# Contexto do Projeto

## Objetivo

IMPORTANTE:
O sistema deve seguir os requisitos descritos no documento técnico do desafio.

Também devem ser gerados arquivos de teste para validação do sistema:

* PDFs
* PNGs
* XMLs

Os arquivos de teste devem conter informações estruturadas para permitir validação da extração de dados.

Também devem ser criados testes unitários simples para validar a identificação e extração de padrões estruturados.

Os testes devem validar pelo menos:

* Extração de CPF
* Extração de datas

Os testes podem utilizar documentos mockados e funções isoladas de parsing/OCR.

Objetivo dos testes:

* Garantir funcionamento básico da extração
* Validar regex e parsing
* Demonstrar preocupação com qualidade e confiabilidade do processamento documental.

O sistema deve identificar pelo menos 2 padrões estruturados extraídos dos documentos.

Exemplos:

* CPF
* Datas
* Valores monetários
* CNPJ

A extração desses padrões deve ocorrer durante o processamento OCR/parser.

---

Construir um sistema de processamento documental utilizando arquitetura monorepo.

O sistema deverá permitir:

* Upload de documentos PDF e PNG
* Upload de XML para enriquecimento de dados
* Processamento OCR
* Extração de informações
* Relatórios quantitativos
* Controle de usuários e permissões
* Execução web e mobile utilizando a mesma base frontend

---

# Estrutura do Monorepo

```txt
root/
 ├── backend/
 ├── frontend/
 ├── docker/
 ├── context.md
 ├── docker-compose.yml
 └── README.md
```

---

# Arquitetura Definida

## Banco de Dados

## PostgreSQL

O banco de dados principal do sistema será PostgreSQL.

### Motivos da escolha

* Banco relacional robusto e maduro
* Excelente suporte para consultas analíticas e relatórios
* Suporte a índices avançados e full-text search
* Facilidade de integração com Sequelize
* Ótima estabilidade para ambientes containerizados
* Simplifica a arquitetura mantendo apenas um banco principal

### Responsabilidades

* Usuários
* Controle de permissões
* Metadados dos documentos
* Status de processamento
* Logs de auditoria
* Relatórios agregados
* Relacionamento entre documentos e XML

---

# Arquitetura Backend

O backend deverá seguir princípios de Clean Architecture.

## Estrutura esperada

```txt
backend/
 ├── src/
 │   ├── core/
 │   ├── domain/
 │   │    ├── entities/
 │   │    ├── repositories/
 │   │    ├── usecases/
 │   │    └── services/
 │   ├── data/
 │   │    ├── datasource/
 │   │    ├── repositories/
 │   │    └── dtos/
 │   ├── infra/
 │   │    ├── database/
 │   │    ├── http/
 │   │    ├── queue/
 │   │    ├── cache/
 │   │    └── storage/
 │   ├── models/
 │   ├── routes/
 │   ├── middlewares/
 │   ├── utils/
 │   └── shared/
```

## Regras arquiteturais

* Domain não pode depender de infra
* Usecases devem centralizar regras de negócio
* Datasource deve isolar acesso externo
* Sequelize ficará isolado na camada infra/data
* Controllers devem ser simples
* Regras de negócio não devem ficar nas rotas
* Separar responsabilidades corretamente

---

# Frontend

O frontend será desenvolvido utilizando React Native + React Native Web.

A arquitetura deve seguir organização escalável e modular.

## Estrutura esperada

```txt
frontend/
 ├── src/
 │   ├── components/
 │   ├── pages/
 │   ├── hooks/
 │   ├── services/
 │   ├── store/
 │   ├── utils/
 │   ├── routes/
 │   ├── theme/
 │   ├── types/
 │   ├── contexts/
 │   └── assets/
```

## Gerenciamento global

Utilizar Zustand para gerenciamento global de estado.

## Regras frontend

* Componentes reutilizáveis
* Separação entre lógica e UI
* Hooks customizados
* Services para chamadas HTTP
* Axios centralizado
* Tratamento global de erros
* Estrutura preparada para web e mobile
* Responsividade para web
* Navegação compartilhada entre plataformas

---

# Banco de Dados

Stack:

* Node.js
* Express.js
* Sequelize
* PostgreSQL
* Redis
* Axios
* Tesseract OCR

Arquitetura:

* API REST
* Worker separado para processamento OCR
* Processamento assíncrono
* Cache com Redis
* Fila de processamento baseada em Redis
* Dockerizado

Fluxo:

1. Usuário envia documento
2. API salva metadados
3. Documento é salvo em storage local
4. Job é enviado para fila
5. Worker processa OCR
6. Dados extraídos são persistidos
7. Relatórios ficam disponíveis

---

## Frontend

Stack:

* React Native
* React Native Web
* Expo
* Axios
* React Query
* React Navigation

Objetivo:

* Compartilhar a maior parte possível do código entre web e mobile
* Interface única para:

  * operador
  * gestor
  * administrador

Funcionalidades:

* Login
* Upload de documentos
* Upload de XML
* Listagem de documentos
* Visualização de status
* Relatórios
* Controle de usuários

---

As autorizações serão controladas exclusivamente no backend através de middlewares de autenticação e autorização baseados em roles.

Cada requisição protegida deverá:

validar o JWT do usuário autenticado
identificar a role do usuário (operator, manager ou admin)
verificar se aquela role possui permissão para acessar a rota
retornar erro 401 Unauthorized ou 403 Forbidden quando necessário

Exemplo:

Operador → upload, consulta status e correção de erros
Gestor → acesso apenas aos relatórios e métricas
Administrador → gerenciamento de usuários e logs

O frontend apenas controla exibição de telas/menu por UX, mas a segurança real deve existir no backend.

## Infraestrutura

Stack:

* Docker
* Docker Compose

Containers:

* api
* worker
* postgres
* redis
* frontend

Objetivos:

* Ambiente reproduzível
* Facilidade de execução
* Simplicidade operacional

---

Decisão:

* Utilizar apenas PostgreSQL
* Redis para cache e fila

Motivos:

* Redução de complexidade
* Facilidade de manutenção
* Menor custo operacional
* Menor risco de inconsistência

---

## Elasticsearch obrigatório sem necessidade

A volumetria do sistema não justifica Elasticsearch.

Decisão:

* Utilizar full-text search do PostgreSQL

---

## Processamento síncrono

OCR é uma operação pesada.

Decisão:

* Processamento assíncrono utilizando worker

---

## Storage local sem estratégia

O diagrama utiliza filesystem local sem backup.

Decisão:

* Utilizar filesystem local para o desafio
* Estruturar código preparado para futura migração para S3 ou MinIO

---

## Kubernetes desnecessário

O diagrama mistura:

* docker-compose
* Kubernetes
* HPA

Decisão:

* Utilizar apenas Docker Compose

---

## Redis indefinido

O diagrama não define estratégia para Redis.

Decisão:

* Utilizar Redis para:

  * cache
  * fila
  * rate limit

---

## OCR acoplado na API

Decisão:

* Separar API e Worker

---

# Modelagem Inicial

## users

Campos:

* id
* name
* email
* password_hash
* role
* created_at

Roles:

* operator
* manager
* admin

---

## documents

Campos:

* id
* original_name
* mime_type
* file_path
* status
* extracted_text
* processed_at
* created_by
* created_at
* updated_at

Status:

* pending
* processing
* completed
* failed

---

## extracted_patterns

Campos:

* id
* document_id
* type
* value
* created_at

Tipos:

* cpf
* cnpj
* currency
* date

---

## xml_imports

Campos:

* id
* document_id
* xml_path
* xml_content
* imported_at

---

## audit_logs

Campos:

* id
* user_id
* action
* entity
* entity_id
* created_at

---

# Organização Backend

```txt
backend/
 ├── src/
 │   ├── config/
 │   ├── controllers/
 │   ├── services/
 │   ├── repositories/
 │   ├── middlewares/
 │   ├── routes/
 │   ├── workers/
 │   ├── queues/
 │   ├── utils/
 │   ├── database/
 │   ├── models/
 │   └── app.js
 │
 ├── Dockerfile
 ├── package.json
 └── .env
```

---

# Organização Frontend

```txt
frontend/
 ├── src/
 │   ├── screens/
 │   ├── components/
 │   ├── services/
 │   ├── hooks/
 │   ├── routes/
 │   ├── contexts/
 │   ├── utils/
 │   └── styles/
 │
 ├── app.json
 ├── package.json
 └── Dockerfile
```

---

# Requisitos Técnicos

## Upload

* PDF
* PNG
* XML
* Limite configurável
* Validação MIME type

---

## OCR

Fluxo:

* PDF → extração direta
* PNG → OCR Tesseract

---

## Relatórios

Relatórios:

* Quantidade por período
* Quantidade por cliente
* Quantidade por status
* Quantidade por tipo

Formato:

* JSON
* CSV

---

# Segurança

* JWT
* Hash de senha
* Middleware de autenticação
* Middleware de autorização por role
* Rate limit
* Validação de upload

---

# Cache

Redis será utilizado para:

* Cache de relatórios
* Cache temporário de consultas pesadas
* TTL de 5 minutos

---

# Fila

Fluxo da fila:

1. Documento enviado
2. Job criado
3. Worker consome
4. OCR executado
5. Banco atualizado

---

# Docker

Containers esperados:

* backend-api
* backend-worker
* postgres
* redis
* frontend

---

# Objetivos Técnicos

Prioridades:

1. Simplicidade
2. Clareza arquitetural
3. Separação de responsabilidades
4. Escalabilidade futura
5. Facilidade de manutenção
6. Boa experiência de desenvolvimento

---

# Observações

* O projeto deve priorizar legibilidade
* Evitar overengineering
* O código deve ser modular
* Preparar o sistema para futura escalabilidade
* O foco principal é demonstrar tomada de decisão técnica
* Utilizar boas práticas de organização
* Utilizar commits incrementais

=======

feature

vamos ajustar o sitema para usar o OCR

“O sistema deve utilizar OCR (Optical Character Recognition / Reconhecimento Óptico de Caracteres) para processar imagens PNG e documentos PDF escaneados.

O OCR será responsável por converter imagens e documentos digitalizados em texto editável e pesquisável, permitindo posteriormente a extração de padrões estruturados como:

CPF
Datas
Valores monetários
Números de documentos

O pipeline de processamento deve:

Receber o arquivo
Identificar o tipo do documento
Executar OCR quando necessário
Extrair o texto bruto
Aplicar parsers/regex para identificar padrões estruturados
Salvar os dados processados no banco

O sistema deve funcionar tanto com:

PDFs textuais
PDFs escaneados
Imagens PNG/JPG

Sugestão técnica:

Utilizar Tesseract OCR
Implementar uma camada de OCR Service desacoplada
Permitir futura troca do provider de OCR sem impacto na regra de negócio”