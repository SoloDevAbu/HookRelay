import React from "react";
import { Separator } from "@/components/ui/separator";

// Import all document sections
import { ArchitectureSection } from "@/components/docs/sections/ArchitectureSection";
import { BenchmarksSection } from "@/components/docs/sections/BenchmarksSection";
import { StructureSection } from "@/components/docs/sections/StructureSection";
import { PrerequisitesSection } from "@/components/docs/sections/PrerequisitesSection";
import { GettingStartedSection } from "@/components/docs/sections/GettingStartedSection";
import { ConfigurationSection } from "@/components/docs/sections/ConfigurationSection";
import { ApiReferenceSection } from "@/components/docs/sections/ApiReferenceSection";
import { PipelineSection } from "@/components/docs/sections/PipelineSection";
import { RetryStrategySection } from "@/components/docs/sections/RetryStrategySection";
import { CircuitBreakerSection } from "@/components/docs/sections/CircuitBreakerSection";
import { RateLimitingSection } from "@/components/docs/sections/RateLimitingSection";
import { LoadTestingSection } from "@/components/docs/sections/LoadTestingSection";
import { TechStackSection } from "@/components/docs/sections/TechStackSection";
import { LicenseSection } from "@/components/docs/sections/LicenseSection";

export default function DocsPage() {
  return (
    <>
      {/* Header Introduction */}
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
          HookRelay Documentation
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Welcome to the complete developer reference guide for HookRelay. Learn how to configure, deploy, scale, and integrate our reliable high-throughput webhook delivery infrastructure.
        </p>
        <Separator className="mt-8" />
      </div>

      <ArchitectureSection />
      <BenchmarksSection />
      <StructureSection />
      <PrerequisitesSection />
      <GettingStartedSection />
      <ConfigurationSection />
      <ApiReferenceSection />
      <PipelineSection />
      <RetryStrategySection />
      <CircuitBreakerSection />
      <RateLimitingSection />
      <LoadTestingSection />
      <TechStackSection />
      <LicenseSection />
    </>
  );
}
