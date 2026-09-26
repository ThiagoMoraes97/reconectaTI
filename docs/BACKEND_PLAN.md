# Plano técnico do backend

## Organização

```text
backend/
  prisma/       schema, migrations e seed demonstrativo
  src/
    config/     ambiente e Prisma Client
    controllers/ HTTP e envelopes de resposta
    middlewares/ autenticação, validação e erros
    repositories/ consultas e persistência Prisma
    routes/     agrupamento por recurso
    schemas/    validação de entradas com Zod
    services/   regras de domínio e transições
    types/      tipos de autenticação/Express
    utils/      erros, protocolo e serializers
```

## Persistência e modelos

SQLite facilita a execução local; modelos relacionais Prisma usam tipos escalares portáveis e enums de domínio. AdminUser guarda apenas hash bcrypt e role ADMIN. Need guarda quantidades e status. Donor e Donation separam dados pessoais da intenção, com protocolo único e eventos de histórico. Chaves e relações evitam duplicar doador/intenção. `DATABASE_URL` isola o driver; a futura migração para PostgreSQL deve exigir mudança do provider, URL e migrations, sem reescrever regras ou repositories.

## API

- `GET /api/health`
- `POST /api/auth/login`, `GET /api/auth/me`
- Público: `GET /api/needs`, `GET /api/needs/:id`, `POST /api/donations`, `GET /api/donations/protocol/:protocol`
- Administração (JWT): gestão de necessidades, listagem/detalhe e transições de doação, dashboard e relatórios em `/api/admin/*`
- Respostas usam `{ success, data }`; erros usam `{ success: false, error: { code, message, details? } }`.

## Regras essenciais

- Validar entradas no servidor, em especial quantidades inteiras e positivas.
- Doações seguem `pending → reviewing → approved → awaiting_delivery → completed`; somente `pending`/`reviewing` podem ser recusadas.
- A conclusão é idempotente, registra a quantidade recebida uma única vez e atualiza a necessidade na mesma transação. A necessidade passa a `fulfilled` ao atingir a solicitação.
- O endpoint de protocolo retorna status, equipamento, quantidades e histórico público, sem contato pessoal, notas internas ou motivo interno de recusa.
- API pública aplica Helmet, CORS configurável, limite de JSON e rate limit para login e criação/consulta de intenções. JWT, hash e segredos vêm do ambiente.

## Execução local

Criar `backend/.env` a partir de `.env.example`; configurar URL SQLite, CORS, JWT e credenciais do admin de desenvolvimento. Aplicar migrations e executar seed, depois iniciar os dois servidores. O seed identifica os dados como demonstração e não representa inventário oficial da escola. Veja o README da raiz para comandos e detalhes operacionais.

## Integração do frontend

Manter componentes e tipos existentes e substituir a implementação dos services para usar `fetch` centralizado em `src/config/api.ts`. O token é mantido pelo auth service no armazenamento do navegador e enviado em `Authorization: Bearer`; o contexto restaura usuário via `/auth/me`. Necessidades públicas/admin e doações usam recursos separados. Estados de loading, erro, vazio e toast existentes permanecem nas páginas.

O JWT fica no `localStorage` quando “Lembrar de mim” está marcado, ou no `sessionStorage` durante a sessão atual quando desmarcado; `/auth/me` valida o token ao restaurar a sessão. Essa escolha simples para a demonstração exige proteger a aplicação contra XSS. Em uma implantação pública, revisar a estratégia com cookies `HttpOnly`, `Secure` e `SameSite`.
