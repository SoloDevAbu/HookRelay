"use client";

import React from "react";
import {
  Globe,
  Cpu,
  Database,
  Coins,
  SlackLogo,
  GithubLogo,
  WarningCircle,
  Circle,
} from "@phosphor-icons/react";

const logos = [
  { name: "Stripe", icon: Coins, color: "text-[#635BFF]" },
  { name: "Shopify", icon: StoreIcon, color: "text-[#96BF48]" },
  { name: "Twilio", icon: Cpu, color: "text-[#F22F46]" },
  { name: "Slack", icon: SlackLogo, color: "text-[#4A154B]" },
  { name: "GitHub", icon: GithubLogo, color: "text-foreground" },
  { name: "AWS SQS", icon: Database, color: "text-[#FF9900]" },
  { name: "PagerDuty", icon: WarningCircle, color: "text-[#00A300]" },
  { name: "Discord", icon: Globe, color: "text-[#5865F2]" },
];

function StoreIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12V9" />
      <path d="M10 12V9" />
      <path d="M14 12V9" />
      <path d="M20 12V9" />
      <path d="M2 7v10a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4V7" />
      <path d="M16 17a4 4 0 0 1-8 0" />
    </svg>
  );
}

export function LogosMarquee() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center gap-4 overflow-hidden bg-background py-10">
      <p className="mb-4 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
        &#123; Processing Millions of Webhook Events Daily &#125;
      </p>

      <div className="relative flex w-full items-center overflow-hidden py-4">
        {/* Left/Right Fade gradients */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />

        <div className="animate-marquee flex min-w-full shrink-0 items-center justify-around gap-16 whitespace-nowrap">
          {logos.concat(logos).map((logo, index) => {
            const Icon = logo.icon;
            return (
              <div
                key={index}
                className="group flex cursor-pointer items-center gap-2 text-muted-foreground/75 transition-colors hover:text-foreground"
              >
                <Icon
                  className={`size-6 transition-transform group-hover:scale-110 ${logo.color}`}
                />
                <span className="font-sans text-sm font-semibold tracking-wide">
                  {logo.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
