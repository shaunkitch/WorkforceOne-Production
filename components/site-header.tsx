import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="font-bold sm:inline-block">WorkforceOne</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm">
                        <Link
                            href="#features"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Features
                        </Link>
                        <Link
                            href="#pricing"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Pricing
                        </Link>
                        <Link
                            href="#about"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            About
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Add search or other controls here if needed */}
                    </div>
                    <nav className="flex items-center gap-2">
                        <Button variant="ghost" asChild size="sm">
                            <Link href="/login">Log In</Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/signup">Sign Up</Link>
                        </Button>
                    </nav>
                </div>
            </div>
        </header>
    );
}
