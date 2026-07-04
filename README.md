# Client Workspace

A modern, light, role-aware client collaboration portal inspired by the workflow needs of small digital agencies. Replace scattered email chains, Google Drive links, and WhatsApp threads with a single unified dashboard for managing projects, client assets, and interactive feedback.

---

## Key Features

- **🔑 Role-Aware Access Control (Admin vs. Client)**:
  - **Admins** can create client projects, upload deliverables/files, assign tasks, and monitor all clients.
  - **Clients** get a focused, read-only view of their specific projects, shared files, and direct feedback channels without administrative clutter.
- **💬 Real-Time Discussion Threads**: A Linear-style chat interface inside projects allowing clients to request revisions and admins to reply in real-time, styled with clear sender roles and custom avatars.
- **📂 Asset Deliverables Manager**: Central repository for tracking all design mockups, booking widget configurations, and asset links with direct source access.
- **🎨 Premium Minimalist UI**: Built using custom Tailwind CSS variables inspired by modern SaaS applications (Notion, Linear, Vercel). No heavy AI-style gradients or glassmorphism, just clean borders, sharp typography, and smooth transitions.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router v7, Axios, Lucide Icons
- **Backend**: Node.js, Express, JSON Web Tokens (JWT) for secure stateful sessions
- **Database**: PostgreSQL (Hosted on Neon serverless postgres)

---

## Getting Started

### 1. Database Initialization
Ensure you have your environment variables set in `server/.env`.
```bash
cd server
npm install
npm run seed
```
> The seeder automatically drops old tables, runs migrations (if needed), and populates realistic agency workspace data (projects, deliverables, comments) to showcase the agency workflow.

### 2. Run Backend Dev Server
```bash
npm run dev
```
The server will boot on `http://localhost:5000`.

### 3. Run Frontend Client
```bash
cd ../client
npm install
npm run dev
```
Vite will start the client interface on `http://localhost:5173`.

---

## 🔐 Seeded Workspace Credentials

Run `npm run seed` to generate default Admin and Client accounts — check `server/seed.js` for credentials.

---

## 🚀 Production Deployment

### Frontend (e.g. Vercel / Netlify)
Set the environment variable on build:
```env
VITE_API_URL=https://your-deployed-backend.com/api
```

### Backend (e.g. Render / Heroku)
Set the following variables:
```env
DATABASE_URL=your_postgresql_uri
JWT_SECRET=your_jwt_secret
```
