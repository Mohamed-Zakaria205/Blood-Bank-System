# Frontend Integration Guide: Emergency Notifications Update

This document guides frontend developers on integrating the updated Bulk Emergency Notifications feature, which resolves the issue of selection loss across paginated pages and moves notification content generation to the backend.

---

## 1. GET `/api/v1/system/donors/eligibility` (Donor Search Page)

### New Query Parameter
The search and filtering endpoint now accepts a `hasMobileApp` query parameter to filter donors by whether they have registered an active app account.

- **Parameter Name**: `hasMobileApp`
- **Type**: `boolean` (optional)
- **Values**:
  - `true`: Filter and display only donors who have a registered mobile app account.
  - `false`: Filter and display only donors who do not have a mobile app account.
  - Omitted (null): Display all donors regardless of app registration status.

---

## 2. POST `/api/v1/system/donors/eligibility/notifications/preview` (Get Notification Preview)

To show the doctor the exact message and title before sending (as rendered in the confirmation popup/modal), use this endpoint. It calculates the final target recipient count and constructs the encouraging Arabic title and message dynamically based on the current live database state.

- **Endpoint**: `/api/v1/system/donors/eligibility/notifications/preview`
- **HTTP Method**: `POST`
- **Content-Type**: `application/json`

### Request Payload Structures

The request body structure matches the `notifications` send endpoint exactly (supporting both Selected and Filtered modes):

#### Mode 1: Selected Donors (Explicit Selection)
```json
{
  "selectionMode": "selected",
  "donorIds": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "d0a7a8d5-171b-4fc6-bc2a-fde462444dfb"
  ]
}
```

#### Mode 2: Filtered Donors (Bulk Selection across Pages)
```json
{
  "selectionMode": "filtered",
  "filters": {
    "search": "احمد",
    "bloodType": "O+",
    "status": "eligible",
    "district": "بني سويف",
    "gender": "male",
    "hasMobileApp": true
  },
  "excludedDonorIds": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  ]
}
```

### Response Payload (`200 OK`)
```json
{
  "success": true,
  "message": "Notification preview generated successfully.",
  "data": {
    "title": "🚨 فرصة للمساعدة في إنقاذ حياة",
    "message": "🚨 فرصة لإنقاذ حياة: فصيلتك الدموية (O+) مطلوبة حالياً لدعم حالات بحاجة للتبرع بالدم. تبرعك قد يكون سبباً في إدخال الفرحة والشفاء على قلب مريض وعائلته. نسعد بزيارتك لأقرب مركز تبرع.",
    "recipientCount": 120
  }
}
```

Display these `title` and `message` strings directly in the UI text fields of the confirmation dialog, and the `recipientCount` as the targeted count.

---

## 3. POST `/api/v1/system/donors/eligibility/notifications` (Send Notifications)

Sends the bulk notifications to the target recipients.

- **Endpoint**: `/api/v1/system/donors/eligibility/notifications`
- **HTTP Method**: `POST`
- **Content-Type**: `application/json`

### Request Payload Structures
Matches the payload of the preview endpoint exactly. (Note: The `type` and `message` fields are no longer sent in the request body).

### Response Structure (Unchanged)
```json
{
  "success": true,
  "message": "Notifications processed successfully.",
  "data": {
    "requested": 121,
    "sent": 120,
    "failed": 1,
    "failedDonorIds": [
      "d0a7a8d5-171b-4fc6-bc2a-fde462444dfb"
    ]
  }
}
```
