import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DocsSidebar />
      <SidebarInset>
        {/* Mobile Sidebar Trigger placed at the top of content */}
        <div className="md:hidden sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border p-4 flex items-center gap-3">
          <SidebarTrigger />
          <span className="font-semibold text-sm">Documentation</span>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 py-8 md:py-12 flex flex-col gap-20">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
