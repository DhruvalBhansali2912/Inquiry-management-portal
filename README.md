# Inquiry Management Portal

A full-stack enterprise **Inquiry Management Portal** built with **PHP 8.2+ / Laravel 11** and **React.js 19** with TailwindCSS and Vite. Designed for capturing, tracking, assigning, and converting website visitors and campaign leads into active accounts with audit logging and follow-up reminders.

Built with production best practices and prepared for automated CI/CD deployment on **AlmaLinux 9 Bluehost VPS** servers.

---

## ✨ Features Overview

### 1. Public Lead Intake
- **Clean Responsive Public Form**: Accessible at `/` and `/inquiry` with live client-side validation.
- **Reference Number Generator**: Auto-generates unique inquiry codes (e.g. `INQ-2026-XXXXX`).
- **File Attachments**: Visitors can upload specs, RFPs, or screenshots (PDF, DOCX, PNG, JPG, ZIP).
- **Lead Source & UTM Tracking**: Captures organic channels, `utm_campaign`, `utm_source`, Google Ads, LinkedIn, etc.
- **Automated Staff Assignment**: Automatically assigns new leads to active agents via workload balancing.
- **Email Notifications**: Triggers confirmation email to the lead and instant alerts to sales staff.

### 2. Admin & Staff Operations Portal
- **Role-Based Access Control (RBAC)**: Supports `admin`, `manager`, and `agent` roles with Sanctum token auth.
- **Real-Time Dashboard Metrics**:
  - Total inquiries, open leads, pending follow-ups, and won accounts.
  - Conversion rate percentage calculation.
  - Lead channel breakdown (Website, Google Ads, LinkedIn, Campaigns, Referrals).
  - Pipeline conversion health breakdown.
- **Inquiry Management Table**:
  - Full-text search across lead name, email, phone, company, subject, and reference ID.
  - Filters by status (`new`, `contacted`, `qualified`, `won`, `lost`, `pending`), priority (`low`, `normal`, `high`, `urgent`), source, assignee, and date range.
  - Quick inline status updater directly from the list.
  - Export filtered inquiries to CSV.
- **Comprehensive Detail Panel**:
  - Full lead details, submission IP, user-agent, and contact links.
  - Assign / Reassign to any active team member.
  - **Internal Notes & Logs**: Categorized as General Note, Phone Call, Email Log, or Discovery Meeting.
  - **Follow-up Reminders**: Schedule date/time reminders with status toggling (pending / completed).
  - **Secure Attachments**: Upload supplementary documents or download submitted files securely.
  - **Activity Timeline**: Full chronological audit trail of all actions, status changes, and assignments.

---

## 🏗️ Architecture

- **Backend**: Laravel 11 (REST API, MVC structure, Form Requests, Sanctum authentication, Mailables, Eloquent ORM).
- **Frontend**: React 19 SPA mounted inside Laravel via Vite, TailwindCSS, Lucide Icons.
- **Database**: SQLite (local development and automated in-memory tests) & MariaDB / MySQL (production).
- **CI/CD**: GitHub Actions workflow (`.github/workflows/deploy.yml`) deploying to AlmaLinux 9 VPS.
- **Web Server**: Nginx with PHP-FPM, SELinux enforcement, and Systemd queue workers/timers.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- PHP 8.2+ with PDO, SQLite, cURL, mbstring, and zip extensions
- Composer 2.x
- Node.js 20+ and npm

### 2. Setup
```bash
# 1. Install PHP dependencies
php composer.phar install

# 2. Setup environment
cp .env.example .env
php artisan key:generate

# 3. Run database migrations & seed demo data
php artisan migrate --seed

# 4. Install Node dependencies & compile frontend
npm install
npm run build

# 5. Start the local server
php artisan serve
```

Visit: `http://127.0.0.1:8000`

### Demo Staff Accounts
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@inquiry.local` | `Password123!` |
| **Manager** | `manager@inquiry.local` | `Password123!` |
| **Agent** | `agent@inquiry.local` | `Password123!` |

*(The login screen also provides convenient 1-click login buttons for testing each role)*.

---

## 🧪 Automated Testing

Run the full automated test suite (Unit & Feature tests):
```bash
php artisan test
```

### Test Coverage Highlights:
- `PublicInquirySubmissionTest`: Validates required fields, email formatting, auto-assignment, file uploads, and mail dispatch.
- `AdminAuthTest`: Tests login with valid/invalid credentials, deactivated accounts, profile retrieval, and token revocation.
- `InquiryManagementTest`: Tests listing, full-text search, multi-condition filtering, status transitions, staff assignments, and CSV exports.
- `InquiryNotesAndRemindersTest`: Tests adding notes/call logs, scheduling reminders, and status toggles.
- `InquiryAttachmentsTest`: Tests uploading attachments, secure download streaming, and deletion.
- `DashboardMetricsTest`: Verifies metric math, conversion rate percentages, and channel distribution.

---

## 🌐 Production Deployment (AlmaLinux 9 Bluehost VPS)

See the comprehensive [DEPLOYMENT.md](DEPLOYMENT.md) guide for:
1. AlmaLinux 9 DNF packages installation (PHP 8.2 Remi repo, Nginx, MariaDB).
2. Firewalld and SELinux policies (`httpd_sys_rw_content_t`).
3. GitHub Actions CI/CD secrets configuration (`VPS_HOST`, `VPS_SSH_KEY`, `VPS_USERNAME`).
4. Systemd worker (`inquiry-worker.service`) and scheduler timer (`inquiry-scheduler.timer`).
5. Let's Encrypt SSL via Certbot.
