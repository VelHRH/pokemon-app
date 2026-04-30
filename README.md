# Project description

Small full-stack Pokemon app:

- browse Pokemon and view details
- create Pokemon lists (min 3 different species), download as JSON
- download/upload a list JSON to recreate a list on the server

# Run project

```bash
docker compose up --build
```

Open:

- `http://localhost:5173` (client)
- `http://localhost:3000` (server)

# Tech stack

- **Client**: React + TypeScript, Vite dev server/build, React Router, Tailwind CSS
- **Server**: NestJS + TypeScript, Mongoose (MongoDB)
- **Validation**: `class-validator` + `class-transformer` for DTO validation on the server
- **Monorepo shared types**: `shared/` contains DTOs/types used by both client and server (single source of truth)
- **Seeding**: optional DB seeding from PokeAPI, controlled by `SEED_POKEAPI` and `SEED_LIMIT` envs
- **Dev environment**: Docker Compose (app + client + mongodb)
