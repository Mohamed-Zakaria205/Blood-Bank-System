# Donor Eligibility Notification API Revision

## Replace Endpoint 3

### POST /api/Donors/notifications

Purpose: Send a notification to one or more donors using a single
endpoint.

### Request

``` json
{
  "donorIds": [
    "donor-guid-1",
    "donor-guid-2"
  ],
  "type": "emergency",
  "message": "🚨 Emergency blood donation request."
}
```

### Notes

-   `donorIds` is required and must contain at least one donor ID.
-   The same endpoint supports:
    -   Single notification (`donorIds` contains one item).
    -   Bulk notification (`donorIds` contains multiple items).
-   `type` must be `emergency` or `ready`.
-   `message` must be non-empty and at most 320 characters.
-   Backend must verify every donor is currently `eligible` or `soon`.
-   Backend should apply rate limiting per donor.
-   Backend should process each donor independently and continue even if
    some recipients fail.

### Response (202)

``` json
{
  "success": true,
  "message": "Notifications processed successfully.",
  "data": {
    "requested": 5,
    "sent": 5,
    "failed": 0,
    "failedDonorIds": []
  }
}
```

## TypeScript Contract

``` ts
export interface SendNotificationRequest {
  donorIds: string[];
  type: "emergency" | "ready";
  message: string;
}
```

This design replaces `POST /api/Donors/{id}/notifications` and keeps the
API consistent by using one endpoint for both single and bulk
notification sending.
