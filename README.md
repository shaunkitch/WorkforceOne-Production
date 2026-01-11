# FormBuilder SaaS

A centralized multi-tenant form builder SaaS built with Next.js 14, Supabase, and Tailwind CSS.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React Server Components
- **UI**: Shadcn/UI, Tailwind CSS, Radix UI
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth
- **State**: React Query, Zustand
- **Forms**: react-hook-form, zod
- **Deployment**: Vercel

## Project Structure

```
/app                    # Next.js 14 App Router
  /(auth)              # Authentication routes
  /dashboard/[orgId]   # Organization-scoped dashboard
  /admin               # Super admin panel
  /api                 # API routes and webhooks
/components            # React components
  /ui                  # Shadcn UI components
  /forms               # Form builder & renderer
/lib                   # Utilities and configurations
  /supabase           # Supabase client
  /actions            # Server actions
/types                 # TypeScript type definitions
```

## Getting Started

1. Copy `.env.local.example` to `.env.local` and fill in your credentials
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Set up Supabase database schema (see `docs/schema.sql`)

## Multi-Tenancy

This application uses a shared database with Row-Level Security (RLS) to enforce tenant isolation. Every data table includes an `organization_id` discriminator column.

## Security

- **Row-Level Security**: Database-level tenant isolation
- **RBAC**: Four roles (Owner, Admin, Editor, Viewer)
- **Server Actions**: Secure backend logic without separate API

## License

Proprietary - All rights reserved
