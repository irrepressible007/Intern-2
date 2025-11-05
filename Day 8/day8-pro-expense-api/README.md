# Day 8: Advanced Expense Management API (Pro Features)

This project is a complete, secure, and multi-tenant Expense Management API built with NestJS and MongoDB. It implements all features from the Day 8 task list, including JWT authentication, user-scoped data, budgeting, recurring expenses, advanced reporting, and file uploads.

---

## ✨ Features

* **Authentication:** Full JWT (stateless) authentication with `signup` and `login`.
* **User Scoping:** All data (`categories`, `expenses`, `budgets`) is 100% scoped to the logged-in user.
* **Categories:** CRUD with soft-delete, audit fields, and case-insensitive unique slugs per user.
* **Expenses:** CRUD with soft-delete, advanced filtering (`month`, `category`, `search`, `amount`), and receipt linking.
* **Recurring Expenses:** A CRON job (`@nestjs/schedule`) runs daily to create concrete expenses from user-defined templates (e.g., "Monthly Netflix Bill").
* **Budgets:** Users can set monthly budgets, either overall or per-category.
* **Advanced Reports:**
    * `GET /reports/summary`: A powerful aggregation (`$facet`) showing monthly total, category breakdowns, budget comparisons, and overrun alerts.
    * `GET /reports/trend`: A time-series report showing spending over multiple months.
* **File Uploads:** Secure `POST /uploads/receipt` endpoint using Multer for (image/pdf) receipts, with validation for file size (3MB) and MIME type.
* **Global Architecture:**
    * **Response Wrapping:** `TransformInterceptor` wraps all success responses in `{ success: true, data: ... }`.
    * **Global Error Handling:** `AllExceptionsFilter` catches all errors and formats them into a clean `{ success: false, ... }` response.
    * **Global Validation:** `ValidationPipe` (with `whitelist` and `forbidNonWhitelisted`) runs on all DTOs.
    * **Global Security:** A global `JwtAuthGuard` protects all endpoints, except for `@Public()` routes (`/auth/login`, `/auth/signup`).
* **Documentation:** Full API documentation automatically generated with Swagger at `/docs`.

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js (v18+)
* `pnpm` (or `npm`/`yarn`)
* MongoDB Server (running locally on `127.0.0.1:27017`)

### 2. Installation & Setup

1.  **Clone the repository:**
    *(If you are the reviewer, you've already done this)*

2.  **Navigate to the project folder:**
    ```bash
    cd "Day 8/day8-pro-expense-api"
    ```

3.  **Install dependencies:**
    ```bash
    pnpm install
    ```

4.  **Set up Environment File:**
    Create a `.env` file in the root of the `day8-pro-expense-api` folder and paste the following:
    ```env
    MONGO_URI=mongodb://127.0.0.1:27017/day8_pro_db
    JWT_SECRET=mySuperSecretKeyForDay8
    JWT_EXPIRES_IN=15m
    ```

5.  **Start the Database:**
    Make sure your local MongoDB server is running. (Check your Windows "Services" app for "MongoDB Server" and ensure it is "Running").

6.  **Run the Application:**
    ```bash
    pnpm run start:dev
    ```
    The API will be live at `http://127.0.0.1:3000`.

---

## 🧪 How to Test & Verify

### 1. API Documentation (Swagger)

The easiest way to see all endpoints is to visit:
**`http://127.0.0.1:3000/docs`**

### 2. Database Seeding (Recommended First Step)

To fill the database with a test user, categories, expenses, and budgets, run the seed script:
```bash
