import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { HeartHandshake, ListChecks, PackageCheck, Clock } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { StatusBadge } from "@/components/common/Badges";
import { ProgressBar } from "@/components/common/ProgressBar";
import { TableLoading, ErrorState, EmptyState } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { getDashboardMetrics } from "@/services/dashboardService";
import { getDonations } from "@/services/donationsService";
import { getNeeds } from "@/services/needsService";
import { formatDate } from "@/lib/labels";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Visão geral | Painel ReConecta TI" },
      { name: "description", content: "Acompanhe necessidades e intenções de doação da escola." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const metrics = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardMetrics });
  const donations = useQuery({ queryKey: ["donations"], queryFn: getDonations });
  const needs = useQuery({ queryKey: ["needs"], queryFn: getNeeds });

  const attention = (donations.data ?? []).filter((donation) =>
    ["pending", "reviewing"].includes(donation.status),
  );
  const priorityNeeds = (needs.data ?? [])
    .filter((need) => need.status === "active" && need.priority === "high")
    .slice(0, 3);

  return (
    <AdminLayout>
      <PageHeader
        title="Olá, Administração"
        description="Acompanhe as necessidades e intenções de doação da escola."
        actions={
          <Button asChild>
            <Link to="/admin/necessidades/nova">Nova necessidade</Link>
          </Button>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Necessidades ativas"
          value={metrics.data?.activeNeeds ?? "—"}
          icon={ListChecks}
        />
        <MetricCard
          label="Doações pendentes"
          value={metrics.data?.pendingDonations ?? "—"}
          icon={Clock}
        />
        <MetricCard
          label="Doações aprovadas"
          value={metrics.data?.approvedDonations ?? "—"}
          icon={HeartHandshake}
        />
        <MetricCard
          label="Itens recebidos"
          value={metrics.data?.receivedItems ?? "—"}
          icon={PackageCheck}
        />
      </div>

      <section className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Doações nos últimos meses</h2>
        <div className="mt-6 h-64">
          {metrics.isError ? <ErrorState onRetry={() => metrics.refetch()} /> : null}
          {metrics.data ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.data.monthlyDonations}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} name="Doações" />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">Doações que precisam de atenção</h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/doacoes">Ver todas</Link>
          </Button>
        </div>

        <div className="mt-5">
          {donations.isLoading ? <TableLoading /> : null}
          {donations.data && attention.length === 0 ? (
            <EmptyState
              title="Nenhuma doação pendente"
              description="Todas as intenções recebidas já foram analisadas pela equipe."
            />
          ) : null}

          {attention.length > 0 ? (
            <ul className="divide-y divide-border">
              {attention.map((donation) => (
                <li
                  key={donation.id}
                  className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{donation.equipment}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {donation.donor.name} • {donation.quantity} un. •{" "}
                      {formatDate(donation.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">{donation.protocol}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={donation.status} />
                    <Button asChild size="sm" variant="outline">
                      <Link to="/admin/doacoes/$id" params={{ id: donation.id }}>
                        Analisar
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Necessidades prioritárias</h2>
          <div className="mt-5 space-y-5">
            {priorityNeeds.map((need) => (
              <div key={need.id}>
                <div className="flex items-center justify-between gap-3">
                  <Link
                    to="/admin/necessidades/$id"
                    params={{ id: need.id }}
                    className="truncate font-medium text-foreground hover:underline"
                  >
                    {need.name}
                  </Link>
                  <span className="shrink-0 text-xs text-muted-foreground">{need.category}</span>
                </div>
                <div className="mt-2">
                  <ProgressBar
                    received={need.receivedQuantity}
                    requested={need.requestedQuantity}
                  />
                </div>
              </div>
            ))}
            {needs.data && priorityNeeds.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma necessidade de prioridade alta no momento.
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Atividade recente</h2>
          <ol className="mt-5 space-y-4">
            {(metrics.data?.recentActivity ?? []).map((activity) => (
              <li key={activity.id} className="flex gap-3">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </AdminLayout>
  );
}
