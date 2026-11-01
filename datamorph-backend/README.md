# DataMorph Backend API & Mapping Engine

[🇧🇷 Versão em Português](#-português) | [🇺🇸 English Version](#-english)

---

## 🇧🇷 Português

O **DataMorph Backend** é o núcleo de processamento e inteligência da plataforma DataMorph. Desenvolvido com **PHP 8.3** e **Laravel 11**, foi concebido para processar fluxos de dados em lote de forma determinística, segura e com isolamento multi-inquilino.

### ⚙️ Características Técnicas

- **Engine de Mapeamento Determinístico:** Processamento modular de dados através de pipelines compostos de transformadores e validadores.
- **Isolamento de Dados Multi-inquilino:** Trait `BelongsToUser` com escopos globais do Eloquent que garantem que nenhum dado seja exposto entre diferentes contas.
- **Autenticação Auth0:** Middleware de verificação de tokens JWT via OAuth 2.0 / OIDC.
- **Arquitetura de Quarentena:** Detecção preventiva de exceções por registro, permitindo resolução pontual de inconsistências sem perda do lote.
- **Exportação Multiformato:** Suporte a streaming de exportação de dados consolidados em CSV e XLSX.

---

### 🧩 Transformadores Disponíveis

O `MappingEngine` possui registro centralizado dos seguintes componentes:

| Nome do Transformador | Classe | Descrição |
|-----------------------|--------|-----------|
| `trim` | `TrimTransformer` | Remove espaços extras, quebras de linha e caracteres não imprimíveis. |
| `document` | `SanitizeDocumentTransformer` | Valida dígitos verificadores oficiais de CPF e CNPJ brasileiros. |
| `date` | `DateFormatTransformer` | Normaliza datas brasileiras (`d/m/Y`) ou internacionais para o formato ISO (`Y-m-d`). |
| `currency` | `CurrencyTransformer` | Converte strings com moedas (ex.: `R$ 1.500,50`) para números decimais padronizados. |
| `titlecase` | `TitleCaseTransformer` | Converte texto para formato título (primeira letra de cada palavra maiúscula). |
| `unaccent` | `UnaccentTransformer` | Remove acentuações e diacríticos (ex.: `São Paulo` para `Sao Paulo`). |
| `alphanumeric` | `RemoveSpecialCharsTransformer` | Remove pontuações e símbolos, mantendo apenas caracteres alfanuméricos. |
| `cep` | `CepTransformer` | Formata códigos postais brasileiros de 8 dígitos para o padrão `00000-000`. |
| `phone` | `PhoneTransformer` | Formata números de telefone e celular brasileiros para `(00) 00000-0000`. |
| `replace` | `ReplaceTextTransformer` | Substitui termos ou palavras incorretas com suporte a busca pontual ou dicionários. |
| `lookup` | `LookupMappingTransformer` | Tradução de códigos externos para nomes padronizados usando tabelas de/para. |
| `uppercase` | `UppercaseTransformer` | Transforma todos os caracteres em maiúsculas (`MB_CASE_UPPER`). |
| `lowercase` | `LowercaseTransformer` | Transforma todos os caracteres em minúsculas (`MB_CASE_LOWER`). |
| `digits` | `OnlyDigitsTransformer` | Extrai exclusivamente os caracteres numéricos. |
| `required` | `RequiredTransformer` | Valida a obrigatoriedade do campo, rejeitando valores nulos ou vazios. |
| `regex` | `RegexTransformer` | Validação baseada em expressões regulares customizadas. |
| `length` | `LengthTransformer` | Valida limites de tamanho mínimo, máximo ou exato. |
| `range` | `RangeTransformer` | Valida faixas de valores numéricos mínimo e máximo. |

---

### 📡 Referência dos Endpoints da API

Todos os endpoints corporativos são autenticados via Bearer Token JWT e agrupados sob o prefixo `/api`:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/health` | Health check operacional do serviço. |
| `POST` | `/api/files/inspect` | Inspeciona arquivo e retorna colunas identificadas e amostra dos dados. |
| `POST` | `/api/batches/process` | Executa o processamento do lote com a receita de mapeamento informada. |
| `GET` | `/api/batches` | Lista o histórico consolidado de lotes processados do inquilino. |
| `GET` | `/api/batches/{id}/preview` | Retorna amostra paginada dos registros aprovados do lote. |
| `GET` | `/api/batches/{id}/export/{format}` | Efetua o download dos dados aprovados em formato `csv` ou `xlsx`. |
| `GET` | `/api/quarantine` | Lista os registros retidos na quarentena com opção de filtros por status. |
| `PUT` | `/api/quarantine/{id}` | Atualiza pontualmente os campos com erro e revalida a linha pelo motor. |
| `GET` | `/api/dashboard/stats` | Retorna indicadores agregados (KPIs, taxa de sucesso, horas poupadas). |

---

### 🧪 Executando Testes

Para rodar os testes automatizados da aplicação:
```bash
php artisan test
```

---

## 🇺🇸 English

The **DataMorph Backend** serves as the central data processing and intelligence service of the platform. Engineered with **PHP 8.3** and **Laravel 11**, it provides deterministic, high-throughput, and secure data mapping pipelines.

### ⚙️ Technical Highlights

- **Deterministic Mapping Engine:** Highly extensible pipeline architecture composed of granular transformers and validation rules.
- **Strict Multi-Tenant Scoping:** Built-in `BelongsToUser` Eloquent trait enforcing tenant data segregation at the query level.
- **Auth0 JWT Authentication:** Validates enterprise Bearer tokens via OAuth 2.0 / OIDC.
- **Preventive Exception Isolation:** Quarantines individual invalid rows without failing entire processing jobs.
- **Streaming Multi-format Exports:** Fast, memory-efficient exports in CSV and XLSX formats.

---

### 🧩 Available Transformers

| Transformer Name | Class | Description |
|------------------|-------|-------------|
| `trim` | `TrimTransformer` | Cleans leading/trailing whitespace, newlines, and non-breaking spaces. |
| `document` | `SanitizeDocumentTransformer` | Validates Brazilian CPF and CNPJ checksum algorithms. |
| `date` | `DateFormatTransformer` | Parses localized dates and converts them into standardized ISO format (`Y-m-d`). |
| `currency` | `CurrencyTransformer` | Converts localized currency expressions (e.g. `R$ 1.500,50`) to decimal numbers. |
| `titlecase` | `TitleCaseTransformer` | Converts strings to Title Case capitalization. |
| `unaccent` | `UnaccentTransformer` | Removes accents and diacritical marks (e.g. `São Paulo` to `Sao Paulo`). |
| `alphanumeric` | `RemoveSpecialCharsTransformer` | Strips punctuation and symbols while retaining letters and numbers. |
| `cep` | `CepTransformer` | Formats 8-digit postal codes to standard `00000-000`. |
| `phone` | `PhoneTransformer` | Formats telephone and mobile numbers to `(00) 00000-0000`. |
| `replace` | `ReplaceTextTransformer` | Replaces custom words, abbreviations, or typos via direct match or lookup tables. |
| `lookup` | `LookupMappingTransformer` | Maps external system codes to standard values using custom dictionaries. |
| `uppercase` | `UppercaseTransformer` | Converts entire strings to uppercase. |
| `lowercase` | `LowercaseTransformer` | Converts entire strings to lowercase. |
| `digits` | `OnlyDigitsTransformer` | Extracts only numeric digits. |
| `required` | `RequiredTransformer` | Enforces mandatory field presence. |
| `regex` | `RegexTransformer` | Validates inputs against custom regular expressions. |
| `length` | `LengthTransformer` | Checks minimum, maximum, or exact character counts. |
| `range` | `RangeTransformer` | Verifies numeric values against allowed bounds. |

---

### 📡 API Endpoint Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service operational health check. |
| `POST` | `/api/files/inspect` | Analyzes uploaded file, extracts detected columns and sample rows. |
| `POST` | `/api/batches/process` | Ingests file, runs mapping recipe, and segregates valid and quarantined rows. |
| `GET` | `/api/batches` | Retrieves audit history of all batches processed by the tenant. |
| `GET` | `/api/batches/{id}/preview` | Previews approved rows from a specific batch. |
| `GET` | `/api/batches/{id}/export/{format}` | Downloads clean dataset as `csv` or `xlsx`. |
| `GET` | `/api/quarantine` | Lists quarantined records with status filtering. |
| `PUT` | `/api/quarantine/{id}` | Edits and re-evaluates an individual quarantined row. |
| `GET` | `/api/dashboard/stats` | Aggregated dashboard KPIs (processed rows, quarantine count, hours saved). |

---

### 🧪 Running Tests

Execute the PHPUnit automated test suite:
```bash
php artisan test
```
