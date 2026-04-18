import { apiGet } from "@frontend/lib/api";
import { Card } from "@frontend/components/ui/Card";

interface ExecutionTaskRow {
  id: string;
  suggestionId: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
}

export default async function WorkspacePage() {
  const tasks = await apiGet<ExecutionTaskRow[]>("/execution");

  return (
    <Card>
      <h1 className="mb-4 text-2xl font-semibold">Execution Workspace</h1>
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950">
            <tr>
              <th className="p-3">Channel</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Artifacts</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr className="border-t border-zinc-800">
                <td className="p-3 text-zinc-400" colSpan={4}>
                  No execution tasks yet.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="border-t border-zinc-800">
                  <td className="p-3">{task.suggestionId}</td>
                  <td className="p-3">executed asset</td>
                  <td className="p-3">{task.status}</td>
                  <td className="p-3">{task.completedAt ?? task.startedAt ?? "queued"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
