# Processador Documental

Sistema de processamento documental com OCR, extração de padrões e relatórios.

## Stack

- **Backend**: Node.js + Express + Sequelize + PostgreSQL + Redis + Tesseract OCR
- **Frontend**: React Native + React Native Web + Expo + Zustand
- **Infra**: Docker Compose (5 containers)

## Estrutura

```
├── backend/          # API REST + Worker OCR
├── frontend/         # App mobile/web
├── docker/           # Configurações Docker
├── docker-compose.yml
└── README.md
```

## Execução

```bash
# Subir todos os serviços
docker compose up --build

# Migrar banco
docker compose exec backend-api npm run migrate

# Seed usuários iniciais
docker compose exec backend-api npm run seed
```

### Usuários seed

| Email | Role | Senha |
|-------|------|-------|
| admin@sistema.com | admin | admin123 |
| operator@sistema.com | operator | admin123 |
| manager@sistema.com | manager | admin123 |

### Desenvolvimento (sem Docker)

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev

# Tests
npm test

# Frontend
cd frontend
npm install
npx expo start --web
```

## API Endpoints

| Método | Rota | Roles |
|--------|------|-------|
| POST | /api/auth/login | - |
| GET | /api/auth/me | autenticado |
| POST | /api/documents/upload | operator, admin |
| GET | /api/documents | operator, manager, admin |
| GET | /api/documents/:id | operator, manager, admin |
| PATCH | /api/documents/:id/status | operator, admin |
| PUT | /api/documents/:id/patterns | operator, admin |
| POST | /api/xml/upload | operator, admin |
| GET | /api/xml/:documentId | operator, manager, admin |
| GET | /api/reports/* | manager, admin |
| GET | /api/users | admin |
| GET | /api/audit | admin |

## Testes

```bash
cd backend
npm test                   # Todos os testes
npm run test:watch         # Modo watch
```

Testes unitários validam extração de CPF, CNPJ, datas e valores monetários via regex.
