'use client';

import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  // NOTE: This project uses Vite (not Next.js), so there is no ThemeProvider.
  // We default to "system" theme detection instead of reading from next-themes.
  return (
    <Sonner
      theme="system"
      position="top-center"
      richColors={true}
      visibleToasts={5}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group flex items-center gap-3 w-full p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 font-sans',
          title: 'text-[15px] font-bold',
          description: 'text-[13px] text-opacity-90',
          actionButton: 'bg-primary text-primary-foreground font-medium rounded-lg px-3 py-1.5',
          cancelButton: 'bg-muted text-muted-foreground font-medium rounded-lg px-3 py-1.5',
          
          // Loading: Default muted palette since richColors doesn't cover loading heavily
          loading: 
            'bg-white border-gray-200 text-gray-800 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300',
            
          // Icon sizing and styling
          icon: 'w-5 h-5 flex-shrink-0',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
