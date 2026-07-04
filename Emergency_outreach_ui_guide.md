# Frontend Integration Guide: Emergency Outreach & Failed Donors UI

This guide details the implementation requirements, state management, UI flows, and API integration for the frontend developers to handle failed emergency notifications.

---

## 1. Updated API Response & Requests

### A. Bulk Send Response
The existing endpoint `POST /api/v1/system/donors/eligibility/notifications` now returns the created `appealId` and detailed failure information.

**Response Body (`202 Accepted`):**
```json
{
  "isSuccess": true,
  "message": "Notifications processed successfully.",
  "data": {
    "appealId": "a52f40ec-82cc-4997-bd4b-22c6085a6a3b",
    "requested": 50,
    "sent": 42,
    "failed": 8,
    "failedDonors": [
      {
        "donorId": "e1f13bda-fb1d-4074-a69c-0eb96503c83a",
        "fullName": "محمد أحمد العتيبي",
        "phoneNumber": "01012345678",
        "bloodType": "O+",
        "failureReason": "فشل نظام الإشعارات في إرسال إشعار الهاتف"
      },
      {
        "donorId": "8b082bb4-a8e5-4d6b-bd85-055d49156475",
        "fullName": "سارة محمود علي",
        "phoneNumber": "01287654321",
        "bloodType": "A-",
        "failureReason": "فشل نظام الإشعارات في إرسال إشعار الهاتف"
      }
        // ... failureReason is returned in Arabic from the API
    ]
  }
}
```

### B. PDF Export Request
To generate and download the failed donor PDF report, make a simple `GET` request to:
`GET /api/v1/system/donors/eligibility/notifications/export-failed-pdf/{appealId}`

* **Authentication**: Requires the standard Authorization header (`Bearer <token>`).
* **Statelessness**: The backend queries the database directly using the `appealId` to retrieve all notification records for this appeal where `IsSent == false`. No large JSON request payloads are sent from the frontend.

---

## 2. Component Design & Behaviors

### 🔔 Component A: Sticky Notification Banner (Toast)
* **Visual Style**: Sleek emergency banner pinned to the top of the viewport (`z-index: 1000`). Use soft red background with crimson text/borders (`bg-red-50 text-red-800 border-red-200`).
* **Sticky Behavior**: **Must not** auto-dismiss over time.
* **Content**: 
  * Text: `"Emergency notifications initiated: [X] successful, [Y] failed."`
  * Action: A prominent link or button labeled **"Review Failures"**.
* **Closing**: Can only be removed once the user reviews failures or manually closes the toast.

---

### 🗖 Component B: Slide-Over Drawer
* **Visual Style**: Slides in from the right-hand side of the screen.
* **Layout**: Fixed width (e.g., `450px` to `500px`). It must leave the main dashboard visible and interactable. Use `pointer-events: none` on the overlay/backdrop to allow interaction with the dashboard behind it.
* **Backdrop Interaction**: **Disable close on click-outside/backdrop click**. 
* **Header**: Contains a title: `"Failed Notifications Recipients"` and a prominent close (`X`) button in the top right.
* **Outreach List**: Scrollable table/list showing:
  * **Donor Name** (renders RTL Arabic text nicely)
  * **Blood Type** (e.g. `O+`, `AB-`)
  * **Reason for Failure** (e.g. `"فشل نظام الإشعارات في إرسال إشعار الهاتف"`)
  * **Phone Number**: Accompanied by a **Copy Icon**. Renders a tooltip saying `"Copied!"` briefly when clicked. Do **not** include direct call buttons.

---

### ⚠️ Component C: Data Loss Prevention & Confirmation
Because the failed donors list is stateless on the frontend (not stored in frontend cache), closing the drawer resets the UI state.

1. **Close Confirmation Dialog**:
   * When clicking the `X` button, intercept the closing action.
   * Open a confirmation modal:
     > **Warning**: *Are you sure you want to close this drawer? You will not be able to retrieve the unsaved list of failed donors.*
   * Two Buttons:
     * **Cancel**: Returns to the active drawer.
     * **Confirm Close**: Dismisses the drawer and resets component state.

2. **Accidental Reload Warning**:
   * While the drawer is open and contains data, listen to the window's beforeunload event to prevent accidental tab closing or F5 page refreshes.
   * **Clean-up**: Remove this listener as soon as the drawer is closed.

---

## 3. Implementation Code Snippets (JavaScript / React Example)

### A. Preventing Accidental Refreshes
```javascript
// Hook this up when the drawer opens
function enablePageUnloadWarning() {
    window.addEventListener('beforeunload', handleUnload);
}

// Unhook this when the drawer closes
function disablePageUnloadWarning() {
    window.removeEventListener('beforeunload', handleUnload);
}

function handleUnload(e) {
    e.preventDefault();
    e.returnValue = 'You will lose the list of failed donors. Are you sure you want to leave?';
}
```

### B. Clipboard Copying with Tooltip
```javascript
async function copyToClipboard(phoneNumber, buttonElement) {
    try {
        await navigator.clipboard.writeText(phoneNumber);
        
        // Show tooltip (custom CSS class or library)
        buttonElement.setAttribute('data-tooltip', 'Copied!');
        buttonElement.classList.add('show-tooltip');
        
        setTimeout(() => {
            buttonElement.classList.remove('show-tooltip');
            buttonElement.removeAttribute('data-tooltip');
        }, 1500);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
}
```

### C. Triggering PDF Generation & Download (via GET request)
Because this is a simple `GET` endpoint, you can trigger the download either by opening it in a new tab (if the token is sent in the query parameter/cookie) or by fetching it with the authorization header and downloading the blob:

```javascript
async function downloadFailedDonorsPdf(appealId) {
    try {
        const response = await fetch(`/api/v1/system/donors/eligibility/notifications/export-failed-pdf/${appealId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}` // replace with actual token
            }
        });

        if (!response.ok) throw new Error('Failed to generate PDF');

        // Read as blob
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Trigger browser download
        const a = document.createElement('a');
        a.href = url;
        a.download = `failed_donors_report_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('PDF Export Error:', error);
        alert('Could not download PDF report. Please try again.');
    }
}
```
