// Company facts from the current assessoria30.com. Contact data is operational, not a claim.
export const company = {
  name: "Assessoria 3.0",
  email: "info@assessoria30.com",
  whatsapp: { label: "686 91 49 44", href: "https://wa.me/34686914944" },
  offices: [
    { id: "lleida", name: { ca: "Oficines centrals", es: "Oficinas centrales" }, city: "Lleida", street: "Av. Garrigues, 21", zip: "25001", locality: "Lleida", region: "Lleida", phone: "973 982 852", tel: "+34973982852" },
    { id: "badalona", name: { ca: "Delegació Barcelona", es: "Delegación Barcelona" }, city: "Badalona", street: "C/ Sant Bru, 10", zip: "08911", locality: "Badalona", region: "Barcelona", phone: "931 193 582", tel: "+34931193582" },
    { id: "lescala", name: { ca: "Delegació Girona", es: "Delegación Girona" }, city: "L’Escala", street: "C/ la Platja, 10", zip: "17130", locality: "L’Escala", region: "Girona", phone: "872 505 934", tel: "+34872505934" },
    { id: "tarragona", name: { ca: "Delegació Tarragona", es: "Delegación Tarragona" }, city: "Tarragona", street: "C/ Major, 3", zip: "43003", locality: "Tarragona", region: "Tarragona", phone: "977 296 589", tel: "+34977296589" },
  ],
} as const;

export type ServiceKey = "electricitat" | "gas" | "telecomunicacions" | "alarmes" | "assegurances" | "autoconsum";

/** Services shown on the site. Autoconsum stays hidden until the client confirms it is an active service. */
export const serviceCatalog: { key: ServiceKey; active: boolean }[] = [
  { key: "electricitat", active: true },
  { key: "gas", active: true },
  { key: "telecomunicacions", active: true },
  { key: "alarmes", active: true },
  { key: "assegurances", active: true },
  { key: "autoconsum", active: false },
];

/**
 * Evidence gate: figures and testimonials render with the pending label until the
 * client confirms them. Flip `verified` to true only on explicit confirmation.
 */
export const evidenceStatus = { stats: { verified: false }, testimonials: { verified: false } };

export const testimonials = [
  { quote: { ca: "Han aconseguit reduir la factura de la llum un 25% sense complicacions.", es: "Han conseguido reducir la factura de la luz un 25% sin complicaciones." }, name: "M. R.", city: "Barcelona", saving: "320 €/any" },
  { quote: { ca: "Ràpids, clars i sense sorpreses. El canvi de gas va ser immediat.", es: "Rápidos, claros y sin sorpresas. El cambio de gas fue inmediato." }, name: "J. L.", city: "Girona", saving: "210 €/any" },
  { quote: { ca: "La fibra ara costa menys i va més ràpid. Molt recomanable.", es: "La fibra ahora cuesta menos y va más rápido. Muy recomendable." }, name: "A. P.", city: "Tarragona", saving: "180 €/any" },
];

/** Only partners with a confirmed commercial relationship AND authorised artwork. Empty until confirmed. */
export const partners: { name: string; logo: string; width: number; height: number }[] = [];
