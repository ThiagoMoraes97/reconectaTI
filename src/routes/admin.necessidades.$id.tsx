import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { NeedStatusBadge, PriorityBadge, StatusBadge } from "@/components/common/Badges";
import { ProgressBar } from "@/components/common/ProgressBar";
import { EmptyState, TableLoading } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { getNeedById } from "@/services/needsService";
import { getDonationsByNeed } from "@/services/donationsService";
import { formatDate } from "@/lib/labels";

export const Route = createFileRoute("/admin/necessidades/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe da necessidade | Painel ReConecta TI" },
      { name: "description", content: "Veja o andamento e as doações ligadas à necessidade." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminNeedDetailPage,
});

function AdminNeedDetailPage() {
  const { id } = Route.useParams();
  const need = useQuery({ queryKey: ["need", id], queryFn: () => getNeedById(id) });
  const donations = useQuery({
    queryKey: ["donations", "need", id],
    queryFn: () => getDonationsByNeed(id),
  });

  if (need.isLoading) {
    return (
      <AdminLayout>
        <TableLoading />
      </AdminLayout>
    );
  }

  if (!need.data) {
    return (
      <AdminLayout>
        <EmptyState
          title="Necessidade não encontrada"
          description="O item pode ter sido removido do cadastro."
          action={
            <Button asChild>
              <Link to="/admin/necessidades">Voltar para a lista</Link>
            </Button>
          }
        />
      </AdminLayout>
    );
  }

  const item = need.data;
  const linked = donations.data ?? [];

  return (
    <AdminLayout>
      <PageHeader
        eyebrow="Necessidades"
        title={item.name}
        description={item.description}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/admin/necessidades">Voltar</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/necessidades/$id/editar" params={{ id: item.id }}>
                Editar
              </Link>
            </Button>
          </>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <NeedStatusBadge status={item.status} />
              <PriorityBadge priority={item.priority} />
              <span className="text-xs text-muted-foreground">{item.category}</span>
            </div>

            <div className="mt-5">
              <ProgressBar received={item.receivedQuantity} requested={item.requestedQuantity} />
            </div>

            <h2 className="mt-6 text-sm font-semibold text-foreground">Motivo da solicitação</h2>
            <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>

            {item.recommendedConditions.length > 0 ? (
              <>
                <h2 className="mt-6 text-sm font-semibold text-foreground">
                  Condições recomendadas
                </h2>
                <ul className="mt-2 space-y-1.5">
                  {item.recommendedConditions.map((condition) => (
                    <li
                      key={condition}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary"
                        aria-hidden="true"
                      />
                      {condition}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Doações vinculadas</h2>
            {donations.isLoading ? (
              <div className="mt-4">
                <TableLoading rows={3} />
              </div>
            ) : null}

            {donations.data && linked.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhuma intenção de doação foi registrada para esta necessidade até o momento.
              </p>
            ) : null}

            {linked.length > 0 ? (
              <ul className="mt-4 divide-y divide-border">
                {linked.map((donation) => (
                  <li
                    key={donation.id}
                    className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{donation.equipment}</p>
                      <p className="text-sm text-muted-foreground">
                        {donation.donor.name} • {donation.quantity} un. • {donation.protocol}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={donation.status} />
                      <Button asChild size="sm" variant="outline">
                        <Link to="/admin/doacoes/$id" params={{ id: donation.id }}>
                          Abrir
                        </Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground">Resumo</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Solicitado</dt>
                <dd className="font-medium text-foreground">{item.requestedQuantity}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Recebido</dt>
                <dd className="font-medium text-foreground">{item.receivedQuantity}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Restante</dt>
                <dd className="font-medium text-foreground">
                  {Math.max(0, item.requestedQuantity - item.receivedQuantity)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Criada em</dt>
                <dd className="font-medium text-foreground">{formatDate(item.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Atualizada em</dt>
                <dd className="font-medium text-foreground">{formatDate(item.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-muted p-5 text-sm text-muted-foreground">
            Página pública desta necessidade:{" "}
            <Link
              to="/necessidades/$id"
              params={{ id: item.slug }}
              className="text-primary underline-offset-2 hover:underline"
            >
              ver como doador
            </Link>
          </div>
        </aside>
      </div>
    </AdminLayout>
  );
}
