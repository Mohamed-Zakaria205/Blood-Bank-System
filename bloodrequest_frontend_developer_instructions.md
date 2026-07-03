# Frontend Implementation Guide: Blood Demand Fulfillment Workflow

This document provides step-by-step instructions for the frontend developer to implement the contextual navigation and fulfillment flow between the **Blood Requests** and **Blood Bags Inventory** pages.

---

## 1. Overview of the Flow

Instead of having two separate ways to issue blood bags, the manager will physically select and issue bags **only on the Blood Bags inventory page**. 
When fulfilling a specific request, the manager is redirected from the **Requests** page to the **Blood Bags** page in a special **Fulfillment Mode**.

```
[Requests Page] 
    ↓ Click "تحديد حقائب للصرف" (Select Bags to Issue)
    ↓ Navigates with query params (demandId, bloodType, remainingUnits, requesterName)
[Blood Bags Page (Fulfillment Mode)]
    ↓ Auto-filters to requested blood type
    ↓ Renders a top banner: "جاري تلبية الطلب #..."
    ↓ Manager checks checkboxes to select bags
    ↓ Click "متابعة الصرف" (Proceed to Issue)
[Issue Modal]
    ↓ Opens with Recipient Name & Reason pre-filled
    ↓ Calls API /api/inventory/issue with BagIds and BloodDemandId
```

---

## 2. Page 1: Blood Requests (طلبات الدم)

This page displays the lists of demands and their statuses.

### UI Requirements
1. **Metrics Cards**:
   - **إجمالي الطلبات** (Total Requests)
   - **معلقة** (Pending)
   - **مكتملة جزئياً** (Partially Fulfilled)
   - **مكتملة** (Fulfilled)
2. **Filters Row**: Filter requests by Status (`معلق`, `مكتمل جزئياً`, `مكتمل`, `ملغي`), Blood Type, and Priority (`منخفضة`, `متوسطة`, `عالية`).
3. **Table Columns**:
   - **كود الطلب** (Request ID)
   - **المستشفى / الجهة** (Hospital/Organization name)
   - **الفصيلة** (Blood Type)
   - **الوحدات المطلوبة** (Requested Units)
   - **الوحدات المنصرفة** (Issued Units)
   - **المتبقي** (Remaining Units)
   - **الأولوية** (Priority - styled badge)
   - **الحالة** (Status - styled badge)
   - **تاريخ الطلب** (Request Date)
   - **إجراءات** (Actions - view details icon)
4. **Detail Panel (at the bottom or side drawer)**:
   When a request row is clicked, load the request's details:
   - Display a prominent green action button: **"تحديد حقائب للصرف"** (Select Bags to Fulfill).
   - Only show this button if `status` is **Pending** (`معلق`) or **PartiallyFulfilled** (`مكتمل جزئياً`).

### Navigation Action (Fulfill Button Click)
Redirect the manager to the **Blood Bags** inventory route, passing the following parameters in the route state or query string:
```typescript
{
  demandId: string,        // e.g. "f0c1b2a3-..."
  bloodType: string,       // e.g. "O+"
  remainingUnits: number,  // e.g. 20 (Requested - Issued)
  requesterName: string    // e.g. "مستشفى القاهرة"
}
```

---

## 3. Page 2: Blood Bags Inventory (حقائب الدم)

This page must support both **Normal Mode** (general browsing/issuing) and **Fulfillment Mode** (contextual fulfillment of a demand).

### Fulfilling State Check
On component load, check if the route contains query parameters:
```typescript
const isFulfilling = !!query.demandId;
```

### UI & Behavior in "Fulfillment Mode" (`isFulfilling === true`)

1. **Contextual Top Banner**:
   Render a persistent, highlighted green banner above the inventory list:
   - **Text**: `جاري تلبية الطلب للجهة: {requesterName} | الفصيلة المطلوبة: {bloodType} | تم تحديد {selectedCount} من {remainingUnits} حقيبة`
   - Include a close/cancel button `(X)` on the banner. Clicking it clears the query parameters and returns the page to Normal Mode.

2. **Automated Filtering**:
   - The table list must be **automatically filtered** to only show blood bags matching the requested `bloodType`.
   - The blood type filter dropdown must be locked/disabled to prevent selecting a different blood type until Fulfillment Mode is cancelled.
   - Only show bags with status **Available** (`متاح`).

3. **Dynamic Selection Checkboxes**:
   - Allow checking rows to select bags.
   - Update the `{selectedCount}` on the banner dynamically as checkboxes are checked.
   - Max Limit check (Optional but recommended): Show a warning if the manager selects more than `remainingUnits`.

4. **Action Button**:
   - The action button **"متابعة الصرف ({selectedCount})"** (Proceed to Issue) becomes active when `selectedCount > 0`.
   - Clicking this button opens the **Issue Modal**.

---

## 4. Dialog: Issuance Modal (تصدير الحقائب)

When the Issue Modal is opened from Fulfillment Mode:

1. **Pre-filled Fields**:
   - **اسم المستلم / المريض** (Recipient Name): Pre-fill with the `requesterName` (e.g. `"مستشفى القاهرة"`).
   - **سبب التصدير** (Reason for Export): Pre-fill with `"تلبية طلب الدم رقم #{demandId}"` (Fulfilling blood request).
   - The manager can edit these fields if needed.
2. **Hidden Metadata**:
   - Keep the `demandId` in the component state. It must be sent to the API during form submission.

---

## 5. API Integration Details

All system APIs use versioning and authorization. Ensure that requests to these endpoints include the `Authorization: Bearer <token>` header of a logged-in `InventoryManager`.

### 1. Get Blood Demands (طلبات الدم)
- **Endpoint**: `GET /api/v1/system/blood-demands`
- **Query Parameters**:
  - `page` (number, default: `1`)
  - `limit` (number, default: `10`)
  - `search` (string, optional - searches hospital/requester name)
  - `status` (string, optional: `Pending`, `Approved`, `PartiallyFulfilled`, `Fulfilled`, `Cancelled`)
  - `bloodType` (string, optional, e.g. `"O+"`, `"A-"`)
  - `priority` (string, optional: `Low`, `Medium`, `High`)
- **Response Shape**:
```json
{
  "success": true,
  "message": "تم استرجاع طلبات الدم بنجاح",
  "data": {
    "items": [
      {
        "id": "f0c1b2a3-9876-4321-b123-abcdef000001",
        "requestDate": "2026-07-02T23:48:59",
        "bloodType": "O+",
        "requesterName": "مستشفى القاهرة",
        "requestedUnits": 50,
        "issuedUnits": 30,
        "remainingUnits": 20,
        "priority": "High",
        "status": "PartiallyFulfilled",
        "notes": "Urgent need for surgery cases",
        "createdAt": "2026-07-02T23:48:59"
      }
    ],
    "page": 1,
    "limit": 10,
    "totalCount": 24,
    "totalPages": 3
  }
}
```

---

### 2. Get Blood Demand Detail (تفاصيل الطلب)
- **Endpoint**: `GET /api/v1/system/blood-demands/{id}`
- **Response Shape**:
```json
{
  "success": true,
  "message": "تم استرجاع تفاصيل الطلب بنجاح",
  "data": {
    "id": "f0c1b2a3-9876-4321-b123-abcdef000001",
    "requestDate": "2026-07-02T23:48:59",
    "bloodType": "O+",
    "requesterName": "مستشفى القاهرة",
    "requestedUnits": 50,
    "issuedUnits": 30,
    "remainingUnits": 20,
    "priority": "High",
    "status": "PartiallyFulfilled",
    "notes": "Urgent need for surgery cases",
    "createdAt": "2026-07-02T23:48:59",
    "issuanceHistory": [
      {
        "issuanceId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "issuedAt": "2026-07-02T23:55:00",
        "issuedByName": "أحمد نصر بكري",
        "serialNumber": "DTN-2026-0143",
        "recipientName": "مستشفى القاهرة",
        "nationalId": "29901011234567",
        "phone": "01001234567",
        "reason": "تلبية طلب الدم رقم #f0c1b2a3-..."
      }
    ]
  }
}
```

---

### 3. Create Blood Demand (إضافة طلب جديد)
- **Endpoint**: `POST /api/v1/system/blood-demands`
- **Request Body**:
```json
{
  "bloodTypeId": 1,        // Numeric ID of the blood type (1=A+, 2=A-, 3=B+, 4=B-, 5=AB+, 6=AB-, 7=O+, 8=O-)
  "requesterName": "مستشفى القاهرة",
  "requestedUnits": 50,
  "priority": "High",     // "Low", "Medium", "High"
  "notes": "Urgent need for surgery cases"
}
```
- **Response Shape**:
```json
{
  "success": true,
  "message": "تم إنشاء طلب الدم بنجاح",
  "data": "f0c1b2a3-9876-4321-b123-abcdef000001" // Guid of the created demand
}
```

---

### 4. Issue Blood Bags (صرف الحقائب لتلبية الطلب)
- **Endpoint**: `POST /api/v1/system/inventory/blood-bags/issue`
- **Request Body**:
```json
{
  "bagIds": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "4fa85f64-5717-4562-b3fc-2c963f66afa7"
  ],
  "recipientName": "مستشفى القاهرة",
  "nationalId": "29901011234567",
  "phone": "01001234567",
  "reason": "تلبية طلب الدم رقم #f0c1b2a3-...",
  "bloodDemandId": "f0c1b2a3-9876-4321-b123-abcdef000001" // Optional Guid to associate the issuance to a demand
}
```
- **Response Shape**:
```json
{
  "success": true,
  "message": "تمت معالجة طلب صرف الحقائب",
  "data": {
    "processedCount": 2,
    "failedCount": 0,
    "results": [
      { "bagId": "3fa85f64-...", "success": true },
      { "bagId": "4fa85f64-...", "success": true }
    ]
  }
}
```

### Post-Submission Navigation
If the API call is successful:
1. Show a success toast notification (e.g. `"تم صرف الحقائب وتحديث حالة الطلب بنجاح"`).
2. Clear the route query parameters.
3. Redirect the manager back to the **Blood Requests** page so they can verify the updated `IssuedUnits` and status of the demand.

---

## 6. UI & UX Best Practices (Advices)

To ensure the new flow matches the premium quality of the existing application, the frontend developer should follow these design recommendations:

### 1. Theme Consistency (Dark Teal & Emerald)
- **Backgrounds**: Use the signature dark-teal black color palette (`#071815` / `#0b201d`) for dashboard containers.
- **Glassmorphism**: Apply semi-transparent backdrops (`backdrop-filter: blur(10px); background: rgba(11, 32, 29, 0.5);`) for panels and tables.
- **Emerald/Green accents**: Use high-contrast emerald green for success metrics, checked states, and primary action buttons.

### 2. Contextual Fulfillment Banner
- **Entrance Animation**: Implement a smooth slide-down animation when entering Fulfillment Mode.
- **Visual Distinction**: Give the top banner a soft glowing green border (`box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);`) to draw focus immediately.
- **Cancel Button**: Provide a clear `X` close icon inside the banner. It must immediately clear the route params and return the inventory page to normal mode.

### 3. Locked Controls & Indicators
- **Locked Dropdown**: When in Fulfillment Mode, show a lock icon next to the "Blood Type" filter dropdown. This visually explains why the filter is disabled.
- **Row Validation**: If a row has a different blood type, disable the row checkbox and show a tooltip on hover (e.g. `"هذه الحقيبة لا تطابق الفصيلة المطلوبة"`).

### 4. Arabic RTL Compatibility
- **Sidebar Navigation**: Ensure the sidebar remains anchored to the right side of the screen.
- **Text Alignment**: All table columns (Request ID, Organization, Units, Priority, Status, Date) must align right-to-left.
- **Number formatting**: Render digits clearly, preserving formatting like `#105` correctly in Arabic context.

### 5. Pre-Filled Modal Context
- **Auto-filled Fields**: Highlight the pre-filled fields (Recipient Name & Reason) with a subtle background shade or a help icon tooltip: `"تم الملء تلقائياً بناءً على طلب الدم #105"` to improve transparency.
