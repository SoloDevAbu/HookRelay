"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "@phosphor-icons/react";

export function HeroSection() {
  return (
    <section className="relative flex w-full flex-col items-center overflow-hidden px-4 pt-32 pb-16 text-center md:pt-44 md:pb-24">
      {/* Premium background radial glows */}
      <div className="pointer-events-none absolute top-[-20%] left-[50%] h-[400px] w-[1000px] translate-x-[-50%] rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute top-10 left-[20%] h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-[100px]" />

      {/* Decorative Top Badge */}
      <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-xs font-medium text-primary transition-colors hover:bg-primary/10">
        <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        Built for High-Volume Webhooks
      </div>

      {/* Hero Header */}
      <h1 className="mb-6 max-w-4xl bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-4xl leading-[1.1] font-extrabold tracking-tight text-transparent select-none md:text-7xl">
        Never Miss a{" "}
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Webhook Event
        </span>{" "}
        Again
      </h1>

      {/* Subtitle */}
      <p className="mb-10 max-w-2xl font-sans text-lg leading-relaxed text-muted-foreground md:text-xl">
        HookRelay is the reliable event gateway and worker pipeline built to
        ingest, queue, filter, and deliver your webhooks. Guard your system
        against outages, rate limits, and slow destinations automatically.
      </p>

      {/* Action Buttons */}
      <div className="z-10 flex flex-col gap-4 sm:flex-row">
        <Button
          size="lg"
          asChild
          className="rounded-full bg-blue-600 px-8 font-semibold text-white shadow-lg shadow-blue-500/15 transition-all hover:bg-blue-700 hover:shadow-blue-500/25"
        >
          <Link href="/signup" className="flex items-center gap-2">
            Get Started For Free
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          asChild
          className="rounded-full border-border px-8 font-semibold transition-all hover:bg-muted"
        >
          <Link href="/docs" className="flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" />
            Read Developer Docs
          </Link>
        </Button>
      </div>

      {/* Decorative Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 z-[-1] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:14px_24px]" />
    </section>
  );
}
