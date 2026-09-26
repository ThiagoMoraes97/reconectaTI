# ReConecta TI — instruções do projeto

## Arquitetura

- O repositório contém o frontend React/TanStack Start e uma API Node.js independente em `backend/`.
- As páginas acessam dados pela camada `src/services/*Service.ts`; a API Express usa Prisma e SQLite.
- A URL da API no frontend é configurada por `VITE_API_URL`; configurações e segredos do servidor ficam em `backend/.env`.
- A autenticação administrativa usa JWT na API. Não mover segredos para variáveis `VITE_*`.
- A interface e todo texto apresentado ao usuário devem permanecer em português brasileiro.

## Execução e entrega

- Use Bun e respeite os lockfiles `bun.lock` e `backend/bun.lock`.
- `bun run dev` inicia frontend e API; `bun run build` constrói ambos.
- O frontend usa TanStack Start e Nitro com destino Node.js; o build web é iniciado por `bun run start`.
- `docker-compose.yml` reúne frontend, API, proxy Caddy e o volume persistente do SQLite; preserve essa configuração para Coolify e execução local.
