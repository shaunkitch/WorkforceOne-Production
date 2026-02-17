import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import {
  ArrowRight,
  BarChart3,
  Lock,
  Zap,
  CheckCircle2,
  Users,
  Globe,
  Clock,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default async function IndexPage() {
  const supabase = createClient();

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error("IndexPage Auth Error:", error);
  }

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">

        {/* --- HERO SECTION --- */}
        <section className="relative overflow-hidden bg-background pt-16 md:pt-20 lg:pt-32 pb-16 md:pb-20 lg:pb-32">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="container flex flex-col items-center text-center gap-6">
            <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary rounded-full text-sm font-medium mb-4">
              ✨ New: AI-Powered Form Building
            </Badge>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl text-balance">
              Manage your Workforce.<br />
              <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                Automate the Rest.
              </span>
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed text-balance">
              WorkforceOne creates the bridge between your field teams and your office.
              Build powerful forms, track time, manage payroll, and automate workflows—all in one beautiful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
              <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 transition-all hover:scale-105">
                <Link href="/signup">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base bg-background/50 backdrop-blur border-muted-foreground/20">
                <Link href="#features">View Features</Link>
              </Button>
            </div>

            {/* Hero Image / Dashboard Preview */}
            <div className="mt-16 relative w-full max-w-5xl rounded-xl border bg-card p-2 shadow-2xl">
              <div className="rounded-lg bg-muted/50 aspect-video w-full flex items-center justify-center text-muted-foreground overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
                  alt="Dashboard Preview"
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- SOCIAL PROOF --- */}
        <section className="py-12 bg-muted/30 border-y">
          <div className="container text-center">
            <p className="text-sm font-semibold text-muted-foreground mb-8">TRUSTED BY INNOVATIVE TEAMS WORLDWIDE</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-60">
              {['Acme Corp', 'GlobalTech', 'Nebula', 'Spherix', 'Quotient'].map((brand) => (
                <div key={brand} className="text-xl font-bold font-heading">{brand}</div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section id="features" className="container py-24 space-y-24">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Everything you need to run your operations</h2>
            <p className="text-lg text-muted-foreground">Stop jumping between five different apps. WorkforceOne brings your essential tools together.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Smartphone}
              title="Mobile-First Forms"
              description="Build complex forms with drag-and-drop ease. Capture photos, signatures, GPS locations, and offline data from any device."
            />
            <FeatureCard
              icon={Zap}
              title="Smart Automations"
              description="Trigger emails, webhooks, or database updates instantly when a form is submitted. Put your workflows on autopilot."
            />
            <FeatureCard
              icon={Clock}
              title="Time & Attendance"
              description="Geofenced clock-in/out for field staff. Generate timesheets automatically and track overtime with precision."
            />
            <FeatureCard
              icon={Users}
              title="HR & Payroll"
              description="Manage employee profiles, calculate pay runs based on tracked hours, and handle varying currency rates."
            />
            <FeatureCard
              icon={BarChart3}
              title="Real-time Analytics"
              description="Turn raw data into actionable insights. Visualize trends in submissions, efficiency, and costs with custom dashboards."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Enterprise Security"
              description="Rest easy with role-based access control (RBAC), audit logs, and secure data encryption standards."
            />
          </div>
        </section>

        {/* --- DEEP DIVE SECTION (Alternating) --- */}
        <section className="py-24 bg-slate-50 dark:bg-slate-950/50">
          <div className="container space-y-24">
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">Easy Form Builder</Badge>
                <h3 className="text-3xl md:text-4xl font-bold">Unleash your data collection potential</h3>
                <p className="text-lg text-muted-foreground">
                  Create dynamic forms with conditional logic, repeatable sections, and rich media uploads.
                  Our AI assistant can even build the form for you—just upload a PDF or describe what you need.
                </p>
                <ul className="space-y-3 pt-4">
                  {['Drag-and-drop interface', 'AI-powered generation', 'Offline capability', 'Conditional logic'].map(item => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 rounded-xl bg-background shadow-2xl border p-2 ring-1 ring-slate-200 dark:ring-slate-800">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60" alt="Form Builder" className="rounded-lg w-full h-auto object-cover aspect-[4/3]" />
              </div>
            </div>

            {/* Feature 2 (Reverse) */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1 space-y-6">
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400">Remote Workforce</Badge>
                <h3 className="text-3xl md:text-4xl font-bold">Manage your team, wherever they are</h3>
                <p className="text-lg text-muted-foreground">
                  From onboarding to payroll, handle the entire employee lifecycle.
                  Track live GPS locations during work hours and ensure accurate timekeeping for billing.
                </p>
                <ul className="space-y-3 pt-4">
                  {['Live GPS Tracking', 'Automated Timesheets', 'Multi-currency Payroll', 'Team Management'].map(item => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 rounded-xl bg-background shadow-2xl border p-2 ring-1 ring-slate-200 dark:ring-slate-800">
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60" alt="Team Management" className="rounded-lg w-full h-auto object-cover aspect-[4/3]" />
              </div>
            </div>
          </div>
        </section>

        {/* --- PRICING --- */}
        <section id="pricing" className="container py-24 text-center">
          <div className="max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground">Start for free, scale as you grow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <PricingCard
              title="Starter"
              price="$0"
              description="Perfect for small teams getting started."
              features={['1 Admin User', '5 Forms', '100 Submissions/mo', 'Basic Analytics', 'Community Support']}
              cta="Start Free"
              href="/signup"
            />
            {/* Pro Tier */}
            <PricingCard
              title="Professional"
              price="$29"
              period="/mo"
              description="For growing businesses needing automation."
              popular={true}
              features={['5 Admin Users', 'Unlimited Forms', '5,000 Submissions/mo', 'Automations & Webhooks', 'Priority Support', 'Remove Branding']}
              cta="Start Trial"
              href="/signup"
              variant="default"
            />
            {/* Enterprise Tier */}
            <PricingCard
              title="Enterprise"
              price="Custom"
              description="For large organizations with custom needs."
              features={['Unlimited Users', 'Unlimited Submissions', 'SLA Guarantee', 'Dedicated Success Manager', 'SSO & Advanced Security', 'Custom Integrations']}
              cta="Contact Sales"
              href="mailto:sales@workforceone.com"
            />
          </div>
        </section>

        {/* --- FAQ --- */}
        <section className="container py-24 max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Can I import existing PDFs?</AccordionTrigger>
              <AccordionContent>
                Yes! With our AI Smart Import, you can upload any PDF form and we will convert it into a digital, mobile-friendly form in seconds.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Does the app work offline?</AccordionTrigger>
              <AccordionContent>
                Absolutely. The mobile app allows your field team to collect data, photos, and signatures without an internet connection. Data syncs automatically when they go back online.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How does payroll calculation work?</AccordionTrigger>
              <AccordionContent>
                We use the clocked hours from your team and multiply them by their set hourly rates. You can then generate pay runs for specific periods and export them for payment.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Is my data secure?</AccordionTrigger>
              <AccordionContent>
                We take security seriously. All data is encrypted at rest and in transit. We use enterprise-grade cloud infrastructure and perform regular security audits.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* --- BOTTOM CTA --- */}
        <section className="container py-24">
          <div className="relative rounded-3xl overflow-hidden bg-primary px-6 py-16 sm:px-12 sm:py-24 md:py-32 text-center shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl">
                Ready to revolutionize your workforce?
              </h2>
              <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                Join the thousands of forward-thinking companies building better operations with WorkforceOne.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold w-full sm:w-auto">
                  <Link href="/signup">Get Started Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t bg-slate-50 dark:bg-slate-950">
        <div className="container py-12 md:py-16 lg:py-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> WorkforceOne</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The all-in-one platform for modern field operations. Built for speed, scale, and security.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="/changelog" className="hover:text-primary">Changelog</Link></li>
                <li><Link href="/roadmap" className="hover:text-primary">Roadmap</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/docs" className="hover:text-primary">Documentation</Link></li>
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link href="/community" className="hover:text-primary">Community</Link></li>
                <li><Link href="/help" className="hover:text-primary">Help Center</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">About</Link></li>
                <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
                <li><Link href="/legal" className="hover:text-primary">Legal</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} WorkforceOne Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
              <Link href="/terms" className="hover:underline">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function PricingCard({ title, price, period, description, features, cta, popular, href, variant = "outline" }: any) {
  return (
    <div className={`relative flex flex-col p-8 rounded-2xl border ${popular ? 'border-primary shadow-2xl scale-105 z-10 bg-background' : 'bg-card shadow-sm'}`}>
      {popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-bold rounded-full shadow-lg">Most Popular</div>}
      <div className="mb-8 space-y-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{price}</span>
          {period && <span className="text-muted-foreground">{period}</span>}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature: string) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button asChild variant={variant as any} className="w-full h-12">
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  )
}