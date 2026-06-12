import { useEffect, useRef, RefObject } from 'react';

/**
 * Custom hook to trap focus inside a modal for keyboard accessibility (a11y).
 * - Traps Tab and Shift+Tab navigation within the modal.
 * - Closes the modal when the Escape key is pressed.
 * - Restores focus to the element that was focused before opening the modal upon unmounting.
 * - Automatically focuses the first focusable element inside the modal.
 * 
 * @param onClose Callback function to invoke when the Escape key is pressed.
 * @returns A ref object to be attached to the modal wrapper element.
 */
export function useModalFocusTrap(onClose: () => void): RefObject<HTMLDivElement | null> {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Save the element that was focused before the modal was opened
    const previousActiveElement = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableSelector =
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableElements = Array.from(
          modalRef.current.querySelectorAll(focusableSelector)
        ) as HTMLElement[];

        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            // Shift + Tab (backward focus traversal)
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            // Tab (forward focus traversal)
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        } else {
          // Prevent focus from leaving the modal if there are no focusable elements
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Automatically focus the first focusable element on mount
    if (modalRef.current) {
      // Set tabIndex to -1 dynamically on the modal container if not set,
      // so it can receive programmatic focus if no focusable children exist
      if (!modalRef.current.hasAttribute('tabindex')) {
        modalRef.current.setAttribute('tabindex', '-1');
      }
      
      const focusableSelector =
        'button, [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const firstFocusable = modalRef.current.querySelector(focusableSelector) as HTMLElement | null;
      
      if (firstFocusable) {
        // Delay focus slightly to ensure transition/rendering is completed
        const timer = setTimeout(() => {
          firstFocusable.focus();
        }, 50);
        return () => {
          clearTimeout(timer);
          document.removeEventListener('keydown', handleKeyDown);
          if (previousActiveElement) {
            previousActiveElement.focus();
          }
        };
      } else {
        modalRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [onClose]);

  return modalRef;
}
