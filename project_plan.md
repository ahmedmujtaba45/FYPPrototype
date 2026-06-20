# AI-Powered Performance Evaluation Dashboard

## 1. Project Description
A modern SaaS-style web dashboard for AI-powered employee performance evaluation. Supports four user roles (Admin, Line Manager, HR, Employee) with role-specific dashboards, KPI tracking, AI-generated insights, surveys, comprehensive reporting, audit logs, and bias detection.

## 2. Page Structure
- `/login` - Login Page (email/password, company logo, role selector)
- `/manager` - Manager Dashboard (team members, KPI evaluation, quarterly progress, AI insights)
- `/hr` - HR Dashboard (all employees, scoring panel, completion tracker, reports, announcements, surveys)
- `/employee` - Employee Dashboard (assigned KPIs, scores, performance history, AI feedback, announcements, surveys)
- `/reports` - Reports Screen (charts, team/individual performance, export)
- `/survey` - Survey Screen (form submission, anonymous/non-anonymous)
- `/admin` - Admin Dashboard (user management, KPI configuration, system settings)
- `/audit-logs` - Audit Logs (track evaluation changes and submissions)
- `/bias-detection` - Bias Detection (AI-identified scoring inconsistencies)

## 3. Core Features
- [x] Role-based login and navigation
- [x] Manager: Team member list, KPI evaluation forms, quarterly progress summary, AI insights, status tracking
- [x] HR: Employee directory, scoring panel (max 5), completion tracker, reports/charts, announcements, survey management
- [x] Employee: KPI display, score breakdown (Manager/HR/Total), quarterly history, AI feedback, announcements, survey participation
- [x] Reports: Performance charts (team + individual), PDF/Excel export
- [x] Surveys: Response forms with anonymous and non-anonymous modes
- [x] Admin: User management, KPI configuration, system settings
- [x] Audit Logs: Timeline of evaluation changes and submissions
- [x] Bias Detection: AI analysis of scoring inconsistencies

## 4. Data Model Design
(Using mock data for prototype phase - no Supabase connected yet)

### Mock Data Structures
- Users: id, name, email, role, department, avatar
- KPIs: id, employee_id, title, description, weight, target, actual, manager_score, hr_score
- Evaluations: id, employee_id, quarter, year, status, manager_score, hr_score, total_score, ai_insights
- Surveys: id, title, description, is_anonymous, questions[], responses[]
- Announcements: id, title, content, author, date, priority
- AuditLogs: id, action, user, target, details, timestamp
- BiasDetection: id, type, severity, description, affected_employees, recommendation

## 5. Backend / Third-party Integration Plan
- Supabase: Not connected (prototype phase using mock data)
- Shopify: Not needed
- Stripe: Not needed
- Charts: Recharts library (already in dependencies)

## 6. Development Phase Plan

### Phase 1: Core Dashboard Pages
- Goal: Build Login, Manager Dashboard, and HR Dashboard with full UI and mock data
- Deliverable: 3 fully functional pages with navigation, charts, tables, and forms
- Status: COMPLETED

### Phase 2: Employee Dashboard + Reports + Surveys
- Goal: Build Employee Dashboard, Reports Screen, and Survey Screen
- Deliverable: 3 additional pages completing the full prototype
- Status: COMPLETED

### Phase 3: Admin + Audit + Bias Detection
- Goal: Build Admin Dashboard, Audit Logs, and Bias Detection pages
- Deliverable: 3 additional pages for system administration and AI analytics
- Status: IN PROGRESS

### Phase 4: Polish & Interactions
- Goal: Add animations, refine responsive design, enhance UX
- Deliverable: Production-ready polished dashboard
