"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/api/useAuth";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { data: user, isLoading } = useUser();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-colors duration-300 border-b border-transparent",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          HookRelay
        </Link>
        <nav className="flex items-center gap-4">
          {!isLoading && (
            <>
              {user ? (
                <Button asChild variant="default">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild variant="default">
                    <Link href="/signup">Sign up</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
