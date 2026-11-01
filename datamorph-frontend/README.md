# DataMorph Frontend — Enterprise Web Application

[🇧🇷 Versão em Português](#-português) | [🇺🇸 English Version](#-english)

---

## 🇧🇷 Português

O **DataMorph Frontend** é uma aplicação web corporativa (Single Page Application) construída em **Angular 20**, com foco em alta produtividade, previsibilidade operacional e excelente experiência de uso (UI/UX).

A interface foi projetada para conferir total autonomia ao operador, eliminando a dependência de planilhas modelo externas ou manuais técnicos.

### 💎 Pilares Arquiteturais

1. **Angular Signals e Reatividade Nativa:**
   - Gerenciamento de estado leve e de alta performance utilizando Angular Signals (`signal`, `computed`).
   - Componentes Standalone desacoplados com Change Detection `OnPush`.
2. **Design System Corporativo Próprio:**
   - Paleta de cores de alto contraste (`--dm-primary: #1d4ed8`, superfícies em `#ffffff` e tipografia nítida em `#090d16`).
   - Sem bibliotecas visuais genéricas ou estilos artificiais.
   - Totalmente responsivo para desktops, notebooks, tablets e smartphones.
3. **Internacionalização Reativa (i18n):**
   - Sistema de tradução próprio gerenciado pelo `I18nService` e `TranslatePipe`.
   - Alternância instantânea em tempo real entre Português (PT-BR) e Inglês (EN-US).
4. **Mapeamento Studio & Autonomia:**
   - **Upload Inteligente:** Área drag-and-drop compatível com `.csv`, `.xlsx` e `.txt`.
   - **Mapeamento Automático 1:1:** Ao carregar um arquivo, todas as colunas de entrada são instantaneamente mapeadas para o esquema de destino.
   - **Dedução Semântica:** Identificação automática de tipos comuns (CPF/CNPJ, datas brasileiras, moedas, telefones e CEPs).
   - **Esquema Editável:** O operador pode renomear diretamente o nome da coluna (`label`) e a chave técnica (`key`).
   - **Regras Flexíveis:** Ativação com um clique de transformadores de texto, formatação, remoção de acentos e criação de regras personalizadas (Regex, substituição de palavras, tamanho e faixas numéricas).
5. **Mesa de Quarentena e Correção em Tempo Real:**
   - Linhas com inconformidades são exibidas com o motivo detalhado do erro.
   - Gaveta lateral (*slide-over*) para edição direta dos valores da linha e revalidação instantânea contra o backend.
6. **Histórico de Lotes & Despacho:**
   - Auditoria completa de lotes processados, visualização prévia dos dados e download de arquivos em CSV e Excel.

---

### 📂 Estrutura de Pastas

```
datamorph-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── components/toast/   # Sistema de notificações corporativo
│   │   │   ├── interceptors/       # Interceptor HTTP de token Auth0
│   │   │   ├── pipes/              # TranslatePipe para i18n declarativo
│   │   │   └── services/           # ApiService, I18nService, ToastService, ClarityService
│   │   ├── features/
│   │   │   ├── home/               # Visão geral e indicadores executivos (KPIs)
│   │   │   ├── studio/             # Mapping Studio (De-Para & Regras)
│   │   │   ├── quarantine/         # Mesa de Quarentena e resolução de exceções
│   │   │   └── batches/            # Histórico de Lotes e exportações
│   │   ├── app.component.ts        # Shell da aplicação, barra de navegação e seletor de idioma
│   │   └── app.routes.ts           # Roteamento SPA
│   ├── environments/               # Configurações de ambiente e Auth0
│   └── styles.scss                 # Variáveis CSS e Design System institucional
```

---

### 🚀 Comandos de Desenvolvimento

#### Executar Localmente
```bash
npm install
npm run start
```
Acesse a aplicação em `http://localhost:4200`.

#### Build de Produção
```bash
npm run build
```
Os arquivos otimizados serão gerados no diretório `dist/datamorph-frontend`.

---

## 🇺🇸 English

**DataMorph Frontend** is an enterprise Single Page Application built with **Angular 20**, engineered for operational reliability, workflow efficiency, and exceptional UI/UX standards.

The application empowers non-technical and operational users to ingest, map, transform, and export complex datasets autonomously without relying on external sample spreadsheets or manual training.

### 💎 Core Architecture

1. **Angular Signals & Native Reactivity:**
   - Lightweight, performant state management driven by Angular Signals (`signal`, `computed`).
   - Modular Standalone Components with `OnPush` change detection.
2. **Proprietary Enterprise Design System:**
   - Modern, high-contrast visual identity (`--dm-primary: #1d4ed8`, pure `#ffffff` cards, and crisp `#090d16` typography).
   - Clean, professional SaaS aesthetics without generic styling or artificial design gimmicks.
   - Fully responsive across desktop, laptop, tablet, and mobile displays.
3. **Reactive Internationalization (i18n):**
   - Native translation engine powered by `I18nService` and `TranslatePipe`.
   - Real-time language switching between English (EN-US) and Brazilian Portuguese (PT-BR).
4. **Mapping Studio & Operator Autonomy:**
   - **Universal Upload Dropzone:** Drag-and-drop ingestion supporting `.csv`, `.xlsx`, and `.txt`.
   - **Instant 1:1 Auto-Mapping:** Automatically pairs all uploaded columns to target fields upon inspection.
   - **Semantic Deduction:** Detects Tax IDs (CPF/CNPJ), localized dates, currency strings, phone numbers, and postal codes.
   - **Editable Output Schema:** Customize both display labels and programmatic output keys directly in the UI.
   - **Flexible Transformation Rules:** One-click toggles for formatting, casing, accent removal, character sanitization, and custom rule authoring (Regex, word replacement, character lengths, numeric ranges).
5. **Quarantine Desk & Real-time Correction:**
   - Isolated invalid rows displayed with exact error diagnostic notes.
   - Slide-over drawer allows instant value editing and immediate re-validation against the deterministic engine.
6. **Batch History & Dispatch:**
   - Full audit trail of processed batches, data preview tables, and authenticated downloads in CSV and XLSX formats.

---

### 🚀 Development & Build

#### Run Locally
```bash
npm install
npm run start
```
Access the application at `http://localhost:4200`.

#### Production Build
```bash
npm run build
```
Optimized assets are written to `dist/datamorph-frontend`.
