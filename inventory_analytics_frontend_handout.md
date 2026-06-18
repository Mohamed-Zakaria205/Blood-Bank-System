# Inventory Analytics - Frontend Integration Handout

This document outlines the changes implemented on the backend and instructions for frontend integration.

---

## 1. Backend-Driven Alert Statuses

> [!IMPORTANT]
> **No Hardcoded Display Logic**: Do NOT calculate status levels (e.g. multiplying thresholds by 0.5) on the frontend. The backend is the sole authority for calculating inventory warning states.
> 
> Read the `alertStatus` property returned by the backend:
> - `"out_of_stock"`: Count of available units is zero.
> - `"critical"`: Count of available units is greater than zero but below or equal to the critical threshold level (`CriticalThreshold`).
> - `"normal"`: Stock level is healthy.

---

## 2. API Endpoints

All endpoints require standard `Bearer <token>` authorization headers and are prefixed with `/api/v1/system/inventory`.

### GET `/analytics`
- Fetches all computed stats, monthly trends, alerts, expiring bags list, and consumption rates.
- **Expiry Window**: Conforms to the global backend warning window setting (`WarningWindowDays` = 5).

### GET `/thresholds`
- Retrieves the current minimum safety stock levels configured for each blood type.
- **Response Shape**:
  ```json
  {
    "success": true,
    "message": "تم استرجاع الحد الأدنى للمخزون بنجاح",
    "data": {
      "A+": 10,
      "A-": 8,
      "B+": 12,
      "B-": 10,
      "AB+": 5,
      "AB-": 5,
      "O+": 15,
      "O-": 10
    }
  }
  ```

### PUT `/thresholds`
- Updates the safety thresholds.
- **Request Body Shape**:
  ```json
  {
    "thresholds": {
      "A+": 10,
      "A-": 8,
      "B+": 12,
      "B-": 10,
      "AB+": 5,
      "AB-": 5,
      "O+": 15,
      "O-": 10
    }
  }
  ```
- **Response Shape**: Returns the updated key-value pair of thresholds.

---

## 3. UI Mappings for the "Threshold Config" Form
- Bind the input fields on the "ضبط الحدود الدنيا للمخزون" modal to send the `thresholds` dictionary in the `PUT /thresholds` request.
- The keys in the payload must match the standard blood type keys: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`.
- Validations are enforced on the backend. Sending values `<= 0` or invalid key strings will return a `422 Unprocessable Entity` error:
  ```json
  {
    "success": false,
    "message": "البيانات المرسلة غير صالحة",
    "errors": {
      "thresholds.A+": [
        "الحد الأدنى للكمية يجب أن يكون رقماً موجباً أكبر من الصفر"
      ]
    }
  }
  ```
