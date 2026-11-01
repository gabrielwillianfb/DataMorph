# DataMorph — Enterprise Data Ingestion & Transformation Gateway

[🇧🇷 Versão em Português](#-português) | [🇺🇸 English Version](#-english)

---

## 🇧🇷 Português

O **DataMorph** é uma plataforma corporativa desenvolvida para solucionar os desafios de ingestão, higienização, mapeamento e validação de arquivos de dados heterogêneos (planilhas CSV, XLSX e arquivos posicionais TXT) oriundos de múltiplos parceiros comerciais, bancos e sistemas legados.

Construído sob uma arquitetura desacoplada, o sistema combina um backend de processamento determinístico de alta performance em **PHP 8.3 / Laravel 11** com uma interface moderna, reativa e intuitiva em **Angular 20**.

### 🌟 Principais Funcionalidades

1. **Mapeamento Automático 1:1 com Dedução Inteligente:**
   - Ao carregar qualquer planilha ou arquivo tabular, o sistema mapeia automaticamente todas as colunas de entrada para os campos de destino.
   - Identifica padrões semânticos de cabeçalhos e preenche regras adequadas (ex.: identificação de CPF/CNPJ, valores monetários, datas brasileiras, CEP e telefones).
2. **Edição Livre de Esquema e Chaves de Saída:**
   - Permite que o operador renomeie tanto o rótulo de exibição (`label`) quanto a chave técnica de destino (`key`) das colunas mapeadas.
   - Adicione novos campos ou exclua colunas desnecessárias com facilidade.
3. **Motor Extensível de Regras e Transformações:**
   - Formatação e conversão: Caixa alta (`uppercase`), caixa baixa (`lowercase`), formato título (`titlecase`), moeda (`currency`), data padronizada (`date`), telefone (`phone`), CEP (`cep`).
   - Higienização e caracteres: Remoção de acentuações e diacríticos (`unaccent`), remoção de pontuações e símbolos (`alphanumeric`), extração de dígitos (`digits`), corte de espaços (`trim`).
   - Correção semântica e vocabulário: Substituição de palavras/termos incorretos (`replace`) e tabelas de de-para (`lookup`).
   - Validações estruturais customizadas: Expressões regulares (`regex`), regras de tamanho (`length`) e validação de faixas numéricas (`range`).
4. **Mesa de Quarentena Preventiva:**
   - Linhas com inconformidades ou inconsistências cadastrais não interrompem o processamento das linhas válidas do lote.
   - Registros com divergências são isolados em quarentena com o diagnóstico detalhado do erro.
   - O operador pode corrigir pontualmente os valores em uma gaveta lateral e revalidar o registro em tempo real.
5. **Histórico, Auditoria e Exportação de Lotes:**
   - Rastreabilidade completa de arquivos processados, taxa de aproveitamento e volumetria.
   - Exportação autenticada dos dados consolidados em formatos CSV e Excel (.xlsx).
6. **Internacionalização Reativa (i18n):**
   - Suporte completo e dinâmico a Português do Brasil (PT-BR) e Inglês (EN-US), sem necessidade de recarregar a aplicação.
7. **Autenticação Corporativa e Isolamento Multi-inquilino:**
   - Integração segura com Auth0 (OAuth 2.0 / OIDC com PKCE).
   - Isolamento de dados por usuário/empresa garantido por traits de escopo global no banco de dados.

---

### 🏛️ Arquitetura do Sistema

```
datamorph/
├── datamorph-backend/         # Core API & Motor de Mapeamento
│   ├── app/Http/Controllers/  # Endpoints RESTful de ingestão, lotes e quarentena
│   ├── app/Http/Middleware/   # Autenticação e resolução de inquilino via Auth0
│   ├── app/Models/            # Entidades Eloquent com escopo multi-tenant
│   ├── app/Services/Mapping/  # Motor determinístico e pipeline de transformadores
│   ├── database/migrations/   # Esquema relacional estruturado
│   └── tests/Feature/         # Testes de integração e processamento em lote
│
└── datamorph-frontend/        # Portal Web SPA (Angular 20)
    ├── src/app/core/          # Serviços de API, i18n, telemetria (Clarity) e interceptores
    ├── src/app/features/      # Módulos: Home, Studio, Quarentena e Histórico de Lotes
    └── src/styles.scss        # Design System corporativo baseado em CSS Variables
```

---

### 🚀 Instalação e Execução Local

#### Pré-requisitos
- **PHP** >= 8.3 com extensões `intl`, `mbstring`, `pdo_sqlite` (ou PostgreSQL)
- **Composer** >= 2.x
- **Node.js** >= 20.x e **npm** >= 10.x

#### 1. Configurando o Backend
```bash
cd datamorph-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```
A API estará acessível em `http://127.0.0.1:8000`.

#### 2. Configurando o Frontend
```bash
cd datamorph-frontend
npm install
npm run start
```
Acesse a aplicação no navegador em `http://localhost:4200`.

---

### 🧪 Testes Automatizados e Qualidade

O backend conta com uma suíte de testes que valida ponta a ponta o pipeline de ingestão e as regras de transformação:
```bash
cd datamorph-backend
php artisan test
```
*Resultado: 14 testes executados, 5.069 asserções com 100% de aprovação.*

Para validar o build de produção do frontend:
```bash
cd datamorph-frontend
npm run build
```

---

## 🇺🇸 English

**DataMorph** is an enterprise data gateway designed to streamline the ingestion, cleaning, transformation, and validation of heterogeneous datasets (CSV, XLSX, and flat TXT files) received from business partners, financial institutions, and legacy platforms.

Engineered with a decoupled architecture, the system combines a high-performance deterministic mapping engine in **PHP 8.3 / Laravel 11** with a responsive, modern user interface built in **Angular 20**.

### 🌟 Key Features

1. **Automatic 1:1 Mapping with Semantic Deduction:**
   - Instantly maps all incoming columns to output fields upon file upload.
   - Automatically detects common header patterns (e.g. Tax IDs, monetary amounts, localized dates, postal codes, and phone numbers).
2. **Customizable Target Schema & Keys:**
   - Operators can rename output display labels and destination database/file keys (`key`) on the fly.
   - Easily add new fields or eliminate unmapped input columns.
3. **Comprehensive Transformation & Validation Rules:**
   - Case & formatting: `uppercase`, `lowercase`, `titlecase`, `currency`, `date`, `phone`, `cep`.
   - Character hygiene: Accent removal (`unaccent`), punctuation/symbol stripping (`alphanumeric`), digit extraction (`digits`), whitespace trimming (`trim`).
   - Semantic text correction: Target word/typo replacement (`replace`) and value translation dictionaries (`lookup`).
   - Custom business rules: Regular expressions (`regex`), string length validations (`length`), and numeric ranges (`range`).
4. **Preventive Quarantine Desk:**
   - Rows failing validation rules never fail or corrupt the entire batch.
   - Problematic rows are safely quarantined with detailed error diagnostics.
   - Operators can edit values in place using a slide-over drawer and revalidate individual rows in real time.
5. **Audit Trail, Batch History & Exports:**
   - Full visibility into batch volume, success rate, and discrepancy statistics.
   - Authenticated exports of approved records in CSV and Microsoft Excel (.xlsx) formats.
6. **Reactive Internationalization (i18n):**
   - Seamless runtime switching between Portuguese (PT-BR) and English (EN-US) across all screens, dialogs, and validation notifications.
7. **Enterprise Security & Multi-Tenant Data Isolation:**
   - Secured with Auth0 (OAuth 2.0 / OIDC PKCE).
   - Strict database-level isolation per organization/user using global query scopes.

---

### 🚀 Getting Started

#### Prerequisites
- **PHP** >= 8.3 with `intl`, `mbstring`, `pdo_sqlite` (or PostgreSQL)
- **Composer** >= 2.x
- **Node.js** >= 20.x & **npm** >= 10.x

#### 1. Backend Setup
```bash
cd datamorph-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```
Backend API will be running on `http://127.0.0.1:8000`.

#### 2. Frontend Setup
```bash
cd datamorph-frontend
npm install
npm run start
```
Open your browser and navigate to `http://localhost:4200`.

---

### 🧪 Automated Testing

Run the PHPUnit test suite:
```bash
cd datamorph-backend
php artisan test
```

Build the production frontend bundle:
```bash
cd datamorph-frontend
npm run build
```

---

## 📄 Licença / License
Este projeto está sob a licença [MIT](LICENSE).
This project is licensed under the [MIT License](LICENSE).
