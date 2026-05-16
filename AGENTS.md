# AGENTS.md

## Project state

Implemented monorepo — backend (Express + Sequelize), frontend (Expo + Zustand), Docker Compose, and unit tests all created. See `CONTEXT.md` for full architecture rationale.

## Authoritative source

`CONTEXT.md` (611 lines) is the single architecture document. It defines:
- Stack, directory trees, DB schema, roles, auth, infra, and all technical decisions.
- **Read it first** before any implementation. If a design question arises, `CONTEXT.md` wins.

## Monorepo layout

```
root/
 ├── backend/         # Node.js + Express + Sequelize + Tesseract OCR
 ├── frontend/        # React Native + React Native Web + Expo + Zustand
 ├── docker/          # Dockerfiles + ancillary config
 ├── context.md
 ├── docker-compose.yml   # 5 containers: api, worker, postgres, redis, frontend
 └── README.md
```

## Developer commands

```bash
cd backend
npm run migrate        # Sync Sequelize models to DB
npm run seed           # Seed 3 users (admin/operator/manager)
npm run dev            # Start API with nodemon
npm run worker         # Start OCR worker
npm test               # 20 pattern-extraction unit tests
```

## Key architectural rules

- **Clean Architecture backend**: `domain/` must never import `infra/`. Sequelize stays in `infra/database`.
- **Async OCR**: API enqueues → Redis queue → worker processes. Never block on OCR in request path.
- **Auth**: Backend-enforced via JWT + role middleware. Frontend only controls visible UI.
  - `operator` → upload, status, error correction
  - `manager` → reports/metrics only
  - `admin` → user management, logs
- **DB**: PostgreSQL only. Redis for cache (5min TTL), queue, and rate limit. No Elasticsearch.
- **Storage**: Local filesystem for now. Design storage layer to be swappable to S3/MinIO later.
- **PDF → direct text extraction. PNG → Tesseract OCR.
- **Shared code** (`backend/src/shared/`) for cross-cutting concerns.
- **Frontend**: Shared navigation between web and mobile. Zustand for global state. Axios centralized.

## DB models

| Table | Key fields |
|-------|-----------|
| `users` | name, email, password_hash, role (operator\|manager\|admin) |
| `documents` | original_name, mime_type, file_path, status (pending\|processing\|completed\|failed), extracted_text, created_by |
| `extracted_patterns` | document_id, type (cpf\|cnpj\|currency\|date), value |
| `xml_imports` | document_id, xml_path, xml_content |
| `audit_logs` | user_id, action, entity, entity_id |

## Testing requirements

- Generate test PDFs, PNGs, and XMLs with structured data for extraction validation.
- Unit tests for at least **CPF extraction** and **date extraction** using mocked documents and isolated parsing/OCR functions.
- Tests should validate regex and parsing logic, not integration with external OCR.

## Docker

5 services: `backend-api`, `backend-worker`, `postgres`, `redis`, `frontend`.

```bash
docker compose up --build
docker compose exec backend-api npm run migrate
docker compose exec backend-api npm run seed
```

## Conventions

- Clean Architecture package structure per `CONTEXT.md`
- Incremental commits
- Portuguese for user-facing content (national client); English for code identifiers and comments
- Avoid overengineering; favor simplicity and modularity
