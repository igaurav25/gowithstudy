import { getAdminAuditLogsAction } from "@/features/admin/application-actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, ShieldAlert, Clock } from "lucide-react";

export default async function AdminAuditPage() {
  const logsRes = await getAdminAuditLogsAction();
  const logs = logsRes.data?.logs || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-amber-400" />
          <span>Immutable Audit Log Trail</span>
        </h1>
        <p className="text-xs text-zinc-400">
          Append-only security log recording administrative actions, applicant approvals, and authentications.
        </p>
      </div>

      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center text-xs text-zinc-500">
            No audit records logged yet.
          </div>
        ) : (
          logs.map((log) => (
            <Card
              key={log.id}
              className="border-zinc-800 bg-zinc-900/60 p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-amber-300">
                    {log.action}
                  </span>
                  <Badge variant="outline" className="text-[10px] py-0 border-zinc-700">
                    {log.entity}
                  </Badge>
                  <span className="text-xs text-zinc-300 font-semibold">
                    by {log.actorName} ({log.actorEmail})
                  </span>
                </div>

                {log.metadata && (
                  <pre className="text-[11px] font-mono text-zinc-400 bg-zinc-950/80 p-2 rounded-lg overflow-x-auto max-w-xl">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>

              <div className="text-right text-xs text-zinc-500 font-mono whitespace-nowrap">
                <span className="block">{new Date(log.createdAt).toLocaleDateString()}</span>
                <span className="text-[10px]">{new Date(log.createdAt).toLocaleTimeString()}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
