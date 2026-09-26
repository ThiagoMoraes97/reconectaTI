import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { NeedForm } from "@/components/admin/NeedForm";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState, TableLoading } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { archiveNeed, fulfillNeed, getNeedById, updateNeed } from "@/services/needsService";
import type { NeedInput } from "@/types";

export const Route = createFileRoute("/admin/necessidades/$id/editar")({
  head: () => ({
    meta: [
      { title: "Editar necessidade | Painel ReConecta TI" },
      { name: "description", content: "Atualize os dados de uma necessidade cadastrada." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditNeedPage,
});

function EditNeedPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState<"archive" | "fulfill" | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["need", id],
    queryFn: () => getNeedById(id),
  });

  const save = useMutation({
    mutationFn: (input: NeedInput) => updateNeed(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Necessidade atualizada.");
      navigate({ to: "/admin/necessidades" });
    },
    onError: () => toast.error("Não foi possível atualizar a necessidade."),
  });

  const quickAction = useMutation({
    mutationFn: (action: "archive" | "fulfill") =>
      action === "archive" ? archiveNeed(id) : fulfillNeed(id),
    onSuccess: (_result, action) => {
      queryClient.invalidateQueries();
      toast.success(action === "archive" ? "Necessidade arquivada." : "Necessidade atendida.");
      navigate({ to: "/admin/necessidades" });
    },
    onError: () => toast.error("Não foi possível concluir a ação."),
  });

  return (
    <AdminLayout>
      <PageHeader
        eyebrow="Necessidades"
        title={data ? `Editar: ${data.name}` : "Editar necessidade"}
        description="Ajuste as informações exibidas para os doadores."
      />

      <div className="mt-8 max-w-3xl">
        {isLoading ? <TableLoading /> : null}

        {!isLoading && !data ? (
          <EmptyState
            title="Necessidade não encontrada"
            description="O item pode ter sido removido do cadastro."
            action={
              <Button asChild>
                <Link to="/admin/necessidades">Voltar para a lista</Link>
              </Button>
            }
          />
        ) : null}

        {data ? (
          <NeedForm
            submitLabel="Atualizar necessidade"
            submitting={save.isPending}
            defaultValues={{
              name: data.name,
              category: data.category,
              description: data.description,
              reason: data.reason,
              requestedQuantity: data.requestedQuantity,
              receivedQuantity: data.receivedQuantity,
              priority: data.priority,
              status: data.status,
              recommendedConditions: data.recommendedConditions.join("\n"),
            }}
            onSubmit={(values) => save.mutate(values)}
            footer={
              <>
                <Button type="button" variant="outline" onClick={() => setConfirm("fulfill")}>
                  Marcar como atendida
                </Button>
                <Button type="button" variant="ghost" onClick={() => setConfirm("archive")}>
                  Arquivar
                </Button>
                <Button asChild type="button" variant="ghost">
                  <Link to="/admin/necessidades">Cancelar</Link>
                </Button>
              </>
            }
          />
        ) : null}
      </div>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm === "archive" ? "Arquivar necessidade?" : "Marcar como atendida?"}
        description={
          confirm === "archive"
            ? "A necessidade deixará de aparecer para os doadores."
            : "A necessidade será exibida como atendida na página pública."
        }
        confirmLabel={confirm === "archive" ? "Arquivar" : "Marcar como atendida"}
        destructive={confirm === "archive"}
        onConfirm={() => {
          if (confirm) quickAction.mutate(confirm);
          setConfirm(null);
        }}
      />
    </AdminLayout>
  );
}
