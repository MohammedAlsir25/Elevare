# Elevare Development Roadmap

This document outlines the remaining tasks to complete the Elevare application based on the project specification. We will work through these items step-by-step.

## Functional Requirements To-Do

### 1. Backend Integration & API Layer
- [x] Create foundational `api.ts` service with mock functions.
- [x] Refactor `WalletsPage` to use `api.ts`.
- [x] Refactor `TransactionsPage` to use `api.ts`.
- [x] Refactor `ContactsPage` to use `api.ts`.
- [x] Refactor `SalesPage` (Invoices & Kanban) to use `api.ts`.
- [x] Refactor `BudgetsPage` (Budgets & Goals) to use `api.ts`.
- [x] Refactor `HrPage` (Employees, Timesheets, Claims) to use `api.ts`.
- [x] Refactor `AccountingPage` (Accounts, Journal Entries) to use `api.ts`.
- [x] Refactor `InventoryPage` (Products, Purchase Orders) to use `api.ts`.
- [x] Refactor `Dashboard` to use `api.ts`.
- [x] Refactor `Analytics` to use `api.ts`.
- [x] Refactor `ReportsPage` to use `api.ts`.
- [x] **[Backend]** Implement real Node.js backend REST endpoints.
  - [x] Transactions (GET, POST, PUT, DELETE)
  - [x] Wallets (GET, POST, PUT, DELETE)
  - [x] Contacts (GET, POST, PUT, DELETE)
  - [x] Invoices (GET, POST, PUT, DELETE)
  - [x] Budgets (GET, POST, PUT, DELETE)
  - [x] Financial Goals (GET, POST, PUT, DELETE)
  - [x] HR (Employees, Timesheets, Claims) (GET, POST, PUT, DELETE, Approve)
  - [x] Accounting (Accounts, Journal Entries) (GET, POST, PUT, DELETE)
  - [x] Inventory (Products, POs) (GET, POST, PUT, DELETE, Receive)
  - [x] Admin (Users) (GET, POST, PUT, DELETE)
- [x] **[Backend]** Connect frontend `api.ts` to the live backend.
  - [x] Transactions
  - [x] Wallets
  - [x] Contacts
  - [x] Invoices
  - [x] Budgets
  - [x] Financial Goals
  - [x] HR (Employees, Timesheets, Claims)
  - [x] Accounting (Accounts, Journal Entries)
  - [x] Inventory (Products, POs)
  - [x] Admin (Users)
- [x] **[Backend]** Implement JWT authentication.
  - [x] JWT verification middleware
  - [x] Refresh tokens
- [x] **[Backend]** Implement database connection with PostgreSQL.

### 2. AI & Automation Features
- [x] **Receipt OCR:** Implement image upload on `TransactionModal` and connect to a mock OCR endpoint in `api.ts` that returns extracted text (vendor, date, amount).
- [x] **Auto-Categorization:** When a transaction is created, call a (mock) AI service to suggest a category.
- [x] **Cash Flow Forecasting:** Add a new chart to the `Analytics` page that shows a simple time-series forecast.
- [x] **AI Chatbot Enhancement:** Connect the `AIAssistant` to the `api.ts` to get contextual data (e.g., "What was my biggest expense category this month?") give it the ability to access the application data to help the user to get any info he need.

### 3. Advanced Module Features
- [x] **Transactions:** Implement recurring transactions.
- [x] **Sales:** Implement PDF invoice generation (client-side library like `jspdf`).
- [x] **Sales:** Create a simple "Customer Portal" view where a customer can see their invoices.
- [x] **Accounting:** Implement bank statement import (CSV).
- [x] **Accounting:** Implement multi-currency support with exchange rates.

### 4. Admin & Settings
- [x] **Multi-Company:** Implement logic to switch between companies.
- [x] **Admin Panel:** Create a new page for Admins to manage users and roles for a company.

## Non-Functional Requirements To-Do

### 1. Cross-Platform Builds
- [ ] **Mobile (React Native):** Create the React Native project structure and share components/logic.
- [x] **Desktop (Electron):** Create the Electron project structure, `electron-main.js`, and build scripts for a Windows installer.
- [x] **.EXE

### 2. Testing
- [x] **Unit Tests:** Add basic unit tests for key components and logic (e.g., calculations in `ReportsPage`).
- [ ] **Integration Tests:** (Placeholder for backend)
- [ ] **E2E Tests:** (Placeholder for Playwright/Cypress)

### 3. CI/CD & Deployment
- [ ] **CI Pipeline:** Create a basic GitHub Actions workflow file to run linters/tests.
- [x] **Containerization:** Create `Dockerfile` for frontend and backend.
- [x] **Local Dev:** Create `docker-compose.yml` for easy local startup.
- [ ] **Deployment:** (Placeholder for AWS/Firebase scripts)

### 4. Polish & UX
- [x] **Localization (i1n):** Add framework for multi-language support.
- [x] **Accessibility:** Perform a final audit for WCAG compliance.
- [ ] **Offline Support:** (Placeholder for mobile)
- [x] **Notifications:** Add a simple notification component/system in the UI.

## Future Features & Enhancements (Post-V1)

### 1. Core Accounting
- [ ] **Bank Reconciliation:** Create a UI to match imported bank transactions with system records.
- [ ] **Audit Trail:** Log all create, update, and delete actions on critical financial records for compliance.
- [ ] **Tax Management:** Implement a basic system for applying, tracking, and reporting sales tax on transactions.
### 2. Integrations
- [ ] **Payment Gateways:** Integrate Stripe or PayPal or apple pay to allow customers to pay invoices directly via the Customer Portal.
- [ ] **Email Integration:** Implement functionality to send invoices, reminders, and purchase orders directly from the app.

### 3. User Experience & Customization
- [ ] **Custom Fields:** Allow users to add custom data fields to modules like contacts, invoices, and products.
- [x] **Role-Based Dashboards:** Create default dashboard layouts tailored to different user roles (Admin, Accountant, HR Manager, etc.).
- [x] **Onboarding Tour:** Implement a guided tour for new users to explain key features of the application.

### 4. Security
- [ ] **Two-Factor Authentication (2FA):** Add 2FA options for enhanced user account security.

## Polish & UX Improvements (Pre-Release Checklist)
- [x] **Custom Confirmation Modals:** Replace all `window.confirm()` calls with a consistent, styled modal component.
- [x] **Enhanced Empty States:** Improve "No data" messages to include illustrations and clear call-to-action buttons (e.g., "Add your first transaction").
- [x] **Consistent Notifications:** Replace all native `alert()` calls with the `useNotification` system for a unified user experience.
- [x] **Date Localization:** Use `Intl.DateTimeFormat` with the current language from `I18nContext` to format all user-facing dates.
- [x] **Debounced Search:** Implement debouncing on all search inputs to improve performance, especially for future server-side searching.
- [x] **Advanced Form Validation:** Add more robust client-side validation for forms (e.g., email format, password strength during user creation).
- [x] **User Avatars:** Allow users to upload an avatar or generate a default one based on their initials, replacing the placeholder.
- [x] **Onboarding Tour:** Implement an animated, guided tour for new sign-up users.