# 🎨 Frontend Integration Specification: Donor Eligibility Settings

This specification outlines the UI design, client-side validation rules, and API integration contract for implementing the **Donor Eligibility & Cooldown Settings** panel in the Admin Dashboard.

---

## 🗺️ Form UI Specifications

The active settings panel must render a form with the following structure:

* **Header Title (`<h1>`):** `إعدادات فترات مؤهلية التبرع` (Donor Eligibility & Cooldown Settings)
* **Description Paragraph:** `تحديد فترات الانتظار الآمنة (بالأيام) بين عمليات التبرع وفترات الاستبعاد المؤقت في حال عدم مطابقة الشروط.` (Determine safe waiting periods (in days) between blood donations and temporary exclusion/deferral periods in case criteria are not met.)

### Input Controls Layout

Arrange the inputs in a clean grid or form layout. All fields are numeric:

| Field Label (Arabic) | Description | Key Name | Default Value |
| :--- | :--- | :--- | :--- |
| **فترة انتظار الذكور (أيام)** | Safe wait days for male whole blood donors | `wholeBloodMaleDays` | `90` |
| **فترة انتظار الإناث (أيام)** | Safe wait days for female whole blood donors | `wholeBloodFemaleDays` | `120` |
| **فترة انتظار البلازما (أيام)** | Cooldown days between plasma donations | `plasmaDays` | `28` |
| **فترة انتظار الصفائح الدموية (أيام)** | Cooldown days between platelet donations | `plateletsDays` | `7` |
| **فترة الاستبعاد المؤقت التلقائية (أيام)** | Deferral days when failing a health screening | `defaultScreeningLockoutDays` | `7` |

* **Form Action Button:**
  * **Label:** `حفظ التغييرات` (Save Changes)
  * **Icon:** Save / Floppy Disk icon
  * **Behavior:** Triggers a `PUT` request to update the configuration.

---

## 🌐 API Integration Contract

### 1. Load Current Eligibility Settings
Call this API when the panel is loaded to populate the form fields.

* **HTTP Method:** `GET`
* **Endpoint URL:** `/api/v1/system/admin/settings/cooldown`
* **Headers:**
  ```http
  Authorization: Bearer <JWT_ACCESS_TOKEN>
  Accept: application/json
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Eligibility settings retrieved successfully.",
    "data": {
      "wholeBloodMaleDays": 90,
      "wholeBloodFemaleDays": 120,
      "plasmaDays": 28,
      "plateletsDays": 7,
      "defaultScreeningLockoutDays": 7
    },
    "errors": null
  }
  ```

---

### 2. Save Eligibility Settings
Call this API when the administrator clicks the **حفظ التغييرات** (Save Changes) button.

* **HTTP Method:** `PUT`
* **Endpoint URL:** `/api/v1/system/admin/settings/cooldown`
* **Headers:**
  ```http
  Authorization: Bearer <JWT_ACCESS_TOKEN>
  Content-Type: application/json
  Accept: application/json
  ```
* **Request Payload:**
  ```json
  {
    "wholeBloodMaleDays": 90,
    "wholeBloodFemaleDays": 120,
    "plasmaDays": 28,
    "plateletsDays": 7,
    "defaultScreeningLockoutDays": 7
  }
  ```

* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Eligibility settings updated successfully.",
    "data": {
      "wholeBloodMaleDays": 90,
      "wholeBloodFemaleDays": 120,
      "plasmaDays": 28,
      "plateletsDays": 7,
      "defaultScreeningLockoutDays": 7
    },
    "errors": null
  }
  ```

---

## ⚠️ Validation & Error Handling

### 1. Client-Side Validation Rules
Before submitting the form, ensure the inputs conform to the following:
* **Required:** All fields must contain a valid number.
* **Positive Integers:** Values must be whole numbers greater than `0`.
* **Logical Range:** Cooldown and lockout days are typically between `1` and `365` days.

---

### 2. Server-Side Error Handling (`400 Bad Request`)
If a server-side validation error occurs, the API returns a structured object detailing the failed fields. Parse this response to show validation error text under each corresponding input box:

* **Error Response Example:**
  ```json
  {
    "success": false,
    "message": "Validation Failed",
    "data": null,
    "errors": {
      "WholeBloodMaleDays": ["Must be greater than 0."],
      "WholeBloodFemaleDays": ["Must be between 1 and 365 days."],
      "DefaultScreeningLockoutDays": ["Must be greater than 0."]
    }
  }
  ```
* **Integration Rule:** Map the keys inside `errors` to highlight the matching form fields and display their corresponding error messages to the administrator.

---

## ⚡ UX Best Practices
* **Loading State:** Show a skeleton loader or a loading spinner inside the inputs while fetching the settings on initial load.
* **Submission Cooldown:** Disable the input fields and the **حفظ التغييرات** button during the `PUT` API call to prevent double submissions.
* **Success Toast:** Show a success notification toast (e.g., "تم حفظ التغييرات بنجاح") once the `200 OK` response is received.
