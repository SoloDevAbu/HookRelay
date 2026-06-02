"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTenants, useCreateTenant } from "@/hooks/api/useTenants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const createTenantSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
});

export default function DashboardPage() {
  const { data: tenants, isLoading } = useTenants();
  const { mutateAsync: createTenant, isPending } = useCreateTenant();
  const [open, setOpen] = useState(false);
  const [newKeyData, setNewKeyData] = useState<{ apiKey: string; warning: string } | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof createTenantSchema>>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: z.infer<typeof createTenantSchema>) {
    try {
      const res = await createTenant({ name: values.name, rateLimitPerMin: 100000 });
      setNewKeyData({ apiKey: res.apiKey, warning: res.warning });
      toast.success("Tenant created successfully");
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create tenant");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tenants</h2>
          <p className="text-muted-foreground">Manage your webhook tenants and endpoints.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Tenant</Button>
          </DialogTrigger>
          <DialogContent>
            {newKeyData ? (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Tenant Created</DialogTitle>
                  <DialogDescription className="text-destructive font-semibold">
                    {newKeyData.warning}
                  </DialogDescription>
                </DialogHeader>
                <div className="p-4 bg-muted rounded-md border font-mono break-all text-sm">
                  {newKeyData.apiKey}
                </div>
                <Button className="w-full" onClick={() => { setNewKeyData(null); setOpen(false); }}>
                  I have copied the key
                </Button>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Create new tenant</DialogTitle>
                  <DialogDescription>
                    A tenant represents a distinct workspace or project for webhook delivery.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tenant Name</Label>
                    <Input id="name" placeholder="Acme Corp" {...register("name")} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Creating..." : "Create Tenant"}
                  </Button>
                </form>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[140px] w-full rounded-xl" />
            <Skeleton className="h-[140px] w-full rounded-xl" />
          </>
        ) : tenants?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-background rounded-lg border border-dashed">
            No tenants found. Create one to get started.
          </div>
        ) : (
          tenants?.map((tenant) => (
            <Link key={tenant.id} href={`/dashboard/tenants/${tenant.id}`}>
              <Card className="hover:border-primary/50 transition-colors h-full flex flex-col cursor-pointer">
                <CardHeader>
                  <CardTitle>{tenant.name}</CardTitle>
                  <CardDescription>Created {new Date(tenant.createdAt).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex size-2 rounded-full bg-green-500"></span>
                    Rate Limit: {tenant.rateLimitPerMin}/min
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
