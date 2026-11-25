# Formularis · Formspree i compatibilitat amb el CRM

- Connexió única: `src/site/lead/formspree.ts` (endpoint `https://formspree.io/f/mredlbqp`, POST JSON asíncron, `Accept: application/json`, temps màxim 15 s). Tots els formularis hi passen a través de `src/site/lead/adapter.ts` i `useLeadForm` (`src/site/ui/forms.tsx`).
- Nota: el codi publicat de www.assessoria30.com envia a `https://formspree.io/f/xreyrqbq`; la nova web fa servir `mredlbqp`, l'endpoint indicat per Assessoria 3.0.

## Formularis i origen

| Formulari | Origen enviat (`origen`) |
|---|---|
| Contacte general (secció final) | `web-contacte` |
| Contacte amb «Soc: Empresa» | `web-empresa` (+ camp `company`) |
| CTA «Demana un estudi» (serveis) i «Sol·licita l'estudi» (SavEnergy) | `web-estudi-energetic` (+ servei) |
| Parla amb un assessor (trucada) | `web-assessorament` |
| Col·laboradors | `web-collaborador` |

## Ordre i camps (comprovat amb una còpia del lector `renovaciosC/src/core/lead-mail.ts`, sense modificar-lo)

1. Metadades primer: `origen`, `idioma`, `pagina_origen`, `tipus_client`, `codi_collaborador`, `utm_*`, `data_consulta`, `consentiment_privacitat`, `consentiment_comercial`. El lector del CRM **no les desa com a camps** (no són etiquetes reconegudes; `idioma` s'ignora explícitament), però surten al correu i a Formspree.
2. Camps reconeguts pel CRM: `name`, `email`, `phone`, `company`, `city`, `service`.
3. `message` sempre l'últim i amb un resum llegible de les metadades: **és la manera que el CRM conservi** origen, UTM, tipus de client, codi de col·laborador i consentiments sense canviar-lo.
4. El camp visual «Telèfon o correu» es valida i s'envia com a `phone` o `email`.
5. Valors de metadades que coincideixen amb una etiqueta del CRM (p. ex. «empresa») s'envien amb un sufix perquè el lector no els confongui amb un camp.

Resultat de la prova amb el lector: `name/phone/email/company/service/message` extrets correctament i `formspreeCheck` = vàlid, tant en format «etiqueta: valor» com en format d'etiqueta i valor en línies separades.

## Protecció

Honeypot `_gotcha` (Formspree), temps mínim d'emplenament (1,2 s), un sol enviament alhora, bloqueig de duplicats idèntics durant 10 minuts, errors amb reintent i dades conservades.
