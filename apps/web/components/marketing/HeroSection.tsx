"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "@phosphor-icons/react";

export function HeroSection() {
  return (
    <section className="relative w-full pt-32 pb-16 md:pt-44 md:pb-24 px-4 flex flex-col items-center text-center overflow-hidden">
      {/* Premium background radial glows */}
      <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[1000px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-[20%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Decorative Top Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-mono font-medium text-primary hover:bg-primary/10 transition-colors mb-6 animate-fade-in">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        V2.0 is Live: Built for High-Volume Webhooks
      </div>
      
      {/* Hero Header */}
      <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight max-w-4xl bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent mb-6 select-none leading-[1.1]">
        Never Miss a <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Webhook Event</span> Again
      </h1>
      
      {/* Subtitle */}
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed font-sans">
        HookRelay is the reliable event gateway and worker pipeline built to ingest, queue, filter, and deliver your webhooks. Guard your system against outages, rate limits, and slow destinations automatically.
      </p>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 z-10">
        <Button size="lg" asChild className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25">
          <Link href="/signup" className="flex items-center gap-2">
            Get Started For Free
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild className="rounded-full px-8 border-border hover:bg-muted font-semibold transition-all">
          <Link href="/docs" className="flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" />
            Read Developer Docs
          </Link>
        </Button>
      </div>

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-[-1]" />
    </section>
  );
}
