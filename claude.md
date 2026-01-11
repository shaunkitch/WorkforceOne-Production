# FormBuilder SaaS - Technical Context

## Project Overview
This is a **Centralized Multi-Tenant Form Builder SaaS** built on a shared infrastructure model. Users purchase licenses to access isolated workspaces within a single application instance. The architecture enforces strict tenant isolation through database Row-Level Security (RLS).

## Core Architecture

### Tech Stack
- **Frontend & API**: Next.js 14+ (App Router, React Server Components) deployed on Vercel
- **Database & Auth**: Supabase (PostgreSQL with RLS)
- **UI Library**: Shadcn/UI (Radix + Tailwind CSS)
- **State Management**: React Query (data fetching) + Zustand (builder state)
- **Form Engine**: react-hook-form + zod

### 3-Tier Architecture
1. **Presentation Tier**: Next.js handles UI, Form Builder, and Dashboards
2. **Application Tier**: Next.js Server Actions & Edge Functions for business logic
3. **Data Tier**: Supabase PostgreSQL with strict RLS policies

## Multi-Tenancy Model

### Key Principle: Discriminator Pattern
- **Shared Database, Shared Schema**: All tenants use the same database
- **Isolation**: Every data table includes an `organization_id` column
- **Security**: Row-Level Security (RLS) policies enforce tenant boundaries

### Core Database Schema
```sql
-- Organizations are the "tenants" (workspaces/companies)
organizations (
  id uuid PRIMARY KEY,
  name text,
  slug text UNIQUE,  -- for subdomains (acme.formbuilder.com)
  license_key text UNIQUE,
  license_tier text,  -- 'free', 'starter', 'pro', 'agency'
  license_status text,
  limits_forms int,
  limits_submissions int
)

-- Links users to organizations with roles
organization_members (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations,
  user_id uuid REFERENCES profiles,
  role text CHECK (role IN ('owner', 'admin', 'editor', 'viewer'))
)

-- Forms belong to organizations
forms (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations,  -- CRITICAL: tenant discriminator
  title text,
  content jsonb,  -- form schema/configuration
  is_published boolean
)
```

## Role-Based Access Control (RBAC)

### Role Hierarchy (Cascading Permissions)
1. **Owner**: Full access including billing, workspace deletion, member management
2. **Admin**: Create/delete/publish forms, view submissions (no billing access)
3. **Editor**: Edit form content only (cannot publish/delete)
4. **Viewer**: Read-only access to submission results

### Security Implementation
**Defense in Depth**: RBAC is enforced at TWO layers:
1. **Database Level**: RLS policies prevent unauthorized data access
2. **Application Level**: UI gates and server action checks

### Example RLS Policy
```sql
-- Helper function to get user's role in an organization
create function get_user_role(org_id uuid) returns text as $$
  select role from organization_members
  where organization_id = org_id and user_id = auth.uid()
$$ language sql security definer;

-- Only org members can view forms
create policy "Members can view forms" on forms for select
using (auth.uid() in (
  select user_id from organization_members 
  where organization_id = forms.organization_id
));

-- Only admins/owners can edit
create policy "Admins/Owners can edit forms" on forms for update
using (get_user_role(organization_id) in ('owner', 'admin'));
```

## Licensing & Business Model

### License-Based Access
- Users purchase licenses (one-time or subscription) via Stripe/Lemon Squeezy
- Each license grants access to specific tier with defined limits
- License key activates features within the shared platform

### Activation Flow
1. User purchases license → webhook generates `license_key`
2. User signs up and creates organization
3. User enters license key in dashboard
4. System validates and upgrades `license_tier` + increases limits

## Server Actions Pattern

### Why Server Actions?
Instead of a separate API, we use Next.js Server Actions for secure backend logic directly in the app.

### Standard Server Action Structure
```typescript
'use server'

export async function createForm(formData: FormData) {
  const supabase = createClient()
  
  // 1. Authentication check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // 2. Get organization context
  const orgId = formData.get('org_id')
  
  // 3. RBAC check (application-level validation)
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', orgId)
    .single()
  
  if (!['owner', 'admin'].includes(membership.role)) {
    throw new Error('Insufficient permissions')
  }
  
  // 4. Perform database operation (RLS will also enforce)
  const { data, error } = await supabase
    .from('forms')
    .insert({ title: formData.get('title'), organization_id: orgId })
    .select()
  
  if (error) throw error
  return data
}
```

## Super Admin Dashboard

### Purpose
Back-office for platform management at `/admin/*` routes

### Implementation
- Add `is_super_admin` boolean column to `profiles` table
- Middleware protects `/admin/*` routes
- Features: tenant overview, user impersonation, license management

## File Upload Handling
- Use Supabase Storage for file uploads
- Storage buckets secured with RLS policies
- Only organization members can access uploaded files

## Development Guidelines

### Always Include organization_id
When creating server actions or API routes that handle data:
- Always require `organization_id` as context
- Validate user membership in that organization
- Let RLS provide final enforcement

### Context Awareness
The "current organization" should be tracked in:
- URL structure: `/dashboard/[orgId]/...`
- Or via context/cookies if using subdomain routing

### Testing Multi-Tenancy
When testing, always verify:
1. User A cannot access User B's organization data
2. RLS policies block unauthorized queries (test with SQL directly)
3. Role restrictions work at both DB and UI level

## Common Patterns

### Fetching Organization-Scoped Data
```typescript
const { data: forms } = await supabase
  .from('forms')
  .select('*')
  .eq('organization_id', currentOrgId)  // RLS will also enforce this
```

### Checking Permissions in Components
```typescript
const canPublish = ['owner', 'admin'].includes(userRole)

if (canPublish) {
  // Show publish button
}
```

### Realtime Subscriptions (for live updates)
```typescript
supabase
  .channel('submissions')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'submissions',
    filter: `form_id=eq.${formId}`
  }, handleNewSubmission)
  .subscribe()
```

## Security Checklist

When implementing new features, verify:
- [ ] All data tables with user content have `organization_id`
- [ ] RLS policies are enabled on the table
- [ ] Server actions validate both auth and membership
- [ ] UI conditionally renders based on user role
- [ ] File uploads (if any) are scoped to organization
- [ ] API routes check organization membership before returning data

## Project Structure (Recommended)
```
/app
  /(auth)           # Login, signup flows
  /dashboard
    /[orgId]        # Organization-scoped routes
      /forms
      /submissions
      /settings
      /members
  /admin            # Super admin dashboard
  /api              # Webhooks (Stripe, etc.)
/components
  /ui               # Shadcn components
  /forms            # Form builder components
/lib
  /supabase         # Supabase client utilities
  /actions          # Server actions
/types              # TypeScript definitions
```

## Important Notes

- **Never use localStorage or sessionStorage in artifacts** - use React state instead
- **RLS is the final security layer** - even if app logic fails, RLS prevents data leaks
- **Double validation**: Check permissions in server actions AND rely on RLS
- **Organization context is critical**: Always pass/validate `organization_id`
- **License limits**: Check limits before allowing form creation/publishing

## Development Phases

1. **Foundation**: Auth + Organizations + RLS policies
2. **RBAC & Members**: Invitations + role gates
3. **Builder**: Form editor + public form view
4. **Admin & Billing**: Super admin dashboard + payment webhooks