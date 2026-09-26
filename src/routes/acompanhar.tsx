import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/common/Badges";
import { EmptyState } from "@/components/common/States";
import { getDonationByProtocol } from "@/services/donationsService";
import { formatDate } from "@/lib/labels";
import type { PublicDonation } from "@/services/donationsService";

export const Route = createFileRoute("/acompanhar")({
  head: () => ({
    meta: [
      { title: "Acompanhar doação | ReConecta TI" },
      {
        name: "description",
        content: "Consulte o andamento da sua intenção de doação pelo número de protocolo.",
      },
      { property: "og:title", content: "Acompanhar doação | ReConecta TI" },
      {
        property: "og:description",
        content: "Digite seu protocolo e veja em que etapa está a sua doação.",
      },
    ],
  }),
  component: TrackPage,
});

const timeline = [
  { key: "received", label: "Intenção recebida" },
  { key: "reviewing", label: "Em análise" },
  { key: "approved", label: "Aprovada" },
  { key: "awaiting_delivery", label: "Entrega combinada" },
  { key: "completed", label: "Concluída" },
];

function stepIndex(donation: PublicDonation): number {
  const map: Record<string, number> = {
    pending: 0,
    reviewing: 1,
    approved: 2,
    awaiting_delivery: 3,
    completed: 4,
    rejected: 1,
  };
  return map[donation.status] ?? 0;
}

function TrackPage() {
  const [protocol, setProtocol] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [donation, setDonation] = useState<PublicDonation | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setSearched(false);
    try {
      const result = await getDonationByProtocol(protocol);
      setDonation(result);
      setSearched(true);
    } catch {
      setDonation(null);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  const current = donation ? stepIndex(donation) : -1;

  return (
    <PublicLayout>
      <div className="surface-warm border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <PageHeader
            eyebrow="Acompanhamento"
            title="Acompanhe sua intenção de doação"
            description="Informe o número de protocolo recebido ao enviar o formulário para consultar o andamento."
          />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-card p-6 sm:p-8"
        >
          <Label htmlFor="protocolo">Digite seu protocolo</Label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Input
              id="protocolo"
              value={protocol}
              onChange={(event) => setProtocol(event.target.value)}
              placeholder="RCT-2026-00124"
              required
            />
            <Button type="submit" disabled={loading}>
              <Search className="mr-1 h-4 w-4" aria-hidden="true" />
              {loading ? "Consultando…" : "Consultar"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Use o protocolo apresentado após registrar uma intenção de doação.
          </p>
        </form>

        <div className="mt-8" aria-live="polite">
          {searched && !donation ? (
            <EmptyState
              title="Protocolo não localizado"
              description="Verifique se o número foi digitado corretamente. Ele aparece na tela de confirmação após o envio do formulário."
            />
          ) : null}

          {donation ? (
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Protocolo</p>
                  <p className="font-display text-xl font-bold text-primary">{donation.protocol}</p>
                </div>
                <StatusBadge status={donation.status} />
              </div>

              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Equipamento</dt>
                  <dd className="font-medium text-foreground">{donation.equipment}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Quantidade</dt>
                  <dd className="font-medium text-foreground">{donation.quantity}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Registrada em</dt>
                  <dd className="font-medium text-foreground">{formatDate(donation.createdAt)}</dd>
                </div>
              </dl>

              {donation.status === "rejected" ? (
                <div className="mt-6 rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
                  Após a análise, a escola não pôde seguir com esta doação neste momento. Isso não
                  diminui a importância da sua intenção — outras necessidades seguem abertas e você
                  pode contribuir novamente quando desejar.
                </div>
              ) : (
                <ol className="mt-8 space-y-4">
                  {timeline.map((item, index) => {
                    const done = index <= current;
                    return (
                      <li key={item.key} className="flex items-start gap-3">
                        <span
                          className={`mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${
                            done ? "border-secondary bg-secondary" : "border-border bg-background"
                          }`}
                          aria-hidden="true"
                        />
                        <div>
                          <p
                            className={`text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {item.label}
                          </p>
                          {index === current ? (
                            <p className="text-xs text-secondary">Etapa atual</p>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </PublicLayout>
  );
}
