> **Numeració (27/11/2026).** En integrar la versió actual del CRM de producció (`main`, que ja té una migració 067), les migracions de SavEnergy s'han renumerat de 067–072 a **068–073**. Només n'ha canviat el nom: el contingut és idèntic al que es va aplicar a proves. El procediment complet de publicació a producció és a `SAVENERGY_PUBLICACIO_PRODUCCIO.md`, al repositori del CRM.

# SavEnergy IA · activació i proves (2.0TD residencial)

Estat: **desenvolupat, apagat**. El comparador real només funciona quan es compleixen **totes** aquestes condicions:
1. Migració `068_savenergy_web.sql` aplicada (primer en una base de dades de proves aïllada).
   Després, `069_savenergy_fiabilitat.sql`: només afegeix tres paràmetres a `sev_settings` (no activa res):
   - `min_invoice_days` (20) i `max_invoice_age_months` (12): una factura massa curta o massa antiga no mostra cap estalvi anual i es deriva a un assessor;
   - `ai_fallback` (`essencials`): quan es recorre a la IA després de l'extracció directa del PDF i la validació de coherència — `mai`, `essencials` (falten dades imprescindibles) o `contradiccions` (també si la lectura és completa però incoherent). Sempre amb `ai_enabled` actiu i dins dels límits de `sev_reserve_ai`; amb la IA desactivada no es fa mai cap crida.
   Si la base de dades de proves ja es va inicialitzar amb la primera migració de SavEnergy, n'hi ha prou d'executar-hi el fitxer `069_savenergy_fiabilitat.sql`.
   I `070_savenergy_sips.sql` (consulta SIPS des de la web; tampoc activa res): afegeix `sips_per_session` (1), `sips_retries` (1) i `sips_max_age_months` (6) a `sev_settings`, la taula `sev_sips_calls` (recompte de consultes, sense cap CUPS) i les funcions de reserva atòmica `sev_reserve_sips` / `sev_settle_sips`.

   I `071_savenergy_segments.sql` (segments d'empresa, 3.0TD i 6.1TD; no activa res): afegeix `business_max_annual_kwh` (2.000.000) i `business_max_power_kw` (1.000) a `sev_settings`, i la columna `provider` (`mock` / `real`) a `sev_sips_calls`. La funció `sev_reserve_sips` passa a exigir el proveïdor i a comptar els límits per proveïdor. **S'ha d'aplicar al mateix temps que el codi**: el codi nou crida la funció de tres paràmetres i el codi antic, la de dos.

   I `072_savenergy_gas.sql` (comparador de gas; no activa res): afegeix `gas_max_annual_kwh` (300.000) a `sev_settings`.

   I `073_savenergy_seguretat.sql` (fase final de seguretat; no activa res): taula `sev_rate` i funció atòmica `sev_rate_hit` (límit de peticions repetitives), columna `sev_sessions.lead_claimed_at` (un sol lead davant de peticions simultànies) i revocació explícita de permisos de totes les taules i funcions `sev_*` per a `anon` i `authenticated`.

### Seguretat entre la web i el CRM

- **Signatura versió 2**: la IP del visitant forma part de la signatura HMAC. La web i el CRM **s'han de desplegar alhora**: el CRM rebutja les signatures de la versió anterior (sense IP) i la web nova només signa amb la versió 2.
- **Turnstile**: el servidor de la web exigeix `success`, l'acció `savenergy`, que el repte sigui recent (5 minuts) i que el domini on s'ha resolt sigui un dels admesos. Per defecte, el domini de la mateixa petició; per fixar-los, `TURNSTILE_ALLOWED_HOSTS` (separats per comes) al projecte de la web. A Cloudflare, el widget ha de tenir només els dominis propis.
- **Límit de peticions** (per connexió i 10 minuts): visites 30, obertures de sessió 30, anàlisis 30, consultes d'estat 600, confirmacions 60, sol·licituds de contacte 12. La petició que el supera rep `429`.

### Neteja automàtica i termini de conservació

El visitant és informat que la factura s'elimina en un màxim de 24 hores si no demana contacte. Vercel Hobby només permet un cron diari, de manera que la freqüència horària la dona **Supabase Cron**: executa `supabase/optional/savenergy_neteja_cada_hora.sql` (del repositori del CRM) al projecte de Supabase. Necessita `pg_cron`, `pg_net` i els secrets de Vault `crm_app_url` i `crm_cron_secret`; si el CRM és una **Preview protegida**, també `crm_protection_bypass` (el valor de «Protection Bypass for Automation» de Vercel). El fitxer inclou les consultes de comprovació. Encara que la neteja no hagués passat, el servidor rebutja qualsevol sessió caducada.

La neteja elimina: fitxers temporals i sessions sense contacte caducades, fitxers orfes, lectures i resultats de sessions que ja són un lead, nonces, comptadors de peticions i reserves d'IA o de SIPS que hagin quedat penjades. Les factures dels leads autoritzats són en un altre bucket (`lead-documents`) i no es toquen.

### Tarifes aptes

A «Tarifes autoritzades per publicar», el panell valida cada tarifa amb el motor de comparatives i en mostra l'aptitud i el motiu d'exclusió. «Selecciona automàticament les aptes» marca només les aptes; una tarifa exclosa no es pot publicar i, si deixa de ser apta, deixa de mostrar-se encara que continuï publicada. El mateix informe es pot obtenir amb `scripts/savenergy-valida-tarifes.ts` (només lectura).

### Segments (activables des del panell)

| Segment | Què admet | Per defecte |
|---|---|---|
| Electricitat 2.0TD · particulars | Titulars particulars, 3 períodes d'energia i 2 de potència | Activat |
| Electricitat 2.0TD · empreses | Titulars empresa o autònoms amb CIF; ofertes de pime o industrials | Desactivat |
| Electricitat 3.0TD | Qualsevol titular; 6 períodes d'energia i 6 de potència | Desactivat |
| Electricitat 6.1TD | Qualsevol titular; 6 i 6 | Desactivat |
| Gas natural (RL.1 a RL.11) | Qualsevol titular; un sol període de consum i terme fix. La nomenclatura antiga 3.1–3.4 es converteix a RL.1–RL.4 | Desactivat |

Cada oferta es mostra només als subministraments de la seva tarifa d'accés i segment, i si compleix les seves condicions (consum anual, potències i, a les tarifes amb trams, la potència P6): ho decideix el motor de comparatives del CRM, que és l'únic que calcula. Cal publicar expressament les ofertes de 3.0TD i 6.1TD a «Tarifes autoritzades per publicar».

### Consulta SIPS (desactivada per defecte)

Calen **totes** aquestes condicions perquè es faci una consulta: `sips_enabled` activat al panell, límits superiors a zero (`sips_daily_max` és 0 per defecte), la variable de servidor del CRM `SAVENERGY_SIPS_MODE` i l'autorització expressa del visitant (casella opcional, desmarcada per defecte).

| `SAVENERGY_SIPS_MODE` | Efecte |
|---|---|
| (sense valor) o `off` | No es consulta res. La web no mostra la casella d'autorització. |
| `mock` | Respostes **simulades** amb dades fictícies, per validar el flux. Mai en producció (s'ignora si `VERCEL_ENV=production`). |
| `real` | Portal SIPS del CRM (`SIPS_USER` / `SIPS_PASSWORD`). **No l'activis** fins que s'hagin validat els permisos del proveïdor i hi hagi credencials de proves. |

El SIPS simulat i el real no es barregen mai: cada dada porta el proveïdor que l'ha servida i només es reutilitza amb aquell mateix proveïdor; els límits i les estadístiques també es compten per separat. El simulat no llegeix ni escriu la memòria cau del SIPS real (`sips_cache`).

**Temps d'espera del SIPS real.** Una consulta del servei intern pot arribar a ~90 s en el pitjor cas (inici de sessió, fins a quatre variants de cerca, resum i històric, amb 12 s cadascuna), i la funció que llegeix la factura en té 60. Des de la web la consulta va acotada:

| Variable del CRM | Per defecte | Efecte |
|---|---|---|
| `SAVENERGY_SIPS_BUDGET_MS` | 20000 | Temps màxim de tota la consulta. Si s'esgota, es continua sense SIPS (comparativa orientativa). |
| `SAVENERGY_SIPS_ERROR_COOLDOWN_MIN` | 15 | Minuts en què un error desat a la memòria cau no es torna a consultar des de la web (el servei intern el conserva 24 h o més). |

Des de la web només es fan cerques exactes del CUPS (s'omet la cerca oberta per prefix, la que més sovint esgota el temps del portal). Després d'un temps esgotat o d'un error ja desat no es reintenta de seguida; el reintent immediat queda per a errors puntuals. Un error desat no consumeix quota.

Només es consulta el CUPS llegit de la factura al servidor: cap operació pública n'accepta cap. El visitant veu el consum anual i les dates, mai el CUPS complet ni la resposta del SIPS. Les potències contractades són sempre les de la factura.
2. Variables configurades a la web i al CRM.
3. `enabled = true` al panell «SavEnergy IA (web)» del CRM.
4. `NEXT_PUBLIC_SAVENERGY_ENABLED=true` a la web.

Mentre no es compleixin, la web continua mostrant la demostració actual i els formularis de contacte i de col·laboradors segueixen anant a Formspree.

Branques: web `feature/savenergy-web` (ASSESSORIA30/newweb) · CRM `feature/savenergy-web` (ASSESSORIA30/renovaciosC). Cap de les dues és a `main`.

## 1. Claus de Cloudflare Turnstile (gratuït, sense tocar DNS)

1. Entra a https://dash.cloudflare.com (si no hi ha compte, crea'n un de gratuït). No cal moure cap domini a Cloudflare.
2. Menú **Turnstile** → **Add widget**.
3. Configura el widget:
   - **Widget name:** «Assessoria 3.0 · SavEnergy».
   - **Hostnames:** `www.assessoria30.com`, `assessoria30.com` i el domini de la Preview que vulguis provar, per exemple `newweb-git-feature-savenergy-web-assessoria30s-projects.vercel.app`. Es poden afegir i treure més endavant.
   - **Widget mode:** *Managed* (invisible si no hi ha risc; només demana un clic quan Cloudflare ho considera necessari).
   - **Pre-clearance:** No.
4. Copia les dues claus:
   - **Site key** → variable `NEXT_PUBLIC_TURNSTILE_SITE_KEY` de la web (és pública).
   - **Secret key** → variable `TURNSTILE_SECRET_KEY` de la web (**només servidor**, mai amb `NEXT_PUBLIC_`).

Turnstile no instal·la galetes publicitàries ni de seguiment. Només es carrega quan el visitant tria una factura.

## 2. Variables

**Web (Vercel · projecte newweb · Preview i, quan toqui, Production)**

| Variable | Valor | Visible al navegador |
|---|---|---|
| `NEXT_PUBLIC_SAVENERGY_ENABLED` | `true` per activar el panell real | sí (només és un interruptor) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Site key de Turnstile | sí |
| `TURNSTILE_SECRET_KEY` | Secret key de Turnstile | **no** |
| `SAVENERGY_CRM_URL` | URL del CRM de **proves** (https://…) | **no** |
| `SAVENERGY_SHARED_SECRET` | 64 caràcters aleatoris (`openssl rand -hex 32`), el mateix que al CRM | **no** |
| `SAVENERGY_CRM_BYPASS` | Secret de *Protection Bypass for Automation* del CRM (només si les Previews del CRM estan protegides) | **no** |

**CRM (Vercel · projecte del CRM · l'entorn de proves aïllat)**

| Variable | Valor |
|---|---|
| `SAVENERGY_SHARED_SECRET` | el mateix valor que a la web |
| `ANTHROPIC_API_KEY` | la clau existent del CRM (no canvia) |
| `SAVENERGY_UPLOAD_NEEDS_APIKEY` | `false`. Només `true` si la Preview mostra que Storage rebutja les pujades signades sense `apikey`. |

El model intern del CRM (`ANTHROPIC_MODEL`) **no canvia**. El de la web es tria al panell (per defecte, `claude-haiku-5-5`).

## 3. Abans d'activar la lectura amb IA

```bash
ANTHROPIC_API_KEY=… npx tsx scripts/savenergy-model-check.ts claude-haiku-5-5
```
Comprova que el model està disponible per a la clau del CRM. No envia cap factura.

```bash
ANTHROPIC_API_KEY=… npx tsx --conditions=react-server scripts/savenergy-compara-lectura.ts ./factures-anonimitzades claude-haiku-5-5
```
Compara, camp per camp, la lectura del model intern i la de Haiku 5.5 sobre factures **anonimitzades**, i en mostra el cost. Amb 20 factures, el cost total és inferior a 1 $.

Activa `ai_enabled` al panell només si la coincidència és satisfactòria. Sense IA, el comparador continua funcionant amb l'extracció de text dels PDF. La IA només s'usa quan aquesta extracció no és suficient.

## 4. Neteja dels documents temporals

- **Vercel Cron:** un cop al dia, com a reserva (compatible amb el pla Hobby, la convenció del CRM).
- **Supabase Cron:** cada hora, executant `supabase/optional/savenergy_neteja_cada_hora.sql` quan s'activi el comparador. Garanteix el termini de 24 h comunicat al visitant.
- **Servidor:** rebutja qualsevol sessió caducada encara que la neteja no hagi passat.

## 5. Proves fetes (sense dades reals ni enviaments reals)

- **CRM:**
  - PostgreSQL real (PGlite): migració, permisos (cap accés anònim ni d'usuaris del CRM), límits atòmics, pressupost d'IA, nonces i desfer.
  - Servidor amb Supabase en memòria: signatura i reenviaments, testimoni de sessió, lectura amb text primer, IA només amb pressupost, lead amb atribució del codi «C34», neteja de temporals i orfes.
  - Motor: catàleg públic, abast, dades personals, regla de no inventar estalvis, anonimització.
- **Web:**
  - Playwright contra un CRM simulat que valida cada signatura, a escriptori i mòbil, en català i castellà.
  - Turnstile i les pujades són simulats; Formspree no rep res d'aquest flux.

## 6. Pendent per a la validació en Preview

Entorn de proves preparat: vegeu `supabase/test-env/README.md` al repositori del CRM (branca `feature/savenergy-web`): script d'inicialització, catàleg fictici i variables per branca.


1. Base de dades de proves aïllada (projecte Supabase separat o local) amb la migració 067 i una còpia **anonimitzada** del catàleg.
2. Verificar la pujada signada real a Storage (CORS i `apikey`).
3. Executar els dos scripts de la § 3 i decidir el model.
4. Publicar al panell les tarifes 2.0TD validades.
5. Revisar els textos legals (`docs/legal-canvis-proposats.md`).
