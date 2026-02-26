'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/admin.api';
import {
    ShieldCheck as RolesIcon,
    ChevronLeft,
    Save,
    Settings,
    Layout,
    Monitor,
    MousePointer2,
    Loader2,
    Info,
    CheckSquare,
    Square,
    Database,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface RoleEditorProps {
    roleId?: string;
    initialData?: any;
    isEdit?: boolean;
}

export default function RoleEditor({ roleId, initialData, isEdit }: RoleEditorProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Form State
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [isSystem, setIsSystem] = useState(initialData?.isSystem || false);
    const [isDefault, setIsDefault] = useState(initialData?.isDefault || false);
    const [targetUserType, setTargetUserType] = useState(initialData?.targetUserType || 'client');
    const [selectedPermissions, setSelectedPermissions] = useState<any[]>([]);

    // Data Fetching
    const { data: modules = [], isLoading: modulesLoading } = useQuery({
        queryKey: ['admin-modules'],
        queryFn: () => adminApi.getModules(),
        select: r => r.data,
    });

    const { data: screens = [], isLoading: screensLoading } = useQuery({
        queryKey: ['admin-screens'],
        queryFn: () => adminApi.getScreens(),
        select: r => r.data,
    });

    const { data: existingPermissions, isLoading: permissionsLoading } = useQuery({
        queryKey: ['role-permissions', roleId],
        queryFn: () => adminApi.getRolePermissions(roleId!),
        enabled: !!roleId && isEdit,
        select: r => r.data,
    });

    // Filtered Data
    const filteredModules = useMemo(() => {
        const targetApp = targetUserType === 'super_admin' ? 'ADMIN_WEB' : 'MAIN_WEB';
        return modules.filter((m: any) => m.appType === targetApp);
    }, [modules, targetUserType]);

    const filteredScreens = useMemo(() => {
        const targetApp = targetUserType === 'super_admin' ? 'ADMIN_WEB' : 'MAIN_WEB';
        return screens.filter((s: any) => (s.appType === targetApp) || (s.module?.appType === targetApp));
    }, [screens, targetUserType]);

    // Group screens by module for better organization
    const groupedScreens = useMemo(() => {
        const groups: Record<string, { module: any, screens: any[] }> = {};
        filteredScreens.forEach((screen: any) => {
            const moduleId = screen.moduleId;
            if (!groups[moduleId]) {
                groups[moduleId] = {
                    module: screen.module || modules.find((m: any) => m.id === moduleId),
                    screens: []
                };
            }
            groups[moduleId].screens.push(screen);
        });
        return Object.values(groups);
    }, [filteredScreens, modules]);

    useEffect(() => {
        if (existingPermissions) {
            const mapped = existingPermissions
                .filter((p: any) => p.granted)
                .map((p: any) => ({
                    featureId: p.featureId,
                    screenId: p.screenId,
                    actionId: p.actionId
                }));
            setSelectedPermissions(mapped);
        }
    }, [existingPermissions]);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (isEdit && roleId) {
                // Update basic info
                await adminApi.updateRole(roleId, {
                    name: data.name,
                    description: data.description,
                    isSystem: data.isSystem,
                    isDefault: data.isDefault,
                    targetUserType: data.targetUserType
                });
                // Update permissions
                await adminApi.grantRolePermissions(roleId, data.initialPermissions);
            } else {
                return adminApi.createRole(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
            if (roleId) queryClient.invalidateQueries({ queryKey: ['role-permissions', roleId] });
            toast.success(`Role ${isEdit ? 'updated' : 'created'} successfully`);
            router.push('/admin/roles');
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} role`);
        }
    });

    const togglePermission = (type: 'feature' | 'screen', id: string, actionId: string) => {
        const key = type === 'feature' ? 'featureId' : 'screenId';
        const exists = selectedPermissions.find(p => p[key] === id && p.actionId === actionId);

        if (exists) {
            setSelectedPermissions(prev => prev.filter(p => !(p[key] === id && p.actionId === actionId)));
        } else {
            setSelectedPermissions(prev => [...prev, { [key]: id, actionId }]);
        }
    };

    const isPermissionSelected = (type: 'feature' | 'screen', id: string, actionId: string) => {
        const key = type === 'feature' ? 'featureId' : 'screenId';
        return selectedPermissions.some(p => p[key] === id && p.actionId === actionId);
    };

    const handleSave = () => {
        if (!name) return toast.error('Role name is required');

        mutation.mutate({
            name,
            description,
            isSystem,
            isDefault,
            targetUserType: isSystem ? targetUserType : null,
            initialPermissions: selectedPermissions
        });
    };

    const isLoading = modulesLoading || screensLoading || (isEdit && permissionsLoading);

    return (
        <div className="space-y-10 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/40 pb-10">
                <div className="space-y-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] hover:text-primary transition-colors group px-0"
                    >
                        <ChevronLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" /> Back to Registry
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-foreground flex items-center gap-4">
                            {isEdit ? 'Refine Authority' : 'Define Authority'}
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg italic">
                            {isEdit ? 'Adjust system protocols and personnel access levels.' : 'Construct a new access profile with granular protocol adherence.'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="rounded-2xl h-14 px-8 font-bold uppercase tracking-[0.15em] text-[11px] border-border/40"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={mutation.isPending}
                        variant="gradient"
                        className="rounded-2xl h-14 px-10 font-bold uppercase tracking-[0.15em] text-[11px]"
                    >
                        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} {isEdit ? 'Update Protocol' : 'Commit Changes'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Basic Configuration */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass rounded-[2rem] p-8 space-y-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <Settings className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                        Identity Core
                                    </h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                                        Fundamental metadata defining this role's purpose.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Role Designation</label>
                                <Input
                                    placeholder="e.g. Legal Auditor"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Conceptual Abstract</label>
                                <Textarea
                                    placeholder="Detailed description of responsibilities..."
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="space-y-6 pt-4 border-t border-border/40">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold text-foreground">System Assignment Role</p>
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-tighter">Automatic assignment based on personnel type.</p>
                                    </div>
                                    <Switch
                                        checked={isSystem}
                                        onCheckedChange={setIsSystem}
                                        variant="primary"
                                    />
                                </div>

                                {isSystem && (
                                    <div className="space-y-2 animate-fade-in">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 text-primary">Target Personnel Segment</label>
                                        <Select
                                            value={targetUserType}
                                            onValueChange={setTargetUserType}
                                        >
                                            <SelectTrigger className="bg-primary/5 text-primary border-primary/20">
                                                <SelectValue placeholder="Select personnel type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="client">Client</SelectItem>
                                                <SelectItem value="professional">Professional</SelectItem>
                                                <SelectItem value="organization_admin">Organization Admin</SelectItem>
                                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold text-foreground">Organization Default</p>
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-tighter">Cloned to new organizations upon initialization.</p>
                                    </div>
                                    <Switch
                                        checked={isDefault}
                                        onCheckedChange={setIsDefault}
                                        variant="primary"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-2xl border border-dashed border-border/60 flex gap-4">
                            <Info className="h-5 w-5 text-primary shrink-0" />
                            <p className="text-[10px] leading-relaxed text-muted-foreground italic">
                                Creating a platform role will automatically make it available as a template for new organizations.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Permission Matrix */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="glass rounded-[2rem] border-none shadow-xl overflow-hidden min-h-[600px] flex flex-col">
                        <Tabs defaultValue="backend" className="w-full flex flex-col h-full">
                            <div className="px-10 pt-8 pb-4 border-b border-border/20 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                        <RolesIcon className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold font-display text-foreground">Protocol Matrix</h3>
                                        <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Map granular permissions to system features and screens.</p>
                                    </div>
                                </div>
                                <TabsList className="bg-muted/50 p-1 rounded-xl h-11 border border-border/20">
                                    <TabsTrigger value="backend" className="rounded-lg px-6 font-bold uppercase tracking-widest text-[9px] data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
                                        <Layout className="mr-2 h-3.5 w-3.5" /> API Modules
                                    </TabsTrigger>
                                    <TabsTrigger value="frontend" className="rounded-lg px-6 font-bold uppercase tracking-widest text-[9px] data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">
                                        <Monitor className="mr-2 h-3.5 w-3.5" /> Client Screens
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="backend" className="flex-1 p-0 focus:outline-none">
                                {modulesLoading ? (
                                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/20">
                                        {filteredModules.map((module: any) => (
                                            <div key={module.id} className="p-10 space-y-8 hover:bg-muted/20 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                        <Database className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-lg text-foreground">{module.name}</h4>
                                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{module.key}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {module.features.map((feature: any) => (
                                                        <div key={feature.id} className="space-y-4 p-6 bg-card/40 border border-border/40 rounded-3xl group/feature hover:border-primary/30 transition-all">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-black uppercase tracking-widest text-foreground/80">{feature.name}</span>
                                                                <Badge variant="outline" className="text-[8px] font-bold border-muted-foreground/20 text-muted-foreground uppercase tracking-widest">{feature.key}</Badge>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {feature.actions.map((action: any) => {
                                                                    const active = isPermissionSelected('feature', feature.id, action.id);
                                                                    return (
                                                                        <button
                                                                            key={action.id}
                                                                            onClick={() => togglePermission('feature', feature.id, action.id)}
                                                                            className={cn(
                                                                                "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-[0.1em] border transition-all flex items-center gap-2",
                                                                                active
                                                                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                                                                    : "bg-muted/50 text-muted-foreground border-border/40 hover:border-primary/40 hover:text-primary active:scale-95"
                                                                            )}
                                                                        >
                                                                            {active ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                                                                            {action.name}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="frontend" className="flex-1 p-0 focus:outline-none">
                                {screensLoading ? (
                                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/20">
                                        {groupedScreens.map((group: any) => (
                                            <div key={group.module?.id} className="p-10 space-y-8 hover:bg-muted/20 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                                                        <Layout className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-lg text-foreground">{group.module?.name || 'Uncategorized'}</h4>
                                                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{group.module?.key || 'SYSTEM'}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {group.screens.map((screen: any) => (
                                                        <div key={screen.id} className="space-y-6 p-8 bg-card/60 border border-border/40 rounded-[2rem] hover:border-primary/30 transition-all group/screen shadow-sm">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-[1.25rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                                                    <Monitor className="h-6 w-6" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-foreground text-sm">{screen.name}</h4>
                                                                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">{screen.key}</p>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Screen Actions</p>
                                                                <div className="flex flex-wrap gap-3">
                                                                    {screen.actions.map((action: any) => {
                                                                        const active = isPermissionSelected('screen', screen.id, action.id);
                                                                        return (
                                                                            <button
                                                                                key={action.id}
                                                                                onClick={() => togglePermission('screen', screen.id, action.id)}
                                                                                className={cn(
                                                                                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-2",
                                                                                    active
                                                                                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10"
                                                                                        : "bg-muted/50 text-muted-foreground border-border/60 hover:border-primary/30 hover:text-primary active:scale-95"
                                                                                )}
                                                                            >
                                                                                {active ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                                                                                {action.name}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                        {/* Summary Footer */}
                        <div className="mt-auto px-10 py-6 border-t border-border/40 bg-card/40 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Badge variant="system">
                                        {selectedPermissions.filter(p => p.featureId).length} API Features
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="system">
                                        {selectedPermissions.filter(p => p.screenId).length} UI Screens
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-[10px] items-center gap-2 hidden md:flex font-bold text-primary uppercase tracking-[0.2em]">
                                <MousePointer2 className="h-3 w-3" /> Select protocols to assign
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
