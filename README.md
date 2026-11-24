# Smart Lab Management System

## Project Overview

A full-stack web application for managing Windows-based computer laboratories at a college. It supports RFID-based student identification, automatic PC allocation, programming exercises, session tracking, and fault management.

---

## Architecture

```
smart-laboratory-system/
├── src/                         # React Frontend (THIS REPO)
│   ├── components/
│   │   ├── layout/              # Sidebar, Topbar, AppLayout
│   │   └── ui/                  # Shared UI components
│   ├── context/                 # AuthContext
│   ├── data/                    # Mock API / seed data
│   ├── pages/                   # All application pages
│   └── types/                   # TypeScript domain types
├── backend/                     # Spring Boot (see backend/README.md)
├── database/                    # MySQL schema + seed
└── agent/                       # C#/.NET Smart Lab Agent
```

---

## Quick Start (Frontend Demo)

### Prerequisites
- Node.js 18+
- npm 9+

### Run

```bash
npm install
npm run dev
```

Visit: **http://localhost:5173/**

---

## Demo Credentials

| Role    | Email                  | Password     |
|---------|------------------------|--------------|
| Admin   | admin@smartlab.edu     | admin123     |
| Faculty | faculty@smartlab.edu   | faculty123   |
| Student | aanya@smartlab.edu     | student123   |

---

## Pages & Features

| Page           | URL             | Roles               | Key Features |
|----------------|-----------------|---------------------|--------------|
| Login          | /login          | All                 | Role-based redirect, demo quick-login |
| Dashboard      | /dashboard      | All                 | KPI cards, live charts, activity feeds |
| PC Monitoring  | /monitoring     | Admin, Faculty      | Grid/Table view, live metrics, detail modal |
| Students       | /students       | Admin, Faculty      | CRUD, RFID assignment, profile modal |
| PC Allocation  | /allocation     | Admin, Faculty      | RFID scan flow, session create/end |
| Exercises      | /exercises      | All (role-aware)    | Create/publish/submit, code editor |
| Submissions    | /submissions    | All (role-aware)    | Faculty review, scoring, feedback |
| Sessions       | /sessions       | Admin, Faculty      | History, filters, duration tracking |
| Faults         | /faults         | Admin, Faculty      | Report, categorize, update status |
| Reports        | /reports        | Admin, Faculty      | Charts, CSV export, analytics |
| Settings       | /settings       | Admin               | Users, labs, system config, audit log |

---

## Technology Stack

- **Frontend**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Routing**: React Router v6
- **Date**: date-fns
- **Utilities**: clsx

### Planned (Full Implementation)
- **Backend**: Java Spring Boot 3
- **Database**: MySQL 8
- **Agent**: C#/.NET 8 Windows Service
- **Auth**: JWT Bearer tokens
- **Real-time**: Server-Sent Events (SSE) for PC heartbeats

---

## Demo Mode Notice

> ⚠️ The current build runs entirely in-browser with simulated data.  
> No real Windows Agent, MySQL, or Spring Boot server is connected.  
> All metrics are realistic simulations for demonstration purposes.

---

## Integration Notes (Full Stack)

### Switching to Real Backend
1. Replace `src/data/mockData.ts` imports with `src/services/api.ts` calls
2. Set `VITE_API_BASE_URL` in `.env` to your Spring Boot server
3. Start the MySQL database and run `database/schema.sql`
4. Start the Spring Boot backend
5. Deploy the C# Agent on each lab PC

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_DEMO_MODE=true
```
