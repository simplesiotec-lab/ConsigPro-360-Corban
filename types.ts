export interface ExtractedData {
  baseIR: number; // From Contracheque (VALOR BASE PENSÃO I.R or BASE CÁLCULO DO I.R)
  items: ExtratoItem[]; // Extracted from Extrato de Consignações
  contrachequeData?: {
    servidor: string;
    matricula: string;
    orgao: string;
    competencia: string;
  };
}

export interface ExtratoItem {
  description: string; // The "Rubrica" or description
  value: number; // The "Valor da Parcela"
  bank?: string; // Extracted bank name
  contract?: string; // Contract number
  installmentIndex?: string; // e.g., "05/60"
  startDate?: string;
  endDate?: string;
}

export interface MarginCalculation {
  maxMargin: number; // The 35% or 5% limit
  usedMargin: number; // Sum of relevant items
  availableMargin: number; // max - used
  isNegative: boolean;
}

export enum AnalysisView {
  DASHBOARD = 'DASHBOARD',
  CONTRACHEQUE = 'CONTRACHEQUE',
  EXTRATO = 'EXTRATO',
  HISTORY = 'HISTORY'
}

export interface CategoryCalculation {
  used: number;
  items: ExtratoItem[];
  limit: number;
  available: number;
  isNegative: boolean;
}

export interface CalculationResult {
  baseIR: number;
  loan: CategoryCalculation;
  creditCard: CategoryCalculation;
  benefitCard: CategoryCalculation;
  rawItems: ExtratoItem[];
}
