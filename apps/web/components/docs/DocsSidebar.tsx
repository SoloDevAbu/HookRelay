"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { 
  Cpu, 
  Graph, 
  Folder, 
  CheckSquare, 
  Play, 
  Sliders, 
  Code, 
  GitMerge, 
  ArrowClockwise, 
  Lightning, 
  Gauge, 
  Flame, 
  Stack, 
  FileText,
  House
} from "@phosphor-icons/react";
import { useSidebar } from "@/components/ui/sidebar";

const docSections = [
  { id: "architecture", title: "Architecture", icon: Cpu },
  { id: "benchmarks", title: "Performance Benchmarks", icon: Graph },
  { id: "structure", title: "Project Structure", icon: Folder },
  { id: "prerequisites", title: "Prerequisites", icon: CheckSquare },
  { id: "getting-started", title: "Getting Started", icon: Play },
  { id: "configuration", title: "Configuration", icon: Sliders },
  { id: "api-reference", title: "API Reference", icon: Code },
  { id: "pipeline", title: "Delivery Pipeline", icon: GitMerge },
  { id: "retry-strategy", title: "Retry Strategy", icon: ArrowClockwise },
  { id: "circuit-breaker", title: "Circuit Breaker", icon: Lightning },
  { id: "rate-limiting", title: "Rate Limiting", icon: Gauge },
  { id: "load-testing", title: "Load Testing", icon: Flame },
  { id: "tech-stack", title: "Tech Stack", icon: Stack },
  { id: "license", title: "License", icon: FileText }
];

export function DocsSidebar() {
  const [activeSection, setActiveSection] = useState("architecture");
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const section of docSections) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth"
      });
    }
    // Close mobile sidebar on navigation
    setOpenMobile(false);
  };

  return (
    <Sidebar className="border-r border-border bg-card">
      <SidebarContent className="py-6">
        <SidebarGroup>
          <div className="px-3 mb-6">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold hover:text-blue-600 transition-colors">
              <House className="size-4" />
              Back to Home
            </Link>
            <div className="mt-4 text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
              Documentation
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {docSections.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      onClick={() => handleScrollTo(item.id)}
                      isActive={activeSection === item.id}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                        activeSection === item.id 
                          ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
