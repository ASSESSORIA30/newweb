// SYNTHETIC demonstration data. Not a real customer, not a real tariff, not an offer.
// Phase 2 replaces this with the CRM bill reader + comparison engine + tariff catalogue.

export const DEMO_LABEL = "Simulació de demostració · sense connexió al CRM";

export const sampleBill = {
  kind: "Electricitat",
  retailer: "Comercialitzadora actual",
  period: "30 dies",
  consumption: 312, // kWh
  power: 4.6, // kW
  periods: [
    { label: "P1 punta", share: 0.34 },
    { label: "P2 pla", share: 0.29 },
    { label: "P3 vall", share: 0.37 },
  ],
};

export const analysisStages = [
  "Llegint la factura",
  "Identificant tarifa i potència",
  "Analitzant el consum per franges",
  "Comparant amb més de 30 comercialitzadores",
  "Preparant l’estimació",
] as const;

// Illustrative range only. Shown with DEMO_LABEL wherever it appears.
export const demoEstimate = { min: 110, max: 180, unit: "€ l’any" };
