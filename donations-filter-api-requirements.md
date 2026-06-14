# Donations Filter API Requirements

This document outlines the API specifications and query parameters that the backend needs to implement for the updated Donations list filters.

## Endpoint

**GET** `/api/v1/system/Donations` (or equivalent paginated donations list endpoint)

---

## 1. Query Parameters

All parameters below are optional.

### Search (Existing)
* **Parameter**: `search`
* **Type**: `string`
* **Description**: Performs text search on supported donation fields (such as donor's name, national ID, or donation code).

### Blood Type (Existing)
* **Parameter**: `bloodType`
* **Type**: `string`
* **Description**: Filters donations by the donor's blood type.
* **Casing/Values**: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`

### Donation Source (New)
* **Parameter**: `donationSource`
* **Type**: `string`
* **Description**: Filters donations based on how they were registered.
* **Casing/Values (Tentative)**: 
  * `Application` (Donations booked through the normal application flow)
  * `Campaign` (Donations associated with a campaign)
  * `WalkIn` (Donations registered directly inside the blood bank by staff)
* *Note: These enum values are tentative. If the backend schema uses different naming or casing (e.g., lowercased, numeric IDs, etc.), please align with the frontend developer to update the client mapping.*

### Donation Status (New)
* **Parameter**: `donationStatus`
* **Type**: `string`
* **Description**: Filters donations by their current lab delivery status.
* **Casing/Values (Tentative)**:
  * `Pending` (التبرعات التي لم يتم إرسالها للمعمل بعد وما زالت تحت الإجراء أو المراجعة)
  * `SentToLab` (التبرعات التي تم إرسالها بالفعل إلى المعمل)
* *Note: These enum values are tentative. If the backend schema uses different naming or casing, please align with the frontend developer.*

### Donation Date (New)
Date filtering can be performed using either a preset or a custom date range.

#### Preset Filters
* **Parameter**: `datePreset`
* **Type**: `string`
* **Description**: Filters donations created within a predefined calendar period. Dates should be interpreted using the application's configured local time zone (e.g., Egypt Standard Time) rather than UTC unless otherwise specified, to prevent timezone mismatch on boundary hours.
* **Values**:
  * `today` (Returns donations created during the current day)
  * `thisWeek` (Returns donations created during the current calendar week. `thisWeek` should represent the current calendar week according to the server's configured locale/time zone, e.g., Saturday–Friday or Monday–Sunday as defined by the business rules)
  * `thisMonth` (Returns donations created during the current calendar month)

#### Custom Filtering
* **Parameters**: `fromDate` and `toDate`
* **Type**: `string` (Format: `YYYY-MM-DD`)
* **Description**: Returns donations created within the specified range. `fromDate` and `toDate` are **inclusive**, meaning records created on both boundary dates should be included in the results.
* *Note: `datePreset` and `fromDate`/`toDate` are mutually exclusive. When custom dates are sent, `datePreset` will not be sent, and vice-versa.*

---

## 2. Expected Backend Behavior

1. **Server-Side Filtering**: All filtering must be performed on the database level (server-side), not on the client.
2. **Combinable Parameters**: All parameters can be used together in any combination (e.g. searching, filtering by blood type, donation source, status, and custom dates simultaneously).
3. **Search Priority & Integration**: Search should be applied together with all other active filters. It should not override or ignore blood type, donation source, donation status, or date filters. All clauses must be combined using logical `AND` operators.
4. **Omission of Empty Parameters**: The frontend will omit empty query parameters, and the backend should treat missing parameters as "no filtering".
5. **Time Zone Rules**: All dates must be interpreted using the application's configured local time zone (e.g., Egypt Standard Time) rather than UTC unless otherwise specified.
6. **Pagination Integration**: Filtering must apply before pagination. The response fields `total` (total matching items), `page`, and `limit` must reflect the filtered results set.

---

## 3. Example Requests

### Get default paginated donations list (no filters)
```http
GET /api/v1/system/Donations?page=1&limit=10
```

### Filter by Blood Type
```http
GET /api/v1/system/Donations?page=1&limit=10&bloodType=A+
```

### Filter by Donation Source
```http
GET /api/v1/system/Donations?page=1&limit=10&donationSource=Campaign
```

### Filter by Donation Status
```http
GET /api/v1/system/Donations?page=1&limit=10&donationStatus=Pending
```

### Filter by Date Preset (Today)
```http
GET /api/v1/system/Donations?page=1&limit=10&datePreset=today
```

### Filter by Date Preset (This Week)
```http
GET /api/v1/system/Donations?page=1&limit=10&datePreset=thisWeek
```

### Filter by Date Preset (This Month)
```http
GET /api/v1/system/Donations?page=1&limit=10&datePreset=thisMonth
```

### Filter by Custom Date Range
```http
GET /api/v1/system/Donations?page=1&limit=10&fromDate=2026-06-01&toDate=2026-06-30
```

### Complex Combination (Blood Type + Source + Status + Custom Date Range)
```http
GET /api/v1/system/Donations?page=1&limit=10&bloodType=O-&donationSource=Application&donationStatus=SentToLab&fromDate=2026-06-01&toDate=2026-06-30
```
