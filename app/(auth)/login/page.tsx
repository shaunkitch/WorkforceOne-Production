"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, Eye, EyeOff, LayoutGrid } from "lucide-react"
import { motion } from "framer-motion"
import { hexToHSL } from "@/lib/utils"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Whitelabel States
  const [branding, setBranding] = useState<{ name: string, logo: string | null, color: string | null } | null>(null)
  const [fetchingBranding, setFetchingBranding] = useState(true)

  const orgParam = searchParams.get("org")

  useEffect(() => {
    async function loadBranding() {
      try {
        const { data, error } = await (supabase.rpc as any)('get_public_org_branding', {
          org_identifier: orgParam || null
        })

        if (!error && data && data.length > 0) {
          const orgData = data[0]
          setBranding({
            name: orgData.name,
            logo: orgData.logo_url,
            color: orgData.brand_color
          })
        }
      } catch (err) {
        console.error("Failed to fetch public org branding:", err)
      } finally {
        setFetchingBranding(false)
      }
    }

    loadBranding()
  }, [orgParam, supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Attempting login for:", email)

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Missing Supabase configuration")
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error("Supabase Auth Error:", authError)
        setError(authError.message)
      } else {
        console.log("Login successful, redirecting...")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err: any) {
      console.error("Unexpected Login Error:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const primaryHSL = branding?.color ? hexToHSL(branding.color) : null;
  const displayTitle = branding?.name || "WorkforceOne";

  return (
    <div
      className="flex min-h-screen bg-background text-foreground transition-colors duration-1000"
      style={primaryHSL ? { "--primary": primaryHSL } as React.CSSProperties : undefined}
    >
      {/* LEFT PANEL - Branding (Hidden on Mobile) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 bg-zinc-950 flex-col items-start justify-between p-12 relative overflow-hidden"
      >
        {/* Decorative Grid Background Elements */}
        <div className="absolute inset-0 z-0 opacity-20 transition-all duration-1000" style={primaryHSL ? { color: `hsl(${primaryHSL})` } : undefined}>
          <svg className="absolute h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40V0H40" fill="none" stroke="currentColor" strokeWidth="1" className={branding ? "" : "text-zinc-700"}></path>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)"></rect>
          </svg>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 transition-all duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 transition-all duration-1000"></div>
        </div>

        <div className="z-10 flex items-center gap-3 text-zinc-50">
          <div className="p-2 bg-primary/20 rounded-lg ring-1 ring-primary/30 flex items-center justify-center min-w-10 min-h-10 transition-all duration-1000 overflow-hidden">
            {branding?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={branding.logo} alt={branding.name} className="w-8 h-8 object-contain" />
            ) : (
              <LayoutGrid className="w-6 h-6 text-primary" />
            )}
          </div>
          <span className="text-xl font-bold tracking-tight">{displayTitle}</span>
        </div>

        <div className="z-10 max-w-lg space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-4xl lg:text-5xl font-extrabold text-zinc-50 tracking-tight leading-tight"
          >
            Welcome Back to <br /> <span className="text-primary border-b-4 border-primary/30 transition-all duration-1000">{displayTitle}.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="text-lg text-zinc-400"
          >
            Log in to continue managing your teams, tracking operations,
            and building advanced workflows from your comprehensive dashboard.
          </motion.p>
        </div>

        <div className="z-10 text-sm text-zinc-500">
          © {new Date().getFullYear()} {displayTitle}. All rights reserved.
        </div>
      </motion.div>

      {/* RIGHT PANEL - Form Container */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-[380px] space-y-8"
        >
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 rounded-lg overflow-hidden min-w-10 min-h-10 flex items-center justify-center transition-all duration-1000">
              {branding?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={branding.logo} alt={branding.name} className="w-6 h-6 object-contain" />
              ) : (
                <LayoutGrid className="w-6 h-6 text-primary" />
              )}
            </div>
            <span className="text-xl font-bold tracking-tight">{displayTitle}</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Sign In</h2>
            <p className="text-muted-foreground text-sm">
              Enter your email and password to access your account.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20"
            >
              {error}
            </motion.div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
                className="h-11 transition-all focus-visible:ring-2 focus-visible:ring-primary/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                <Link href="#" className="text-xs font-medium text-primary hover:underline transition-all">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  required
                  className="h-11 pr-10 transition-all focus-visible:ring-2 focus-visible:ring-primary/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-11 font-medium transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-2 group"
              disabled={loading || fetchingBranding}
            >
              {loading || fetchingBranding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {fetchingBranding ? "Loading Branding..." : "Signing In..."}
                </>
              ) : "Sign In"}
            </Button>

            <div className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <Link href={orgParam ? `/signup?org=${orgParam}` : "/signup"} className="font-semibold text-primary hover:underline transition-all">
                Sign up
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
