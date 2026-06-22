# مواصفات صفحة إعدادات الفرع الرئيسي (Main Branch Settings Frontend Specification)

عزيزي المطور، هذه هي المواصفات والتفاصيل البرمجية الكاملة لتطوير صفحة **إعدادات الفرع الرئيسي** الجديدة. تم تقسيم الصفحة إلى **3 تبويبات (Tabs)** لتنظيم البيانات وعرضها بشكل سلس للمستخدم.

---

## 🎨 الهيكل العام وعناصر واجهة المستخدم (UI Tabs)

يتم عرض الإعدادات تحت قسم **بيانات المنشأة** وتكون مقسمة كالآتي:

### Tab 1: بيانات الفرع والجدولة (Basic Info & Slots)

يحتوي هذا التبويب على البيانات الأساسية للفرع وقواعد حجز المواعيد العامة.

> 💡 **ملاحظة هامة:** إحداثيات الموقع (Latitude & Longitude) تم إخفاؤها تماماً من واجهة المستخدم ويتم إدخالها مباشرة في قاعدة البيانات.

| اسم الحقل في الواجهة (Arabic) | Key (JSON) | نوع الحقل (Input Type) | حالة الحقل (State) / التحقق (Validation) | مثال على البيانات |
| :--- | :--- | :--- | :--- | :--- |
| **اسم الفرع** | `name` | Text Input | مطلوب (Required) | "مستشفى بني سويف العام" |
| **الموقع** | `location` | **Text Input** | مطلوب (Required) | "بني سويف" |
| **تفاصيل العنوان** | `addressDetails` | Text Area | اختياري (Optional) | "شارع الرياض، بجوار مركز البريد" |
| **رقم الهاتف** | `phoneNumber` | Text Input | **تعطيل (Disabled / Read-only)** | "082-2320000" |
| **البريد الإلكتروني** | `email` | Email Input | **تعطيل (Disabled / Read-only)** | "info@bsgh.gov.eg" |
| **أنواع التبرع المدعومة** | `supportedDonationTypes` | Checkboxes | اختيار نوع واحد على الأقل | [ ] كامل الدم (`WholeBlood`) <br/> [ ] صفائح دموية (`Platelets`) <br/> [ ] بلازما (`Plasma`) |
| **مدة الفترة (بالدقائق)** | `slotDurationMinutes` | Select Dropdown | مطلوب (Required) - خيارات: 15, 30, 45, 60 | 15 |
| **أقصى عدد متبرعين بالفترة** | `maxDonorsPerSlot` | Number Input | مطلوب (Required) - رقم صحيح أكبر من 0 | 10 |

---

### Tab 2: ساعات العمل الأسبوعية (Weekly Schedule)

يتم عرض جدول أسبوعي يمثل أيام العمل الاعتيادية (من الأحد إلى السبت).

* لكل يوم من أيام الأسبوع السبعة الخيارات التالية:
  1. **اسم اليوم** (أحد، إثنين، ثلاثاء، إلخ...)
  2. **الحالة (النشاط)**: مفتاح تبديل (Switch / Checkbox) يحدد ما إذا كان الفرع (مفتوح `Open` / مغلق `Closed`).
  3. **وقت الفتح (Open)**: Time Picker (يتم تعطيله إذا كان اليوم مغلقاً).
  4. **وقت الإغلاق (Close)**: Time Picker (يتم تعطيله إذا كان اليوم مغلقاً).
  5. **أقصى عدد متبرعين في الفترة (Max Per Slot)**: حقل رقمي اختياري (يستخدم لتخطي القيمة العامة المحددة في التبويب الأول لهذا اليوم تحديداً).

---

### Tab 3: أيام الإجازات والاستثناءات (Holidays & Exceptions)

يستخدم هذا القسم لإضافة أيام الإجازات الرسمية، العطلات الطارئة، أو أيام الصيانة التي تختلف مواعيدها عن الجدول الأسبوعي المعتاد.

#### 1. جدول عرض الاستثناءات الحالية:
يجب عرض جدول يحتوي على الاستثناءات المضافة مسبقاً مع إمكانية **التعديل** أو **الحذف**:

| التاريخ | الحالة | وقت الفتح | وقت الإغلاق | السبب | إجراءات |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2026-06-25** | مغلق بالكامل | --:-- | --:-- | إجازة عيد الأضحى | [تعديل] [حذف] |
| **2026-07-02** | ساعات خاصة | 09:00 AM | 01:00 PM | أعمال صيانة دورية | [تعديل] [حذف] |

#### 2. نافذة إضافة/تعديل استثناء (Modal Dialog):
عند الضغط على "إضافة استثناء جديد"، تظهر نافذة تحتوي على الحقول التالية:
- **التاريخ (Date)**: Date Picker.
- **نوع الاستثناء (Status)**: خيارين (مغلق بالكامل `IsClosed = true` / ساعات عمل خاصة `IsClosed = false`).
- **وقت الفتح الخاص (Special Opening Time)**: Time Picker (يظهر فقط إذا تم اختيار "ساعات عمل خاصة").
- **وقت الإغلاق الخاص (Special Closing Time)**: Time Picker (يظهر فقط إذا تم اختيار "ساعات عمل خاصة").
- **السبب (Reason)**: Text Input (يصف سبب الإغلاق أو الاستثناء).

---

## 🔌 الربط مع واجهة البرمجيات (API Integration Contract)

### 1. جلب البيانات (GET)
* **Endpoint:** `GET /api/v1/system/donation-centers/main-branch`
* **Response Payload Example (200 OK):**
```json
{
  "isSuccess": true,
  "message": "Success",
  "data": {
    "id": "b5b4d5b7-eaf8-4a92-8b0a-2fc73f6cc3d1",
    "name": "Beni Suef Main Branch",
    "location": "Beni Suef",
    "addressDetails": "Beni Suef Main Branch",
    "phoneNumber": "082-2320000",
    "email": "info@bsgh.gov.eg",
    "supportedDonationTypes": ["WholeBlood", "Platelets", "Plasma"],
    "slotDurationMinutes": 15,
    "maxDonorsPerSlot": 10,
    "weeklyHours": [
      { "dayOfWeek": 0, "isClosed": false, "openingTime": "08:00", "closingTime": "16:00", "maxDonorsPerSlot": null },
      { "dayOfWeek": 1, "isClosed": false, "openingTime": "08:00", "closingTime": "16:00", "maxDonorsPerSlot": null },
      { "dayOfWeek": 2, "isClosed": false, "openingTime": "08:00", "closingTime": "16:00", "maxDonorsPerSlot": null },
      { "dayOfWeek": 3, "isClosed": false, "openingTime": "08:00", "closingTime": "16:00", "maxDonorsPerSlot": null },
      { "dayOfWeek": 4, "isClosed": false, "openingTime": "08:00", "closingTime": "16:00", "maxDonorsPerSlot": null },
      { "dayOfWeek": 5, "isClosed": true, "openingTime": "00:00", "closingTime": "00:00", "maxDonorsPerSlot": null },
      { "dayOfWeek": 6, "isClosed": true, "openingTime": "00:00", "closingTime": "00:00", "maxDonorsPerSlot": null }
    ],
    "exclusions": [
      { "id": "a1b2c3d4-e5f6...", "date": "2026-06-25", "isClosed": true, "specialOpeningTime": null, "specialClosingTime": null, "reason": "إجازة عيد الأضحى" }
    ]
  }
}
```
*ملاحظة: قيم `dayOfWeek` تعبر عن: 0 = الأحد، 1 = الإثنين، 2 = الثلاثاء، 3 = الأربعاء، 4 = الخميس، 5 = الجمعة، 6 = السبت.*

---

### 2. حفظ التغييرات (PUT)
* **Endpoint:** `PUT /api/v1/system/donation-centers/main-branch`
* **Request Payload Example:**
```json
{
  "name": "مستشفى بني سويف العام",
  "location": "بني سويف",
  "addressDetails": "شارع الرياض، بجوار مركز البريد",
  "supportedDonationTypes": ["WholeBlood", "Platelets"],
  "slotDurationMinutes": 15,
  "maxDonorsPerSlot": 10,
  "weeklyHours": [
    { "dayOfWeek": 0, "isClosed": false, "openingTime": "08:00", "closingTime": "16:00", "maxDonorsPerSlot": null },
    { "dayOfWeek": 1, "isClosed": false, "openingTime": "08:00", "closingTime": "16:00", "maxDonorsPerSlot": null },
    { "dayOfWeek": 2, "isClosed": false, "openingTime": "08:00", "closingTime": "16:00", "maxDonorsPerSlot": null },
    { "dayOfWeek": 3, "isClosed": false, "openingTime": "08:00", "closingTime": "16:00", "maxDonorsPerSlot": null },
    { "dayOfWeek": 4, "isClosed": false, "openingTime": "08:00", "closingTime": "16:00", "maxDonorsPerSlot": null },
    { "dayOfWeek": 5, "isClosed": true, "openingTime": "00:00", "closingTime": "00:00", "maxDonorsPerSlot": null },
    { "dayOfWeek": 6, "isClosed": true, "openingTime": "00:00", "closingTime": "00:00", "maxDonorsPerSlot": null }
  ],
  "exclusions": [
    { "date": "2026-06-25", "isClosed": true, "specialOpeningTime": null, "specialClosingTime": null, "reason": "إجازة عيد الأضحى" }
  ]
}
```
*ملاحظة: حقلي الهاتف والبريد الإلكتروني لا يتم إرسالهما في الـ Body عند التحديث لأنهما غير قابلين للتعديل (Disabled).*
