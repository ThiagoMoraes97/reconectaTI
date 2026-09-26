import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/Badges";
import { EmptyState, TableLoading } from "@/components/common/States";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  approveDonation,
  getDonationById,
  registerReception,
  rejectDonation,
  saveInternalNotes,
  updateDonationStatus,
} from "@/services/donationsService";
import { getNeedById } from "@/services/needsService";
import {
  conditionLabel,
  contactPeriodLabel,
  deliveryLabel,
  donorTypeLabel,
  formatDate,
  workingStatusLabel,
} from "@/lib/labels";

export const Route = createFileRoute("/admin/doacoes/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe da doação | Painel ReConecta TI" },
      { name: "description", content: "Analise uma intenção de doação recebida." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDonationDetailPage,
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function AdminDonationDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [approvedQuantity, setApprovedQuantity] = useState(1);
  const [receivedQuantity, setReceivedQuantity] = useState(1);
  const [rejectionReason, setRejectionReason] = useState("");
  const [dialog, setDialog] = useState<"approve" | "reject" | "receive" | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["donation", id],
    queryFn: () => getDonationById(id),
  });

  const need = useQuery({
    queryKey: ["need", data?.needId],
    queryFn: () => getNeedById(data!.needId!),
    enabled: Boolean(data?.needId),
  });

  useEffect(() => {
    if (data) {
      setNotes(data.internalNotes ?? "");
      setApprovedQuantity(data.approvedQuantity ?? data.quantity);
      setReceivedQuantity(data.receivedQuantity ?? data.approvedQuantity ?? data.quantity);
    }
  }, [data]);

  function refresh() {
    queryClient.invalidateQueries();
  }

  const approve = useMutation({
    mutationFn: () => approveDonation(id, approvedQuantity, notes),
    onSuccess: () => {
      refresh();
      toast.success("Doação aprovada.");
    },
    onError: () => toast.error("Não foi possível aprovar a doação."),
  });

  const reject = useMutation({
    mutationFn: () => rejectDonation(id, rejectionReason, notes),
    onSuccess: () => {
      refresh();
      toast.success("Doação recusada.");
    },
    onError: () => toast.error("Não foi possível recusar a doação."),
  });

  const receive = useMutation({
    mutationFn: () => registerReception(id, receivedQuantity, notes),
    onSuccess: () => {
      refresh();
      toast.success("Recebimento registrado.");
    },
    onError: () => toast.error("Não foi possível registrar o recebimento."),
  });

  const review = useMutation({
    mutationFn: () => updateDonationStatus(id, "reviewing"),
    onSuccess: () => {
      refresh();
      toast.success("Doação marcada como em análise.");
    },
  });

  const awaiting = useMutation({
    mutationFn: () => updateDonationStatus(id, "awaiting_delivery"),
    onSuccess: () => {
      refresh();
      toast.success("Entrega combinada com o doador.");
    },
  });

  const notesMutation = useMutation({
    mutationFn: () => saveInternalNotes(id, notes),
    onSuccess: () => {
      refresh();
      toast.success("Observações salvas.");
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <TableLoading />
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <EmptyState
          title="Doação não encontrada"
          description="Verifique o protocolo ou volte para a lista de doações."
          action={
            <Button asChild>
              <Link to="/admin/doacoes">Voltar para a lista</Link>
            </Button>
          }
        />
      </AdminLayout>
    );
  }

  const donation = data;

  return (
    <AdminLayout>
      <PageHeader
        eyebrow={donation.protocol}
        title={donation.equipment}
        description={`Intenção registrada em ${formatDate(donation.createdAt)}.`}
        actions={
          <Button asChild variant="outline">
            <Link to="/admin/doacoes">Voltar</Link>
          </Button>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">Dados do doador</h2>
              <StatusBadge status={donation.status} />
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Nome" value={donation.donor.name} />
              <Field label="Tipo" value={donorTypeLabel(donation.donor.type)} />
              {donation.donor.companyName ? (
                <Field label="Instituição" value={donation.donor.companyName} />
              ) : null}
              <Field label="E-mail" value={donation.donor.email} />
              <Field label="Telefone" value={donation.donor.phone} />
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Equipamento</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Equipamento" value={donation.equipment} />
              <Field label="Categoria" value={donation.category} />
              <Field label="Quantidade" value={String(donation.quantity)} />
              <Field label="Marca" value={donation.brand || "Não informado"} />
              <Field label="Modelo" value={donation.model || "Não informado"} />
              <Field label="Ano aproximado" value={donation.approximateYear || "Não informado"} />
              <Field label="Estado" value={conditionLabel(donation.condition)} />
              <Field label="Funcionamento" value={workingStatusLabel(donation.workingStatus)} />
            </dl>
            {donation.notes ? (
              <>
                <h3 className="mt-6 text-sm font-semibold text-foreground">
                  Observações do doador
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{donation.notes}</p>
              </>
            ) : null}
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Entrega e contato</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Preferência" value={deliveryLabel(donation.deliveryPreference)} />
              <Field label="Melhor período" value={contactPeriodLabel(donation.contactPeriod)} />
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Análise da escola</h2>

            <div className="mt-5">
              <Label htmlFor="internal-notes">Observações internas</Label>
              <Textarea
                id="internal-notes"
                rows={4}
                className="mt-1.5"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Visíveis apenas para a equipe da escola."
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => notesMutation.mutate()}
              >
                Salvar observações
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="approved-quantity">Quantidade aprovada</Label>
                <Input
                  id="approved-quantity"
                  type="number"
                  min={1}
                  className="mt-1.5"
                  value={approvedQuantity}
                  onChange={(event) => setApprovedQuantity(Number(event.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="received-quantity">Quantidade recebida</Label>
                <Input
                  id="received-quantity"
                  type="number"
                  min={0}
                  className="mt-1.5"
                  value={receivedQuantity}
                  onChange={(event) => setReceivedQuantity(Number(event.target.value))}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="rejection-reason">Motivo da recusa (se aplicável)</Label>
                <Textarea
                  id="rejection-reason"
                  rows={2}
                  className="mt-1.5"
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  placeholder="Escreva com respeito: o doador poderá ver esta informação."
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {donation.status === "pending" ? (
                <Button type="button" variant="outline" onClick={() => review.mutate()}>
                  Marcar em análise
                </Button>
              ) : null}
              {["pending", "reviewing"].includes(donation.status) ? (
                <>
                  <Button type="button" onClick={() => setDialog("approve")}>
                    Aprovar doação
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialog("reject")}
                    disabled={rejectionReason.trim().length < 5}
                  >
                    Recusar doação
                  </Button>
                </>
              ) : null}
              {donation.status === "approved" ? (
                <Button type="button" variant="outline" onClick={() => awaiting.mutate()}>
                  Combinar entrega
                </Button>
              ) : null}
              {["approved", "awaiting_delivery"].includes(donation.status) ? (
                <Button type="button" onClick={() => setDialog("receive")}>
                  Registrar recebimento
                </Button>
              ) : null}
            </div>

            {["pending", "reviewing"].includes(donation.status) &&
            rejectionReason.trim().length < 5 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Para recusar, escreva antes o motivo da recusa.
              </p>
            ) : null}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground">Histórico</h2>
            <ol className="mt-4 space-y-4">
              {donation.history.map((event, index) => (
                <li key={`${event.label}-${index}`} className="flex gap-3">
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{event.label}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {need.data ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground">Necessidade relacionada</h2>
              <p className="mt-2 text-sm text-foreground">{need.data.name}</p>
              <p className="text-xs text-muted-foreground">
                {need.data.receivedQuantity} de {need.data.requestedQuantity} recebidos
              </p>
              <Button asChild size="sm" variant="outline" className="mt-4">
                <Link to="/admin/necessidades/$id" params={{ id: need.data.id }}>
                  Abrir necessidade
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-muted p-5 text-sm text-muted-foreground">
              Esta intenção não está vinculada a uma necessidade cadastrada.
            </div>
          )}

          {donation.rejectionReason ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
              <h2 className="text-sm font-semibold text-foreground">Motivo da recusa</h2>
              <p className="mt-1 text-sm text-muted-foreground">{donation.rejectionReason}</p>
            </div>
          ) : null}
        </aside>
      </div>

      <ConfirmDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        title={
          dialog === "approve"
            ? "Aprovar esta doação?"
            : dialog === "reject"
              ? "Recusar esta doação?"
              : "Registrar recebimento?"
        }
        description={
          dialog === "approve"
            ? `A doação será aprovada com ${approvedQuantity} item(ns). O doador poderá acompanhar pelo protocolo.`
            : dialog === "reject"
              ? "O motivo informado ficará disponível para o doador na página de acompanhamento."
              : `O recebimento de ${receivedQuantity} item(ns) será somado à necessidade vinculada.`
        }
        confirmLabel={
          dialog === "approve" ? "Aprovar" : dialog === "reject" ? "Recusar" : "Registrar"
        }
        destructive={dialog === "reject"}
        onConfirm={() => {
          if (dialog === "approve") approve.mutate();
          if (dialog === "reject") reject.mutate();
          if (dialog === "receive") receive.mutate();
          setDialog(null);
        }}
      />
    </AdminLayout>
  );
}
