'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { orgApi } from '@/services/org.api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import {
    Building2,
    ArrowLeft,
    Globe,
    Mail,
    MapPin,
    ShieldCheck,
    Loader2,
    Database,
    Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function NewOrganizationPage() {
    const router = useRouter();
    const { user: currentUser } = useAuthStore();
    const [formData, setFormData] = useState({
        name: '',
        type: 'CORPORATE',
        description: '',
        website: '',
        country: 'India'
    });

    const createMutation = useMutation({
        mutationFn: (data: typeof formData) => orgApi.createOrg(data),
        onSuccess: () => {
            toast.success('New entity initialized successfully');
            router.push('/admin/organizations');
        },
        onError: () => {
            toast.error('Initialization failed. Check registry logs.');
        }
    });

    if (currentUser?.role !== 'super_admin') return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error('Entity name is mandatory');
            return;
        }
        createMutation.mutate(formData);
    };

    return (
        <div className="centered-container py-12 max-w-3xl animate-fade-in space-y-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-xl hover:bg-muted">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Initialize Entity</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Corporate Registry Entry</p>
                </div>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card/60 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Legal Name of Entity</label>
                            <div className="relative group">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter organization name"
                                    className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Entity Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-3 bg-background/50 border border-border/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                                >
                                    <option value="CORPORATE">Corporate</option>
                                    <option value="NGO">NGO</option>
                                    <option value="GOVERNMENT">Government</option>
                                    <option value="LEGAL_FIRM">Legal Firm</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Regional Jurisdiction</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        placeholder="e.g. India"
                                        className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Digital Domain (Website)</label>
                            <div className="relative group">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="e.g. www.entity.com"
                                    className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Executive Summary</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the entity's mission..."
                                rows={4}
                                className="w-full px-4 py-3 bg-background/50 border border-border/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="w-full rounded-2xl h-14 font-bold uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30"
                        >
                            {createMutation.isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sequencing...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> Finalize Registry</>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
