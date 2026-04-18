import { apiGet } from "@frontend/lib/api";
import { AdminTabs } from "@frontend/components/admin/AdminTabs";
import { Card } from "@frontend/components/ui/Card";

export default async function AdminPage() {
  const system = await apiGet<{
    postgres: boolean;
    redis: boolean;
    minio: boolean;
    env: Record<string, boolean>;
  }>("/system");

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <p className="text-sm text-zinc-400">Agents, scheduler state, and system health appear here.</p>
      </Card>
      <AdminTabs system={system} />
    </div>
  );
}
