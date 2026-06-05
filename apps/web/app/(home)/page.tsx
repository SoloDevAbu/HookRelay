import React from "react";
import { HeroSection } from "@/components/marketing/HeroSection";
import { LogosMarquee } from "@/components/marketing/LogosMarquee";
import { FeatureGateway } from "@/components/marketing/FeatureGateway";
import { FeatureDelivery } from "@/components/marketing/FeatureDelivery";
import { Footer } from "@/components/marketing/Footer";

export const metadata = {
  title: "HookRelay - Reliable Webhook Ingestion & Inbound Event Infrastructure",
  description:
    "HookRelay handles ingest, fanout routing, rate-controlled queuing, and smart retries for outbound webhooks and inbound event streams.",
};

export default function MarketingPage() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground antialiased selection:bg-blue-500/10 select-none">
      {/* Hero Banner Section */}
      <HeroSection />

      {/* Integration Logos Marquee */}
      <LogosMarquee />

      {/* Event Gateway (Inbound Ingestion) */}
      <div id="features" className="w-full">
        <FeatureGateway />
      </div>

      {/* Webhook Delivery Outpost (Outbound routing & delivery) */}
      <div className="w-full">
        <FeatureDelivery />
      </div>

      {/* Modern Developer footer */}
      <Footer />
    </div>
  );
}
