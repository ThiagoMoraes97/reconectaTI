import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { NeedCard } from "@/components/common/NeedCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/States";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPublicNeeds } from "@/services/needsService";
import { progressOf } from "@/lib/labels";
import { NEED_CATEGORIES } from "@/types";

export const Route = createFileRoute("/necessidades/")({
  head: () => ({
    meta: [
      { title: "Necessidades da escola | ReConecta TI" },
      {
        name: "description",
        content:
          "Equipamentos de tecnologia que a Escola Municipal Francisco Costa precisa receber por doação.",
      },
      { property: "og:title", content: "Necessidades da escola | ReConecta TI" },
      {
        property: "og:description",
        content: "Veja onde sua contribuição pode ajudar a escola neste momento.",
      },
    ],
  }),
  component: NeedsPage,
});

function NeedsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");
  const [status, setStatus] = useState("todas");
  const [sort, setSort] = useState("prioridade");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["public-needs"],
    queryFn: getPublicNeeds,
  });

  const needs = useMemo(() => {
    let list = (data ?? []).filter((need) => need.status !== "archived");

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (need) =>
          need.name.toLowerCase().includes(term) ||
          need.description.toLowerCase().includes(term) ||
          need.category.toLowerCase().includes(term),
      );
    }

    if (category !== "todas") list = list.filter((need) => need.category === category);

    if (status === "alta") list = list.filter((need) => need.priority === "high");
    if (status === "andamento")
      list = list.filter((need) => {
        const percent = progressOf(need.receivedQuantity, need.requestedQuantity);
        return percent > 0 && percent < 80;
      });
    if (status === "quase")
      list = list.filter((need) => progressOf(need.receivedQuantity, need.requestedQuantity) >= 80);

    const weight = { high: 0, medium: 1, low: 2 } as const;
    list = [...list].sort((a, b) => {
      if (sort === "recente") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "proximo")
        return (
          progressOf(b.receivedQuantity, b.requestedQuantity) -
          progressOf(a.receivedQuantity, a.requestedQuantity)
        );
      return weight[a.priority] - weight[b.priority];
    });

    return list;
  }, [data, search, category, status, sort]);

  return (
    <PublicLayout>
      <div className="surface-warm border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <PageHeader
            eyebrow="Necessidades"
            title="Equipamentos que podem fazer a diferença"
            description="Confira as necessidades atuais cadastradas pela escola e veja onde sua contribuição pode ajudar."
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 rounded-xl border border-border bg-card p-5 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Label htmlFor="busca">Buscar equipamento</Label>
            <div className="relative mt-1.5">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="busca"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar equipamento..."
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="categoria" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {NEED_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="situacao">Situação</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="situacao" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="alta">Prioridade alta</SelectItem>
                <SelectItem value="andamento">Em andamento</SelectItem>
                <SelectItem value="quase">Quase atendida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-start-4">
            <Label htmlFor="ordenacao">Ordenar por</Label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger id="ordenacao" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prioridade">Maior prioridade</SelectItem>
                <SelectItem value="recente">Mais recente</SelectItem>
                <SelectItem value="proximo">Mais próximo de ser atendido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-8">
          {data?.some((need) => need.demoData) ? (
            <p className="mb-5 text-sm text-muted-foreground">
              Os itens e números atuais são demonstrativos e não representam dados oficiais da
              escola.
            </p>
          ) : null}
          {isLoading ? <LoadingState /> : null}
          {isError ? <ErrorState onRetry={() => refetch()} /> : null}
          {data && needs.length === 0 ? (
            <EmptyState
              title="Nenhuma necessidade encontrada"
              description="Tente ajustar a busca ou remover alguns filtros para ver outras necessidades cadastradas."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setCategory("todas");
                    setStatus("todas");
                  }}
                >
                  Limpar filtros
                </Button>
              }
            />
          ) : null}
          {data && needs.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
                {needs.length} necessidade{needs.length > 1 ? "s" : ""} encontrada
                {needs.length > 1 ? "s" : ""}
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {needs.map((need) => (
                  <NeedCard key={need.id} need={need} />
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Não encontrou o equipamento que você tem disponível?
          </p>
          <Button asChild className="mt-4">
            <Link to="/doar">Registrar intenção de doação</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
