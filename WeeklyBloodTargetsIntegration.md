# Main Branch Weekly Blood Type Targets - Integration & UI Guide

This document details how to integrate the backend weekly blood type target endpoints and provides design recommendations for the frontend implementation.

---

## 🚀 API Endpoints Guide

These system-level endpoints are authorized for **Admin** and **Doctor** roles.

### 1. Retrieve Weekly Targets & Progress
Fetch the target counts and current week's progress (Saturday to today) for all 8 blood types.

*   **URL**: `/api/v1/system/donation-centers/main-branch/weekly-targets`
*   **Method**: `GET`
*   **Headers**: `Authorization: Bearer <token>`
*   **Response Status**: `200 OK`
*   **Response Schema**:
    ```json
    {
      "success": true,
      "message": "Success",
      "data": [
        {
          "bloodType": "A+",
          "targetCount": 26,
          "currentDonationsCount": 17
        },
        {
          "bloodType": "A-",
          "targetCount": 1,
          "currentDonationsCount": 0
        },
        {
          "bloodType": "B+",
          "targetCount": 17,
          "currentDonationsCount": 10
        },
        {
          "bloodType": "B-",
          "targetCount": 2,
          "currentDonationsCount": 1
        },
        {
          "bloodType": "AB+",
          "targetCount": 5,
          "currentDonationsCount": 3
        },
        {
          "bloodType": "AB-",
          "targetCount": 2,
          "currentDonationsCount": 0
        },
        {
          "bloodType": "O+",
          "targetCount": 33,
          "currentDonationsCount": 20
        },
        {
          "bloodType": "O-",
          "targetCount": 3,
          "currentDonationsCount": 2
        }
      ],
      "errors": null
    }
    ```

---

### 2. Update Weekly Targets
Set new target counts for the blood types. The system will automatically sum these targets up and synchronize the overall count to the `TargetDonors` field in the main branch's `DonationCenters` record.

*   **URL**: `/api/v1/system/donation-centers/main-branch/weekly-targets`
*   **Method**: `PUT`
*   **Headers**: 
    *   `Authorization: Bearer <token>`
    *   `Content-Type: application/json`
*   **Request Body**:
    ```json
    [
      { "bloodType": "A+", "targetCount": 26 },
      { "bloodType": "A-", "targetCount": 1 },
      { "bloodType": "B+", "targetCount": 17 },
      { "bloodType": "B-", "targetCount": 2 },
      { "bloodType": "AB+", "targetCount": 5 },
      { "bloodType": "AB-", "targetCount": 2 },
      { "bloodType": "O+", "targetCount": 33 },
      { "bloodType": "O-", "targetCount": 3 }
    ]
    ```
*   **Response Status**: `200 OK`
*   **Response Schema**: Returns the updated targets list with current progress counts (same format as the `GET` response).

---

## 🎨 UI & Frontend Integration Recommendations

### 1. Page Placement & Naming
*   **Page Name**: **أهداف الفرع الرئيسي (Main Branch Targets)**
*   **Placement**: Add a new option in the vertical navigation sidebar on the right. We recommend placing it directly under **حملات التبرع (Donation Campaigns)**.
*   **Sidebar Icon**: A target or progress icon (e.g. target bullseye).

### 2. Layout Structure
*   **Page Title**: "أهداف الفرع الرئيسي"
*   **Save Button**: A glowing emerald-green **حفظ التغييرات** (Save Changes) button at the top-left of the page.
*   **Grid Cards**: Render a grid containing exactly 8 cards (one for each blood type: A+, A-, B+, B-, AB+, AB-, O+, O-).
*   **Card Contents**:
    *   **Header**: Bold blood type letters (e.g., `A+`, `O-`).
    *   **Current Progress**: A sleek horizontal green progress bar showing weekly progress (e.g., `17 / 26` bags).
    *   **Progress Percentage**: Labeled as `65% مكتمل` or equivalent.
    *   **Target Input**: An editable number input field mapped to `targetCount` where the doctor/admin can set the weekly target.

### 3. Date Cooldown & Weekly Reset
*   Explain to the user/developer:
    *   Weekly progress is calculated based on the local calendar week starting on **Saturday** and ending on **Friday** (inclusive).
    *   At **12:00 AM midnight between Friday and Saturday local time**, the date range shifts forward, causing the progress count to reset back to **zero (0)**.
