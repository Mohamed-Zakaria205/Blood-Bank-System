import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAppointmentsHub } from './useAppointmentsHub';
import { HubConnectionState } from '@microsoft/signalr';

const mockOn = vi.fn();
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockInvoke = vi.fn();

const mockWithUrl = vi.fn().mockReturnThis();
const mockWithAutomaticReconnect = vi.fn().mockReturnThis();
const mockConfigureLogging = vi.fn().mockReturnThis();

const mockConnection = {
  on: mockOn,
  start: mockStart,
  stop: mockStop,
  invoke: mockInvoke,
  state: HubConnectionState.Disconnected,
};

const mockBuild = vi.fn(() => mockConnection);

vi.mock('@microsoft/signalr', () => {
  return {
    HubConnectionState: {
      Connected: 'Connected',
      Disconnected: 'Disconnected',
    },
    LogLevel: {
      Information: 1,
      Warning: 3,
    },
    HubConnectionBuilder: class {
      withUrl = mockWithUrl;
      withAutomaticReconnect = mockWithAutomaticReconnect;
      configureLogging = mockConfigureLogging;
      build = mockBuild;
    },
  };
});

describe('useAppointmentsHub hook', () => {
  const onCancelledMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnection.state = HubConnectionState.Disconnected;
    mockStart.mockResolvedValue(undefined);
    mockStop.mockResolvedValue(undefined);
    mockInvoke.mockResolvedValue(undefined);
  });

  it('does not build or connect if enabled is false', () => {
    renderHook(() =>
      useAppointmentsHub({
        centerId: 'center-abc',
        onCancelled: onCancelledMock,
        enabled: false,
      }),
    );

    expect(mockBuild).not.toHaveBeenCalled();
    expect(mockStart).not.toHaveBeenCalled();
  });

  it('builds, connects, and joins group with centerId when enabled', async () => {
    mockConnection.state = HubConnectionState.Connected;

    const { unmount } = renderHook(() =>
      useAppointmentsHub({
        centerId: 'center-123',
        onCancelled: onCancelledMock,
        enabled: true,
      }),
    );

    expect(mockWithUrl).toHaveBeenCalledWith(expect.stringContaining('/hubs/appointments'), {
      withCredentials: true,
    });
    expect(mockWithAutomaticReconnect).toHaveBeenCalled();
    expect(mockBuild).toHaveBeenCalled();
    expect(mockOn).toHaveBeenCalledWith('AppointmentCancelled', expect.any(Function));
    expect(mockStart).toHaveBeenCalled();

    // Wait for start promise microtasks to resolve
    await vi.waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('JoinCenterGroup', 'center-123');
    });

    unmount();
    expect(mockStop).toHaveBeenCalled();
  });

  it('joins Global group when centerId is null or undefined', async () => {
    mockConnection.state = HubConnectionState.Connected;

    renderHook(() =>
      useAppointmentsHub({
        onCancelled: onCancelledMock,
        enabled: true,
      }),
    );

    await vi.waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('JoinCenterGroup', 'Global');
    });
  });

  it('calls onCancelled callback when AppointmentCancelled event triggers', () => {
    let capturedCallback: Function | null = null;
    mockOn.mockImplementation((event, cb) => {
      if (event === 'AppointmentCancelled') {
        capturedCallback = cb;
      }
    });

    renderHook(() =>
      useAppointmentsHub({
        onCancelled: onCancelledMock,
        enabled: true,
      }),
    );

    expect(capturedCallback).toBeTypeOf('function');

    const sampleNotification = {
      id: 'notif-1',
      donorName: 'أحمد علي',
      donorPhone: '01011112222',
      date: '2026-05-31',
      time: '12:00',
    };

    capturedCallback!(sampleNotification);
    expect(onCancelledMock).toHaveBeenCalledWith(sampleNotification);
  });

  it('gracefully catches and logs connection failures', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
    mockStart.mockRejectedValue(new Error('SignalR network error'));

    renderHook(() =>
      useAppointmentsHub({
        onCancelled: onCancelledMock,
        enabled: true,
      }),
    );

    expect(mockStart).toHaveBeenCalled();

    await vi.waitFor(() => {
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    consoleWarnSpy.mockRestore();
  });
});
