# Arquitetura atual do ReConecta TI

## Stack

- React 19 e TypeScript 5
- TanStack Start e TanStack Router com rotas baseadas em arquivos
- Vite 8, Tailwind CSS 4 e componentes shadcn/ui (Radix UI)
- TanStack Query para consultas, React Hook Form e Zod para formulários
- Bun lockfile (`bun.lock`); as dependências foram instaladas com Bun

## Estrutura

- `src/routes/`: páginas públicas e administrativas; `routeTree.gen.ts` é gerado automaticamente
- `src/components/`: layouts público/admin, componentes de domínio e biblioteca visual
- `src/services/`: fronteira de acesso a dados consumida pelas páginas
- `src/data/`: mocks e store em memória
- `src/types/`: contratos TypeScript para necessidades, doadores, doações e dashboard
- `src/context/`: estado de autenticação administrativa
- `src/config/`: configuração central da API
- `src/lib/`: rótulos, utilidades e apresentação de erro
- `public/`, `src/styles.css`: arquivos públicos e identidade visual

## Rotas e páginas

| Rota                                                          | Página                                   |
| ------------------------------------------------------------- | ---------------------------------------- |
| `/`                                                           | Início, métricas e necessidades públicas |
| `/necessidades` e `/necessidades/:id`                         | Lista e detalhes das necessidades        |
| `/doar` e `/doacao/enviada`                                   | Formulário e confirmação de intenção     |
| `/acompanhar`                                                 | Consulta de doação por protocolo         |
| `/como-funciona`, `/sobre`, `/faq`, `/privacidade`, `/termos` | Conteúdo institucional                   |
| `/admin/login`                                                | Acesso administrativo                    |
| `/admin`                                                      | Dashboard                                |
| `/admin/necessidades`, `/nova`, `/:id`, `/:id/editar`         | Gestão de necessidades                   |
| `/admin/doacoes` e `/:id`                                     | Gestão de intenções e recebimentos       |
| `/admin/relatorios`                                           | Relatórios e indicadores                 |
| `/admin/configuracoes`                                        | Preferências demonstrativas              |

## Fluxos e estado atual

Visitantes consultam necessidades ativas/atendidas, registram uma intenção em formulário dividido em etapas e consultam o andamento com protocolo. A área administrativa contém autenticação, dashboard, cadastro e edição de necessidades, análise das intenções, conclusão de recebimento e relatórios.

As páginas leem dados por `src/services/*Service.ts`; nenhuma página importa mocks diretamente. Os services agora usam o cliente HTTP em `src/config/api.ts` e a API Express. Os arquivos legados em `src/data/` permanecem no projeto, mas não são usados pelos fluxos da interface. Dashboard e relatórios consultam dados persistidos. A tela de configurações continua demonstrativa e suas alterações não são persistidas.

Os dados do seed são ilustrativos e não são informações oficiais da Escola Municipal Francisco Costa; registros seed têm `demoData` e a interface pública informa quando exibe dados demonstrativos. Necessidades, doadores, intenções, eventos, administradores, indicadores e relatórios são persistidos/consultados via Prisma. O acompanhamento público retorna apenas protocolo, equipamento, quantidades, status e histórico, sem dados de contato ou notas internas.

## Backend integrado

- `backend/src/`: aplicação Express separada em rotas, controllers, services, repositories, schemas, middlewares e utilitários.
- `backend/prisma/schema.prisma`: modelos AdminUser, Need, Donor, Donation e DonationEvent. SQLite fica em `backend/prisma/dev.db` durante desenvolvimento.
- `backend/.env.example`: configuração de porta, CORS, SQLite, JWT e credenciais seed, sem senha real versionada.
- `docker-compose.yml`: frontend TanStack/Nitro, API, proxy Caddy e volume persistente SQLite para execução local e deploy em Coolify.
- A API usa `PORT` (padrão local 3002, pois 3001 já está ocupada por um serviço local), com URL centralizada no `VITE_API_URL`.
- O login usa bcrypt/JWT e guarda o token em `localStorage` ou `sessionStorage` conforme “Lembrar de mim”; `/auth/me` valida a sessão ao restaurar a interface.
- Recebimentos concluem a doação e atualizam a necessidade dentro de transação. Repetir uma conclusão é recusado.

## Qualidade observada na auditoria

- `bun run build`: passou para frontend e backend. O frontend gera um servidor Nitro para Node.js, executável com `bun run start`.
- `bun run typecheck`: passou para frontend e backend.
- `bun run test`: passou com 4 testes de protocolo, transição, validação de quantidade e recebimento idempotente.
- `bun run lint`: passou sem erros, com 7 avisos de Fast Refresh nos componentes existentes.
- Não havia dependências instaladas; foram instaladas com Bun a partir do lockfile existente.
- O diretório recebido não contém metadados Git, portanto não foi possível avaliar histórico ou alterações versionadas.

## Estado após implementação

As rotas, layouts, identidade visual, formulários e componentes existentes foram mantidos. A próxima etapa de produto é substituir os registros do seed por dados validados pela escola; a tela de configurações demonstrativa também pode ser conectada se entrar no escopo.
