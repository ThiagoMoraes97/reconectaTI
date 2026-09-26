import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { NeedForm } from "@/components/admin/NeedForm";
import { Button } from "@/components/ui/button";
import { createNeed } from "@/services/needsService";
import type { NeedInput } from "@/types";

export const Route = createFileRoute("/admin/necessidades/nova")({
  head: () => ({
    meta: [
      { title: "Nova necessidade | Painel ReConecta TI" },
      { name: "description", content: "Cadastre um novo equipamento necessário para a escola." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewNeedPage,
});

function NewNeedPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: NeedInput) => createNeed(input),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Necessidade cadastrada.");
      navigate({ to: "/admin/necessidades" });
    },
    onError: () => toast.error("Não foi possível salvar a necessidade."),
  });

  return (
    <AdminLayout>
      <PageHeader
        eyebrow="Necessidades"
        title="Nova necessidade"
        description="Descreva o equipamento, a quantidade desejada e o motivo da solicitação."
      />

      <div className="mt-8 max-w-3xl">
        <NeedForm
          submitLabel="Salvar necessidade"
          submitting={mutation.isPending}
          onSubmit={(values) => mutation.mutate(values)}
          footer={
            <Button asChild type="button" variant="ghost">
              <Link to="/admin/necessidades">Cancelar</Link>
            </Button>
          }
        />
      </div>
    </AdminLayout>
  );
}
