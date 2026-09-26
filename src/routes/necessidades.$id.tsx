import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Info } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { NeedCard } from "@/components/common/NeedCard";
import { NeedStatusBadge, PriorityBadge } from "@/components/common/Badges";
import { ProgressBar } from "@/components/common/ProgressBar";
import { EmptyState, LoadingState } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getNeedById, getPublicNeeds } from "@/services/needsService";

export const Route = createFileRoute("/necessidades/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe da necessidade | ReConecta TI" },
      {
        name: "description",
        content:
          "Informações completas sobre um equipamento necessário à Escola Municipal Francisco Costa.",
      },
      { property: "og:title", content: "Detalhe da necessidade | ReConecta TI" },
      {
        property: "og:description",
        content: "Veja quantidades, condições recomendadas e como doar este equipamento.",
      },
    ],
  }),
  component: NeedDetailPage,
});

function NeedDetailPage() {
  const { id } = Route.useParams();
  const need = useQuery({ queryKey: ["need", id], queryFn: () => getNeedById(id) });
  const others = useQuery({ queryKey: ["public-needs"], queryFn: getPublicNeeds });

  if (need.isLoading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <LoadingState rows={3} />
        </div>
      </PublicLayout>
    );
  }

  if (!need.data) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <EmptyState
            title="Necessidade não encontrada"
            description="Esta necessidade pode ter sido atendida ou removida pela escola."
            action={
              <Button asChild>
                <Link to="/necessidades">Ver necessidades ativas</Link>
              </Button>
            }
          />
        </div>
      </PublicLayout>
    );
  }

  const item = need.data;
  const remaining = Math.max(0, item.requestedQuantity - item.receivedQuantity);
  const related = (others.data ?? []).filter((other) => other.id !== item.id).slice(0, 3);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Início</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/necessidades">Necessidades</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{item.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {item.demoData ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Este item e suas quantidades são demonstrativos e não representam dados oficiais da
            escola.
          </p>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                {item.category}
              </span>
              <PriorityBadge priority={item.priority} />
              <NeedStatusBadge status={item.status} />
            </div>

            <h1 className="mt-3 text-3xl font-bold text-foreground">{item.name}</h1>
            <p className="mt-4 text-base text-muted-foreground">{item.description}</p>

            <section className="mt-8 rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Por que a escola precisa</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.reason}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Quantidade solicitada</p>
                  <p className="mt-1 font-display text-2xl font-bold text-primary">
                    {item.requestedQuantity}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Já recebido</p>
                  <p className="mt-1 font-display text-2xl font-bold text-secondary">
                    {item.receivedQuantity}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Ainda necessário</p>
                  <p className="mt-1 font-display text-2xl font-bold text-accent">{remaining}</p>
                </div>
              </div>

              <div className="mt-6">
                <ProgressBar received={item.receivedQuantity} requested={item.requestedQuantity} />
              </div>
            </section>

            <section className="mt-6 rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Condições recomendadas</h2>
              <ul className="mt-3 space-y-2">
                {item.recommendedConditions.map((condition) => (
                  <li key={condition} className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                      aria-hidden="true"
                    />
                    {condition}
                  </li>
                ))}
              </ul>
            </section>

            <p className="mt-6 flex gap-2 rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />A escola realizará uma
              análise antes de confirmar o recebimento do equipamento.
            </p>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-sm font-medium text-muted-foreground">
                A escola ainda precisa de
              </h2>
              <p className="mt-2 font-display text-3xl font-bold text-primary">
                {remaining} {remaining === 1 ? "unidade" : "unidades"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{item.name}</p>
              <Button asChild className="mt-5 w-full" disabled={remaining === 0}>
                <Link to="/doar" search={{ need: item.id }}>
                  Quero doar este equipamento
                </Link>
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full">
                <Link to="/como-funciona">Entender o processo</Link>
              </Button>
            </div>
          </aside>
        </div>

        {related.length > 0 ? (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground">Outras necessidades</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((other) => (
                <NeedCard key={other.id} need={other} compact />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PublicLayout>
  );
}
