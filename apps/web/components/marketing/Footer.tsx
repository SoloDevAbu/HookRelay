"use client";

import React from "react";
import Link from "next/link";
import { GithubLogo, SlackLogo, PaperPlane } from "@phosphor-icons/react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/60 bg-muted/20 px-4 py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-6">
        {/* Logo and Tagline Column */}
        <div className="col-span-2 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <div className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            HookRelay
          </Link>
          <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
            Ingest, queue, and deliver webhooks reliably at scale. Complete
            visibility and observability for external event streams.
          </p>
          <div className="mt-2 flex gap-3 text-muted-foreground">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              <GithubLogo className="size-5" />
            </a>
            <a
              href="https://slack.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              <SlackLogo className="size-5" />
            </a>
            <a
              href="mailto:support@hookrelay.com"
              className="hover:text-foreground"
            >
              <PaperPlane className="size-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 text-xs text-muted-foreground sm:flex-row">
        <span>
          &copy; {new Date().getFullYear()} HookRelay Inc. All rights reserved.
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
          All Services Operational
        </span>
      </div>
    </footer>
  );
}
