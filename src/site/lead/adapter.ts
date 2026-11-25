"use client";

import { sendToFormspree } from "./formspree";
import { track } from "./tracking";
import type { Lead, LeadAdapter, LeadKind, LeadResult } from "./types";

/*
 * Compatibility with the CRM mail reader (renovaciosC · src/core/lead-mail.ts, read only):
 *  - It recognises these labels: name, phone, email, company, service, message (plus city, date, tariff…).
 *  - Unknown labels are NOT stored; a line that follows a recognised field is appended to it.
 *  - "idioma", "_subject" and "_gotcha" are ignored.
 * So: metadata goes FIRST (before any recognised field, where the reader ignores it) with values that are
 * never a recognised label, the contact fields follow, and `message` goes LAST and always carries a
 * readable summary of the metadata, so the CRM keeps origin, UTM, client type, referral code and consents.
 */

const ORIGIN: Record<LeadKind, { code: string; ca: string; es: string }> = {
  contact: { code: "web-contacte", ca: "Contacte general", es: "Contacto general" },
  business: { code: "web-empresa", ca: "Captació d’empreses", es: "Captación de empresas" },
  collaborator: { code: "web-collaborador", ca: "Captació de col·laboradors", es: "Captación de colaboradores" },
  callback: { code: "web-assessorament", ca: "Sol·licitud d’assessorament (trucada)", es: "Solicitud de asesoramiento (llamada)" },
  study: { code: "web-estudi-energetic", ca: "Sol·licitud d’estudi energètic", es: "Solicitud de estudio energético" },
};

// Labels the CRM reader maps to a field (normalised like its normKey). A metadata value equal to one of
// these, alone on a line, would start that field; such values get a harmless suffix.
const CRM_LABELS = new Set(
  "nom nombre name fullname nomicognoms nomcomplet nombrecompleto nombreyapellidos nomcognoms personadecontacte personadecontacto contacte contacto telefon telefono phone tel mobil movil mobile telefonmobil telefonodecontacto telefondecontacte whatsapp email correu correuelectronic correoelectronico correo mail emailaddress replyto empresa company raosocial razonsocial negoci negocio nomempresa nombreempresa servei servicio service serveis servicios serveiinteressat interes tarifa tariff tarifadacces tarifadeacceso peatge peaje dadescalculadora datoscalculadora calculadora calculator simulacio simulacion dadesdelacalculadora missatge mensaje message comentari comentaris comentario comentarios consulta observacions observaciones data fecha date documentacio documentacion documents documentos adjunts adjuntos fitxers archivos nif cif nifcif dni nie dninie cups codicups codigocups poblacio poblacion ciutat ciudad municipi municipio localitat localidad provincia subject gotcha next language idioma".split(" "),
);
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const safe = (v: string) => {
  const s = v.replace(/[\r\n]+/g, " ").trim().slice(0, 300);
  return CRM_LABELS.has(norm(s)) ? `${s} (valor)` : s;
};

export function buildFormspreePayload(lead: Lead): Record<string, string> {
  const o = ORIGIN[lead.kind];
  const es = lead.locale === "es";
  const a = lead.attribution.last ?? lead.attribution.first;
  const f = lead.attribution.first;
  const ref = a?.ref ?? f?.ref;
  const utm = (k: "utm_source" | "utm_medium" | "utm_campaign" | "utm_term" | "utm_content") => a?.[k] ?? f?.[k];
  const yes = "sí";
  const no = "no";

  // 1 · Metadata (ignored by the CRM reader as separate fields, kept in Formspree and in the email).
  const meta: [string, string | undefined][] = [
    ["_subject", `Web A3 · ${o[lead.locale]} · ${lead.contact.name}`],
    ["origen", o.code],
    ["idioma", lead.locale],
    ["pagina_origen", lead.page],
    ["tipus_client", lead.clientType ? `client-${lead.clientType}` : undefined],
    ["codi_collaborador", ref],
    ["utm_source", utm("utm_source")],
    ["utm_medium", utm("utm_medium")],
    ["utm_campaign", utm("utm_campaign")],
    ["utm_term", utm("utm_term")],
    ["utm_content", utm("utm_content")],
    ["data_consulta", lead.consent.at],
    ["consentiment_privacitat", lead.consent.privacy ? `acceptat ${lead.consent.at}` : no],
    ["consentiment_comercial", lead.consent.marketing ? `acceptat ${lead.consent.at}` : no],
  ];

  // 2 · Readable summary appended to the message (this is what the CRM stores).
  const L = es
    ? { head: "— Datos de la consulta web —", origin: "Origen de la consulta", page: "Página de origen", lang: "Lengua", type: "Tipo de cliente", ref: "Código de colaborador", utm: "Campaña (UTM)", when: "Fecha de la consulta", priv: "Consentimiento privacidad", mkt: "Consentimiento comercial" }
    : { head: "— Dades de la consulta web —", origin: "Origen de la consulta", page: "Pàgina d’origen", lang: "Llengua", type: "Tipus de client", ref: "Codi de col·laborador", utm: "Campanya (UTM)", when: "Moment de la consulta", priv: "Consentiment privacitat", mkt: "Consentiment comercial" };
  const utmLine = [utm("utm_source"), utm("utm_medium"), utm("utm_campaign"), utm("utm_term"), utm("utm_content")].filter(Boolean).join(" / ");
  const summary = [
    L.head,
    `${L.origin}: ${o[lead.locale]} (${o.code})`,
    `${L.page}: ${lead.page}`,
    `${L.lang}: ${lead.locale}`,
    lead.clientType ? `${L.type}: ${lead.clientType}` : null,
    ...lead.details.filter(([, v]) => v).map(([k, v]) => `${k}: ${v.replace(/[\r\n]+/g, " ")}`),
    ref ? `${L.ref}: ${ref}` : null,
    utmLine ? `${L.utm}: ${utmLine}` : null,
    `${L.when}: ${lead.consent.at}`,
    `${L.priv}: ${yes}`,
    `${L.mkt}: ${lead.consent.marketing ? yes : no}`,
  ].filter(Boolean);

  const c = lead.contact;
  const message = [c.message?.trim(), summary.join("\n")].filter(Boolean).join("\n\n");

  // 3 · Fields the CRM recognises, message last.
  const known: [string, string | undefined][] = [
    ["name", c.name],
    ["email", c.email],
    ["phone", c.phone],
    ["company", c.company],
    ["city", c.city],
    ["service", c.service],
    ["message", message],
  ];

  const out: Record<string, string> = {};
  for (const [k, v] of meta) if (v) out[k] = k === "_subject" ? v.slice(0, 150) : safe(v);
  for (const [k, v] of known) if (v && v.trim()) out[k] = k === "message" ? v.slice(0, 4800) : v.trim().slice(0, 300);
  return out;
}

export const formspreeLeadAdapter: LeadAdapter = {
  async submit(lead: Lead, honeypot?: string): Promise<LeadResult> {
    const payload = buildFormspreePayload(lead);
    // Formspree's own honeypot: a filled `_gotcha` makes it drop the submission silently.
    if (honeypot) payload._gotcha = honeypot;
    const res = await sendToFormspree(payload);
    track(res.ok ? "lead_submit" : "lead_error", { kind: lead.kind, locale: lead.locale, source: lead.attribution.last?.utm_source, ref: lead.attribution.last?.ref });
    return res;
  },
};

export const leadAdapter: LeadAdapter = formspreeLeadAdapter;
