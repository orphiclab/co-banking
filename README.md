# Co-Banking Integrated Core Banking System

A full-stack enterprise core banking platform built with a Turborepo monorepo.

## 🏦 Features

- **Authentication**: JWT with RBAC (Admin, Branch Manager, Loan Officer, Teller, Recovery Officer)
- **Customer Management**: KYC verification, risk scoring, account history
- **Loan Management**: Application workflow, amortization schedule, repayments, GL posting
- **Lease Management**: Asset leasing, installment schedule, depreciation tracking
- **Fixed Deposit**: Creation, daily interest accrual, renewal, premature withdrawal
- **General Ledger**: Double-entry accounting, trial balance, P&L, balance sheet
- **Recovery**: Overdue detection, recovery workflow, escalation, settlement
- **Notifications**: BullMQ queues for SMS, Email, and In-App alerts
- **Reporting**: Loan portfolio, overdue aging, branch performance
- **Dashboard**: Live KPIs, animated charts, branch comparison

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, TailwindCSS, Framer Motion, Recharts |
| State | Zustand |
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Queue | Redis + BullMQ |
| Monorepo | Turborepo + PNPM workspaces |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PNPM: `npm install -g pnpm`
- Docker and Docker Compose

### 1. Clone and install
```bash
cd co-banking
cp .env.example .env
pnpm install
```

### 2. Start database services
```bash
docker-compose up -d postgres redis
```

### 3. Run database migrations and seed
```bash
pnpm db:migrate
pnpm db:seed
```

### 4. Start development servers
```bash
pnpm dev
```

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## 📋 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@cobanking.com | Admin@123 |
| Branch Manager | manager@cobanking.com | Manager@123 |
| Loan Officer | loanoffice@cobanking.com | Loan@123 |
| Teller | teller@cobanking.com | Teller@123 |
| Recovery Officer | recovery@cobanking.com | Recovery@123 |

## 🐳 Docker (Full Stack)
```bash
docker-compose up --build
```

## 📁 Project Structure

```
co-banking/
├── apps/
│   ├── web/                  # Next.js 15 frontend
│   │   └── src/
│   │       ├── app/          # App Router pages
│   │       ├── components/   # Layout components (Sidebar, AppShell)
│   │       ├── lib/          # API service layer
│   │       └── store/        # Zustand stores
│   └── api/                  # NestJS backend
│       └── src/
│           ├── modules/
│           │   ├── auth/       # JWT + RBAC
│           │   ├── customers/  # KYC, risk scoring
│           │   ├── loans/      # Amortization, repayments
│           │   ├── leases/     # Asset leasing
│           │   ├── fixed-deposits/ # FD lifecycle
│           │   ├── gl/         # Double-entry accounting
│           │   ├── recovery/   # Recovery workflow
│           │   ├── notifications/ # BullMQ queues
│           │   ├── reporting/  # Reports
│           │   └── dashboard/  # Analytics
│           └── prisma/         # Database service
├── packages/
│   ├── database/             # Prisma schema + seeds
│   └── shared/               # Shared types
├── docker-compose.yml
├── turbo.json
└── .env.example
```
