# আমার হাজিরা - Database Schema Documentation

> Auto-generated: 2026-03-11

---

## Tables Overview

| Table | Description |
|-------|-------------|
| `academic_years` | শিক্ষাবর্ষ |
| `shifts` | শিফট (প্রভাতী/দিবা) |
| `panels` | প্যানেল (টাইম স্লট) |
| `classes` | শ্রেণী |
| `sections` | শাখা |
| `students` | শিক্ষার্থী |
| `teachers` | শিক্ষক |
| `rfid_cards_students` | ছাত্র RFID কার্ড |
| `rfid_cards_teachers` | শিক্ষক RFID কার্ড |
| `devices` | ZKTeco ডিভাইস |
| `punch_logs` | পাঞ্চ লগ |
| `student_attendance` | ছাত্র উপস্থিতি |
| `teacher_attendance` | শিক্ষক উপস্থিতি |
| `manual_attendance_logs` | ম্যানুয়াল উপস্থিতি লগ |
| `school_calendar` | স্কুল ক্যালেন্ডার |
| `calendar_class_entries` | ক্যালেন্ডার ক্লাস এন্ট্রি |
| `class_monthly_fees` | ক্লাস মাসিক ফি |
| `student_fee_records` | ছাত্র ফি রেকর্ড |
| `student_custom_fees` | কাস্টম ফি |
| `fee_settings` | ফি সেটিংস |
| `exams` | পরীক্ষা |
| `expenses` | খরচ |
| `finance_mode` | ফাইন্যান্স মোড |
| `finance_feature_flags` | ফিচার ফ্ল্যাগ |
| `inventory_products` | ইনভেন্টরি পণ্য |
| `inventory_transactions` | ইনভেন্টরি লেনদেন |
| `sms_logs` | SMS লগ |
| `sms_settings` | SMS সেটিংস |
| `system_settings` | সিস্টেম সেটিংস |
| `profiles` | ইউজার প্রোফাইল |
| `user_roles` | ইউজার রোল |
| `role_permissions` | রোল পারমিশন |
| `audit_logs` | অডিট লগ |
| `monitor_news` | মনিটর নিউজ |
| `monitor_videos` | মনিটর ভিডিও |
| `required_documents` | প্রয়োজনীয় ডকুমেন্ট |
| `student_documents` | ছাত্র ডকুমেন্ট |
| `website_pages` | ওয়েবসাইট পেজ |
| `website_hero_slides` | হিরো স্লাইড |
| `website_home_sections` | হোম সেকশন |
| `website_available_sections` | উপলব্ধ সেকশন |
| `website_cta_buttons` | CTA বাটন |
| `website_about_content` | সম্পর্কে কন্টেন্ট |
| `website_academics` | একাডেমিক্স |
| `website_facilities` | সুবিধাসমূহ |
| `website_methodologies` | শিক্ষা পদ্ধতি |
| `website_admission_info` | ভর্তি তথ্য |
| `website_alumni` | প্রাক্তন শিক্ষার্থী |
| `website_alumni_form_fields` | অ্যালামনাই ফর্ম ফিল্ড |
| `website_parent_testimonials` | অভিভাবক মতামত |
| `website_results` | ফলাফল |

---

## Enums

```sql
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'teacher', 'operator', 'accountant');
```

---

## Table Details

### `academic_years`
শিক্ষাবর্ষ ম্যানেজমেন্ট

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `name` | text | No | — |
| `start_date` | date | No | — |
| `end_date` | date | No | — |
| `is_active` | boolean | No | `false` |
| `is_archived` | boolean | No | `false` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**RLS Policies:**
- `SELECT`: Authenticated users can view
- `ALL`: Admins can manage (`is_admin(auth.uid())`)

---

### `shifts`
শিফট (প্রভাতী/দিবা ইত্যাদি)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `name` | text | No | — |
| `name_bn` | text | Yes | — |
| `academic_year_id` | uuid | No | — |
| `start_time` | time | No | — |
| `end_time` | time | No | — |
| `late_threshold_time` | time | Yes | `08:30:00` |
| `absent_cutoff_time` | time | Yes | `09:00:00` |
| `sms_trigger_time` | time | Yes | `09:30:00` |
| `is_active` | boolean | No | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**Foreign Keys:** `academic_year_id` → `academic_years.id`

**RLS Policies:**
- `SELECT`: Authenticated users can view
- `ALL`: Admins can manage

---

### `panels`
প্যানেল - শিফটের ভেতরে টাইম স্লট

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `name` | text | No | — |
| `name_bn` | text | Yes | — |
| `shift_id` | uuid | No | — |
| `type` | text | No | — |
| `start_time` | time | No | — |
| `late_threshold_time` | time | No | — |
| `absent_cutoff_time` | time | No | — |
| `sms_trigger_time` | time | No | — |
| `is_active` | boolean | No | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**Foreign Keys:** `shift_id` → `shifts.id`

**RLS Policies:**
- `SELECT`: Authenticated users can view
- `ALL`: Admins can manage

---

### `classes`
শ্রেণী

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `name` | text | No | — |
| `name_bn` | text | Yes | — |
| `grade_order` | integer | No | `0` |
| `shift_id` | uuid | Yes | — |
| `panel_id` | uuid | Yes | — |
| `is_active` | boolean | No | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**Foreign Keys:** `shift_id` → `shifts.id`, `panel_id` → `panels.id`

**RLS Policies:**
- `SELECT`: Authenticated users can view
- `ALL`: Admins can manage

---

### `sections`
শাখা

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `name` | text | No | — |
| `name_bn` | text | Yes | — |
| `class_id` | uuid | No | — |
| `is_active` | boolean | No | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**Foreign Keys:** `class_id` → `classes.id`

**RLS Policies:**
- `SELECT`: Authenticated users can view
- `ALL`: Admins can manage

---

### `students`
শিক্ষার্থী

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `name` | text | No | — |
| `name_bn` | text | Yes | — |
| `student_id_number` | text | Yes | — |
| `class_id` | uuid | No | — |
| `section_id` | uuid | No | — |
| `shift_id` | uuid | No | — |
| `panel_id` | uuid | Yes | — |
| `academic_year_id` | uuid | No | — |
| `guardian_mobile` | text | No | — |
| `blood_group` | text | Yes | — |
| `photo_url` | text | Yes | — |
| `admission_date` | date | Yes | — |
| `is_active` | boolean | No | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**Foreign Keys:** `class_id` → `classes.id`, `section_id` → `sections.id`, `shift_id` → `shifts.id`, `panel_id` → `panels.id`, `academic_year_id` → `academic_years.id`

**RLS Policies:**
- `SELECT`: Authenticated users can view
- `ALL`: Admins can manage

---

### `teachers`
শিক্ষক

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `name` | text | No | — |
| `name_bn` | text | Yes | — |
| `designation` | text | No | — |
| `mobile` | text | No | — |
| `shift_id` | uuid | No | — |
| `panel_id` | uuid | Yes | — |
| `academic_year_id` | uuid | No | — |
| `blood_group` | text | Yes | — |
| `photo_url` | text | Yes | — |
| `is_active` | boolean | No | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**Foreign Keys:** `shift_id` → `shifts.id`, `panel_id` → `panels.id`, `academic_year_id` → `academic_years.id`

**RLS Policies:**
- `SELECT`: Authenticated users can view
- `ALL`: Admins can manage

---

### `rfid_cards_students`
ছাত্র RFID কার্ড

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `card_number` | text | No | — |
| `student_id` | uuid | No | — |
| `enrolled_at` | timestamptz | No | `now()` |
| `is_active` | boolean | No | `true` |
| `created_at` | timestamptz | No | `now()` |

**Foreign Keys:** `student_id` → `students.id` (one-to-one)

**RLS Policies:**
- `SELECT`: Authenticated users can view
- `ALL`: Admins can manage

---

### `rfid_cards_teachers`
শিক্ষক RFID কার্ড

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `card_number` | text | No | — |
| `teacher_id` | uuid | No | — |
| `enrolled_at` | timestamptz | No | `now()` |
| `is_active` | boolean | No | `true` |
| `created_at` | timestamptz | No | `now()` |

**Foreign Keys:** `teacher_id` → `teachers.id` (one-to-one)

**RLS Policies:**
- `SELECT`: Authenticated users can view
- `ALL`: Admins can manage

---

### `devices`
ZKTeco ডিভাইস

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `name` | text | No | — |
| `ip_address` | text | No | — |
| `port` | integer | No | `4370` |
| `location` | text | Yes | — |
| `device_type` | text | Yes | `'zkteco'` |
| `is_online` | boolean | No | `false` |
| `is_active` | boolean | No | `true` |
| `last_sync_at` | timestamptz | Yes | — |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**RLS Policies:**
- `SELECT`: Authenticated users can view
- `ALL`: Admins can manage

---

### `punch_logs`
পাঞ্চ লগ (ডিভাইস থেকে আসা ডেটা)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `person_id` | uuid | No | — |
| `person_type` | text | No | — |
| `punch_date` | date | No | — |
| `punch_time` | timestamptz | No | `now()` |
| `card_number` | text | Yes | — |
| `device_id` | uuid | Yes | — |
| `created_at` | timestamptz | No | `now()` |

**Foreign Keys:** `device_id` → `devices.id`

**RLS Policies:**
- `SELECT`: Authenticated users can view
- `ALL`: Admins can manage
- `INSERT`: Authenticated users can insert

---

### `student_attendance`
ছাত্র উপস্থিতি

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `student_id` | uuid | No | — |
| `academic_year_id` | uuid | No | — |
| `attendance_date` | date | No | — |
| `punch_time` | timestamptz | No | — |
| `status` | text | No | — |
| `device_id` | uuid | Yes | — |
| `is_manual` | boolean | No | `false` |
| `manual_by` | uuid | Yes | — |
| `manual_reason` | text | Yes | — |
| `created_at` | timestamptz | No | `now()` |

**Foreign Keys:** `student_id` → `students.id`, `academic_year_id` → `academic_years.id`, `device_id` → `devices.id`

**RLS Policies:**
- `SELECT`: Authenticated users can view
- `ALL`: Admins can manage

---

### `teacher_attendance`
শিক্ষক উপস্থিতি

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `teacher_id` | uuid | No | — |
| `academic_year_id` | uuid | No | — |
| `attendance_date` | date | No | — |
| `punch_in_time` | timestamptz | Yes | — |
| `punch_out_time` | timestamptz | Yes | — |
| `late_minutes` | integer | Yes | `0` |
| `status` | text | No | — |
| `device_id` | uuid | Yes | — |
| `is_manual` | boolean | No | `false` |
| `manual_by` | uuid | Yes | — |
| `manual_reason` | text | Yes | — |
| `created_at` | timestamptz | No | `now()` |

**Foreign Keys:** `teacher_id` → `teachers.id`, `academic_year_id` → `academic_years.id`, `device_id` → `devices.id`

**RLS Policies:**
- `SELECT`: Authenticated users can view
- `ALL`: Admins can manage

---

### `manual_attendance_logs`
ম্যানুয়াল উপস্থিতি পরিবর্তনের লগ

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `person_id` | uuid | No | — |
| `person_type` | text | No | — |
| `attendance_date` | date | No | — |
| `old_status` | text | Yes | — |
| `new_status` | text | No | — |
| `reason` | text | Yes | — |
| `admin_id` | uuid | No | — |
| `created_at` | timestamptz | No | `now()` |

**RLS Policies:**
- `SELECT`: Admins can view
- `INSERT`: Admins can insert
- ❌ UPDATE/DELETE not allowed

---

### `school_calendar`
স্কুল ক্যালেন্ডার (ছুটি/কর্মদিবস)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `calendar_date` | date | No | — |
| `day_type` | text | No | — |
| `title` | text | Yes | — |
| `title_bn` | text | Yes | — |
| `description` | text | Yes | — |
| `applies_to_all_classes` | boolean | No | `true` |
| `academic_year_id` | uuid | No | — |
| `created_by` | uuid | Yes | — |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**Foreign Keys:** `academic_year_id` → `academic_years.id`

**RLS Policies:**
- `SELECT`: Authenticated/public can view
- `ALL`: Admins can manage

---

### `calendar_class_entries`
ক্যালেন্ডার ক্লাস-ভিত্তিক এন্ট্রি

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `calendar_id` | uuid | No | — |
| `class_id` | uuid | No | — |
| `entry_type` | text | No | — |
| `created_at` | timestamptz | No | `now()` |

**Foreign Keys:** `calendar_id` → `school_calendar.id`, `class_id` → `classes.id`

---

### `class_monthly_fees`
ক্লাসভিত্তিক মাসিক ফি

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `class_id` | uuid | No | — |
| `academic_year_id` | uuid | No | — |
| `amount` | numeric | No | `0` |
| `admission_fee` | numeric | No | `0` |
| `session_charge` | numeric | No | `0` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**Foreign Keys:** `class_id` → `classes.id`, `academic_year_id` → `academic_years.id`

---

### `student_fee_records`
ছাত্র ফি রেকর্ড

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `student_id` | uuid | No | — |
| `academic_year_id` | uuid | No | — |
| `fee_type` | text | No | — |
| `fee_month` | date | Yes | — |
| `exam_id` | uuid | Yes | — |
| `amount_due` | numeric | No | `0` |
| `late_fine` | numeric | No | `0` |
| `amount_paid` | numeric | No | `0` |
| `status` | text | No | `'unpaid'` |
| `receipt_number` | text | Yes | — |
| `payment_date` | timestamptz | Yes | — |
| `collected_by` | uuid | Yes | — |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**Foreign Keys:** `student_id` → `students.id`, `academic_year_id` → `academic_years.id`, `exam_id` → `exams.id`

**RLS Policies:**
- `SELECT`: Authenticated users can view
- `ALL`: Admins can manage

---

### `student_custom_fees`
কাস্টম ফি (স্পেশাল ছাত্র)

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `student_id` | uuid | No | — |
| `custom_monthly_fee` | numeric | Yes | — |
| `custom_admission_fee` | numeric | Yes | — |
| `effective_from` | date | No | `CURRENT_DATE` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**Foreign Keys:** `student_id` → `students.id` (one-to-one)

---

### `fee_settings`
ফি সেটিংস

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `academic_year_id` | uuid | No | — |
| `monthly_due_date` | integer | No | `10` |
| `late_fine_amount` | numeric | No | `50` |
| `late_fine_enabled` | boolean | No | `false` |
| `receipt_copy_mode` | text | No | `'dual'` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**Foreign Keys:** `academic_year_id` → `academic_years.id` (one-to-one)

---

### `exams`
পরীক্ষা

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `name` | text | No | — |
| `name_bn` | text | Yes | — |
| `academic_year_id` | uuid | No | — |
| `exam_fee_amount` | numeric | No | `0` |
| `is_active` | boolean | No | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**Foreign Keys:** `academic_year_id` → `academic_years.id`

---

### `expenses`
খরচ

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `title` | text | No | — |
| `amount` | numeric | No | `0` |
| `payment_method` | text | No | `'cash'` |
| `category` | text | Yes | — |
| `notes` | text | Yes | — |
| `expense_date` | date | No | `CURRENT_DATE` |
| `created_by` | uuid | No | — |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**RLS Policies:**
- `SELECT`: Accountants (today only) + Admins (all)
- `INSERT`: Accountants (own)
- `UPDATE`: Accountants (same-day own)
- `ALL`: Super admins

---

### `finance_mode`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `mode` | text | No | `'SIMPLE_MODE'` |
| `updated_at` | timestamptz | No | `now()` |
| `updated_by` | uuid | Yes | — |

**RLS Policies:**
- `SELECT`: Any role
- `ALL`: Super admin only

---

### `finance_feature_flags`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `feature_key` | text | No | — |
| `enabled` | boolean | No | `false` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**RLS Policies:**
- `SELECT`: Any role
- `ALL`: Super admin only

---

### `inventory_products`
ইনভেন্টরি পণ্য

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `name` | text | No | — |
| `name_bn` | text | Yes | — |
| `sku` | text | Yes | — |
| `category` | text | No | `''` |
| `unit_price` | numeric | No | `0` |
| `stock_quantity` | integer | No | `0` |
| `min_stock_alert` | integer | Yes | — |
| `academic_year_id` | uuid | Yes | — |
| `is_active` | boolean | No | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**Foreign Keys:** `academic_year_id` → `academic_years.id`

---

### `inventory_transactions`
ইনভেন্টরি লেনদেন

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `product_id` | uuid | No | — |
| `transaction_type` | text | No | — |
| `quantity` | integer | No | — |
| `unit_price` | numeric | No | `0` |
| `total_amount` | numeric | No | `0` |
| `student_id` | uuid | Yes | — |
| `fee_record_id` | uuid | Yes | — |
| `academic_year_id` | uuid | Yes | — |
| `sold_by` | uuid | Yes | — |
| `notes` | text | Yes | — |
| `created_at` | timestamptz | No | `now()` |

**Foreign Keys:** `product_id` → `inventory_products.id`, `student_id` → `students.id`, `fee_record_id` → `student_fee_records.id`, `academic_year_id` → `academic_years.id`

---

### `sms_settings`
SMS সেটিংস

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `api_key` | text | Yes | — |
| `sender_id` | text | Yes | — |
| `is_enabled` | boolean | No | `false` |
| `absent_sms_enabled` | boolean | No | `true` |
| `late_sms_enabled` | boolean | Yes | `false` |
| `punch_sms_enabled` | boolean | Yes | `false` |
| `monthly_summary_enabled` | boolean | No | `true` |
| `balance` | numeric | Yes | `0` |
| `sms_template` | text | Yes | *(বাংলা টেমপ্লেট)* |
| `punch_sms_template` | text | Yes | *(বাংলা টেমপ্লেট)* |
| `late_sms_template` | text | Yes | *(বাংলা টেমপ্লেট)* |
| `active_sms_provider` | text | Yes | `'mim_sms'` |
| `preferred_channel` | text | Yes | `'sms_only'` |
| `whatsapp_enabled` | boolean | Yes | `false` |
| `whatsapp_fallback_to_sms` | boolean | Yes | `true` |
| `whatsapp_phone_number_id` | text | Yes | — |
| `whatsapp_access_token` | text | Yes | — |
| `whatsapp_business_account_id` | text | Yes | — |
| `bulksmsbd_api_key` | text | Yes | — |
| `bulksmsbd_sender_id` | text | Yes | — |
| `bulksmsbd_balance` | numeric | Yes | `0` |
| `bulksmsbd_balance_updated_at` | timestamptz | Yes | — |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**RLS Policies:**
- `SELECT`: Admins
- `ALL`: Admins

---

### `sms_logs`
SMS লগ

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `mobile_number` | text | No | — |
| `message` | text | No | — |
| `sms_type` | text | No | — |
| `status` | text | No | — |
| `student_id` | uuid | Yes | — |
| `sent_by` | uuid | Yes | — |
| `sent_at` | timestamptz | Yes | — |
| `error_message` | text | Yes | — |
| `retry_count` | integer | Yes | `0` |
| `response_code` | text | Yes | — |
| `response_message` | text | Yes | — |
| `provider_name` | text | Yes | — |
| `channel` | text | Yes | — |
| `fallback_used` | boolean | Yes | `false` |
| `whatsapp_message_id` | text | Yes | — |
| `created_at` | timestamptz | No | `now()` |

**Foreign Keys:** `student_id` → `students.id`

---

### `system_settings`
সিস্টেম সেটিংস

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `school_name` | text | Yes | `'আমার হাজিরা স্কুল'` |
| `school_name_bn` | text | Yes | `'আমার হাজিরা স্কুল'` |
| `school_logo_url` | text | Yes | — |
| `monitor_logo_url` | text | Yes | — |
| `report_header_image_url` | text | Yes | — |
| `timezone` | text | Yes | `'Asia/Dhaka'` |
| `scroller_font_family` | text | Yes | `'Hind Siliguri'` |
| `scroller_font_size` | integer | Yes | `24` |
| `scroller_speed` | integer | Yes | `50` |
| `scroller_bg_color` | text | Yes | `'#991B1B'` |
| `scroller_text_color` | text | Yes | `'#FFFFFF'` |
| `scroller_bullet_color` | text | Yes | `'#FDE047'` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**RLS Policies:**
- `SELECT`: Authenticated users
- `ALL`: Super admin only

---

### `profiles`
ইউজার প্রোফাইল

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `user_id` | uuid | No | — |
| `full_name` | text | No | — |
| `email` | text | Yes | — |
| `phone` | text | Yes | — |
| `avatar_url` | text | Yes | — |
| `address` | text | Yes | — |
| `is_profile_complete` | boolean | No | `false` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**RLS Policies:**
- `SELECT`: Own profile + Admins all
- `UPDATE`: Own profile only
- `INSERT`: System (public)
- ❌ DELETE not allowed

---

### `user_roles`
ইউজার রোল

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `user_id` | uuid | No | — |
| `role` | app_role | No | — |
| `created_at` | timestamptz | No | `now()` |

**Unique:** `(user_id, role)`

---

### `role_permissions`
রোল পারমিশন

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `role` | app_role | No | — |
| `module` | text | No | — |
| `can_create` | boolean | No | `false` |
| `can_read` | boolean | No | `false` |
| `can_update` | boolean | No | `false` |
| `can_delete` | boolean | No | `false` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

---

### `audit_logs`
অডিট লগ

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `user_id` | uuid | Yes | — |
| `action` | text | No | — |
| `table_name` | text | No | — |
| `record_id` | uuid | Yes | — |
| `old_data` | jsonb | Yes | — |
| `new_data` | jsonb | Yes | — |
| `ip_address` | text | Yes | — |
| `created_at` | timestamptz | No | `now()` |

**RLS Policies:**
- `SELECT`: Admins
- `INSERT`: Service role only
- ❌ UPDATE/DELETE not allowed

---

### `monitor_news`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `title` | text | No | — |
| `title_bn` | text | Yes | — |
| `display_order` | integer | No | `0` |
| `is_active` | boolean | No | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

---

### `monitor_videos`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `title` | text | No | — |
| `video_url` | text | No | — |
| `display_order` | integer | No | `0` |
| `is_active` | boolean | No | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

---

### `required_documents`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `name` | text | No | — |
| `name_bn` | text | Yes | — |
| `display_order` | integer | No | `0` |
| `is_mandatory` | boolean | No | `false` |
| `is_active` | boolean | No | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

---

### `student_documents`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `student_id` | uuid | No | — |
| `document_id` | uuid | No | — |
| `is_submitted` | boolean | No | `false` |
| `submitted_at` | timestamptz | Yes | — |
| `file_url` | text | Yes | — |
| `notes` | text | Yes | — |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

**Foreign Keys:** `student_id` → `students.id`, `document_id` → `required_documents.id`

---

## Website Tables

### `website_pages`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `slug` | text | No | — |
| `title` | text | No | — |
| `title_bn` | text | Yes | — |
| `seo_title` | text | Yes | — |
| `seo_description` | text | Yes | — |
| `is_enabled` | boolean | No | `true` |
| `display_order` | integer | No | `0` |
| `parent_page_id` | uuid | Yes | — |
| `is_custom_page` | boolean | Yes | `false` |
| `custom_content` | text | Yes | — |
| `custom_content_bn` | text | Yes | — |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

---

### `website_hero_slides`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `image_url` | text | No | — |
| `title` | text | Yes | — |
| `title_bn` | text | Yes | — |
| `subtitle` | text | Yes | — |
| `subtitle_bn` | text | Yes | — |
| `link_url` | text | Yes | — |
| `display_order` | integer | Yes | `0` |
| `is_enabled` | boolean | Yes | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

---

### `website_home_sections`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `section_key` | text | No | — |
| `section_name` | text | No | — |
| `section_name_bn` | text | Yes | — |
| `display_order` | integer | Yes | `0` |
| `is_enabled` | boolean | Yes | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

---

### `website_about_content`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `section_key` | text | No | — |
| `title` | text | Yes | — |
| `title_bn` | text | Yes | — |
| `content` | text | Yes | — |
| `content_bn` | text | Yes | — |
| `image_url` | text | Yes | — |
| `display_order` | integer | Yes | `0` |
| `is_enabled` | boolean | Yes | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

---

### `website_academics`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `title` | text | No | — |
| `title_bn` | text | Yes | — |
| `description` | text | Yes | — |
| `description_bn` | text | Yes | — |
| `category` | text | Yes | — |
| `class_id` | uuid | Yes | — |
| `syllabus_pdf_url` | text | Yes | — |
| `display_order` | integer | No | `0` |
| `is_enabled` | boolean | No | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

---

### `website_facilities`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `title` | text | No | — |
| `title_bn` | text | Yes | — |
| `description` | text | Yes | — |
| `description_bn` | text | Yes | — |
| `icon` | text | Yes | `'Building'` |
| `display_order` | integer | Yes | `0` |
| `is_enabled` | boolean | Yes | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

---

### `website_methodologies`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `title` | text | No | — |
| `title_bn` | text | Yes | — |
| `description` | text | Yes | — |
| `description_bn` | text | Yes | — |
| `icon` | text | Yes | `'Lightbulb'` |
| `display_order` | integer | Yes | `0` |
| `is_enabled` | boolean | Yes | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

---

### `website_admission_info`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `section_key` | text | No | — |
| `title` | text | No | — |
| `title_bn` | text | Yes | — |
| `content` | text | Yes | — |
| `content_bn` | text | Yes | — |
| `icon` | text | Yes | — |
| `display_order` | integer | Yes | `0` |
| `is_enabled` | boolean | Yes | `true` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

---

### `website_alumni`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `name` | text | No | — |
| `name_bn` | text | Yes | — |
| `photo_url` | text | Yes | — |
| `passing_year` | integer | No | — |
| `current_position` | text | Yes | — |
| `current_position_bn` | text | Yes | — |
| `comment` | text | Yes | — |
| `comment_bn` | text | Yes | — |
| `custom_fields` | jsonb | Yes | `'{}'` |
| `is_featured` | boolean | No | `false` |
| `is_approved` | boolean | No | `false` |
| `show_in_bubble` | boolean | No | `false` |
| `submitted_at` | timestamptz | Yes | `now()` |
| `approved_by` | uuid | Yes | — |
| `approved_at` | timestamptz | Yes | — |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

---

### `website_alumni_form_fields`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `field_name` | text | No | — |
| `field_label` | text | No | — |
| `field_label_bn` | text | Yes | — |
| `field_type` | text | Yes | `'text'` |
| `placeholder` | text | Yes | — |
| `placeholder_bn` | text | Yes | — |
| `is_required` | boolean | Yes | `false` |
| `display_order` | integer | Yes | `0` |
| `is_enabled` | boolean | Yes | `true` |
| `options` | jsonb | Yes | `'[]'` |
| `created_at` | timestamptz | Yes | `now()` |
| `updated_at` | timestamptz | Yes | `now()` |

---

### `website_parent_testimonials`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `name` | text | No | — |
| `name_bn` | text | Yes | — |
| `relation` | text | Yes | — |
| `relation_bn` | text | Yes | — |
| `student_class` | text | Yes | — |
| `photo_url` | text | Yes | — |
| `comment` | text | No | — |
| `comment_bn` | text | Yes | — |
| `rating` | integer | Yes | `5` |
| `is_enabled` | boolean | Yes | `true` |
| `display_order` | integer | Yes | `0` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

---

### `website_results`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `title` | text | Yes | — |
| `pdf_url` | text | No | — |
| `academic_year_id` | uuid | No | — |
| `class_id` | uuid | No | — |
| `exam_id` | uuid | No | — |
| `is_published` | boolean | No | `false` |
| `published_at` | timestamptz | Yes | — |
| `uploaded_by` | uuid | Yes | — |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

---

### `website_cta_buttons`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `button_key` | text | No | — |
| `label` | text | No | — |
| `label_bn` | text | Yes | — |
| `link_url` | text | No | `'/'` |
| `is_enabled` | boolean | Yes | `true` |
| `display_order` | integer | Yes | `0` |
| `created_at` | timestamptz | No | `now()` |
| `updated_at` | timestamptz | No | `now()` |

---

### `website_available_sections`

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| `id` | uuid | No | `gen_random_uuid()` |
| `section_key` | text | No | — |
| `section_name` | text | No | — |
| `section_name_bn` | text | Yes | — |
| `description` | text | Yes | — |
| `source_page` | text | Yes | — |
| `component_name` | text | Yes | — |
| `created_at` | timestamptz | No | `now()` |

---

## Database Functions

### `has_role(_user_id uuid, _role app_role) → boolean`
নির্দিষ্ট ইউজারের নির্দিষ্ট রোল আছে কিনা চেক করে। `SECURITY DEFINER` - RLS bypass করে।

### `has_any_role(_user_id uuid) → boolean`
ইউজারের কোনো রোল আছে কিনা চেক করে।

### `is_admin(_user_id uuid) → boolean`
ইউজার admin বা super_admin কিনা চেক করে।

### `handle_new_user() → trigger`
নতুন ইউজার সাইনআপ করলে অটো `profiles` টেবিলে এন্ট্রি তৈরি করে।

### `handle_super_admin_signup() → trigger`
`super@admin.com` দিয়ে সাইনআপ করলে অটো `super_admin` রোল দেয়।

### `get_dashboard_stats(p_academic_year_id, p_date) → json`
ড্যাশবোর্ড স্ট্যাটস রিটার্ন করে (মোট ছাত্র, শিক্ষক, উপস্থিত, দেরি, অনুপস্থিত)।

### `get_daily_finance_summary(p_date) → json`
দৈনিক আর্থিক সামারি (মোট আদায়, খরচ, ব্যালান্স)।

### `is_working_day(p_date, p_class_id, p_academic_year_id) → boolean`
নির্দিষ্ট তারিখ কর্মদিবস কিনা চেক করে (ক্যালেন্ডার + সাপ্তাহিক ছুটি)।

### `get_working_days_count(p_start_date, p_end_date, p_class_id, p_academic_year_id) → integer`
তারিখ রেঞ্জে মোট কর্মদিবস গণনা করে।

### `update_stock_on_transaction() → trigger`
ইনভেন্টরি লেনদেনে অটো স্টক আপডেট করে।

### `update_updated_at_column() → trigger`
`updated_at` কলাম অটো আপডেট করে।

---

## Storage Buckets

| Bucket | Public | Usage |
|--------|--------|-------|
| `photos` | ✅ | ছাত্র/শিক্ষক ছবি, রিপোর্ট হেডার |
| `videos` | ✅ | মনিটর ভিডিও |
| `student-documents` | ❌ | ছাত্র ডকুমেন্ট (প্রাইভেট) |
| `website-assets` | ✅ | ওয়েবসাইট এসেট |

---

## Entity Relationship Summary

```
academic_years
  ├── shifts (academic_year_id)
  │     └── panels (shift_id)
  │           ├── classes (panel_id)
  │           ├── students (panel_id)
  │           └── teachers (panel_id)
  ├── classes (via shifts)
  │     └── sections (class_id)
  ├── students (academic_year_id, class_id, section_id, shift_id)
  │     ├── rfid_cards_students (student_id) [1:1]
  │     ├── student_attendance (student_id)
  │     ├── student_fee_records (student_id)
  │     ├── student_custom_fees (student_id) [1:1]
  │     ├── student_documents (student_id)
  │     └── sms_logs (student_id)
  ├── teachers (academic_year_id, shift_id)
  │     ├── rfid_cards_teachers (teacher_id) [1:1]
  │     └── teacher_attendance (teacher_id)
  ├── exams (academic_year_id)
  │     └── student_fee_records (exam_id)
  ├── fee_settings (academic_year_id) [1:1]
  ├── class_monthly_fees (academic_year_id, class_id)
  ├── school_calendar (academic_year_id)
  │     └── calendar_class_entries (calendar_id, class_id)
  └── inventory_products (academic_year_id)
        └── inventory_transactions (product_id)

devices
  ├── punch_logs (device_id)
  ├── student_attendance (device_id)
  └── teacher_attendance (device_id)

auth.users (managed by Supabase)
  ├── profiles (user_id)
  └── user_roles (user_id)
```
