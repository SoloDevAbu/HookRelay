"use client";

import React, { useState } from "react";
import { Play, Copy, Check } from "@phosphor-icons/react";

export function GettingStartedSection() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <section id="getting-started" className="scroll-mt-24">
      <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center gap-2">
        <Play className="size-6 text-blue-600" />
        Getting Started
      </h2>
      
      <h3 className="text-sm font-bold text-foreground mb-3 font-mono">Running with Docker (Recommended)</h3>
      <div className="border border-border rounded-lg bg-muted/40 p-4 font-mono text-xs text-foreground/80 relative overflow-hidden mb-6">
        <button 
          onClick={() => handleCopy("docker compose up -d", "docker")}
          className="absolute top-2.5 right-2.5 p-1 rounded border border-border bg-background hover:bg-muted text-muted-foreground"
        >
          {copiedText === "docker" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
        </button>
        <pre>{`# 1. Clone repository
git clone https://github.com/SoloDevAbu/HookRelay.git
cd HookRelay

# 2. Copy env configs
cp .env.example .env

# 3. Spin up environment containers
docker compose up -d`}</pre>
      </div>

      <h3 className="text-sm font-bold text-foreground mb-3 font-mono">Running without Docker</h3>
      <div className="border border-border rounded-lg bg-muted/40 p-4 font-mono text-xs text-foreground/80 relative overflow-hidden">
        <button 
          onClick={() => handleCopy("pnpm install && pnpm build", "nodocker")}
          className="absolute top-2.5 right-2.5 p-1 rounded border border-border bg-background hover:bg-muted text-muted-foreground"
        >
          {copiedText === "nodocker" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
        </button>
        <pre>{`# Install workspace dependencies
pnpm install

# Run database push migrations
pnpm --filter @hookrelay/db db:push

# Launch API and Worker tasks
pnpm --filter @hookrelay/api dev
pnpm --filter @hookrelay/worker dev`}</pre>
      </div>
    </section>
  );
}
