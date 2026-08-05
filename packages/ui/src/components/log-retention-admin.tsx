'use client';

import * as React from 'react';
import { Database, Play, Eye, Settings, Power, PowerOff, RotateCw, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Badge } from './badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { PageHeader } from './page-header';
import { DataTable, type Column } from './data-table';
import { LoadingState } from './loading-state';
import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';
import { ConfirmDialog } from './confirm-dialog';
import { Switch } from './switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Alert, AlertDescription } from './alert';
import { toast } from './toast';

// ── Types ────────────────────────────────────────────────────────────

interface Category {
  category: string;
  displayName: string;
  description: string;
  minRetentionDays: number;
  protected: boolean;
}

interface RetentionPolicy {
  id: string;
  service: string;
  category: string;
  enabled: boolean;
  strategy: string;
  description?: string;
  retentionDays: number;
  keepLatestCount: number;
  cronExpression?: string;
  timezone: string;
  batchSize: number;
  maxBatchesPerRun: number;
  dryRun: boolean;
  minRetentionDays: number;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface RunRecord {
  id: string;
  policyId: string;
  service: string;
  category: string;
  trigger: string;
  strategy: string;
  dryRun: boolean;
  result: string;
  scannedCount: number;
  deletedCount: number;
  batchesRun: number;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  error?: string;
  createdAt: string;
}

type Strategy = 'age' | 'count' | 'hybrid';

// ── API helpers ──────────────────────────────────────────────────────

interface ApiOpts {
  baseUrl: string;
  getAccessToken: () => Promise<string | null>;
}

function createRetentionApi(opts: ApiOpts) {
  const headers = async () => {
    const token = await opts.getAccessToken();
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  const req = async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(`${opts.baseUrl}${path}`, {
      ...init,
      headers: { ...(await headers()), ...(init?.headers) },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error?.message || body?.message || `HTTP ${res.status}`);
    }
    const json = await res.json();
    return json?.data ?? json;
  };

  const base = '/admin/log-retention';

  return {
    listCategories: () => req<Category[]>(`${base}/categories`),
    listPolicies: () => req<RetentionPolicy[]>(`${base}/policies`),
    getPolicy: (id: string) => req<RetentionPolicy>(`${base}/policies/${id}`),
    upsertPolicy: (id: string, body: Partial<RetentionPolicy>) =>
      req<RetentionPolicy>(`${base}/policies/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    enablePolicy: (id: string) =>
      req<RetentionPolicy>(`${base}/policies/${id}/enable`, { method: 'POST' }),
    disablePolicy: (id: string) =>
      req<RetentionPolicy>(`${base}/policies/${id}/disable`, { method: 'POST' }),
    preview: (id: string) =>
      req<{ estimatedCount: number; cutoff: string }>(`${base}/policies/${id}/preview`, { method: 'POST' }),
    run: (id: string) =>
      req<RunRecord>(`${base}/policies/${id}/run`, { method: 'POST', body: JSON.stringify({ confirm: 'DELETE' }) }),
    listRuns: () => req<RunRecord[]>(`${base}/runs`),
  };
}

// ── Labels ───────────────────────────────────────────────────────────

const STRATEGY_LABELS: Record<Strategy, string> = { age: 'Age (Time)', count: 'Count', hybrid: 'Hybrid' };
const RESULT_COLORS: Record<string, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  skipped_dry_run: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  skipped_lock_held: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

function formatDuration(ms?: number) {
  if (!ms && ms !== 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── Component Props ──────────────────────────────────────────────────

export interface LogRetentionAdminProps {
  service: 'auth' | 'notifier';
  baseUrl: string;
  getAccessToken: () => Promise<string | null>;
  className?: string;
}

// ── Main Component ───────────────────────────────────────────────────

export function LogRetentionAdmin({ service, baseUrl, getAccessToken, className }: LogRetentionAdminProps) {
  const api = React.useMemo(() => createRetentionApi({ baseUrl, getAccessToken }), [baseUrl, getAccessToken]);

  const [activeTab, setActiveTab] = React.useState('policies');
  const [policies, setPolicies] = React.useState<RetentionPolicy[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [runs, setRuns] = React.useState<RunRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Edit state
  const [editingPolicy, setEditingPolicy] = React.useState<RetentionPolicy | null>(null);
  const [formDirty, setFormDirty] = React.useState(false);

  // Confirm state
  const [confirmRun, setConfirmRun] = React.useState<RetentionPolicy | null>(null);
  const [previewData, setPreviewData] = React.useState<{ estimatedCount: number } | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, pols, r] = await Promise.all([
        api.listCategories(),
        api.listPolicies(),
        api.listRuns(),
      ]);
      setCategories(cats);
      setPolicies(pols);
      setRuns(r);
    } catch (e: any) {
      setError(e.message || 'Failed to load retention data');
    } finally {
      setLoading(false);
    }
  }, [api]);

  React.useEffect(() => { load(); }, [load]);

  // ── Policy table columns ───────────────────────────────────────────

  const policyColumns: Column<RetentionPolicy>[] = [
    { key: 'category', header: 'Category', render: (p) => {
      const cat = categories.find(c => c.category === p.category);
      return <span className="font-medium">{cat?.displayName || p.category}</span>;
    }},
    { key: 'enabled', header: 'Status', render: (p) => (
      <Badge variant={p.enabled ? 'default' : 'secondary'}>
        {p.enabled ? 'Enabled' : 'Disabled'}
      </Badge>
    )},
    { key: 'strategy', header: 'Strategy', render: (p) => (
      <Badge variant="outline">{STRATEGY_LABELS[p.strategy as Strategy] || p.strategy}</Badge>
    )},
    { key: 'retention', header: 'Retention', render: (p) => {
      if (p.strategy === 'count') return `Keep ${p.keepLatestCount.toLocaleString()}`;
      if (p.strategy === 'hybrid') return `${p.retentionDays}d / keep ${p.keepLatestCount.toLocaleString()}`;
      return `${p.retentionDays} days`;
    }},
    { key: 'dryRun', header: 'Dry Run', render: (p) => (
      p.dryRun ? <Badge variant="secondary">Dry Run</Badge> : <Badge variant="destructive">Live</Badge>
    )},
    { key: 'lastRunAt', header: 'Last Run', render: (p) => formatDate(p.lastRunAt), hideOnMobile: true },
  ];

  const policyActions = (p: RetentionPolicy) => (
    <div className="flex gap-1 justify-end">
      <Button variant="ghost" size="sm" onClick={() => { setEditingPolicy(p); setFormDirty(false); setPreviewData(null); }}>
        <Settings className="size-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => handlePreview(p)}>
        <Eye className="size-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => handleToggle(p)}>
        {p.enabled ? <PowerOff className="size-4" /> : <Power className="size-4" />}
      </Button>
    </div>
  );

  // ── Run history columns ────────────────────────────────────────────

  const runColumns: Column<RunRecord>[] = [
    { key: 'category', header: 'Category', render: (r) => {
      const cat = categories.find(c => c.category === r.category);
      return <span className="font-medium">{cat?.displayName || r.category}</span>;
    }},
    { key: 'trigger', header: 'Trigger', render: (r) => (
      <Badge variant="outline">{r.trigger}</Badge>
    )},
    { key: 'result', header: 'Result', render: (r) => (
      <Badge className={RESULT_COLORS[r.result] || ''}>{r.result}</Badge>
    )},
    { key: 'deletedCount', header: 'Deleted', render: (r) => r.deletedCount.toLocaleString() },
    { key: 'durationMs', header: 'Duration', render: (r) => formatDuration(r.durationMs) },
    { key: 'startedAt', header: 'Started', render: (r) => formatDate(r.startedAt), hideOnMobile: true },
  ];

  // ── Handlers ───────────────────────────────────────────────────────

  const handleToggle = async (p: RetentionPolicy) => {
    try {
      if (p.enabled) await api.disablePolicy(p.id);
      else await api.enablePolicy(p.id);
      await load();
    } catch (e: any) {
      toast.error('Error', e.message);
    }
  };

  const handlePreview = async (p: RetentionPolicy) => {
    try {
      const data = await api.preview(p.id);
      setPreviewData(data);
      setEditingPolicy(p);
      setFormDirty(false);
    } catch (e: any) {
      toast.error('Preview failed', e.message);
    }
  };

  const handleSave = async () => {
    if (!editingPolicy) return;
    try {
      await api.upsertPolicy(editingPolicy.id, editingPolicy);
      toast.success('Saved', 'Retention policy updated.');
      setFormDirty(false);
      await load();
    } catch (e: any) {
      toast.error('Save failed', e.message);
    }
  };

  const handleRun = async () => {
    if (!confirmRun) return;
    setIsRunning(true);
    try {
      const record = await api.run(confirmRun.id);
      toast.success('Cleanup completed', `Deleted ${record.deletedCount.toLocaleString()} records.`);
      setConfirmRun(null);
      await load();
    } catch (e: any) {
      toast.error('Cleanup failed', e.message);
    } finally {
      setIsRunning(false);
    }
  };

  // ── Loading / Error ────────────────────────────────────────────────

  if (loading) return <LoadingState fullPage message="Loading retention policies..." />;
  if (error) return <ErrorState title="Error" description={error} />;

  return (
    <div className={cn('space-y-6', className)}>
      <PageHeader
        title="Log Retention"
        description={`Configure automatic log cleanup for ${service}`}
        actions={
          <Button onClick={load} variant="outline" size="sm">
            <RotateCw className="size-4 mr-2" /> Refresh
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="policies">
            <Database className="size-4 mr-2" /> Policies
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="size-4 mr-2" /> Run History
          </TabsTrigger>
        </TabsList>

        {/* ── Policies Tab ─────────────────────────────────────────── */}
        <TabsContent value="policies" className="space-y-6">
          <DataTable
            columns={policyColumns}
            data={policies}
            getRowId={(p) => p.id}
            renderRowActions={(p) => policyActions(p)}
            emptyMessage="No retention policies configured."
            emptyAction={
              <Button variant="outline" onClick={() => {
                const firstCat = categories[0];
                if (!firstCat) return;
                const newPolicy: RetentionPolicy = {
                  id: crypto.randomUUID(),
                  service,
                  category: firstCat.category,
                  enabled: false,
                  strategy: 'age',
                  retentionDays: 30,
                  keepLatestCount: 100000,
                  batchSize: 500,
                  maxBatchesPerRun: 20,
                  dryRun: true,
                  timezone: 'UTC',
                  minRetentionDays: firstCat.minRetentionDays,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                setEditingPolicy(newPolicy);
                setFormDirty(true);
                setPreviewData(null);
              }}>
                Create First Policy
              </Button>
            }
          />

          {/* ── Edit Policy Sheet ──────────────────────────────────── */}
          {editingPolicy && (
            <Card>
              <CardHeader>
                <CardTitle>{editingPolicy.id ? 'Edit Policy' : 'Create Policy'}</CardTitle>
                <CardDescription>
                  {categories.find(c => c.category === editingPolicy.category)?.displayName || editingPolicy.category}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={editingPolicy.category}
                    onValueChange={(v) => { setEditingPolicy({ ...editingPolicy, category: v }); setFormDirty(true); }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.category} value={c.category}>{c.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Enabled */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enabled</p>
                    <p className="text-xs text-muted-foreground">Master switch for automatic cleanup</p>
                  </div>
                  <Switch
                    checked={editingPolicy.enabled}
                    onCheckedChange={(v) => { setEditingPolicy({ ...editingPolicy, enabled: v }); setFormDirty(true); }}
                  />
                </div>

                {/* Strategy */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Strategy</label>
                  <Select
                    value={editingPolicy.strategy}
                    onValueChange={(v) => { setEditingPolicy({ ...editingPolicy, strategy: v as Strategy }); setFormDirty(true); }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="age">Age — delete records older than N days</SelectItem>
                      <SelectItem value="count">Count — keep only the newest N records</SelectItem>
                      <SelectItem value="hybrid">Hybrid — apply both age and count limits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Age strategy params */}
                {(editingPolicy.strategy === 'age' || editingPolicy.strategy === 'hybrid') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Retention Days</label>
                    <Input
                      type="number"
                      min={editingPolicy.minRetentionDays}
                      value={editingPolicy.retentionDays}
                      onChange={(e) => { setEditingPolicy({ ...editingPolicy, retentionDays: parseInt(e.target.value) || 0 }); setFormDirty(true); }}
                    />
                    <p className="text-xs text-muted-foreground">Minimum: {editingPolicy.minRetentionDays} days</p>
                  </div>
                )}

                {/* Count strategy params */}
                {(editingPolicy.strategy === 'count' || editingPolicy.strategy === 'hybrid') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Keep Latest Count</label>
                    <Input
                      type="number"
                      min={1}
                      value={editingPolicy.keepLatestCount}
                      onChange={(e) => { setEditingPolicy({ ...editingPolicy, keepLatestCount: parseInt(e.target.value) || 0 }); setFormDirty(true); }}
                    />
                  </div>
                )}

                {/* Cron */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Schedule (cron)</label>
                  <Input
                    placeholder="0 3 * * *"
                    value={editingPolicy.cronExpression || ''}
                    onChange={(e) => { setEditingPolicy({ ...editingPolicy, cronExpression: e.target.value }); setFormDirty(true); }}
                  />
                  <p className="text-xs text-muted-foreground">e.g., 0 3 * * * (daily at 3am UTC). Empty = manual only.</p>
                </div>

                {/* Advanced */}
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-muted-foreground">Advanced</summary>
                  <div className="mt-3 space-y-4 pl-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Batch Size</label>
                      <Input type="number" min={1} max={10000} value={editingPolicy.batchSize}
                        onChange={(e) => { setEditingPolicy({ ...editingPolicy, batchSize: parseInt(e.target.value) || 500 }); setFormDirty(true); }} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Batches Per Run</label>
                      <Input type="number" min={1} max={1000} value={editingPolicy.maxBatchesPerRun}
                        onChange={(e) => { setEditingPolicy({ ...editingPolicy, maxBatchesPerRun: parseInt(e.target.value) || 20 }); setFormDirty(true); }} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Timezone</label>
                      <Input value={editingPolicy.timezone}
                        onChange={(e) => { setEditingPolicy({ ...editingPolicy, timezone: e.target.value }); setFormDirty(true); }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Dry Run</p>
                        <p className="text-xs text-muted-foreground">Preview-only, never deletes</p>
                      </div>
                      <Switch checked={editingPolicy.dryRun}
                        onCheckedChange={(v) => { setEditingPolicy({ ...editingPolicy, dryRun: v }); setFormDirty(true); }} />
                    </div>
                  </div>
                </details>

                {/* Preview */}
                {previewData && (
                  <Alert>
                    <Eye className="size-4" />
                    <AlertDescription>
                      Estimated eligible records: <strong>{previewData.estimatedCount.toLocaleString()}</strong>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={!formDirty}>
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => handlePreview(editingPolicy)}>
                    <Eye className="size-4 mr-2" /> Preview
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmRun(editingPolicy)}
                    disabled={!editingPolicy.id}
                  >
                    <Play className="size-4 mr-2" /> Run Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Run History Tab ──────────────────────────────────────── */}
        <TabsContent value="history">
          <DataTable
            columns={runColumns}
            data={runs}
            getRowId={(r) => r.id}
            emptyMessage="No cleanup runs yet."
          />
        </TabsContent>
      </Tabs>

      {/* ── Confirmation Dialog ─────────────────────────────────────── */}
      <ConfirmDialog
        open={!!confirmRun}
        onOpenChange={(o) => { if (!o) setConfirmRun(null); }}
        title="Execute Cleanup?"
        description={
          confirmRun
            ? [
                `Service: ${confirmRun.service}`,
                `Category: ${categories.find(c => c.category === confirmRun.category)?.displayName || confirmRun.category}`,
                `Strategy: ${STRATEGY_LABELS[confirmRun.strategy as Strategy]}`,
                confirmRun.strategy !== 'count' ? `Retention: ${confirmRun.retentionDays} days` : '',
                confirmRun.strategy !== 'age' ? `Keep: ${confirmRun.keepLatestCount.toLocaleString()}` : '',
                confirmRun.dryRun
                  ? 'DRY RUN — no records will be deleted.'
                  : 'WARNING: This will PERMANENTLY delete historical records. This action cannot be undone.',
              ].filter(Boolean).join('\n')
            : undefined
        }
        confirmLabel={confirmRun?.dryRun ? 'Run Dry Cleanup' : 'DELETE Records'}
        cancelLabel="Cancel"
        destructive={!confirmRun?.dryRun}
        showIcon
        onConfirm={handleRun}
        isConfirming={isRunning}
      />
    </div>
  );
}
