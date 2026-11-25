# SavEnergy IA · Pla tècnic de la fase funcional

Abast inicial: **electricitat residencial 2.0TD**. Gas i empreses queden preparats a la configuració, però desactivats.
Estat: **pla**. No s'ha modificat el CRM ni s'ha executat cap migració. Anàlisi feta en mode de només lectura sobre `ASSESSORIA30/renovaciosC` (commit `1a1f7e2`) i `ASSESSORIA30/newweb` (`feature/a3-signature-green`).

---

## 1. Què ja existeix al CRM i es reutilitza

El CRM ja té un circuit de captació públic complet (Fase 6, migració `013_captacio.sql`): formulari → sol·licitud → lead → factura privada → lectura → comparativa preliminar. SavEnergy IA **no el duplica**: el reutilitza com a biblioteca i hi afegeix una capa pública nova i més restringida.

| Peça | Fitxers existents | Com es reutilitza |
|---|---|---|
| **Lector IA de factures** | `src/server/invoices.ts` → `readInvoiceBytes(bytes, mime, { allowAi })`; `src/core/capture.ts` → `checkUpload`, `sniffDocument`, `pdfActiveContent`, `normalizeReading`; `src/server/pdf-prepare.ts` | Igual, però en **dues passades**: primer només text (`allowAi: false`, cost zero); la IA només s'activa si falten dades clau i queda pressupost. |
| **Motor de comparatives** | `src/comparator/engine.ts` (`runComparison`, `computeCost`), `tariff-engine.ts`, `ranking.ts`, `final-prices.ts`, `snapshot.ts` (`buildSnapshot`) | Sense canvis. |
| **Càlcul d'estalvi** | `src/core/intelligence.ts` → `analyseSupply`, `isOfferValid`, `PENDING_PRICE`; `src/core/capture.ts` → `readingToComparison` | Sense canvis. Ja ordena per **cost anual total** (no per comissió) i retorna `saving = null` quan no hi ha preus actuals. |
| **Catàleg de tarifes** | `src/server/intelligence.ts` → `catalogOffers(sb)` (taula `tariff_versions`, versió vigent per producte); `src/comparator/review-state.ts` → `tariffReview()` (`validada`, …) | Es filtra amb tres condicions: `isOfferValid` (activa i dins de dates), `tariffReview().state === "validada"` i **llista blanca pública** (nova, gestionada per administració). |
| **SIPS autoritzat** | `src/server/sips.ts` → `readCache`, `refreshSips`, `audit`, `rateLimit`; `src/server/env.ts` → `sipsEnv()` (TTL 7 dies, límits) | Només amb autorització explícita del titular. Del `SipsSummary` només se'n fa servir el consum anual per període (`annual_consumption`, `monthly_kwh`, `tariff`, `contracted_power_kw`). L'adreça, la comercialitzadora i la distribuïdora no surten mai cap al navegador. |
| **Captació de leads** | `src/server/capture.ts` → `submit`, `processSubmission`, `finishReading`, `autoAssign`; `src/core/capture.ts` → `publicFormSchema`, `spamReasons`, `rateDecision`, `ipHash`, `contactHash`, `matchDuplicates`, `CONSENT_TEXTS`, `CONSENT_VERSION` | Es reutilitza `submit()` amb `forcedChannel: "factura"` per crear el lead, la deduplicació, l'assignació i les notificacions. |
| **Generació de PDF** | `src/core/proposal-pdf.ts` → `buildProposalPdf` (servidor); `src/comparator/pdf.ts` → `renderComparisonPdf` (sense l'opció `internal`, que és la que porta les comissions) | PDF orientatiu per al client, amb marca d'aigua «Estimació orientativa». Mai amb `internal`. |
| **Atribució de col·laboradors** | `src/server/capture.ts` → `resolveRef` (taula `cap_referral_links`, partner actiu, caducitat); `src/core/capture.ts` → `resolveAttribution` (finestra de 90 dies), `REF_RE` | El codi viatja com a dada declarada; **qui decideix l'atribució és el servidor**, com ara. |

**Detalls a corregir que he trobat (cap no és de disseny):**
- **Codi de col·laborador:** la web accepta `?ref=`/`?col=` amb `[\w-]{2,40}`, però el CRM exigeix `REF_RE = /^[A-Z0-9]{4,16}$/`. Cal alinear la web amb el CRM (majúscules, 4–16 caràcters).
- **Límit de mida a Vercel:** `POST /api/capture/submit` accepta fitxers de 10 MB en multipart, però les funcions de Vercel només admeten cossos de fins a ~4,5 MB. Les factures més grans fallen. El nou circuit ho resol amb pujada directa a Storage (vegeu § 3).
- **Model d'IA:** `ANTHROPIC_MODEL` és un sol model per a tot el CRM. Per a les lectures públiques convé una variable pròpia, per poder controlar el cost.

---

## 2. Arquitectura

```
Navegador (web estàtica newweb)
  │  1 · JSON petit (consentiments, token antibot)          4 · PUT del fitxer
  ▼                                                          ▼
newweb · /api/savenergy/[op]  (1 funció Node)        Supabase Storage · bucket privat «savenergy-tmp»
  │  signatura HMAC-SHA256 (secret compartit, només servidor)   ▲  URL de pujada signada, d'un sol ús,
  ▼                                                          │  per a una ruta concreta (sense credencials)
CRM · /api/public/savenergy/*  ──────────────────────────────┘
  │  service role només dins del CRM · DTO sanejats de sortida
  ▼
Supabase (taules sev_* noves + tariff_versions, cap_*, crm_leads, sips cache existents)
```

**Principis:**
- **Sense secrets al navegador:** el navegador no veu ni la URL del CRM ni el secret, i la web no té cap clau de Supabase. L'única cosa que rep és una URL de pujada signada per a un sol fitxer.
- **Una sola entrada al CRM:** la web pública només pot parlar amb `/api/public/savenergy/*`. Cada petició va signada amb `X-A30-Timestamp`, `X-A30-Signature = HMAC(secret, ts + "." + mètode + ruta + sha256(cos))`, amb una finestra de ±300 s, i es rebutja qualsevol reutilització (nonce desat 10 min).
- **Sortida per llista blanca:** les respostes del CRM es construeixen camp a camp, no copiant objectes sencers. Mai surten:
  - comissions, matrius `commercial`, `source` ni condicions internes;
  - identificadors interns ni dades de clients existents;
  - adreça, nom del titular, IBAN o NIF de la factura.
- **La web continua sent estàtica:** totes les pàgines segueixen prerenderitzades. L'únic codi de servidor nou és una funció petita de pas.

---

## 3. Flux 2.0TD residencial

1. **Inici** (`POST /api/savenergy/session`)
   - Consentiments: privacitat (obligatori), conservació temporal de la factura 24 h (obligatori), autorització SIPS com a titular (opcional) i comercial (opcional, desmarcat).
   - Token antibot, idioma, atribució (UTM i `ref`, només si hi ha consentiment de cookies), parany i temps d'emplenament.
   - La web verifica el token antibot abans de cridar el CRM.
   - El CRM aplica `rateDecision` per IP (hash diari) i pressupost global, crea `sev_sessions` (caduca en 24 h) i retorna `{ session, uploadUrl, maxBytes }`.
2. **Pujada:** el navegador redueix les imatges (≤ 2.000 px, JPEG/WebP) i fa el `PUT` directament a Storage. Màxim 8 MB i 1 document per sessió.
3. **Anàlisi** (`POST …/analyse`, asíncrona amb `after()`; `GET …/status` per consultar-la, cada 2–3 s i com a màxim 90 s)
   1. Comprovacions del fitxer: `checkUpload` (contingut real i sense contingut actiu), fins a 4 pàgines i SHA-256.
   2. Mateix SHA-256 en les darreres 24 h → es reutilitza la lectura, sense cost d'IA.
   3. Lectura només de text. Si `readingToComparison` ja té el que cal, no es crida la IA.
   4. Si falten dades i queda pressupost (diari, per IP i per sessió), es fa la lectura amb IA (`readInvoiceBytes`) amb el model `SAVENERGY_AI_MODEL`.
   5. Si la tarifa no és 2.0TD o el client no és particular, no es calcula res: es passa directament a «revisió per un assessor».
4. **Confirmació** (`POST …/confirm`, sense IA)
   - L'usuari veu i pot corregir els valors llegits: dies, kWh P1–P3, kW P1–P2 i preus actuals.
   - Si ha autoritzat el SIPS i el CUPS és vàlid, el CRM fa servir `readCache`/`refreshSips` per substituir l'anualització d'una sola factura pel consum real de 12 mesos.
   - Es recalcula amb `analyseSupply` sobre el catàleg públic filtrat.
5. **Resultat:**
   - Només es mostra un estalvi si es compleixen **totes** aquestes condicions: preus actuals coneguts (`current.known`), cap dada dubtosa sense confirmar, alternativa amb qualitat de càlcul acceptable i tarifa vigent.
   - En qualsevol altre cas: «No tenim prou dades per calcular-ho amb rigor», amb l'oferta de revisió per un assessor. Mai es mostra una xifra inventada.
   - S'hi mostren sempre les hipòtesis (`hypotheses`), com ara el consum anualitzat.
6. **Contacte i PDF** (`POST …/lead`)
   - Reutilitza `submit()` (canal `factura`): crea el lead, l'atribució al col·laborador, els duplicats i l'assignació.
   - Mou el document de `savenergy-tmp` a `lead-documents` i desa la lectura i la comparativa en esborrany (`finishReading`).
   - Opcionalment genera el PDF orientatiu, accessible amb una URL signada de 10 min.
   - Aquests leads van **directament al CRM**, no a Formspree, per no duplicar-los.
7. **Caducitat**
   - Les sessions sense contacte s'eliminen (fitxer i lectura) en 24 h: cron diari `…/purge` i, a més, cada endpoint rebutja les sessions caducades encara que el cron no hagi passat.
   - Les sessions amb contacte segueixen la conservació de `lead-documents` del CRM.

---

## 4. Endpoints

### Web (`newweb`) · nou
| Endpoint | Funció |
|---|---|
| `POST /api/savenergy/session` | Verificació antibot → CRM |
| `POST /api/savenergy/analyse` | Pas al CRM |
| `GET  /api/savenergy/status?s=` | Pas al CRM (`Cache-Control: no-store`) |
| `POST /api/savenergy/confirm` | Pas al CRM |
| `POST /api/savenergy/lead` | Pas al CRM |

Un sol fitxer: `src/app/api/savenergy/[op]/route.ts` (runtime Node). El pas només copia el cos permès, signa la petició, limita el cos a 32 KB i no reenvia ni galetes ni capçaleres del client, excepte un hash de la IP.

### CRM (`renovaciosC`) · nous
| Endpoint | Auth | Funció interna reutilitzada |
|---|---|---|
| `POST /api/public/savenergy/session` | HMAC | `rateDecision`, `ipHash`, `resolveRef`, Storage `createSignedUploadUrl` |
| `POST /api/public/savenergy/analyse` | HMAC | `checkUpload`, `readInvoiceBytes`, `normalizeReading`, `readingToComparison`, `catalogOffers`, `analyseSupply` |
| `GET  /api/public/savenergy/status` | HMAC | lectura de `sev_sessions` (DTO) |
| `POST /api/public/savenergy/confirm` | HMAC | `applyReview`, `readCache`/`refreshSips`, `analyseSupply` |
| `POST /api/public/savenergy/lead` | HMAC | `submit`, `processSubmission`, `finishReading`, `buildProposalPdf` |
| `GET  /api/public/savenergy/purge` | `CRON_SECRET` | neteja de Storage i `sev_sessions` |
| `GET/PUT /api/savenergy/settings` | sessió, rol `admin`/`cap_administrativa` | configuració |

`middleware.ts`: afegir `api/public/savenergy` a les exclusions del `matcher` (com `api/capture/submit`). Així s'evita la consulta de sessió de Supabase a cada petició.

---

## 5. Configuració d'administració (CRM)

Taula `sev_settings` (una sola fila) i taula `sev_public_offers`, amb una vista nova a Configuració → «SavEnergy web».

| Paràmetre | Valor inicial proposat |
|---|---|
| `enabled` (interruptor general) | `false` fins a la validació |
| `services` | `{ luz_20td_residencial: true, gas: false, empresa: false }` |
| Tarifes públiques | llista blanca de `product_id` (només les `validada` i vigents es poden marcar) |
| `display_supplier` | `nom` o `anonim` (si hi ha acords que no permeten publicar la marca) |
| `top_n` | 3 |
| Límits de consum 2.0TD | 500–15.000 kWh/any · P1 ≤ 15 kW (fora de rang → assessor) |
| `ai_daily_max` / `ai_per_ip_day` / `ai_per_session` | 150 / 3 / 1 (+1 reintent) |
| `sips_daily_max` / `sips_per_ip_day` | 100 / 2 |
| `sessions_per_ip_10min` / `per_ip_day` | 5 / 20 (mateixos llindars que `RATE`) |
| `max_file_mb` / `max_pdf_pages` | 8 / 4 |
| `retention_hours` (sense contacte) | 24 |

Comptadors diaris a `sev_usage` (dia, lectures IA, crides SIPS, sessions, PDF). En arribar al pressupost, l'anàlisi automàtica s'atura i el formulari passa a «Un assessor revisarà la teva factura». No es perd cap client.

---

## 6. Seguretat, privacitat i costos

- **Bots:**
  - Parany i temps mínim (reutilitzant `spamReasons`), límits per IP i per contacte (`rateDecision`), idempotència per sessió.
  - Verificació antibot a la web: **pendent de decisió** (vegeu § 9).
- **Factures:**
  - Bucket privat nou `savenergy-tmp`, sense polítiques públiques. Pujada amb una URL signada d'un sol ús i ruta aleatòria.
  - Validació del contingut real (`sniffDocument`, `pdfActiveContent`); mai s'executa ni es reenvia el fitxer.
  - Els registres (logs) no contenen dades personals. La lectura desada a `sev_sessions` és la mínima: es descarten nom, adreça, NIF i IBAN i es desa el CUPS emmascarat (`ES00••••••••1234`).
- **Consentiments:** text i versió desats amb cada sessió, ampliant `CONSENT_TEXTS` (`factura_temporal`, `sips_titular`) i `CONSENT_VERSION`. L'autorització SIPS fa constar que la persona n'és titular o hi està autoritzada.
- **Caducitat:** 24 h per defecte; els endpoints rebutgen sessions caducades i el cron diari esborra fitxers i files.
- **Cost d'IA:**
  - Lectura de text primer.
  - Deduplicació per SHA-256.
  - Model propi configurable.
  - `max_tokens` limitat (ara 3.000).
  - Pàgines limitades.
  - Pressupost diari amb tall automàtic.
- **Cost de Vercel:**
  - Les pàgines continuen sent estàtiques.
  - La consulta d'estat és lleugera i limitada a 90 s.
  - Els fitxers no passen per cap funció.
  - `maxDuration` de 60 s només a `analyse` del CRM.
  - Sense crons nous a la web.
- **Textos legals:** cal afegir Anthropic (lectura amb IA), Supabase i el SIPS a la política de privacitat, al costat dels canvis ja recollits a `docs/legal-canvis-proposats.md`.

---

## 7. Modificacions estrictament necessàries

**CRM (`renovaciosC`) · branca nova, sense tocar producció**
1. `supabase/migrations/067_savenergy_web.sql` (+ `_down`):
   - taules `sev_settings`, `sev_public_offers`, `sev_sessions`, `sev_usage` i `sev_nonces`, amb RLS activat i sense polítiques (només service role);
   - bucket `savenergy-tmp`.
2. `src/core/savenergy.ts` (pur i provable):
   - DTO públics i funció de sanejament;
   - filtre del catàleg públic (`isOfferValid` + `tariffReview` + llista blanca);
   - abast 2.0TD i regla «mostrar estalvi només si…»;
   - verificació HMAC i decisió de pressupost.
3. `src/server/savenergy.ts`: orquestració que reutilitza les funcions de la § 1.
4. `src/server/invoices.ts`: paràmetre opcional `model` a `readInvoiceBytes` i `aiExtract`. És l'únic canvi a codi existent, retrocompatible.
5. `src/server/env.ts`: `savenergyEnv()` amb `SAVENERGY_SHARED_SECRET`, `SAVENERGY_AI_MODEL` i `SAVENERGY_ENABLED`.
6. `app/api/public/savenergy/*` (6 rutes), `app/api/savenergy/settings/route.ts`, vista d'administració.
7. `middleware.ts`: exclusió del `matcher`.
8. `vercel.json`: cron diari de purga.
9. `CONSENT_TEXTS`/`CONSENT_VERSION`: dos textos nous.
10. Proves `vitest`: sanejament (cap camp prohibit), filtre de catàleg, «no inventar estalvi», HMAC i pressupost.

**Web (`newweb`) · sense canvis de disseny**
1. `src/app/api/savenergy/[op]/route.ts` (pas signat i verificació antibot).
2. `src/site/savenergy/client.ts`: màquina d'estats (sessió → pujada → anàlisi → confirmació → resultat o assessor → contacte).
3. `src/site/home/SavEnergy.tsx`: connectar `UploadPanel` a aquesta màquina reutilitzant els estils i components actuals. Els panells «Estimació sense factura» i «Parla amb un assessor» no canvien.
4. `src/site/lead/tracking.ts`: validar `ref` amb el `REF_RE` del CRM.
5. Textos ca/es nous (estats, errors, consentiments) i proposta d'actualització de la política de privacitat.
6. Proves Playwright amb el CRM simulat (cap enviament real).

---

## 8. Ordre de treball proposat

1. **CRM:** migració i `core/savenergy.ts` amb proves (sense executar la migració a producció).
2. **CRM:** endpoints públics i configuració, provats contra una base de dades de preview o local.
3. **Web:** funció de pas i màquina d'estats, provades amb respostes simulades.
4. **Integració en preview:** activació amb `enabled=false` a producció, proves amb factures reals anonimitzades i validació de tarifes per administració.
5. **Activació** de la 2.0TD residencial. Després, gas (RL.x) i empreses (3.0TD), activant els serveis a la configuració.

## 9. Decisions pendents

1. **Antibot:** Cloudflare Turnstile (gratuït, cal un compte i una clau) o només les proteccions pròpies (parany, temps, límits i pressupost).
2. **Comercialitzadores:** mostrar-les amb el nom o anonimitzades.
3. **Conservació:** 24 h per a les factures sense sol·licitud de contacte.
4. **Pressupost d'IA:** lectures diàries màximes i model de lectura per a la web.
5. **Pla de Vercel del CRM** (Hobby o Pro): determina si el cron de purga pot ser més freqüent que diari.
