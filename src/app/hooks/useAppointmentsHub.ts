// ═══════════════════════════════════════════════════════════
// useAppointmentsHub — SignalR real-time cancellation alerts
//
// Connects to /hubs/appointments, joins a center group (or
// the "Global" group), and fires onCancelled whenever the
// backend pushes an "AppointmentCancelled" event.
//
// Trigger rule (backend):
//   Only fires when a DONOR cancels a previously Confirmed
//   appointment. Staff/doctor cancellations do NOT trigger.
//
// Usage:
//   useAppointmentsHub({
//     centerId: user.centerId,          // optional — null joins "Global"
//     onCancelled: (n) => addNotif(n),  // called on every push
//   });
// ═══════════════════════════════════════════════════════════
import { useEffect, useRef } from 'react';
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import type { CancellationNotification } from '../types/appointment';

interface UseAppointmentsHubOptions {
  /** Donation-center GUID — when null, joins the "Global" broadcast group. */
  centerId?: string | null;
  /** Called every time the backend pushes an "AppointmentCancelled" event. */
  onCancelled: (notification: CancellationNotification) => void;
  /** Set to false to temporarily disable the connection (e.g. user is not logged in). */
  enabled?: boolean;
}

export function useAppointmentsHub({
  centerId,
  onCancelled,
  enabled = true,
}: UseAppointmentsHubOptions) {
  // Keep a stable ref to the callback so we don't re-connect on every render
  const onCancelledRef = useRef(onCancelled);
  useEffect(() => { onCancelledRef.current = onCancelled; }, [onCancelled]);

  useEffect(() => {
    if (!enabled) return;

    // In dev the Vite proxy handles /hubs/* → backend.
    // In production (Vercel) WebSockets are NOT supported through rewrites,
    // so we connect directly to the backend origin.
    const hubUrl = import.meta.env.DEV
      ? '/hubs/appointments'
      : 'https://bloodlink.runasp.net/hubs/appointments';

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(
        import.meta.env.DEV ? LogLevel.Information : LogLevel.Warning,
      )
      .build();

    // Listen for cancellation push events
    connection.on('AppointmentCancelled', (notification: CancellationNotification) => {
      if (import.meta.env.DEV) {
        console.info('[SignalR] AppointmentCancelled event received:', notification);
      }
      onCancelledRef.current(notification);
    });

    // Start → join center group (or "Global") → done
    connection
      .start()
      .then(async () => {
        if (import.meta.env.DEV) {
          console.info('[SignalR] Connected to', hubUrl);
        }
        if (connection.state === HubConnectionState.Connected) {
          // Join the specific center group, or "Global" if no centerId
          const groupId = centerId || 'Global';
          await connection.invoke('JoinCenterGroup', groupId);
          if (import.meta.env.DEV) {
            console.info('[SignalR] Joined group:', groupId);
          }
        }
      })
      .catch((err) => {
        if (import.meta.env.DEV) {
          console.warn('[SignalR] Connection failed:', err);
        }
      });

    // Cleanup: stop connection when component unmounts or options change
    return () => {
      connection.stop().catch(() => {/* ignore stop errors */});
    };
  }, [enabled, centerId]); // reconnect only when enabled/centerId change
}
