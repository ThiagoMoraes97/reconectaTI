import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/admin/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações | Painel ReConecta TI" },
      { name: "description", content: "Dados da instituição e preferências do painel." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { user } = useAuth();
  const [schoolName, setSchoolName] = useState("Escola Municipal Francisco Costa");
  const [city, setCity] = useState("Miguel Pereira – RJ");
  const [email, setEmail] = useState(user?.email ?? "admin@reconectati.local");
  const [phone, setPhone] = useState("(24) 0000-0000");
  const [message, setMessage] = useState(
    "Obrigado por considerar doar. Cada equipamento recebido amplia o acesso dos estudantes à tecnologia.",
  );
  const [notifyNewDonations, setNotifyNewDonations] = useState(true);
  const [showPublicMetrics, setShowPublicMetrics] = useState(true);

  return (
    <AdminLayout>
      <PageHeader
        title="Configurações"
        description="Informações da instituição exibidas na plataforma e preferências do painel."
      />

      <form
        className="mt-8 max-w-3xl space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          toast.success("Configurações salvas nesta sessão de demonstração.");
        }}
      >
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Dados da instituição</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="school">Nome da escola</Label>
              <Input
                id="school"
                className="mt-1.5"
                value={schoolName}
                onChange={(event) => setSchoolName(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                className="mt-1.5"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contact-email">E-mail de contato</Label>
              <Input
                id="contact-email"
                type="email"
                className="mt-1.5"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contact-phone">Telefone</Label>
              <Input
                id="contact-phone"
                className="mt-1.5"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="welcome">Mensagem para doadores</Label>
              <Textarea
                id="welcome"
                rows={3}
                className="mt-1.5"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Preferências</h2>
          <div className="mt-5 space-y-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <div className="min-w-0">
                <Label htmlFor="notify">Avisar sobre novas intenções de doação</Label>
                <p className="text-sm text-muted-foreground">
                  Exibe um destaque no painel quando uma nova intenção chega.
                </p>
              </div>
              <Switch
                id="notify"
                checked={notifyNewDonations}
                onCheckedChange={setNotifyNewDonations}
              />
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <div className="min-w-0">
                <Label htmlFor="metrics">Mostrar números na página inicial</Label>
                <p className="text-sm text-muted-foreground">
                  Controla a exibição dos indicadores públicos da escola.
                </p>
              </div>
              <Switch
                id="metrics"
                checked={showPublicMetrics}
                onCheckedChange={setShowPublicMetrics}
              />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button type="submit">Salvar alterações</Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Configurações demonstrativas: as alterações não são persistidas, pois o projeto ainda não
          possui backend.
        </p>
      </form>
    </AdminLayout>
  );
}
