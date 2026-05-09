"use client";

import { use, useState } from "react";
import { useTenant, useRotateApiKey } from "@/hooks/api/useTenants";
import { useEndpoints, useCreateEndpoint, useDeleteEndpoint, useResetCircuitBreaker } from "@/hooks/api/useEndpoints";
import { useEvents, useReplayEvent } from "@/hooks/api/useEvents";
import { useDeliveries, useRetryDelivery } from "@/hooks/api/useDeliveries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Key, Plus, Trash, ArrowCounterClockwise } from "@phosphor-icons/react";
import Link from "next/link";
import { format } from "date-fns";

export default function TenantDetailPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = use(params);
  const { data: tenant, isLoading: isLoadingTenant } = useTenant(tenantId);
  
  if (isLoadingTenant) return <Skeleton className="w-full h-[400px] rounded-xl" />;
  if (!tenant) return <div>Tenant not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard"><ArrowLeft className="size-5" /></Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{tenant.name}</h2>
          <p className="text-sm text-muted-foreground font-mono">ID: {tenant.id}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <OverviewTab tenantId={tenantId} tenant={tenant} />
        </TabsContent>
        <TabsContent value="endpoints" className="space-y-4 mt-6">
          <EndpointsTab tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="events" className="space-y-4 mt-6">
          <EventsTab tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="deliveries" className="space-y-4 mt-6">
          <DeliveriesTab tenantId={tenantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- OVERVIEW TAB ---
function OverviewTab({ tenantId, tenant }: { tenantId: string, tenant: any }) {
  const { mutateAsync: rotateKey, isPending } = useRotateApiKey(tenantId);
  const [newKeyData, setNewKeyData] = useState<{ apiKey: string; warning: string } | null>(null);

  const handleRotate = async () => {
    if (!confirm("Are you sure? Old API keys will immediately stop working.")) return;
    try {
      const res = await rotateKey();
      setNewKeyData(res);
      toast.success("API key rotated");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to rotate key");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>API Key Management</CardTitle>
          <CardDescription>Rotate your API key if it has been compromised.</CardDescription>
        </CardHeader>
        <CardContent>
          {newKeyData ? (
             <div className="space-y-4">
               <p className="text-sm text-destructive font-semibold">{newKeyData.warning}</p>
               <div className="p-4 bg-muted rounded-md border font-mono break-all text-sm">
                 {newKeyData.apiKey}
               </div>
               <Button onClick={() => setNewKeyData(null)} variant="outline" className="w-full">Dismiss</Button>
             </div>
          ) : (
            <Button onClick={handleRotate} disabled={isPending} variant="destructive">
              <Key className="mr-2 size-4" /> Rotate API Key
            </Button>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Rate Limit</span>
            <span className="font-medium">{tenant.rateLimitPerMin} / minute</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-muted-foreground">Created At</span>
            <span>{new Date(tenant.createdAt).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- ENDPOINTS TAB ---
function EndpointsTab({ tenantId }: { tenantId: string }) {
  const { data: endpoints, isLoading } = useEndpoints(tenantId);
  const { mutateAsync: createEndpoint, isPending: isCreating } = useCreateEndpoint(tenantId);
  const { mutateAsync: deleteEndpoint } = useDeleteEndpoint(tenantId);
  const { mutateAsync: resetCircuit } = useResetCircuitBreaker(tenantId);
  
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEndpoint({ url });
      toast.success("Endpoint created");
      setOpen(false);
      setUrl("");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Endpoints</CardTitle>
          <CardDescription>Destinations where webhooks will be delivered.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
             <Button><Plus className="size-4 mr-2" /> Add Endpoint</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Endpoint</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input placeholder="https://api.example.com/webhook" value={url} onChange={(e) => setUrl(e.target.value)} required type="url" />
              <Button type="submit" disabled={isCreating} className="w-full">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-32" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Failures</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {endpoints?.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center">No endpoints found.</TableCell></TableRow>
              ) : (
                endpoints?.map(ep => (
                  <TableRow key={ep.id}>
                    <TableCell className="font-mono text-xs">{ep.url}</TableCell>
                    <TableCell>
                      {ep.status === "active" ? <span className="text-green-500">Active</span> :
                       ep.status === "degraded" ? <span className="text-destructive">Failing</span> : 
                       <span className="text-yellow-500">Paused</span>}
                    </TableCell>
                    <TableCell>{ep.failureCount}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {ep.status !== "active" && (
                        <Button variant="outline" size="sm" onClick={() => resetCircuit(ep.id)}>Reset Circuit</Button>
                      )}
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteEndpoint(ep.id)}>
                        <Trash className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// --- EVENTS TAB ---
function EventsTab({ tenantId }: { tenantId: string }) {
  const { data, isLoading } = useEvents(tenantId, { limit: 50 });
  const { mutate: replay } = useReplayEvent(tenantId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Events</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-64" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.events.map(ev => (
                <TableRow key={ev.id}>
                  <TableCell className="font-mono text-xs">{ev.id}</TableCell>
                  <TableCell>{ev.eventType}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(ev.createdAt), "MMM d, HH:mm:ss")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => {
                      replay(ev.id, { onSuccess: () => toast.success("Replay queued") })
                    }}>
                      <ArrowCounterClockwise className="mr-2 size-4" /> Replay
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data?.events.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No events found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// --- DELIVERIES TAB ---
function DeliveriesTab({ tenantId }: { tenantId: string }) {
  const { data, isLoading } = useDeliveries(tenantId, { limit: 50 });
  const { mutate: retry } = useRetryDelivery(tenantId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Deliveries</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-64" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Next Retry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.deliveries.map(del => (
                <TableRow key={del.id}>
                  <TableCell className="font-mono text-xs max-w-[120px] truncate" title={del.id}>{del.id}</TableCell>
                  <TableCell>
                    <span className={
                      del.status === "success" ? "text-green-500" :
                      del.status === "failed" ? "text-yellow-500" :
                      del.status === "dead" ? "text-destructive" : ""
                    }>
                      {del.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>{del.attemptCount}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {del.nextRetryAt ? format(new Date(del.nextRetryAt), "MMM d, HH:mm:ss") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {(del.status === "failed" || del.status === "dead") && (
                      <Button variant="ghost" size="sm" onClick={() => {
                        retry(del.id, { onSuccess: () => toast.success("Retry queued") });
                      }}>
                        <ArrowCounterClockwise className="mr-2 size-4" /> Retry
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {data?.deliveries.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No deliveries found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
