import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { TableLoading } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { getDashboardMetrics } from "@/services/dashboardService";
import { getNeeds } from "@/services/needsService";
import { formatDate } from "@/lib/labels";

export const Route = createFileRoute("/admin/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios | Painel ReConecta TI" },
      { name: "description", content: "Indicadores de doações e necessidades da escola." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminReportsPage,
});

const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function AdminReportsPage() {
  const metrics = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardMetrics });
  const needs = useQuery({ queryKey: ["needs"], queryFn: getNeeds });

  return (
    <AdminLayout>
      <PageHeader
        title="Relatórios"
        description="Acompanhe os números gerais das doações e das necessidades cadastradas."
        actions={
          <Button
            variant="outline"
            onClick={() =>
              toast.info("A exportação de relatórios será habilitada junto com o backend.")
            }
          >
            Exportar relatório
          </Button>
        }
      />

      {metrics.isLoading ? (
        <div className="mt-8">
          <TableLoading />
        </div>
      ) : null}

      {metrics.data ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Necessidades ativas" value={metrics.data.activeNeeds} />
            <MetricCard label="Doações aprovadas" value={metrics.data.approvedDonations} />
            <MetricCard label="Itens recebidos" value={metrics.data.receivedItems} />
            <MetricCard label="Necessidades atendidas" value={metrics.data.fulfilledNeeds} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Itens por categoria</h2>
              <div className="mt-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.data.donationsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="category" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip cursor={{ fill: "var(--muted)" }} />
                    <Bar
                      dataKey="total"
                      fill="var(--secondary)"
                      radius={[6, 6, 0, 0]}
                      name="Itens"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Doações por status</h2>
              <div className="mt-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.data.donationsByStatus}
                      dataKey="total"
                      nameKey="status"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {metrics.data.donationsByStatus.map((entry, index) => (
                        <Cell key={entry.status} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </>
      ) : null}

      <section className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Necessidades e atendimento</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Situação de atendimento por necessidade</caption>
            <thead className="border-b border-border text-left">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  Equipamento
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Solicitado
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Recebido
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  % atendido
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Atualizado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(needs.data ?? []).map((need) => (
                <tr key={need.id}>
                  <td className="px-3 py-2 font-medium text-foreground">{need.name}</td>
                  <td className="px-3 py-2">{need.requestedQuantity}</td>
                  <td className="px-3 py-2">{need.receivedQuantity}</td>
                  <td className="px-3 py-2">
                    {Math.round(
                      (need.receivedQuantity / Math.max(1, need.requestedQuantity)) * 100,
                    )}
                    %
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{formatDate(need.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs text-muted-foreground">
        Os itens marcados como demonstrativos são exemplos e não representam o inventário oficial da
        escola.
      </p>
    </AdminLayout>
  );
}
