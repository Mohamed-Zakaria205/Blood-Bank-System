# Staff API Contract

**Base URL:** `/api/v1/system`

This document outlines the API endpoints required by the frontend's Staff Management module (`AdminStaff.tsx`, `useStaff.ts`, `api/staff.ts`).

## 1. Global Response Wrapper

All endpoints (except where specified) must wrap their responses in the following structure. 
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

## 2. Global Enums / Mappings

### Staff Roles
The frontend will map internal lowercase roles to these exact PascalCase strings before sending:
- `Admin`
- `Doctor`
- `LabDoctor`
- `InventoryManager`

---

## 3. Endpoints

### A. Fetch Filtered & Paginated Staff
**Method:** `GET`
**Path:** `/staff`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional) - Filters by Name, Email, or Phone.
- `role` (string, optional) - Exact match for the role string.
- `status` (string, optional) - `active` or `inactive`.

**Expected Response Data (`data` field in wrapper):**
This endpoint expects the `data` field to contain the paginated structure directly:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "data": [
      {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "role": "string",
        "nationalId": "string",
        "phone": "string",
        "address": "string",
        "city": "string",
        "status": "active" | "inactive",
        "createdAt": "YYYY-MM-DD"
      }
    ],
    "total": number (total count of records matching filters),
    "page": number,
    "limit": number
  },
  "errors": null
}
```

### B. Create Staff Member
**Method:** `POST`
**Path:** `/Staff`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "Doctor" | "LabDoctor" | "InventoryManager",
  "nationalId": "string (14 digits)",
  "phone": "string",
  "address": "string",
  "city": "string"
}
```

**Expected Response Data (`data` field in wrapper):**
- Returns the `string` (UUID) of the newly created staff member.

```json
{
  "success": true,
  "message": "Staff created successfully",
  "data": "123e4567-e89b-12d3-a456-426614174000",
  "errors": null
}
```

### C. Update Staff Member
**Method:** `PATCH`
**Path:** `/staff/{id}`

**Request Body:**
Partial update (all fields are optional). Password is NOT updated via this endpoint.

```json
{
  "name": "string",
  "email": "string",
  "role": "Doctor" | "LabDoctor" | "InventoryManager",
  "nationalId": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "status": "active" | "inactive"
}
```

**Expected Response Data (`data` field in wrapper):**
- Returns the updated User object.

```json
{
  "success": true,
  "message": "Staff updated successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "string",
    "nationalId": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "status": "active" | "inactive",
    "createdAt": "YYYY-MM-DD"
  },
  "errors": null
}
```

### D. Delete / Deactivate Staff Member
**Method:** `DELETE`
**Path:** `/staff/{id}`

**Expected Response:**
An empty response with a 204 status code, or a success wrapper with 200 OK.

```json
{
  "success": true,
  "message": "Staff deleted successfully",
  "data": null,
  "errors": null
}
```
