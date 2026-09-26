import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade | ReConecta TI" },
      {
        name: "description",
        content:
          "Rascunho da política de privacidade do ReConecta TI, conteúdo que deverá ser revisado antes da publicação.",
      },
      { property: "og:title", content: "Política de Privacidade | ReConecta TI" },
      {
        property: "og:description",
        content: "Como as informações enviadas pelos doadores são utilizadas na plataforma.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="surface-warm border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <PageHeader eyebrow="Documentos" title="Política de Privacidade" />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-foreground">
          Conteúdo preliminar. Este texto é um rascunho do projeto acadêmico e deverá ser revisado
          por pessoa responsável antes de qualquer publicação oficial.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">Informações coletadas</h2>
            <p className="mt-2">
              Ao registrar uma intenção de doação, a plataforma solicita nome, e-mail, telefone e
              informações sobre o equipamento ofertado. Esses dados são utilizados apenas para a
              análise da doação e para o contato da instituição com o doador.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Uso das informações</h2>
            <p className="mt-2">
              As informações são utilizadas para avaliar a compatibilidade entre o equipamento
              ofertado e as necessidades cadastradas, além de organizar a entrega e o registro do
              recebimento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Compartilhamento</h2>
            <p className="mt-2">
              Os dados não são comercializados. O acesso é restrito às pessoas responsáveis pela
              gestão das doações na instituição.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Retenção e exclusão</h2>
            <p className="mt-2">
              A definição de prazos de retenção e do procedimento de exclusão de dados será
              detalhada na versão final deste documento, junto com a implementação do sistema em
              ambiente definitivo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Contato</h2>
            <p className="mt-2">
              Os canais oficiais de contato serão informados quando a plataforma for publicada pela
              instituição.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
