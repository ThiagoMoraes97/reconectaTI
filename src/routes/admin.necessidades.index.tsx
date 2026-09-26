import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { NeedStatusBadge, PriorityBadge } from "@/components/common/Badges";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState, TableLoading } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { archiveNeed, getNeeds } from "@/services/needsService";
import { formatDate } from "@/lib/labels";
import { NEED_CATEGORIES } from "@/types";

export const Route = createFileRoute("/admin/necessidades/")({
  head: () => ({
    meta: [
      { title: "Necessidades | Painel ReConecta TI" },
      { name: "description", content: "Gerencie as necessidades de equipamentos da escola." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminNeedsPage,
});

function AdminNeedsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");
  const [priority, setPriority] = useState("todas");
  const [status, setStatus] = useState("todas");
  const [archiveTarget, setArchiveTarget] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["needs"], queryFn: getNeeds });

  const archive = useMutation({
    mutationFn: (id: string) => archiveNeed(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Necessidade arquivada.");
    },
    onError: () => toast.error("Não foi possível arquivar a necessidade."),
  });

  const needs = useMemo(() => {
    let list = data ?? [];
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter((need) => need.name.toLowerCase().includes(term));
    }
    if (category !== "todas") list = list.filter((need) => need.category === category);
    if (priority !== "todas") list = list.filter((need) => need.priority === priority);
    if (status !== "todas") list = list.filter((need) => need.status === status);
    return list;
  }, [data, search, category, priority, status]);

  const all = data ?? [];

  return (
    <AdminLayout>
      <PageHeader
        title="Necessidades"
        description="Cadastre, acompanhe e atualize os equipamentos solicitados pela escola."
        actions={
          <Button asChild>
            <Link to="/admin/necessidades/nova">+ Nova necessidade</Link>
          </Button>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Ativas" value={all.filter((need) => need.status === "active").length} />
        <MetricCard
          label="Atendidas"
          value={all.filter((need) => need.status === "fulfilled").length}
        />
        <MetricCard
          label="Alta prioridade"
          value={all.filter((need) => need.priority === "high").length}
        />
      </div>

      <div className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-5 lg:grid-cols-4">
        <div>
          <Label htmlFor="admin-busca">Buscar</Label>
          <Input
            id="admin-busca"
            className="mt-1.5"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome do equipamento"
          />
        </div>
        <div>
          <Label htmlFor="admin-categoria">Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="admin-categoria" className="mt-1.5">
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
          <Label htmlFor="admin-prioridade">Prioridade</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger id="admin-prioridade" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="admin-status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="admin-status" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="active">Ativa</SelectItem>
              <SelectItem value="fulfilled">Atendida</SelectItem>
              <SelectItem value="archived">Arquivada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? <TableLoading /> : null}

        {data && needs.length === 0 ? (
          <EmptyState
            title="Nenhuma necessidade encontrada"
            description="Ajuste os filtros ou cadastre uma nova necessidade para a escola."
            action={
              <Button asChild>
                <Link to="/admin/necessidades/nova">Cadastrar necessidade</Link>
              </Button>
            }
          />
        ) : null}

        {needs.length > 0 ? (
          <>
            {/* Tabela (desktop) */}
            <div className="hidden overflow-x-auto rounded-xl border border-border bg-card lg:block">
              <table className="w-full text-sm">
                <caption className="sr-only">Lista de necessidades cadastradas</caption>
                <thead className="border-b border-border bg-muted/60 text-left">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Equipamento
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Categoria
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Solicitado
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Recebido
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Restante
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Prioridade
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Atualizado em
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {needs.map((need) => (
                    <tr key={need.id}>
                      <td className="px-4 py-3 font-medium text-foreground">{need.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{need.category}</td>
                      <td className="px-4 py-3">{need.requestedQuantity}</td>
                      <td className="px-4 py-3">{need.receivedQuantity}</td>
                      <td className="px-4 py-3">
                        {Math.max(0, need.requestedQuantity - need.receivedQuantity)}
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={need.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <NeedStatusBadge status={need.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(need.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link to="/admin/necessidades/$id" params={{ id: need.id }}>
                              Ver
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="ghost">
                            <Link to="/admin/necessidades/$id/editar" params={{ id: need.id }}>
                              Editar
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setArchiveTarget(need.id)}
                          >
                            Arquivar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards (mobile) */}
            <ul className="grid gap-4 lg:hidden">
              {needs.map((need) => (
                <li key={need.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{need.name}</p>
                      <p className="text-xs text-muted-foreground">{need.category}</p>
                    </div>
                    <PriorityBadge priority={need.priority} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {need.receivedQuantity} de {need.requestedQuantity} recebidos •{" "}
                    {Math.max(0, need.requestedQuantity - need.receivedQuantity)} restantes
                  </p>
                  <div className="mt-3">
                    <NeedStatusBadge status={need.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/admin/necessidades/$id" params={{ id: need.id }}>
                        Ver
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/admin/necessidades/$id/editar" params={{ id: need.id }}>
                        Editar
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setArchiveTarget(need.id)}>
                      Arquivar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <ConfirmDialog
        open={archiveTarget !== null}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title="Arquivar necessidade?"
        description="A necessidade deixará de aparecer para os doadores. Você poderá reativá-la depois pela edição."
        confirmLabel="Arquivar"
        destructive
        onConfirm={() => {
          if (archiveTarget) archive.mutate(archiveTarget);
          setArchiveTarget(null);
        }}
      />
    </AdminLayout>
  );
}
