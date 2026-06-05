"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/api/useAuth";
import { Button } from "@/components/ui/button";
import { GithubLogoIcon, XLogoIcon } from "@phosphor-icons/react";

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
        "fixed top-0 z-50 w-full border-b border-transparent transition-colors duration-300",
        isScrolled
          ? "border-border bg-background/80 shadow-sm backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
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
          <Link href="https://github.com/SoloDevAbu/HookRelay" target="_blank">
            <GithubLogoIcon className="size-5" />
          </Link>
          <Link href="https://x.com/AbuBakkar2502" target="_blank">
            <XLogoIcon className="size-5" />
          </Link>
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
