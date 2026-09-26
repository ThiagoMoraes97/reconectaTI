import { createFileRoute, Link } from "@tanstack/react-router";
import escola from "@/assets/escola.png";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o projeto | ReConecta TI" },
      {
        name: "description",
        content:
          "O ReConecta TI é uma iniciativa acadêmica de economia circular voltada à Escola Municipal Francisco Costa, em Miguel Pereira.",
      },
      { property: "og:title", content: "Sobre o projeto | ReConecta TI" },
      {
        property: "og:description",
        content: "Conheça a proposta, o desafio e o impacto esperado do ReConecta TI.",
      },
    ],
  }),
  component: AboutPage,
});

const impact = [
  "Ampliar o acesso a recursos tecnológicos",
  "Facilitar o contato entre escola e comunidade",
  "Incentivar a reutilização de equipamentos",
  "Reduzir o descarte prematuro",
  "Promover inclusão digital",
];

const sdgs = [
  { number: "04", title: "Educação de qualidade" },
  { number: "10", title: "Redução das desigualdades" },
  { number: "12", title: "Consumo e produção responsáveis" },
];

function AboutPage() {
  return (
    <PublicLayout>
      <section className="surface-warm border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Sobre o projeto
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              Tecnologia, educação e economia circular.
            </h1>
            <p className="mt-5 text-base text-muted-foreground">
              O ReConecta TI é uma iniciativa acadêmica desenvolvida para aproximar a Escola
              Municipal Francisco Costa da comunidade e facilitar a destinação responsável de
              equipamentos de tecnologia.
            </p>
          </div>
          <img
            src={escola}
            alt="Fachada da Escola Municipal Francisco Costa, em Miguel Pereira, RJ"
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[var(--shadow-soft)]"
          />
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-12 px-4 py-14 sm:px-6">
        <section>
          <h2 className="text-2xl font-bold text-foreground">A Escola Municipal Francisco Costa</h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            A instituição fica em Miguel Pereira, no Rio de Janeiro, e atende estudantes da rede
            municipal de ensino. O projeto foi pensado a partir do contexto dessa escola, mas o
            formato pode servir de referência para outras instituições públicas.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground">O desafio</h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Instituições de ensino podem conviver com demandas por recursos tecnológicos enquanto
            equipamentos ainda utilizáveis permanecem guardados em residências, escritórios e
            organizações. Falta, muitas vezes, um canal simples e organizado que conecte essas duas
            pontas e deixe claro o que é realmente necessário.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground">A proposta</h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            A escola publica suas necessidades com quantidade, prioridade e condições recomendadas.
            Quem deseja doar consulta essa lista e registra uma intenção de doação. A equipe da
            escola analisa cada intenção, aprova ou recusa de forma transparente e acompanha o
            recebimento dos itens. Não há compra, venda ou pagamento em nenhuma etapa.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground">Impacto esperado</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {impact.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-card p-4 text-sm text-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground">
            Objetivos de Desenvolvimento Sustentável
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {sdgs.map((sdg) => (
              <div key={sdg.number} className="rounded-xl border border-border bg-card p-5">
                <p className="font-display text-3xl font-bold text-secondary">{sdg.number}</p>
                <p className="mt-2 text-sm font-medium text-foreground">{sdg.title}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-muted p-6">
          <h2 className="text-lg font-semibold text-foreground">Projeto acadêmico</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Projeto desenvolvido no contexto da disciplina Atividade Extensionista II do curso de
            Análise e Desenvolvimento de Sistemas.
          </p>
        </section>

        <div className="text-center">
          <Button asChild size="lg">
            <Link to="/necessidades">Ver necessidades da escola</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
