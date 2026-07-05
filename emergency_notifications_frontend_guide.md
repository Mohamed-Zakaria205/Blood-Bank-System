# Frontend Developer Integration Guide: Emergency Notifications Update

This guide documents the API changes made to the Emergency Notifications flow (Preview, Bulk Send, and PDF Export) to help the frontend handle these responses correctly.

---

## 1. Preview Emergency Notification
* **Endpoint:** `POST /api/v1/system/donors/eligibility/notifications/preview`
* **Role required:** `Doctor`

### What Changed?
Previously, this endpoint only returned the message details and the count of successful target recipients. It has been upgraded to also return the details of donors who **cannot** be notified, along with the reasons.

### Updated Response Schema (`200 OK`)
```json
{
  "title": "🚨 فرصة للمساعدة في إنقاذ حياة",
  "message": "🚨 فرصة لإنقاذ حياة: فصيلتك الدموية (A+) مطلوبة حالياً لدعم حالات بحاجة للتبرع بالدم...",
  "recipientCount": 10,
  "failedCount": 3,
  "failedDonors": [
    {
      "donorId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "fullName": "احمد محمد علي",
      "phoneNumber": "+201234567890",
      "bloodType": "A+",
      "failureReason": "تم إرسال إشعار لهذا المتبرع خلال الـ 24 ساعة الماضية"
    },
    {
      "donorId": "d0e1f2a3-b4c5-6d7e-8f90-1a2b3c4d5e6f",
      "fullName": "خالد محمود",
      "phoneNumber": "+201099887766",
      "bloodType": "O-",
      "failureReason": "لا يوجد حساب نشط على تطبيق الهاتف"
    }
  ]
}
```

### New Properties to Handle:
* **`failedCount`** *(integer)*: The total count of selected donors who failed the checks and will not receive push notifications.
* **`failedDonors`** *(array of objects)*: Detailed list of failed donors containing:
  * `donorId` *(string, UUID)*
  * `fullName` *(string)*
  * `phoneNumber` *(string)*
  * `bloodType` *(string)*
  * `failureReason` *(string)*: Arabic description of why sending will fail.

---

## 2. Bulk Send Emergency Notifications
* **Endpoint:** `POST /api/v1/system/donors/eligibility/notifications`
* **Role required:** `Doctor`

### What Changed?
Previously, if donors were skipped due to the 24-hour rate limit (i.e. they received an emergency notification recently), they were silently skipped, resulting in a confusing `Sent: 0`, `Failed: 0`, and `FailedDonors: []` response.

Now, these skipped donors are correctly added to the `FailedDonors` list and counted under `Failed`.

### Updated Response Schema (`202 Accepted`)
If you send notifications to a list of donors who were already notified within 24 hours:
```json
{
  "appealId": null,
  "requested": 5,
  "sent": 0,
  "failed": 5,
  "failedDonors": [
    {
      "donorId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "fullName": "احمد محمد علي",
      "phoneNumber": "+201234567890",
      "bloodType": "A+",
      "failureReason": "تم إرسال إشعار لهذا المتبرع خلال الـ 24 ساعة الماضية"
    }
    // ... other rate-limited donors
  ]
}
```

### UI Integration Tip:
Use the `failedDonors` array in the response to display a summary or error alert showing the specific reasons why notifications could not be dispatched to each donor.

---

## 3. Export Failed Donors PDF Report
* **Endpoint:** `GET /api/v1/system/donors/eligibility/notifications/export-failed-pdf/{appealId}`
* **Role required:** `Doctor`

### What Changed?
The backend now records pre-filtered failures in the database with their respective failure reasons. Therefore, when you download the failed donors PDF report for a given appeal, it will automatically include **all** failures (including rate-limited donors and donors without app accounts) with their exact failure reasons printed in the PDF tables, instead of just FCM dispatch failures.

---

## Summary of Backend Failure Reason Strings (Arabic)

| Code Context | Failure Reason string in API / PDF |
| :--- | :--- |
| **Rate Limit** | `"تم إرسال إشعار لهذا المتبرع خلال الـ 24 ساعة الماضية"` |
| **No App Account** | `"لا يوجد حساب نشط على تطبيق الهاتف"` |
| **FCM Failure** | `"فشل نظام الإشعارات في إرسال إشعار الهاتف"` |
| **System Exception** | `"خطأ غير متوقع أثناء إرسال الإشعار"` |
