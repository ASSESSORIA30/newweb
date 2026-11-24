// Real company content, taken from the current assessoria30.com and confirmed by the client.
// Anything synthetic (sample bill, demo estimate) lives in bill-demo.ts and is labelled in the UI.

export const brand = {
  name: "Assessoria 3.0",
  product: "SavEnergy IA",
  tagline: "L’estalvi és ara.",
  email: "info@assessoria30.com",
  whatsapp: { label: "686 91 49 44", href: "https://wa.me/34686914944" },
};

// Figures and testimonials come from the current website and are PENDING VERIFICATION by the client.
// Keep EVIDENCE_NOTE visible next to them until the client confirms them explicitly.
export const EVIDENCE_NOTE = "Dades de la web actual · pendents de verificació";

export const evidence = [
  { value: 3000, prefix: "+", suffix: "", label: "estudis realitzats" },
  { value: 500000, prefix: "+", suffix: " €", label: "estalviats pels clients" },
  { value: 30, prefix: "+", suffix: "", label: "comercialitzadores comparades" },
] as const;

export type ServiceId = "llum" | "gas" | "telecom" | "alarmes" | "assegurances";

export const services: {
  id: ServiceId;
  name: string;
  short: string;
  lead: string;
  points: string[];
}[] = [
  {
    id: "llum",
    name: "Llum",
    short: "Tarifa elèctrica per a la llar o el negoci.",
    lead: "Analitzem el teu consum real i comparem comercialitzadores per trobar la millor tarifa, sense sorpreses.",
    points: ["Comparació de preus de llum", "Optimització de la potència contractada", "Canvi de companyia sense tall de subministrament"],
  },
  {
    id: "gas",
    name: "Gas",
    short: "Gas natural més econòmic, amb les mateixes garanties.",
    lead: "T’ajudem a entendre el teu consum de gas i t’oferim alternatives més econòmiques amb les mateixes garanties.",
    points: ["Tarifes indexades o fixes", "Anàlisi del consum estacional", "Gestió integral del canvi"],
  },
  {
    id: "telecom",
    name: "Fibra i mòbil",
    short: "Velocitat real al preu que toca.",
    lead: "Negociem amb els principals operadors per oferir-te velocitat real i tarifes mòbils ajustades al que fas servir.",
    points: ["Comparador de fibra i mòbil", "Descomptes per paquets combinats", "Conserves el número, sense permanència"],
  },
  {
    id: "alarmes",
    name: "Alarmes",
    short: "Protecció per a la llar i el negoci.",
    lead: "Protecció per a la teva llar o el teu negoci amb preus competitius i la instal·lació gestionada per nosaltres.",
    points: ["Comparativa de proveïdors", "Llar i negoci", "Gestió de l’alta"],
  },
  {
    id: "assegurances",
    name: "Assegurances",
    short: "Llar, vida, salut, cotxe i més.",
    lead: "Llar, vida, salut, cotxe i més. Comparem pòlisses perquè paguis el just per la cobertura que necessites.",
    points: ["Llar i comerç", "Vida i salut", "Cotxe i flotes"],
  },
];

export const steps = [
  { title: "Envia la teva factura", text: "Puja la factura actual en menys d’un minut." },
  { title: "Rep la proposta", text: "L’analitzem i et preparem la millor alternativa." },
  { title: "Comença a estalviar", text: "Gestionem el canvi de companyia per tu. Cada any tornem a revisar les teves factures." },
];

export const testimonials = [
  { quote: "Han aconseguit reduir la factura de la llum un 25% sense complicacions.", name: "M. R.", city: "Barcelona", saving: "320 €/any" },
  { quote: "Ràpids, clars i sense sorpreses. El canvi de gas va ser immediat.", name: "J. L.", city: "Girona", saving: "210 €/any" },
  { quote: "La fibra ara costa menys i va més ràpid. Molt recomanable.", name: "A. P.", city: "Tarragona", saving: "180 €/any" },
];

export const offices = [
  { name: "Oficines centrals", city: "Lleida", street: "Av. Garrigues, 21", zip: "25001 Lleida", phone: "973 982 852", tel: "+34973982852", x: 0.18, y: 0.55 },
  { name: "Delegació Barcelona", city: "Badalona", street: "C/ Sant Bru, 10", zip: "08911 Badalona", phone: "931 193 582", tel: "+34931193582", x: 0.74, y: 0.6 },
  { name: "Delegació Girona", city: "L’Escala", street: "C/ la Platja, 10", zip: "17130 L’Escala", phone: "872 505 934", tel: "+34872505934", x: 0.9, y: 0.25 },
  { name: "Delegació Tarragona", city: "Tarragona", street: "C/ Major, 3", zip: "43003 Tarragona", phone: "977 296 589", tel: "+34977296589", x: 0.5, y: 0.82 },
];

export const faqs = [
  {
    q: "El servei és gratuït?",
    a: "Sí. L’estudi i l’assessorament són gratuïts. Rebem una comissió de les companyies quan fas el canvi, però el preu per a tu és el mateix o millor que si hi anessis directament.",
  },
  {
    q: "Quant triga el canvi de companyia?",
    a: "El canvi de llum o gas sol trigar entre 5 i 15 dies laborables. En telecomunicacions, entre 24 i 48 hores. Nosaltres gestionem tot el procés.",
  },
  {
    q: "Puc canviar si tinc permanència?",
    a: "Depèn del cas. Calculem si compensa pagar la penalització per l’estalvi d’una tarifa més econòmica i t’ho expliquem abans de decidir.",
  },
  {
    q: "Què passa si tinc una incidència?",
    a: "La distribució de llum i gas depèn de la distribuïdora de la teva zona, que no canvia. Mantens el mateix servei de reparació, i nosaltres t’ajudem a gestionar qualsevol incidència.",
  },
];

export const formatNumber = (n: number) => new Intl.NumberFormat("ca-ES").format(n);
