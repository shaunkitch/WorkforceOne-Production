import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    // Create Supabase client with proper cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            request.cookies.delete(name)
            response.cookies.delete(name)
          },
        },
      }
    )

    // Check auth - this should NOT make a fetch call if session is in cookies
    const { data: { session } } = await supabase.auth.getSession()

    // Redirect logic
    const isAuthPage = request.nextUrl.pathname === '/login' || 
                       request.nextUrl.pathname === '/signup'
    const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard') ||
                            request.nextUrl.pathname.startsWith('/onboarding') ||
                            request.nextUrl.pathname.startsWith('/account')

    if (!session && isProtectedPage) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (session && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Default home redirect if logged in
    if (session && request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response

  } catch (error) {
    console.error('[Middleware] Error:', error)
    // On error, allow through to avoid blocking
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
