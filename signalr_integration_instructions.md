# SignalR Integration & Fix Instructions

We've resolved the issue causing the `404 Not Found` error and mapped the real-time notification payloads correctly on the backend. Please share the following details and code snippets with the frontend developer.

---

## 1. Vite Proxy Setup (To fix 404/Connection Error)
If the frontend uses a relative URL (like `VITE_API_URL=/api/v1/system` or `/api`), requests to `/hubs/appointments` default to the frontend dev server port (e.g., `5174`), which returns a `404 Not Found`.

**Action:** Update the Vite proxy configuration (typically `vite.config.ts` or `vite.config.js`) to route `/hubs` traffic to the backend, enabling WebSocket support (`ws: true`).

```typescript
// vite.config.ts / vite.config.js
export default defineConfig({
  server: {
    proxy: {
      // Existing API proxy configuration
      '/api': {
        target: 'http://localhost:5287',
        changeOrigin: true,
      },
      // ADD THIS: Proxy rule for SignalR Hubs
      '/hubs': {
        target: 'http://localhost:5287', // Backend port
        ws: true,                        // REQUIRED for SignalR WebSockets
        changeOrigin: true,
      }
    }
  }
});
```

---

## 2. Join "Global" Group (To fix 0 notifications when `centerId` is null)
The backend broadcasts cancellation events to specific center groups (e.g., `notification.CenterId`). When the frontend connects with `centerId: null`, it doesn't join any group and thus receives nothing.

**Action:** Update `useAppointmentsHub` to subscribe to the `"Global"` group if `centerId` is not provided.

```typescript
// Update this section inside useAppointmentsHub in your hook file
connection
  .start()
  .then(async () => {
    if (import.meta.env.DEV) {
      console.info('[SignalR] Connected to', hubUrl);
    }
    
    // Support group joining based on centerId or join globally
    if (centerId && connection.state === HubConnectionState.Connected) {
      await connection.invoke('JoinCenterGroup', centerId);
    } else if (!centerId && connection.state === HubConnectionState.Connected) {
      await connection.invoke('JoinCenterGroup', 'Global'); // Join the Global broadcast group
    }
  })
  .catch((err) => {
    console.error('[SignalR] Connection failed: ', err);
  });
```

---

## 3. Backend Payload Properties & Trigger Conditions
* **Trigger Rule:** Real-time push notifications are **only** sent when a **donor** cancels an appointment that was previously **Confirmed**. 
* Notifications are **not** triggered when:
  * A doctor or staff member cancels the appointment.
  * A donor cancels a pending (unconfirmed) appointment.

When the `AppointmentCancelled` event is pushed, the payload matches this structure:

```json
{
  "id": "guid-here",               // Map to CancellationNotification.id (matches frontend 'id')
  "appointmentId": "guid-here",    // Kept for backward compatibility
  "donorName": "string",
  "time": "HH:mm",                 // formatted: e.g. "14:30"
  "date": "yyyy-MM-dd",            // formatted: e.g. "2026-05-29"
  "reason": "string",
  "cancelledAt": "ISO-timestamp",  // e.g. "2026-05-29T11:53:00Z"
  "cancelledByName": "string"      // "Donor Name" (matches the donor's full name)
}
```
