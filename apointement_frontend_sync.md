# 🩸 Appointments Module — API Contract Updates & Frontend Sync (Updated)

Hi! I have reviewed your initial contract document and incorporated **Option C (Real-Time Pushes via SignalR)** into our architecture. I have also resolved some C# database constraints. 

Please update your UI implementation and API client files to match these updates.

---

## 1. Real-Time Cancellation Notifications (SignalR / WebSockets)
To make the dashboard interactive and push cancellation alerts immediately without polling:
* We have added a strongly-typed **SignalR Hub** at `/hubs/appointments`.
* **Frontend Action Required**:
  1. Install the `@microsoft/signalr` package (`npm install @microsoft/signalr`).
  2. Open a persistent connection to the Hub:
     ```typescript
     const connection = new HubConnectionBuilder()
         .withUrl("http://<api-url>/hubs/appointments")
         .withAutomaticReconnect()
         .build();
     ```
  3. When a center is selected, join that center's dynamic group to avoid getting notification noise from other centers:
     ```typescript
     connection.invoke("JoinCenterGroup", centerId);
     ```
  4. Listen to the `"AppointmentCancelled"` event:
     ```typescript
     connection.on("AppointmentCancelled", (notification: CancellationNotification) => {
         // Add this notification directly to your collapsible "إشعارات الإلغاء" UI panel
     });
     ```

---

## 2. Dynamic Slot Sizes (No Hardcoded Timelines)
* **What changed**: Slots are generated dynamically based on each center's database settings (`SlotDurationMinutes`). It can be configured differently per center (e.g., 20m, 30m, 60m).
* **Frontend Action Required**: 
  * Do **not** hardcode the `ALL_SLOTS` array in the frontend.
  * Your UI calendar must render slots dynamically based **entirely on the backend API response**.

---

## 3. Database Constraints & Field Mapping
To avoid unnecessary database schema migrations, some fields are mapped dynamically:
* **No `Notes` Field**: The `DonationAppointment` table does not have a general `Notes` column. 
  * When you call the `/no-show` endpoint or send cancellation notes, the backend will save them in the `cancellationReason` column.
  * In `SystemAppointmentSlotDto`, `notes` will map to `cancellationReason`.
* **No Slot-Level Overrides**: The database does not support individual slot-level configuration updates (e.g. disabling a single 15-minute slot or changing its capacity manually from the scheduling view). Slots are either fully available or fully closed on a center-wide day-level (using opening hours and holidays). 
  * The DTO fields `isDisabled` will default to `false`.

---

## 4. Refactored Endpoints (Doctor View)

All "slot15" terminology has been renamed to reflect dynamic slot sizes.

### EP-1: Fetch Appointment Slots (Today/Week/Month Grid)
* **Method**: `GET`
* **Endpoint**: `/api/v1/system/appointments/slots`
* **Query Params**:
  * `centerId` (GUID) — *Optional (Defaults to the Main Branch)*
  * `date` (string: `YYYY-MM-DD`) — *Optional*
  * `dateFrom` / `dateTo` (string: `YYYY-MM-DD`) — *Optional*
  * `status` (string) — *Optional*
  * `campaignId` (GUID) — *Optional*
* **Response**: `PaginatedResponse<SystemAppointmentSlotDto>`

### EP-2: Fetch Appointment Statistics (Stats Cards)
* **Method**: `GET`
* **Endpoint**: `/api/v1/system/appointments/stats`
* **Response**: `ApiResponse<AppointmentStatsDto>` (returns counts for `booked`, `completed`, `missed` (no-show), `cancelled`, `available`, `total`).

### EP-3: Cancel Appointment
* **Method**: `POST`
* **Endpoint**: `/api/v1/system/appointments/slots/{slotId}/cancel`
* **Request Body**: `{ "reason": "string" }`
* *Note: The backend allows staff to bypass the standard 30-minute grace period restriction.*

### EP-4: Mark Appointment as No-Show (Missed)
* **Method**: `POST`
* **Endpoint**: `/api/v1/system/appointments/slots/{slotId}/no-show`
* *Note: Instantly transitions slot status to `"noshow"` (or `"missed"`).*

---

## 5. Donation Registration Linkage (Step 1 → Step 3 Flow)
* When you call `POST /system/donations` (Step 1) using the donor's `NationalId`, the backend **automatically** looks up their active appointment and updates its status to `Confirmed`. No separate `appointmentId` parameter is needed in the body.
* When you call `POST /system/donations/{id}/confirm` (Step 3), the backend automatically marks both the donation and the appointment as `Completed`.
