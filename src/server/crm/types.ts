// Contracts for the future integration with the existing CRM (crm.assessoria30.com,
// repo ASSESSORIA30/renovaciosC). The public site REUSES the CRM's services; it never
// keeps its own tariff catalogue. Nothing here is wired yet.

export type BillReading = {
  supply: "electricity" | "gas";
  retailer?: string;
  tariff?: string;
  periodDays?: number;
  consumptionKwh?: number;
  contractedPowerKw?: number[];
  periodsShare?: Record<string, number>;
  concepts: { key: string; label: string; amount?: number }[];
};

export type SavingsEstimate = {
  currency: "EUR";
  annualMin: number;
  annualMax: number;
  basis: "bill" | "profile";
  catalogVersion: string; // CRM tariff catalogue version used
  opportunities: string[];
};

/** Server-side ports. Implementations call the CRM; the browser only sees the public result. */
export interface BillReaderPort {
  read(file: { name: string; type: string; bytes: ArrayBuffer }): Promise<BillReading>;
}
export interface ComparatorPort {
  estimate(input: { reading?: BillReading; profile?: { segment: "home" | "business"; supply: string; monthlySpend: number; postcode?: string } }): Promise<SavingsEstimate>;
}
export interface SipsPort {
  /** Only with explicit, recorded customer authorisation. */
  lookup(cups: string, authorisationId: string): Promise<{ consumptionKwh12m: number; powerKw: number[] }>;
}
export interface LeadsPort {
  create(lead: unknown): Promise<{ id: string; assignedCollaborator?: string }>;
}
export interface WhatsAppPort {
  notify(leadId: string): Promise<void>;
}
