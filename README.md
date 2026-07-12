# AFRIMOS — African Trade Marketplace & Operations System

B2B marketplace connecting **Ethiopian commodity exporters** with **international buyers**.
Exporters list products, buyers search the directory and send inquiries (RFQs), suppliers
respond via built-in messaging. Simple, fast, no middlemen.

## MVP feature set

- **Supplier directory** — public, searchable, filterable (category, certification, shipping terms), verified suppliers only
- **Supplier profiles** — company info, certifications, logo upload, shipping terms, profile-completeness score
- **Product management** — add/edit/delete products with price, MOQ, quality grade, origin, images
- **RFQ system** — buyers send RFQs to a specific supplier or broadcast to a whole category
- **Messaging** — per-RFQ conversation threads with unread counts and read receipts
- **Reviews & ratings** — buyers rate suppliers after a closed RFQ
- **Admin dashboard** — supplier verification (approve/reject with notes), user management, growth analytics
- **Email notifications** — account verification, new RFQ, new message, verification decision
- **JWT auth** — access + refresh tokens, bcrypt-hashed passwords, role-based access (supplier / buyer / admin)

Out of scope for the MVP (per the business plan): payments/escrow, video verification,
multi-language, native mobile apps, AI matching.

## Tech stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18 + Vite, React Router v6, Tailwind CSS, React Hook Form, Recharts, Axios |
| Backend    | Node.js 18+, Express.js, Zod validation, Multer uploads |
| Database   | PostgreSQL 14+ with Prisma ORM |
| Auth       | JWT (24h access / 7d refresh) + bcrypt |
| Email      | Nodemailer (any SMTP relay, e.g. SendGrid). Logs to console when SMTP is unconfigured |
| Hosting    | Vercel (frontend) + Railway/Render (backend + Postgres) |

## Repository layout

```
AFRIMOS/
├── client/          # React SPA (Vite)
│   └── src/
│       ├── api/         # axios client with token refresh
│       ├── components/  # layout, cards, badges, pagination…
│       ├── context/     # AuthContext
│       └── pages/       # public, auth, supplier/, buyer/, admin/, shared/
├── server/          # Express API
│   ├── prisma/          # schema.prisma, migrations, seed.js
│   └── src/
│       ├── lib/         # prisma, jwt, email
│       ├── middleware/  # auth, validation, error handling
│       ├── routes/      # auth, suppliers, products, rfqs, messages, admin, upload
│       └── utils/       # profile completeness score
├── docker-compose.yml   # local PostgreSQL
└── docs/API.md          # API reference
```

## Local development

Prerequisites: Node.js 18+, PostgreSQL 14+ (or Docker).

```bash
# 1. Database (skip if you already run Postgres)
docker compose up -d

# 2. Backend
cd server
cp .env.example .env          # fill in DATABASE_URL + JWT secrets
npm install
npx prisma migrate dev        # create schema
npm run seed                  # demo data (optional but recommended)
npm run dev                   # API on http://localhost:5000

# 3. Frontend (new terminal)
cd client
npm install
npm run dev                   # app on http://localhost:3000 (proxies /api to :5000)
```

### Seeded demo accounts

All with password `Password123!`:

| Role     | Email |
|----------|-------|
| Admin    | `admin@afrimos.et` |
| Buyer    | `buyer@example.com` |
| Supplier | `yirga@example.et`, `humera@example.et`, `pulses@example.et` |

In development (no SMTP configured) verification emails are logged to the server console;
grab the link from there, or use the seeded accounts which are pre-verified.

## Deployment

**Frontend (Vercel):** root directory `client/`, build command `npm run build`,
output `dist/`. Set `VITE_API_URL` to the deployed backend URL (e.g. `https://api.afrimos.et/api`).

**Backend (Railway / Render):** root directory `server/`, start command `npm start`.
Run `npx prisma migrate deploy` on deploy. Environment variables (see `server/.env.example`):
`DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `SMTP_*`, `PORT`.

**Database:** any managed PostgreSQL (Neon, Railway, Supabase). Prisma handles
migrations; the platform handles backups.

Health check endpoint: `GET /api/health` → `{ "status": "ok" }`.

## API

Full endpoint reference in [docs/API.md](docs/API.md).

## Roadmap (from the business plan)

1. **Now (MVP):** directory, RFQs, messaging, admin verification — this repo
2. **Next:** escrow payments (Stripe), compliance/KYC layer, document generation (proforma invoices, certificates of origin)
3. **Later:** logistics tracking, buyer financing, expansion to Kenya, Nigeria, Ghana
