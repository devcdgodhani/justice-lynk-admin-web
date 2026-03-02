'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/admin.api';
import { 
  Package, 
  Plus, 
  ChevronRight, 
  Check, 
  X, 
  Settings2, 
  ShieldCheck, 
  Zap, 
  Loader2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SubscriptionPlansPage() {
  const queryClient = useQueryClient();

  const { data: plansRes, isLoading } = useQuery({
    queryKey: ['admin-subscription-plans'],
    queryFn: () => adminApi.listSubscriptionPlans(),
    select: r => r.data
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteSubscriptionPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      toast.success('Plan processed successfully');
    },
    onError: () => {
      toast.error('Failed to process plan deletion');
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
          Synchronizing Pricing Tiers...
        </p>
      </div>
    );
  }

  return (
    <div className="centered-container py-12 max-w-7xl animate-fade-in space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-[0.3em]">
            <Package className="h-5 w-5" /> Product Management
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-foreground">
            Subscription Plans
          </h1>
          <p className="text-muted-foreground font-medium text-lg italic">
            Architect your platform's monetization strategy and tier structures.
          </p>
        </div>
        <Link href="/admin/subscription-plans/create">
          <Button className="rounded-2xl h-14 px-8 brand-gradient text-white font-bold uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            <Plus className="h-4 w-4" /> Initialize New Tier
          </Button>
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plansRes?.map((plan: any) => (
          <Card 
            key={plan.id} 
            className="group relative rounded-[2.5rem] border-none glass overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2"
          >
            {/* Visual Accent */}
            <div className="absolute top-0 right-0 p-8">
              {plan.price > 1000 ? (
                <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500/20" />
              ) : (
                <ShieldCheck className="h-6 w-6 text-primary/40" />
              )}
            </div>

            <CardContent className="p-10 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={plan.isActive ? "success" : "secondary"} className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none">
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {!plan.isPublic && (
                    <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-dashed border-primary/40 text-primary">
                      Private
                    </Badge>
                  )}
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-foreground font-display tracking-tight group-hover:text-primary transition-colors">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground font-medium italic mt-1 line-clamp-1">
                    {plan.description || "Fully scalable enterprise infrastructure."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-foreground font-mono tracking-tighter">
                      {Number(plan.monthlyOfferPrice || plan.monthlyPrice) === 0 ? 'FREE' : `₹${Number(plan.monthlyOfferPrice || plan.monthlyPrice).toLocaleString()}`}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      / month
                    </span>
                  </div>
                  {Number(plan.monthlyOfferPrice) > 0 && Number(plan.monthlyOfferPrice) !== Number(plan.monthlyPrice) && (
                    <span className="text-[10px] line-through text-muted-foreground/60 font-bold ml-1">
                      ₹{Number(plan.monthlyPrice).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 pt-2 border-t border-border/10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-foreground font-mono tracking-tighter">
                      {Number(plan.yearlyOfferPrice || plan.yearlyPrice) === 0 ? 'FREE' : `₹${Number(plan.yearlyOfferPrice || plan.yearlyPrice).toLocaleString()}`}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      / year
                    </span>
                  </div>
                  {Number(plan.yearlyOfferPrice) > 0 && Number(plan.yearlyOfferPrice) !== Number(plan.yearlyPrice) && (
                    <span className="text-[10px] line-through text-muted-foreground/60 font-bold ml-1">
                      ₹{Number(plan.yearlyPrice).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Limits Preview */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Tier Specs & Limits</p>
                <div className="grid grid-cols-2 gap-3">
                  {plan.limits?.slice(0, 4).map((limit: any) => (
                    <div key={limit.key} className="flex items-center gap-2">
                      <div className="p-1 rounded-full bg-primary/10">
                        <Check className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <span className="text-[11px] font-bold text-foreground truncate">
                        {limit.value === -1 ? 'Unlimited' : limit.value} {limit.key.replace('max', '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <Link href={`/admin/subscription-plans/${plan.id}`} className="flex-1">
                  <Button variant="outline" className="w-full rounded-2xl h-12 font-bold uppercase tracking-widest text-[10px] border-border/40 hover:bg-primary/5 transition-all">
                    Configure <Settings2 className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this plan?')) {
                      deleteMutation.mutate(plan.id);
                    }
                  }}
                  className="rounded-2xl h-12 w-12 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {plansRes?.length === 0 && (
          <div className="col-span-full py-24 text-center glass rounded-[3rem] border-dashed border-2 border-border/40 flex flex-col items-center gap-6">
            <div className="p-6 rounded-full bg-primary/5">
              <AlertCircle className="h-12 w-12 text-primary/40" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-foreground font-display">No Subscription Tiers Defined</h3>
              <p className="text-muted-foreground italic font-medium">Your platform currently lacks a monetization architecture.</p>
            </div>
            <Link href="/admin/subscription-plans/create">
                <Button className="brand-gradient rounded-xl font-bold uppercase tracking-widest text-[10px] h-12 px-8">
                    Architect First Tier
                </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
