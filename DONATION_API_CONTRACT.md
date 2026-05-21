# Donors & Donations API Contract

**Base URL:** `/api/v1/system` _(or your configured backend prefix)_

This document outlines the API endpoints required by the frontend's Donor and Donation Management modules (`useDonors.ts` and `api/donors.ts`).

## 1. Global Response Wrapper

All endpoints must wrap their responses in the following structure.
Validation errors should be included in the `errors` object.

```json
{
  "success": boolean,
  "message": "string (A localized success or error message)",
  "data": T, // The actual payload requested
  "errors": {
    "FieldName": ["Error message 1", "Error message 2"]
  } | null
}
```

---

## 2. Donors Endpoints (Admin Portal)

### A. Fetch Filtered & Paginated Donors

**Method:** `GET`
**Path:** `/donors`

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional) - Filters by Name, National ID, Phone, or Donor Code.
- `bloodType` (string, optional) - e.g., "A+", "O-".
- `status` (string, optional) - "eligible", "deferred", or "ineligible".
- `city` (string, optional)

**Expected Response Data (`data` field in wrapper):**

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "data": [
      {
        "id": "uuid",
        "donorCode": "DNR-2025-1234",
        "name": "string",
        "gender": "male" | "female",
        "age": number,
        "nationalId": "string",
        "phone": "string",
        "address": "string",
        "city": "string",
        "bloodType": "string",
        "status": "eligible" | "deferred" | "ineligible",
        "rejectionReason": "string | null",
        "deferredUntil": "YYYY-MM-DD | null",
        "registeredAt": "YYYY-MM-DD",
        "lastDonationDate": "YYYY-MM-DD | null",
        "donations": number,
        "points": number,
        "source": "walkin" | "app" | "campaign",
        "campaignId": "uuid | null",
        "campaignName": "string | null"
      }
    ],
    "total": number,
    "page": number,
    "limit": number
  },
  "errors": null
}
```

### B. Fetch Donor By ID

**Method:** `GET`
**Path:** `/donors/{id}`

**Expected Response Data (`data` field in wrapper):**
Returns the single `Donor` object.

```json
{
  "success": true,
  "message": "Success",
  "data": {
    // ... Donor object fields
  },
  "errors": null
}
```

### C. Search Donor by National ID

**Method:** `GET`
**Path:** `/donors/search`

**Query Parameters:**

- `nationalId` (string, required)

**Expected Response Data (`data` field in wrapper):**
Returns the `Donor` object if found, or `null` if not found.

```json
{
  "success": true,
  "message": "Success",
  "data": {
    // ... Donor object fields
  },
  "errors": null
}
```

### D. Update Donor (Partial Update)

**Method:** `PATCH`
**Path:** `/donors/{id}`

**Request Body:**
Partial update (all fields optional).

```json
{
  "name": "string",
  "phone": "string",
  "bloodType": "string",
  "city": "string",
  "status": "eligible" | "deferred" | "ineligible",
  "address" : "string"

  // ... any other Donor or MedicalRecord fields
}
```

**Expected Response Data (`data` field in wrapper):**
Returns the updated `Donor` object.

---

## 3. Donations Endpoints (Doctor Portal)

### A. Fetch Filtered & Paginated Donations

**Method:** `GET`
**Path:** `/donations`

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional) - Filters by Name, National ID, Phone, Donor Code, or Donation Code.
- `bloodType` (string, optional)
- `city` (string, optional)

**Expected Response Data (`data` field in wrapper):**

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "data": [
      {
        "id": "uuid",
        "donationCode": "DTN-2025-1234",
        "donorId": "uuid",
        "donorCode": "DNR-2025-1234",
        "name": "string",
        "gender": "male" | "female",
        "age": number,
        "nationalId": "string",
        "phone": "string",
        "address": "string",
        "city": "string",
        "bloodType": "string",
        "donationType": "whole" | "plasma" | "platelets",
        "source": "walkin" | "app" | "campaign",
        "campaignId": "uuid | null",
        "campaignName": "string | null",
        "donationDate": "YYYY-MM-DD",
        "sentToLab": boolean,
        "diseases": ["string"],
        "additionalData": {
          "weight": number,
          "height": number,
          "bloodPressure": "string",
          "hemoglobin": number
        },
        "isAllergic": boolean
      }
    ],
    "total": number,
    "page": number,
    "limit": number
  },
  "errors": null
}
```

### B. Add Donation (Step 1)

**Method:** `POST`
**Path:** `/donations`

**Request Body:**

```json
{
  "nationalId": "string",
  "name": "string",
  "gender": "male" | "female",
  "age": number,
  "phone": "string",
  "address": "string",
  "city": "string",
  "bloodType": "string",
  "source": "walkin" | "app" | "campaign",
  "campaignId": "uuid | null",
  "donationType": "whole" | "plasma" | "platelets"
}
```

**Expected Response Data (`data` field in wrapper):**

````Returns empty data object
```json
{
  "success": true,
  "message": "تم تسجيل التبرع المبدئي بنجاح",
  "data": null,
  "errors": null
}
````

### C. Add Medical Record / Screening (Step 2)

**Method:** `POST`
**Path:** `/donations/{id}/medical-record`

**Request Body:**

```json
{
  "status": "eligible" | "deferred" | "ineligible",
  "diseases": ["string"],
  "additionalData": {
    "weight": number,
    "bloodPressure": "string",
    "hemoglobin": number
  },
  "isAllergic": boolean,
  "rejectionReason": "string | null",
  "deferredUntil": "YYYY-MM-DD | null",
}
```

**Expected Response Data (`data` field in wrapper):**
Returns an object containing the new `donationCode`

```json
{
  "success": true,
  "message": "تم تسجيل البيانات الطبية بنجاح",
  "data": {
    "donationCode": "uuid"
  },
  "errors": null
}
```

### D. Confirm / Send To Lab

**Method:** `POST`
**Path:** `/donations/{id}/confirm`

**Expected Response Data:**

```json
{
  "success": true,
  "message": "تم إرسال التبرع للمختبر بنجاح",
  "data": null,
  "errors": null
}
```

### E. Delete Donation

**Method:** `DELETE`
**Path:** `/donations/{id}`

**Expected Response Data:**
Empty payload on success.

```json
{
  "success": true,
  "message": "تم حذف التبرع بنجاح",
  "data": null,
  "errors": null
}
```
