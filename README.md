# 🛍️ LUXE Staff & Shop Dashboard

A full‑stack **Next.js** web application for LUXE, featuring:

- **Staff Dashboard**: Inventory management, fitting‑room requests, add new products & variants  
- **Customer shop**: Shop all, filtering & sorting, cart & fitting‑cart flows, product detail with variant availability  

Built with **Next.js**, **Prisma (PostgreSQL)**, **GSAP**, **NextAuth.js**, and **shadcn/ui** (Tailwind + Radix).

---

## 🌟 Features

### Staff Portal
- 🔒 Role‑based access (Employees & Store Managers)  
- 📦 **Inventory table**: view/edit stock, add new products & variants via inline modals  
- 🚪 **Fitting requests**: view pending try‑on requests, fulfill/cancel  
- ➕ **Product & Variant creation**: create new product + first variant + inventory record; then add more variants to existing products  

### Customer Shop
- 🛒 **Shop all page** with category & price filters, sort by price, live filtering  
- 🛍️ **Product detail**: color & size selection that dynamically disables out‑of‑stock variants  
- 🛒 **Virtual cart**: guest & authenticated cart sessions (2hr expiry), add/remove/update items  
- 👗 **Fitting‑room cart**: authenticated in‑store customers can send try‑on requests  

### Tech & UI
- **Next.js** (App & API Routes)  
- **Prisma ORM** + **PostgreSQL**  
- **GSAP** for animations
- **NextAuth.js** for authentication  
- **shadcn/ui** (Radix + Tailwind) for headless UI components  
- **Lucide‑React** icons  
- Vercel Neon for Database Deployment
- Vercel for Serverless Deployment
- Modern React Hooks & Context  

---

## 🏗 Tech Stack

| Category         | Tools & Libraries                  |
| ---------------- | ---------------------------------- |
| Framework        | Next.js (React, SSR, API routes)   |
| Authentication   | NextAuth.js                        |
| Database ORM     | Prisma                             |
| Database         | PostgreSQL (via env `DATABASE_URL`)|
| UI Components    | shadcn/ui (Radix + Tailwind)       |
| Icons            | Lucide‑React                       |
| Styling          | Tailwind CSS                       |

---

## 🔧 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-org/luxe-dashboard.git
cd luxe-dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
