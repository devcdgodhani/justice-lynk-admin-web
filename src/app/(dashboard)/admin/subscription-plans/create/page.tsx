'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '@/services/admin.api';
import {
    PackagePlus,
    ChevronLeft,
    Check,
    Zap,
    Shield,
    Info,
    Layers,
    BarChart3,
    Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CreateSubscriptionPlanPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        billingInterval: 'monthly',
        trialDays: 0,
        isPublic: true,
        moduleIds: [] as string[],
        limits: [
            { key: 'maxUsers', value: 5 },
            { key: 'maxCases', value: 10 },
            { key: 'storageGb', value: 5 },
        ]
    });

    const { data: modulesRes } = useQuery({
        queryKey: ['admin-modules'],
        queryFn: () => adminApi.getModules(),
        select: r => r.data
    });

    const mutation = useMutation({
        mutationFn: (data: any) => adminApi.createSubscriptionPlan(data),
        onSuccess: () => {
            toast.success('Subscription plan architected successfully');
            router.push('/admin/subscription-plans');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to initialize plan');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    const toggleModule = (id: string) => {
        setFormData(prev => ({
            ...prev,
            moduleIds: prev.moduleIds.includes(id)
                ? prev.moduleIds.filter(m => m !== id)
                : [...prev.moduleIds, id]
        }));
    };

    const updateLimit = (key: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            limits: prev.limits.map(l => l.key === key ? { ...l, value } : l)
        }));
    };

    return (
        <div className="centered-container py-12 max-w-5xl animate-fade-in space-y-12">
            {/* Header */}
            <div className="flex flex-col gap-6">
                <Link href="/admin/subscription-plans" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group">
                    <ChevronLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Back to Tiers
                </Link>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-[0.3em]">
                        <PackagePlus className="h-5 w-5" /> Architectural Forge
                    </div>
                    <h1 className="text-4xl font-bold font-display tracking-tight text-foreground">
                        Initialize New Tier
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg italic">
                        Define the value proposition and resource constraints for your new service level.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Config */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-none glass overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-border/40 bg-card/40 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10">
                                <Info className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold font-display text-foreground">Core Definition</h2>
                        </div>
                        <CardContent className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Plan Identity</Label>
                                    <Input
                                        placeholder="e.g. Enterprise Elite"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-lg font-bold"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Billing Sequence</Label>
                                    <Select
                                        value={formData.billingInterval}
                                        onValueChange={v => setFormData({ ...formData, billingInterval: v })}
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20 text-sm font-bold">
                                            <SelectValue placeholder="Select Interval" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-none glass shadow-2xl">
                                            <SelectItem value="monthly" className="font-bold py-3">Monthly cycle</SelectItem>
                                            <SelectItem value="quarterly" className="font-bold py-3">Quarterly cycle</SelectItem>
                                            <SelectItem value="yearly" className="font-bold py-3">Yearly cycle</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Value Proposition (Description)</Label>
                                <textarea
                                    placeholder="Summarize the core benefits of this tier..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full min-h-[120px] p-6 rounded-[2rem] bg-muted/30 border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium italic outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Asset Valuation (Price)</Label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-primary">₹</span>
                                        <Input
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="h-14 pl-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-mono text-lg font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Trial Period (Days)</Label>
                                    <Input
                                        type="number"
                                        value={formData.trialDays}
                                        onChange={e => setFormData({ ...formData, trialDays: Number(e.target.value) })}
                                        className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold"
                                    />
                                </div>
                                <div className="flex flex-col justify-center space-y-3 pt-6 px-4">
                                    <div className="flex items-center gap-4">
                                        <Checkbox
                                            id="isPublic"
                                            checked={formData.isPublic}
                                            onCheckedChange={v => setFormData({ ...formData, isPublic: !!v })}
                                            className="h-6 w-6 rounded-lg border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:text-white"
                                        />
                                        <Label htmlFor="isPublic" className="text-sm font-bold cursor-pointer">Marketplace Visibility</Label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Module Selection */}
                    <Card className="rounded-[2.5rem] border-none glass overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-border/40 bg-card/40 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10">
                                    <Layers className="h-5 w-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold font-display text-foreground">Functional Modules</h2>
                            </div>
                            <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest text-primary border-primary/20">
                                {formData.moduleIds.length} Selected
                            </Badge>
                        </div>
                        <CardContent className="p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {modulesRes?.map((mod: any) => (
                                    <div
                                        key={mod.id}
                                        onClick={() => toggleModule(mod.id)}
                                        className={cn(
                                            "p-6 rounded-[2rem] border-2 transition-all cursor-pointer group flex items-start gap-4",
                                            formData.moduleIds.includes(mod.id)
                                                ? "bg-primary/5 border-primary shadow-lg shadow-primary/10"
                                                : "bg-muted/10 border-transparent hover:border-border/60"
                                        )}
                                    >
                                        <div className={cn(
                                            "mt-1 h-6 w-6 rounded-lg flex items-center justify-center transition-all border-2",
                                            formData.moduleIds.includes(mod.id)
                                                ? "bg-primary border-primary text-white"
                                                : "border-border/40 text-transparent"
                                        )}>
                                            <Check className="h-3 w-3 stroke-[4]" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground transition-colors group-hover:text-primary">
                                                {mod.name}
                                            </h4>
                                            <p className="text-[10px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wider">
                                                Key: {mod.key}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Constraints */}
                <div className="space-y-8">
                    <Card className="rounded-[2.5rem] border-none glass overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-border/40 bg-card/40 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10">
                                <BarChart3 className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold font-display text-foreground">Resource Limits</h2>
                        </div>
                        <CardContent className="p-10 space-y-8">
                            {formData.limits.map(limit => (
                                <div key={limit.key} className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary">
                                            {limit.key.replace('max', 'Maximum ')}
                                        </Label>
                                        <span className="text-sm font-black font-mono text-foreground">
                                            {limit.value === -1 ? 'Unlimited' : limit.value}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => updateLimit(limit.key, -1)}
                                            className={cn(
                                                "flex-1 rounded-xl font-bold text-[10px] uppercase tracking-widest h-10 border-border/40",
                                                limit.value === -1 && "bg-primary text-white border-primary"
                                            )}
                                        >
                                            Unlimited
                                        </Button>
                                        <div className="flex-1">
                                            <Input
                                                type="number"
                                                min={0}
                                                value={limit.value === -1 ? '' : limit.value}
                                                onChange={e => updateLimit(limit.key, e.target.value === '' ? 0 : Number(e.target.value))}
                                                disabled={limit.value === -1}
                                                className="h-10 rounded-xl bg-muted/30 border-none font-bold text-center"
                                                placeholder="Qty"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none bg-primary p-1 shadow-2xl overflow-hidden">
                        <div className="p-10 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white font-display">Finalize Architecture</h3>
                                <p className="text-white/60 text-xs font-medium italic">Verify all constraints before deploying this tier to the production gateway.</p>
                            </div>
                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                                className="w-full h-16 rounded-[1.25rem] bg-white text-primary font-black uppercase tracking-[0.2em] text-xs hover:bg-white/90 active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                            >
                                {mutation.isPending ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Launch Subscription Tier"
                                )}
                            </Button>
                            <div className="flex items-center justify-center gap-4 text-white/40">
                                <Shield className="h-4 w-4" />
                                <Zap className="h-4 w-4" />
                                <Info className="h-4 w-4" />
                            </div>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
