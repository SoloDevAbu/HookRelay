"use client";

import React, { useState } from "react";
import { Flame, Copy, Check } from "@phosphor-icons/react";

export function LoadTestingSection() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <section id="load-testing" className="scroll-mt-24">
      <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground flex items-center gap-2">
        <Flame className="size-6 text-indigo-600" />
        Load Testing
      </h2>
      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
        k6 test configurations exist inside the project repository root for auditing local deployments:
      </p>
      <div className="border border-border rounded-lg bg-muted/40 p-4 font-mono text-xs text-foreground/80 relative overflow-hidden">
        <button 
          onClick={() => handleCopy("k6 run k6/load-test.js", "k6cmd")}
          className="absolute top-2.5 right-2.5 p-1 rounded border border-border bg-background hover:bg-muted text-muted-foreground"
        >
          {copiedText === "k6cmd" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
        </button>
        <pre>{`# Run full ingestion load test (200 VUs, 5 minutes)
k6 run k6/load-test.js

# Validate rate limiting response headers
k6 run k6/rate-limit-test.js`}</pre>
      </div>
    </section>
  );
}
