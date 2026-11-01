import { Injectable, signal, computed } from '@angular/core';

export type SupportedLang = 'pt-BR' | 'en-US';

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

export const TRANSLATIONS: Record<SupportedLang, TranslationDictionary> = {
  'pt-BR': {
    brand: {
      name: 'DataMorph',
      tag: 'B2B INGESTION GATEWAY'
    },
    nav: {
      overview: 'Visão Geral',
      studio: 'Mapping Studio',
      quarantine: 'Mesa de Quarentena',
      batches: 'Histórico de Lotes',
      sessionSecure: 'Sessão Segura',
      logout: 'Sair',
      login: 'Entrar / Login',
      authenticating: 'Autenticando...',
      menu: 'Menu',
      closeMenu: 'Fechar menu'
    },
    common: {
      actions: 'Ações',
      status: 'Status',
      loading: 'Carregando...',
      cancel: 'Cancelar',
      save: 'Salvar',
      close: 'Fechar',
      delete: 'Remover',
      refresh: 'Atualizar',
      preview: 'Visualizar',
      export: 'Exportar',
      downloadCsv: 'Baixar CSV',
      downloadXlsx: 'Baixar Excel (.XLSX)',
      total: 'Total',
      rows: 'linhas',
      records: 'registros',
      all: 'Todas',
      pending: 'Pendentes',
      resolved: 'Resolvidas',
      success: 'Sucesso',
      error: 'Erro',
      warning: 'Atenção',
      info: 'Informação',
      or: 'ou',
      step: 'Etapa',
      language: 'Idioma'
    },
    home: {
      badge: 'GATEWAY CORPORATIVO DETERMINÍSTICO',
      heroTitle: 'Ingestão e Normalização Inteligente de Dados B2B',
      heroSubtitle: 'Conecte bases heterogêneas de bancos, parceiros e fornecedores. Mapeie colunas em segundos, valide regras com 100% de consistência e resolva exceções sem depender de arquivos manuais.',
      btnStartStudio: 'Acessar Mapping Studio',
      btnQuarantine: 'Ver Quarentena',
      engineTitle: 'Motor de Validação',
      engineService: 'Serviço:',
      engineVersion: 'Versão:',
      engineEnv: 'Ambiente:',
      engineEnvVal: 'Produção Local',
      engineStatus: 'Status:',
      connecting: 'Conectando ao servidor...',
      howItWorksTitle: 'Como o DataMorph Funciona',
      howItWorksSub: 'Um fluxo de 3 passos simples projetado para garantir autonomia, velocidade e zero perda de dados.',
      step1Title: '1. Ingestão Flexível',
      step1Desc: 'Faça upload de planilhas CSV, Excel (XLSX) ou arquivos de texto de qualquer origem sem precisar padronizar antes.',
      step2Title: '2. Mapeamento & Regras',
      step2Desc: 'Associe as colunas da sua planilha aos campos de destino e ative regras de validação (CPF/CNPJ, moeda, datas e de-para).',
      step3Title: '3. Quarentena & Despacho',
      step3Desc: 'Linhas válidas são consolidadas e despachadas de imediato. Divergências ficam isoladas na Quarentena para correção rápida.',
      kpiProcessed: 'Registros Processados',
      kpiProcessedSub: 'lotes consolidados com sucesso',
      kpiSuccessRate: 'Taxa de Conversão Direta',
      kpiSuccessRateSub: 'registros aprovados de primeira',
      kpiQuarantine: 'Linhas em Quarentena',
      kpiQuarantineSub: 'registros corrigidos e liberados',
      kpiHoursSaved: 'Horas Operacionais Poupadas',
      kpiHoursSavedSub: 'Economia estimada em digitação manual'
    },
    studio: {
      title: 'Mapping Studio',
      subtitle: 'Importe sua base de dados, configure as transformações e gere arquivos normalizados prontos para integração.',
      btnChangeFile: 'Trocar Arquivo',
      btnProcess: 'Processar Lote Completo',
      processing: 'Processando lote...',
      inspecting: 'Analisando estrutura e detectando delimitadores...',
      uploadTitle: 'Carregar Planilha ou Base de Dados',
      uploadSubtitle: 'Arraste seu arquivo aqui ou clique para selecionar. Formatos aceitos: .CSV, .XLSX (Excel) ou .TXT.',
      btnBrowseFile: 'Selecionar Arquivo',
      dropzoneHint: 'Detecção automática de delimitadores (vírgula, ponto-e-vírgula e tabulações) e cabeçalhos.',
      featureGuidanceTitle: 'Diretrizes para Preparação do Arquivo',
      guidance1Title: 'Cabeçalhos na 1ª Linha',
      guidance1Desc: 'A primeira linha da planilha deve conter os nomes das colunas para identificação automática.',
      guidance2Title: 'Formatos Flexíveis',
      guidance2Desc: 'Suporte a datas em DD/MM/AAAA ou ISO e valores com ou sem símbolo monetário (R$).',
      guidance3Title: 'Sem Modelos Rígidos',
      guidance3Desc: 'Importe layouts de qualquer banco, ERP ou parceiro comercial sem precisar reformatar.',
      fileLoaded: 'ARQUIVO EM EDIÇÃO:',
      columnsDetected: 'Colunas Identificadas',
      outcomeSuccess: 'Lote Processado com Sucesso!',
      outcomeBatchId: 'ID do Lote:',
      outcomeTotal: 'Total de Linhas:',
      outcomeApproved: 'Aprovadas:',
      outcomeQuarantine: 'Em Quarentena:',
      outcomeRate: 'Aproveitamento:',
      btnViewTable: 'Visualizar Tabela',
      btnGoToQuarantine: 'Resolver Quarentena',
      sourcePanelTitle: 'Colunas Detectadas na Entrada',
      sourcePanelSubtitle: 'Campos identificados no arquivo enviado:',
      sampleDataTitle: 'Amostra dos Dados de Entrada (Primeiras Linhas)',
      targetPanelTitle: 'Esquema de Destino & Regras de Validação',
      btnNewRule: '+ Nova Regra',
      btnMapExact: 'Mapear 1:1',
      btnNewField: '+ Novo Campo',
      columnLabel: 'Coluna de Saída:',
      columnKey: 'Chave do Campo:',
      columnNamePlaceholder: 'Ex: Nome do Cliente',
      columnKeyPlaceholder: 'Ex: nome_cliente',
      fieldSourceLabel: 'Coluna de Origem:',
      unmappedOption: '-- Não Mapear (Ignorar) --',
      activeRulesLabel: 'Regras de validação e transformação:',
      customRuleModalTitle: 'Criar Regra de Validação Personalizada',
      ruleNameLabel: 'Nome da Regra:',
      ruleNamePlaceholder: 'Ex: Formato Matrícula, Código de Filial, Correção de Texto...',
      ruleTypeLabel: 'Tipo de Validação / Transformação:',
      ruleTypeRegex: 'Expressão Regular (Regex)',
      ruleTypeReplace: 'Substituição de Texto / Correção de Palavras',
      ruleTypeLength: 'Comprimento de Caracteres',
      ruleTypeRange: 'Faixa Numérica (Mín / Máx)',
      rulePatternLabel: 'Padrão Regex:',
      rulePatternHint: 'Regex sem barras delimitadoras iniciais ou finais.',
      ruleSearchLabel: 'Localizar Palavra / Termo:',
      ruleSearchPlaceholder: 'Ex: LTDA, SPP, RUA...',
      ruleReplaceLabel: 'Substituir Por:',
      ruleReplacePlaceholder: 'Ex: LIMITADA, SÃO PAULO, R....',
      ruleCaseSensitiveLabel: 'Diferenciar maiúsculas e minúsculas',
      ruleLengthExact: 'Tamanho Exato:',
      ruleLengthMin: 'Tamanho Mínimo:',
      ruleRangeMin: 'Valor Mínimo:',
      ruleRangeMax: 'Valor Máximo:',
      ruleMessageLabel: 'Mensagem explicativa se inválido:',
      ruleMessagePlaceholder: 'Ex: Valor fora do padrão exigido pela empresa.',
      btnSaveRule: 'Salvar e Aplicar Regra',
      previewModalTitle: 'Base Normalizada & Pronta para Integração',
      emptyPreview: 'Nenhum registro aprovado para exibição neste lote.',
      ruleLabels: {
        trim: 'Limpar Espaços',
        document: 'Validar CPF/CNPJ',
        currency: 'Moeda (R$)',
        date: 'Data (AAAA-MM-DD)',
        uppercase: 'MAIÚSCULO',
        lowercase: 'minúsculo',
        titlecase: 'Primeira Maiúscula',
        unaccent: 'Sem Acentos',
        alphanumeric: 'Sem Especiais',
        cep: 'Formatar CEP',
        phone: 'Formatar Telefone',
        digits: 'Apenas Dígitos',
        required: 'Obrigatório',
        lookup: 'De-Para (Lookup)'
      },
      ruleTooltips: {
        trim: 'Remove espaços extras no início e fim de cada texto',
        document: 'Valida dígitos verificadores oficiais de CPF e CNPJ',
        currency: 'Converte R$ 1.250,50 para número decimal 1250.50',
        date: 'Padroniza datas brasileiras para o formato ISO AAAA-MM-DD',
        uppercase: 'Transforma todos os caracteres em maiúsculas',
        lowercase: 'Transforma todos os caracteres em minúsculas',
        titlecase: 'Converte texto para Formato Título com primeiras letras maiúsculas',
        unaccent: 'Remove acentos e diacríticos (ex: São Paulo -> Sao Paulo)',
        alphanumeric: 'Remove pontuações e símbolos mantendo apenas letras e números',
        cep: 'Formata código postal brasileiro para 00000-000',
        phone: 'Formata telefone brasileiro para (00) 00000-0000',
        digits: 'Remove pontuações e mantém apenas os dígitos',
        required: 'Rejeita linhas onde este campo estiver em branco',
        lookup: 'Mapeia códigos numéricos para nomenclaturas padronizadas'
      }
    },
    quarantine: {
      title: 'Mesa de Quarentena',
      subtitle: 'Registros com divergências ou inconsistências cadastrais isolados com segurança. Corrija pontualmente para aprovar.',
      guideTitle: 'Isolamento Preventivo de Exceções',
      guideNotice: 'O DataMorph retém com segurança apenas as linhas com dados divergentes, garantindo que o lote principal continue seu fluxo. Edite os valores na gaveta lateral e revalide em tempo real sem reprocessar o arquivo.',
      filterAll: 'Todas',
      filterPending: 'Pendentes',
      filterResolved: 'Resolvidas',
      totalShown: 'Total exibido:',
      awaitingResolution: 'aguardando resolução',
      emptyTitle: 'Nenhum registro em quarentena neste filtro',
      emptySubtitle: 'Todas as linhas do arquivo foram validadas com sucesso ou já foram regularizadas.',
      thRow: 'Linha',
      thFile: 'Arquivo de Origem',
      thRawData: 'Dados Brutos Recebidos',
      thReason: 'Motivo da Retenção',
      thStatus: 'Status',
      thActions: 'Ações',
      btnFix: 'Corrigir',
      resolvedBadge: 'Corrigido & Aprovado',
      approvedTag: 'Aprovado',
      drawerTitle: 'Corrigir Linha',
      drawerSubtitle: 'Edite os campos inconsistentes para revalidar no motor determinístico.',
      inconsistenciesTitle: 'Inconsistências Detectadas:',
      fieldLabelTag: 'Campo:',
      formTitle: 'Valores das Colunas (Edição Direta):',
      btnCancel: 'Cancelar',
      btnRevalidate: 'Revalidar & Aprovar Linha',
      revalidating: 'Revalidando...',
      successRevalidated: 'Linha validada com sucesso e reincorporada ao lote aprovado!'
    },
    batches: {
      title: 'Histórico de Lotes & Despacho',
      subtitle: 'Acompanhe as remessas processadas, consulte métricas de qualidade e faça o download dos arquivos padronizados.',
      emptyTitle: 'Nenhum lote processado ainda',
      emptySubtitle: 'Envie sua primeira base de dados pelo Mapping Studio para gerar relatórios e exportar saídas normalizadas.',
      btnGoToStudio: 'Ir para o Mapping Studio',
      thFilename: 'Arquivo',
      thPipeline: 'Pipeline',
      thTotal: 'Total de Linhas',
      thApproved: 'Aprovadas',
      thQuarantine: 'Quarentena',
      thDate: 'Data de Processamento',
      btnPreview: 'Visualizar Base',
      btnDownloadCsv: 'Baixar CSV',
      btnDownloadXlsx: 'Baixar Excel',
      btnViewQuarantine: 'Ver Quarentena'
    },
    toasts: {
      fileReadyTitle: 'Arquivo Identificado',
      fileReadyMsg: 'colunas detectadas com sucesso.',
      serverErrorTitle: 'Erro no Servidor',
      serverErrorMsg: 'Falha ao processar requisição. Verifique se o servidor backend está ativo.',
      batchSuccessTitle: 'Lote Concluído',
      batchSuccessMsg: 'Lote processado com sucesso!',
      downloadFailed: 'Erro ao efetuar download autenticado.',
      ruleCreatedTitle: 'Regra Adicionada',
      ruleCreatedMsg: 'Regra criada com sucesso e disponível para os campos.',
      ruleRequiredName: 'Informe um nome para a regra.',
      ruleRequiredPattern: 'Informe o padrão regex.',
      ruleRequiredSearch: 'Informe o termo ou palavra a ser localizada.'
    }
  },
  'en-US': {
    brand: {
      name: 'DataMorph',
      tag: 'B2B INGESTION GATEWAY'
    },
    nav: {
      overview: 'Overview',
      studio: 'Mapping Studio',
      quarantine: 'Quarantine Desk',
      batches: 'Batch History',
      sessionSecure: 'Secure Session',
      logout: 'Log out',
      login: 'Sign In / Login',
      authenticating: 'Authenticating...',
      menu: 'Menu',
      closeMenu: 'Close menu'
    },
    common: {
      actions: 'Actions',
      status: 'Status',
      loading: 'Loading...',
      cancel: 'Cancel',
      save: 'Save',
      close: 'Close',
      delete: 'Delete',
      refresh: 'Refresh',
      preview: 'Preview',
      export: 'Export',
      downloadCsv: 'Download CSV',
      downloadXlsx: 'Download Excel (.XLSX)',
      total: 'Total',
      rows: 'rows',
      records: 'records',
      all: 'All',
      pending: 'Pending',
      resolved: 'Resolved',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
      or: 'or',
      step: 'Step',
      language: 'Language'
    },
    home: {
      badge: 'DETERMINISTIC ENTERPRISE GATEWAY',
      heroTitle: 'Intelligent Ingestion & Normalization for B2B Data',
      heroSubtitle: 'Connect heterogeneous partner, bank, and vendor files. Map columns in seconds, validate rules with 100% deterministic accuracy, and resolve exceptions without relying on manual sample sheets.',
      btnStartStudio: 'Open Mapping Studio',
      btnQuarantine: 'View Quarantine Desk',
      engineTitle: 'Validation Engine',
      engineService: 'Service:',
      engineVersion: 'Version:',
      engineEnv: 'Environment:',
      engineEnvVal: 'Local Production',
      engineStatus: 'Status:',
      connecting: 'Connecting to server...',
      howItWorksTitle: 'How DataMorph Works',
      howItWorksSub: 'A straightforward 3-step workflow designed for complete autonomy, speed, and zero data loss.',
      step1Title: '1. Flexible Ingestion',
      step1Desc: 'Upload raw CSV, Excel (XLSX), or text files from any external partner without needing pre-formatted templates.',
      step2Title: '2. Mapping & Rules',
      step2Desc: 'Align your file columns to the target schema and enable transformation rules (tax IDs, currency, dates, lookups).',
      step3Title: '3. Quarantine & Dispatch',
      step3Desc: 'Clean rows are dispatched immediately. Discrepancies are isolated in Quarantine for prompt interactive resolution.',
      kpiProcessed: 'Processed Records',
      kpiProcessedSub: 'batches finalized successfully',
      kpiSuccessRate: 'Direct Conversion Rate',
      kpiSuccessRateSub: 'records approved on first run',
      kpiQuarantine: 'Quarantined Rows',
      kpiQuarantineSub: 'records resolved and cleared',
      kpiHoursSaved: 'Human Hours Saved',
      kpiHoursSavedSub: 'Estimated savings over manual keying'
    },
    studio: {
      title: 'Mapping Studio',
      subtitle: 'Import raw files, configure column transformations, and generate standardized outputs ready for integration.',
      btnChangeFile: 'Change File',
      btnProcess: 'Process Full Batch',
      processing: 'Processing batch...',
      inspecting: 'Inspecting file structure and detecting delimiters...',
      uploadTitle: 'Upload Spreadsheet or Data File',
      uploadSubtitle: 'Drag and drop your file here or click to browse. Supported formats: .CSV, .XLSX (Excel), or .TXT.',
      btnBrowseFile: 'Select File from Computer',
      dropzoneHint: 'Automatic detection of delimiters (comma, semicolon, tab) and headers.',
      featureGuidanceTitle: 'File Preparation Guidelines',
      guidance1Title: 'Headers in First Row',
      guidance1Desc: 'The first row should contain clear column names for instant automatic detection.',
      guidance2Title: 'Flexible Formats',
      guidance2Desc: 'Accepts localized dates (DD/MM/YYYY or ISO) and currency amounts with or without symbols.',
      guidance3Title: 'No Fixed Templates',
      guidance3Desc: 'Import from any external bank or ERP without rigid pre-formatting requirements.',
      fileLoaded: 'ACTIVE FILE:',
      columnsDetected: 'Columns Detected',
      outcomeSuccess: 'Batch Processed Successfully!',
      outcomeBatchId: 'Batch ID:',
      outcomeTotal: 'Total Rows:',
      outcomeApproved: 'Approved:',
      outcomeQuarantine: 'In Quarantine:',
      outcomeRate: 'Pass Rate:',
      btnViewTable: 'Preview Table',
      btnGoToQuarantine: 'Resolve Quarantine',
      sourcePanelTitle: 'Input File Columns',
      sourcePanelSubtitle: 'Headers identified in the uploaded file:',
      sampleDataTitle: 'Raw Sample Data (First Rows)',
      targetPanelTitle: 'Target Schema & Validation Rules',
      btnNewRule: '+ Custom Rule',
      btnMapExact: 'Map 1:1',
      btnNewField: '+ New Field',
      columnLabel: 'Output Column:',
      columnKey: 'Target Field Key:',
      columnNamePlaceholder: 'e.g. Customer Name',
      columnKeyPlaceholder: 'e.g. customer_name',
      fieldSourceLabel: 'Source Column:',
      unmappedOption: '-- Do Not Map (Ignore) --',
      activeRulesLabel: 'Active validation & transformation rules:',
      customRuleModalTitle: 'New Custom Validation Rule',
      ruleNameLabel: 'Rule Name:',
      ruleNamePlaceholder: 'e.g. Employee ID, Branch Code, Word Correction...',
      ruleTypeLabel: 'Validation / Transformation Type:',
      ruleTypeRegex: 'Regular Expression (Regex)',
      ruleTypeReplace: 'Text Replacement / Word Correction',
      ruleTypeLength: 'Character Length',
      ruleTypeRange: 'Numeric Range (Min / Max)',
      rulePatternLabel: 'Regex Pattern:',
      rulePatternHint: 'Enter regex without leading or trailing slashes.',
      ruleSearchLabel: 'Find Word / Term:',
      ruleSearchPlaceholder: 'e.g. LLC, NYC, ST...',
      ruleReplaceLabel: 'Replace With:',
      ruleReplacePlaceholder: 'e.g. Limited Liability Co, New York City, Street...',
      ruleCaseSensitiveLabel: 'Case-sensitive match',
      ruleLengthExact: 'Exact Length:',
      ruleLengthMin: 'Minimum Length:',
      ruleRangeMin: 'Minimum Value:',
      ruleRangeMax: 'Maximum Value:',
      ruleMessageLabel: 'Error message when invalid:',
      ruleMessagePlaceholder: 'e.g. Value does not match required format.',
      btnSaveRule: 'Save & Apply Rule',
      previewModalTitle: 'Normalized & Standardized Dataset',
      emptyPreview: 'No approved records to display for this batch.',
      ruleLabels: {
        trim: 'Trim Whitespace',
        document: 'Validate Tax ID (CPF/CNPJ)',
        currency: 'Currency (R$)',
        date: 'Date (YYYY-MM-DD)',
        uppercase: 'UPPERCASE',
        lowercase: 'lowercase',
        titlecase: 'Title Case',
        unaccent: 'Remove Accents',
        alphanumeric: 'Alphanumeric Only',
        cep: 'Format Postal Code',
        phone: 'Format Phone Number',
        digits: 'Digits Only',
        required: 'Required',
        lookup: 'De-Para (Lookup)'
      },
      ruleTooltips: {
        trim: 'Strips leading and trailing whitespace from cell values',
        document: 'Validates official Brazilian CPF and CNPJ checksum digits',
        currency: 'Converts currency strings like R$ 1,250.50 to decimal 1250.50',
        date: 'Parses localized dates and converts them to ISO YYYY-MM-DD',
        uppercase: 'Converts entire string to uppercase',
        lowercase: 'Converts entire string to lowercase',
        titlecase: 'Capitalizes the first letter of each word',
        unaccent: 'Removes accents and diacritics (e.g. São Paulo -> Sao Paulo)',
        alphanumeric: 'Strips special characters and punctuation, leaving letters and numbers',
        cep: 'Formats 8-digit postal codes as 00000-000',
        phone: 'Formats 10/11-digit phone numbers as (00) 00000-0000',
        digits: 'Extracts numeric digits only, stripping formatting',
        required: 'Rejects rows where this field is empty',
        lookup: 'Maps external code values to standardized dictionary terms'
      }
    },
    quarantine: {
      title: 'Quarantine Desk',
      subtitle: 'Inconsistent data rows securely isolated in the database. Edit inline to revalidate and approve.',
      guideTitle: 'Preventive Exception Isolation',
      guideNotice: 'DataMorph safely isolates only records with discrepancies, keeping the main batch moving forward. Correct values in the slide-over drawer and revalidate in real time.',
      filterAll: 'All',
      filterPending: 'Pending',
      filterResolved: 'Resolved',
      totalShown: 'Total displayed:',
      awaitingResolution: 'awaiting resolution',
      emptyTitle: 'No quarantined records in this filter',
      emptySubtitle: 'All processed rows passed validation or have already been corrected and approved.',
      thRow: 'Row',
      thFile: 'Source File',
      thRawData: 'Raw Ingested Data',
      thReason: 'Reason for Quarantine',
      thStatus: 'Status',
      thActions: 'Actions',
      btnFix: 'Correct',
      resolvedBadge: 'Corrected & Approved',
      approvedTag: 'Approved',
      drawerTitle: 'Correct Row',
      drawerSubtitle: 'Update the conflicting fields to revalidate with the deterministic engine.',
      inconsistenciesTitle: 'Detected Discrepancies:',
      fieldLabelTag: 'Field:',
      formTitle: 'Column Values (Direct Editing):',
      btnCancel: 'Cancel',
      btnRevalidate: 'Revalidate & Approve Row',
      revalidating: 'Revalidating...',
      successRevalidated: 'Row successfully validated and reincorporated into the approved batch!'
    },
    batches: {
      title: 'Batch History & Dispatch',
      subtitle: 'Audit processed data batches, check quality metrics, and download clean standardized exports.',
      emptyTitle: 'No batches processed yet',
      emptySubtitle: 'Upload your first data file in Mapping Studio to view batch audit logs and export clean files.',
      btnGoToStudio: 'Go to Mapping Studio',
      thFilename: 'Filename',
      thPipeline: 'Pipeline',
      thTotal: 'Total Rows',
      thApproved: 'Approved',
      thQuarantine: 'Quarantine',
      thDate: 'Processed Date',
      btnPreview: 'Preview Data',
      btnDownloadCsv: 'Download CSV',
      btnDownloadXlsx: 'Download Excel',
      btnViewQuarantine: 'View Quarantine'
    },
    toasts: {
      fileReadyTitle: 'File Ready',
      fileReadyMsg: 'columns identified successfully.',
      serverErrorTitle: 'Server Error',
      serverErrorMsg: 'Failed to complete request. Please verify backend service is running.',
      batchSuccessTitle: 'Batch Completed',
      batchSuccessMsg: 'Batch processed successfully!',
      downloadFailed: 'Failed to download authenticated export.',
      ruleCreatedTitle: 'Rule Added',
      ruleCreatedMsg: 'Custom rule created and available across all fields.',
      ruleRequiredName: 'Please provide a name for the rule.',
      ruleRequiredPattern: 'Please provide a regex pattern.',
      ruleRequiredSearch: 'Please enter the search term.'
    }
  }
};

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly storageKey = 'datamorph_lang';

  public currentLang = signal<SupportedLang>(this.getInitialLang());

  public isPt = computed(() => this.currentLang() === 'pt-BR');
  public isEn = computed(() => this.currentLang() === 'en-US');

  private getInitialLang(): SupportedLang {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored === 'pt-BR' || stored === 'en-US') {
        return stored;
      }
      const navLang = navigator.language;
      if (navLang && navLang.toLowerCase().startsWith('pt')) {
        return 'pt-BR';
      }
    } catch {
      // Fallback
    }
    return 'pt-BR';
  }

  public setLang(lang: SupportedLang): void {
    this.currentLang.set(lang);
    try {
      localStorage.setItem(this.storageKey, lang);
    } catch {
      // Ignore
    }
  }

  public toggleLang(): void {
    this.setLang(this.currentLang() === 'pt-BR' ? 'en-US' : 'pt-BR');
  }

  public t(path: string, params?: Record<string, any>): string {
    const lang = this.currentLang();
    const dictionary = TRANSLATIONS[lang] || TRANSLATIONS['pt-BR'];

    const keys = path.split('.');
    let current: any = dictionary;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to pt-BR if missing in en-US
        let fallback: any = TRANSLATIONS['pt-BR'];
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            fallback = null;
            break;
          }
        }
        current = fallback || path;
        break;
      }
    }

    if (typeof current !== 'string') {
      return path;
    }

    if (params) {
      return Object.keys(params).reduce((str, paramKey) => {
        return str.replace(new RegExp(`{${paramKey}}`, 'g'), String(params[paramKey]));
      }, current);
    }

    return current;
  }
}
