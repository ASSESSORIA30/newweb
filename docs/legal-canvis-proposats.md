# Textos legals · canvis proposats (pendents de validació)

Les pàgines `/privacitat`, `/cookies`, `/avis-legal` (i `/es/privacidad`, `/es/cookies`, `/es/aviso-legal`) publiquen **literalment** els textos de www.assessoria30.com (copiats el 25/11/2026, en català i castellà). Font: `src/site/legal/content.ts`.

Aquesta llista recull el que caldria **actualitzar** per les tecnologies i funcionalitats de la nova web. No s'ha aplicat res: cal validar-ho (idealment amb l'assessor legal) abans de publicar-ho.

## Política de privacitat

1. **Responsable**: afegir el domicili social (p. ex. Av. Garrigues, 21, 25001 Lleida, si és el social) i, si n'hi ha, el contacte del delegat de protecció de dades.
2. **Encarregats del tractament / proveïdors** (no hi consten):
   - **Formspree** (Formspree, Inc., EUA): rep els formularis i els envia a info@assessoria30.com. Implica **transferència internacional** (indicar la garantia: EU‑US Data Privacy Framework o clàusules contractuals tipus).
   - **Vercel** (allotjament web, EUA): mateixa observació sobre transferències.
   - Proveïdor del correu (info@assessoria30.com) i proveïdor on s'allotja el **CRM** (que llegeix automàticament els correus de Formspree).
3. **Finalitats noves**: captació de col·laboradors; sol·licitud de trucada; registre de l'origen de la consulta (pàgina, paràmetres UTM, codi de col·laborador), aquest darrer **només amb consentiment** d'atribució.
4. **Legitimació**: les comunicacions comercials només amb el **consentiment separat** (casella opcional ja implementada als formularis). Eliminar l'apartat **10. Acceptació** («L'ús d'aquesta web implica l'acceptació…»): l'ús de la web no és una base legal vàlida segons el RGPD.
5. **Conservació**: concretar terminis (p. ex. consultes que no acaben en contractació: 12 mesos; comunicacions comercials: fins que es retiri el consentiment).
6. **Comunicació a tercers**: aclarir que les dades només es comuniquen a comercialitzadores/asseguradores quan el client sol·licita el servei; i, si una consulta arriba amb codi de col·laborador, si aquest rep informació de l'estat de la seva recomanació.
7. **Drets**: afegir el dret a **retirar el consentiment** en qualsevol moment i una adreça postal alternativa.
8. **SavEnergy IA (fase següent)**: quan s'activi la pujada de factures, informar del proveïdor d'IA, de la conservació de les factures i que no es prenen decisions automatitzades amb efectes jurídics.
9. **Coherència**: la versió castellana diu «Asesoría 3.0 AE, SL» en alguns apartats i «Assessoria 3.0 AE, SL» en d'altres; unificar amb la denominació social. Unificar també el format del telèfon (973982852 / 973 982 852).

### Aplicat el 26/11/2026: apartat 11 de la Política de privacitat (ca i es)

S'ha afegit a `src/site/legal/content.ts` l'apartat «11. Comparador SavEnergy IA: tractament automatitzat de factures» (finalitat i base jurídica, dades tractades, lectura automàtica i IA d'Anthropic amb text emmascarat, consulta del SIPS amb autorització, conservació de 24 hores, encarregats i drets). **Abans de publicar-lo, cal que l'assessor legal confirmi:**

1. La frase sobre la **transferència internacional** a Anthropic («amb les garanties adequades que exigeix el RGPD»): depèn del contracte d'encàrrec de tractament signat amb Anthropic i del mecanisme concret (clàusules contractuals tipus, marc UE–EUA…).
2. La llista d'**encarregats** (Anthropic, Vercel, Supabase, Cloudflare) i que hi ha contracte d'encàrrec amb cadascun.
3. Que el termini de **24 hores** coincideix amb `retention_hours` del panell (si es canvia, cal canviar el text).
4. La coherència amb l'apartat «10. Acceptació», que continua pendent (vegeu el punt 4 de més amunt).

### Addicions per SavEnergy IA (comparador amb factura)

10. **Finalitat**: calcular una comparativa orientativa a partir de la factura que aporta el visitant (lectura automàtica de text i, si cal, amb IA).
11. **Encarregats nous**: Anthropic (lectura amb IA, model configurable; transferència internacional amb garanties) i Cloudflare (verificació antibot Turnstile).
12. **Conservació**: la factura i la lectura s'eliminen en un màxim de 24 hores si no es demana contacte. Si es demana, passen a l'expedient del lead amb la conservació general.
13. **Dades tractades**: només les necessàries per al càlcul (tarifa, dies, consums, potències i preus). El titular, l'adreça, el NIF i l'IBAN no es desen a la sessió del comparador.
14. **Decisions automatitzades**: el resultat és orientatiu i no produeix efectes jurídics. L'oferta definitiva la prepara un assessor.
15. **SIPS**: si s'activa, consulta només amb l'autorització expressa del titular i només per a la comparativa.

## Política de cookies

1. Substituir la llista genèrica per la **llista real** de la nova web:

   | Nom | Tipus | Finalitat | Durada | Consentiment |
   |---|---|---|---|---|
   | `a30.consent.v1` | localStorage | Recordar l'elecció de cookies | Fins que es canviï | Necessària |
   | `a30_lang` | Cookie pròpia | Recordar l'idioma triat (només si l'usuari canvia d'idioma) | 1 any | Necessària |
   | `a30.attribution.first.v1` | localStorage | Origen de la primera visita (UTM, codi de col·laborador) | 90 dies | Atribució i anàlisi |
   | `a30.attribution.last.v1` | sessionStorage | Origen de la visita actual | Sessió | Atribució i anàlisi |
   | Cloudflare Turnstile | Servei de tercers (només en pujar una factura) | Protecció contra bots del comparador | Segons Cloudflare | Necessària (seguretat del servei sol·licitat) |

2. **No** s'utilitza Google Analytics ni cookies publicitàries: treure'n la menció o indicar «no s'utilitzen actualment».
3. Substituir l'apartat **4. Consentiment** («En accedir a aquesta web, l'usuari accepta…») per: el consentiment es demana amb el bàner; es pot acceptar, rebutjar o configurar, i modificar en qualsevol moment des de «Configura les cookies» al peu de pàgina.
4. Indicar que Formspree només rep dades quan s'envia un formulari i no instal·la cookies a la web.
5. Afegir la data d'última actualització.

## Avís legal

1. **LSSI art. 10**: falten el **domicili social** i les **dades d'inscripció al Registre Mercantil** (tom, foli, full).
2. Afegir que les simulacions de SavEnergy IA i de la web són **orientatives** i no constitueixen oferta contractual.
3. Opcional: jurisdicció (jutjats de Lleida) i data d'actualització.
