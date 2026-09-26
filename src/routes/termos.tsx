import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso | ReConecta TI" },
      {
        name: "description",
        content:
          "Rascunho dos termos de uso do ReConecta TI: a plataforma intermedeia intenções de doação, sem aceite automático.",
      },
      { property: "og:title", content: "Termos de Uso | ReConecta TI" },
      {
        property: "og:description",
        content: "Regras de uso da plataforma de intermediação de doações.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PublicLayout>
      <div className="surface-warm border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <PageHeader eyebrow="Documentos" title="Termos de Uso" />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-foreground">
          Conteúdo preliminar. Este texto é um rascunho do projeto acadêmico e deverá ser revisado
          por pessoa responsável antes de qualquer publicação oficial.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">Finalidade da plataforma</h2>
            <p className="mt-2">
              O ReConecta TI é uma plataforma social e educacional que intermedeia intenções de
              doação de equipamentos de tecnologia. Não há compra, venda, pagamento ou entrega
              comercial.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Intenção de doação</h2>
            <p className="mt-2">
              O envio do formulário registra uma intenção. A instituição analisa cada registro e
              pode aprovar ou recusar a doação. Não existe aceite automático.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              Responsabilidade sobre as informações
            </h2>
            <p className="mt-2">
              O doador se responsabiliza pela veracidade das informações prestadas sobre o
              equipamento, incluindo estado de conservação e funcionamento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Entrega</h2>
            <p className="mt-2">
              A entrega só deve ser realizada após a confirmação da instituição, conforme combinado
              entre as partes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Alterações</h2>
            <p className="mt-2">
              Estes termos poderão ser atualizados na versão definitiva da plataforma, quando o
              projeto for publicado pela instituição.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
