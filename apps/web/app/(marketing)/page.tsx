import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function MarketingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full pt-32 pb-20 md:pt-48 md:pb-32 px-4 flex flex-col items-center text-center">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6">
          Webhook Delivery Simplified
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent mb-6">
          Reliable Webhook Delivery for Modern Applications
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
          HookRelay handles ingestion, reliable delivery, retries, and circuit breaking so you don't have to.
          Ensure your webhooks reach their destination, every time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild className="rounded-full px-8">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="rounded-full px-8">
            <Link href="#how-it-works">How it works</Link>
          </Button>
        </div>
      </section>

      {/* Visualize Cards Section */}
      <section id="how-it-works" className="w-full bg-muted/50 py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">How HookRelay Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A robust pipeline designed to guarantee webhook delivery without blocking your primary application logic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1: Ingestion */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m3 15 2 2 4-4"/></svg>
                </div>
                <CardTitle>1. Fast Ingestion</CardTitle>
                <CardDescription>Your app sends events to HookRelay.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  We ingest your events in milliseconds, buffering them in Redis. Your application can immediately continue processing without waiting for HTTP deliveries.
                </p>
                <div className="bg-muted rounded-md p-3 font-mono text-xs text-muted-foreground">
                  POST /events<br/>
                  {"{"}<br/>
                  &nbsp;&nbsp;"type": "user.created",<br/>
                  &nbsp;&nbsp;"payload": {"{ ... }"}<br/>
                  {"}"}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Fan-out & Delivery */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </div>
                <CardTitle>2. Fan-out Delivery</CardTitle>
                <CardDescription>We route events to consumer endpoints.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  HookRelay determines which endpoints are subscribed to the event type and attempts secure delivery concurrently via background workers.
                </p>
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground bg-muted p-3 rounded-md">
                  <span>HookRelay</span>
                  <span className="flex-1 border-t border-dashed border-muted-foreground/50 mx-2 relative">
                    <span className="absolute -top-2.5 right-0 animate-ping">→</span>
                  </span>
                  <span>Consumer API</span>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Retries & Safety */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
                </div>
                <CardTitle>3. Smart Retries</CardTitle>
                <CardDescription>Handling failures automatically.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  If a consumer is down, HookRelay applies exponential backoff for retries. Built-in circuit breakers prevent overwhelming struggling endpoints.
                </p>
                <div className="flex gap-1 flex-col text-xs font-mono text-muted-foreground bg-muted p-2 rounded-md">
                  <div className="flex justify-between"><span>Attempt 1</span><span className="text-destructive">503</span></div>
                  <div className="flex justify-between"><span>Attempt 2 (1m)</span><span className="text-destructive">500</span></div>
                  <div className="flex justify-between"><span>Attempt 3 (5m)</span><span className="text-green-500">200 OK</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
