"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useLogout } from "@/hooks/api/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle"; // Need to create this

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: user, isLoading } = useUser();
  const { mutate: logout } = useLogout();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/20 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/dashboard" className="font-bold flex items-center gap-2">
            <div className="size-6 rounded bg-primary flex items-center justify-center text-primary-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
            HookRelay
          </Link>
        </div>
        <div className="p-4 flex-1">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/dashboard"
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              Tenants
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium truncate">
              {isLoading ? <Skeleton className="h-4 w-24" /> : user?.name}
            </div>
            <ThemeToggle />
          </div>
          <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => logout()}>
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="h-16 flex items-center px-4 sm:px-6 lg:px-8 border-b bg-background md:hidden justify-between">
          <Link href="/dashboard" className="font-bold flex items-center gap-2">
            HookRelay
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              Log out
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-muted/10 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
