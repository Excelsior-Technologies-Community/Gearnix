# Gearnix — Full-Stack E-Commerce

A production-style gaming-gear store built with **React + Node/Express + MySQL (Stored Procedures) + JWT + Razorpay**, with a customer storefront and a full admin panel with role-based access control. UI follows the `nov-gearnix.myshopify.com` theme.

## Features

### Storefront (customer)
- Home page matching the reference theme (hero slider, categories, promo banners, top-rated, weekly deals, new arrivals, brands, gaming-advantage banner, reviews, blog, footer)
- Product listing with category filter + search; product details with image gallery & related products
- Blog listing + article pages
- **Cart & Wishlist** (global state, persisted) with hover actions, quick-view modal, and a cart drawer
- **Auth**: register, login, forgot/reset password, profile, change password, order history
- **Checkout → Razorpay → server-side verification → order confirmation**

### Admin panel (`/admin`)
- Secure admin login + protected routes
- **Dashboard** with live stats (users, products, categories, blogs, orders, payments, revenue)
- CRUD for **Products, Categories, Blogs**
- **Users**, **Orders** (status updates), **Payments** (search) management
- **RBAC**: create roles with a module × action permission matrix, create sub-admins, assign roles — enforced on the **backend** (not just hidden in the UI)
- Swagger API docs at `/api-docs`

## Tech
- **Frontend:** React 19, Vite, Tailwind CSS 4, React Router, Axios, Context API
- **Backend:** Node, Express, MySQL (mysql2) with **Stored Procedures for all DB operations**, JWT auth, bcryptjs, express-validator, Razorpay, swagger-jsdoc/ui

## Prerequisites
- Node 18+ and MySQL 8+ running locally

## Setup

```bash
# 1) Backend
cd backend
npm install
cp .env.example .env        # set DB_PASSWORD (and Razorpay keys if you have them)
npm run setup:db            # creates DB + applies schema + all stored procedures
npm run seed                # seeds the Super Admin + sample products
npm run dev                 # http://localhost:5000  (docs: /api-docs)
```

```bash
# 2) Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev                 # http://localhost:5173
```

## Default admin
- URL: `http://localhost:5173/admin/login`
- Email: `admin@gearnix.com`  ·  Password: `Admin@123`

## Payments (Razorpay)
The checkout + verification flow is fully implemented. With the placeholder keys in `.env`, it runs in **mock mode** (payments auto-complete) so you can test the whole flow. Add real `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` to `.env` to go live — no code changes needed. The secret stays server-side; signatures are verified on the backend.

## Project structure
```
Gearnix/
├── backend/   config · controllers · services · middleware · routes · stored-procedures · utils · swagger
└── frontend/  src/{api, components, context, layouts, pages/{landing,admin}, routes, utils}
```

All significant DB work goes through MySQL stored procedures (`backend/stored-procedures/*.sql`), called from the service layer — never raw SQL in controllers.
