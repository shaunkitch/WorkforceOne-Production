#!/bin/bash

# FormBuilder SaaS - Project Structure Setup Script
# This script creates the complete folder structure for the Next.js 14+ App Router project

set -e  # Exit on error

echo "🚀 Setting up FormBuilder SaaS project structure..."

# Root directories
mkdir -p app
mkdir -p components
mkdir -p lib
mkdir -p types
mkdir -p public
mkdir -p config

# App directory structure (Next.js 14 App Router)
echo "📁 Creating app routes..."

# Auth routes
mkdir -p app/\(auth\)/login
mkdir -p app/\(auth\)/signup
mkdir -p app/\(auth\)/reset-password
mkdir -p app/\(auth\)/callback

# Dashboard routes (organization-scoped)
mkdir -p app/dashboard/\[orgId\]/forms
mkdir -p app/dashboard/\[orgId\]/forms/\[formId\]
mkdir -p app/dashboard/\[orgId\]/builder/\[formId\]
mkdir -p app/dashboard/\[orgId\]/submissions
mkdir -p app/dashboard/\[orgId\]/submissions/\[formId\]
mkdir -p app/dashboard/\[orgId\]/settings
mkdir -p app/dashboard/\[orgId\]/settings/members
mkdir -p app/dashboard/\[orgId\]/settings/billing
mkdir -p app/dashboard/\[orgId\]/settings/license

# Super Admin routes
mkdir -p app/admin/dashboard
mkdir -p app/admin/organizations
mkdir -p app/admin/licenses
mkdir -p app/admin/users

# Public form view
mkdir -p app/forms/\[formId\]

# API routes
mkdir -p app/api/webhooks/stripe
mkdir -p app/api/webhooks/lemon-squeezy
mkdir -p app/api/forms
mkdir -p app/api/submissions

# Components directory structure
echo "🎨 Creating component directories..."

# UI components (Shadcn)
mkdir -p components/ui

# Feature-specific components
mkdir -p components/auth
mkdir -p components/dashboard
mkdir -p components/forms/builder
mkdir -p components/forms/renderer
mkdir -p components/forms/fields
mkdir -p components/organizations
mkdir -p components/members
mkdir -p components/submissions
mkdir -p components/admin
mkdir -p components/layout
mkdir -p components/providers

# Lib directory structure
echo "🔧 Creating lib directories..."

mkdir -p lib/supabase
mkdir -p lib/actions/forms
mkdir -p lib/actions/organizations
mkdir -p lib/actions/members
mkdir -p lib/actions/submissions
mkdir -p lib/actions/admin
mkdir -p lib/hooks
mkdir -p lib/utils
mkdir -p lib/validations
mkdir -p lib/stripe
mkdir -p lib/constants

# Types directory
echo "📝 Creating types directory..."

mkdir -p types/database
mkdir -p types/forms
mkdir -p types/organizations

# Public assets
echo "🖼️  Creating public asset directories..."

mkdir -p public/images
mkdir -p public/icons
mkdir -p public/fonts

# Config directory
echo "⚙️  Creating config directory..."

mkdir -p config/site

# Create placeholder files to ensure directories are tracked by git
echo "📄 Creating placeholder files..."

# Create .gitkeep files in empty directories
find . -type d -empty -exec touch {}/.gitkeep \;

# Create essential config files
cat > .env.local.example << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe Configuration (optional)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Lemon Squeezy Configuration (optional)
LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_WEBHOOK_SECRET=
EOF

# Create middleware.ts
cat > middleware.ts << 'EOF'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Create next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
EOF

# Create README.md
cat > README.md << 'EOF'
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
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF

echo ""
echo "✅ Project structure created successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Copy .env.local.example to .env.local and add your credentials"
echo "  2. Run: npm install"
echo "  3. Run: npm run dev"
echo "  4. Set up your Supabase database schema"
echo ""
echo "📚 Refer to claude.md for architecture details and development guidelines"
echo ""