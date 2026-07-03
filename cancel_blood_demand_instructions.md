# Frontend Guide: Cancel Blood Demand Integration

This document outlines the API contract and UI/UX requirements for implementing the cancellation/closure feature for blood requests on the frontend dashboard.

---

## 1. API Contract

- **Endpoint**: `POST /api/v1/system/blood-demands/{id}/cancel`
- **Path Parameter**: `id` (UUID of the blood request/demand)
- **Headers**: `Authorization: Bearer <token>` (Requires `InventoryManager` role)
- **Description**: Cancels or closes the request depending on its current status.
  - If status is `Pending` or `Approved` $\rightarrow$ transitions to `Cancelled`.
  - If status is `PartiallyFulfilled` $\rightarrow$ transitions to `Fulfilled` (closing the request at the current number of issued units).
- **HTTP Response Codes**:
  - `200 OK`: Successful transition.
  - `404 Not Found`: Request ID does not exist in the database.
  - `422 Unprocessable Entity`: Request is already `Fulfilled` or `Cancelled` (cannot be changed).

### Response JSON:
```json
{
  "success": true,
  "message": "تم تعديل حالة الطلب بنجاح",
  "data": null
}
```

---

## 2. UI/UX Implementation Advice

### 2.1 Dynamic Action Button Labels & Styles
The button on the UI should change its label and styling dynamically based on the demand's current `status`:

1. **For `Pending` or `Approved` requests**:
   - **Label**: **"إلغاء الطلب"** (Cancel Request)
   - **Style**: Red/Crimson button to reflect cancellation.
2. **For `PartiallyFulfilled` requests**:
   - **Label**: **"إنهاء / إغلاق الطلب"** (Close Request)
   - **Style**: Neutral dark gray or outline button to reflect closing/completing at the current progress instead of canceling.
3. **For `Fulfilled` or `Cancelled` requests**:
   - **Visibility**: Hide the cancellation action button completely from the UI.

### 2.2 Confirmation Popups
Show a confirmation modal before calling the cancel API to prevent accidental changes:

- **If status is `Pending` or `Approved`**:
  - **Message**: `"هل أنت متأكد من إلغاء هذا الطلب؟"` (Are you sure you want to cancel this request?)
- **If status is `PartiallyFulfilled`**:
  - **Message**: `"هل أنت متأكد من إغلاق هذا الطلب والكتفاء بالكمية المصروفة حالياً؟"` (Are you sure you want to close this request and settle for the currently issued quantity?)

### 2.3 Post-Cancellation State Update
Once the API returns success:
1. Show a success toast message (`"تم تعديل حالة الطلب بنجاح"`).
2. Refresh the details drawer/modal and the dashboard count statistics to reflect the new status and updated metric counts.
