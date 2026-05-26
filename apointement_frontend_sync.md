# 🩸 Appointments Module — API Contract Updates & Frontend Sync

Hi! I have reviewed your initial contract document. To align with our C# backend architecture and support a production-ready dynamic booking system, I've made some updates to the contract. Please update your UI implementation and API client files accordingly.

---

## 1. Dynamic Slot Sizes (No Hardcoded Timelines)
 What changed The backend generates time slots dynamically based on each center's database settings (`SlotDurationMinutes`), which can be changed at any time (e.g. to 20m, 30m, or 60m).
 Frontend Action Required 
   Do not hardcode the `ALL_SLOTS` time array (like `0800`, `0815`, `0830`...) in the frontend constants.
   Your UI calendar (TodayWeekMonth views) must render dynamic timeline blocks based entirely on the list of slots returned by the backend.

---

## 2. Naming Refactoring (No more 15 suffix)
Since slots are dynamic, we have renamed all models, DTOs, and endpoints to remove references to the fixed `slot15` or `15` suffix
 `Slot15` (Model) $rightarrow$ `AppointmentSlot`  `SystemAppointmentSlot`
 `SystemSlot15Dto` $rightarrow$ `SystemAppointmentSlotDto`
 Endpoint `appointmentsslot15` $rightarrow$ `appointmentsslots`

---

## 3. Updated Endpoints list (Doctor View)

### EP-1 Fetch Appointment Slots (TodayWeekMonth Grid)
 Method `GET`
 Endpoint `apiv1systemappointmentsslots`
 Query Params
   `centerId` (GUID) — Optional (Defaults to the Main Branch center ID)
   `date` (string `YYYY-MM-DD`) — Optional
   `dateFrom`  `dateTo` (string `YYYY-MM-DD`) — Optional (For WeekMonth ranges)
   `status` (string) — Optional
   `campaignId` (GUID) — Optional
 Response `PaginatedResponseSystemAppointmentSlotDto`

### EP-2 Fetch Appointment Statistics (Stats Cards)
 Method `GET`
 Endpoint `apiv1systemappointmentsstats`
 Query Params
   `centerId` (GUID) — Optional
   `date`  `dateFrom`  `dateTo` — Optional
 Response
```json
{
  data {
    booked 6,
    completed 5,
    missed 1,
    cancelled 0,
    available 24,
    total 36
  }
}
```

### EP-3 Cancel Appointment Slot
 Method `POST`
 Endpoint `apiv1systemappointmentsslots{slotId}cancel`
 Request Body `{ reason string }`
 Note The backend allows staffdoctors to bypass the standard 30-minute grace period restriction, meaning staff can cancel at any second.

### EP-4 Mark Appointment as No-Show (Missed)
 Method `POST`
 Endpoint `apiv1systemappointmentsslots{slotId}no-show`
 Request Body None
 Note Staff can use this to manually flag a no-show donor immediately.

---

## 4. No-Show & Status Tracking Rules
 No-Show Trigger The backend will run a background cron job periodically to automatically transition past-due, unchecked-in appointments to `NoShow` (Missed) status.
 Frontend Action Required Please remove client-side status derivations like `booked + past time = cancelled`. The backend is now the source of truth for appointment states. Render the `status` string (`booked`, `completed`, `cancelled`, `noshow`) directly.

---

## 5. Donation Registration Linkage (Step 1 → Step 3 Flow)
 How it works
  1. When a donor arrives, clicking بدء التسجيل redirects to `doctorregisterapt={slotId}`.
  2. In Step 1, when calling `POST systemdonations` with the donor's `NationalId`, the backend automatically looks up their active appointment, matches it, and updates its status to `Confirmed`. No separate `appointmentId` field is required in your request payload.
  3. In Step 3, when finalizing the donation and calling `POST systemdonations{id}confirm` (sending to the lab), the backend automatically marks both the donation and the appointment as `Completed`.
  4. There is no need for you to call a separate `complete` endpoint to finish the appointment.
