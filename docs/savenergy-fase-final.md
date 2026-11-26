# SavEnergy IA · fase final de seguretat, privacitat i fiabilitat (26/11/2026)

Branca `feature/savenergy-web` dels dos repositoris. Res d'això toca `main`, producció, credencials ni dominis.

## Resultats de les proves automàtiques

| Suite | Resultat |
|---|---|
| CRM · `npm test` (Vitest, inclou PostgreSQL real amb PGlite) | 3.104 proves passen. Fallen 45, les mateixes que ja fallen a `main` (WhatsApp IA 41, cron de Vercel 2, alta de contractes 1, correu de leads 1); cap és de SavEnergy. |
| CRM · `tests/db/savenergy-072.test.ts` | 8/8: límit de peticions atòmic (també amb peticions simultànies) i revisió de permisos de les 9 taules i totes les funcions `sev_*`. |
| CRM · `tests/savenergy-seguretat.test.ts` | 18/18: signatura amb IP, minimització de dades cap a la IA i aptitud de tarifes amb el motor real. |
| CRM · `tests/savenergy-server.test.ts` | 86/86: flux complet, inclosos leads simultanis, neteja, límit de peticions i panell. |
| Web · `npm run e2e:savenergy` (Playwright contra un CRM simulat) | Totes les comprovacions passen, incloses les noves de Turnstile, signatura versió 2 i política de privacitat. |

Totes les proves fan servir dades fictícies. No s'ha fet cap consulta real al SIPS ni a la IA.

## Què NO s'ha pogut verificar des d'aquí

- **Les 57 tarifes autoritzades de les 218 importades.** El validador és fet i provat amb el motor real sobre tarifes de prova, però no s'ha pogut executar sobre el catàleg real perquè aquesta sessió no té accés a la base de dades. Cal obrir el panell (SavEnergy IA → Configuració) o executar `scripts/savenergy-valida-tarifes.ts` contra el projecte de proves i revisar-ne l'informe: aptes, excloses per motiu i permanències incompletes (s'esperen les 33 detectades).
- **El text legal.** L'apartat 11 de la Política de privacitat està redactat i publicat a la branca, però l'ha de validar l'assessor legal (vegeu `legal-canvis-proposats.md`).
- **El Supabase Cron**: el fitxer està preparat; s'ha d'executar al projecte de Supabase i comprovar-ne les tres consultes finals.

## Criteris d'aptitud de les tarifes

Una tarifa és **apta** si és d'electricitat 2.0TD/3.0TD/6.1TD o de gas RL.x, és vigent, està validada per Administració, el motor la calcula amb un subministrament de referència que compleix les seves pròpies condicions, i no té cap d'aquests motius d'exclusió: restricció en text lliure que no es pot comprovar amb una factura; preu indexat, mixt o amb FEE sense preus de referència amb la seva metodologia; SAS variable sense import; conversió pendent de validar; contradicció de permanència.

Una **permanència sense durada o penalització** no exclou la tarifa: es detecta, es compta i s'avisa, i al resultat consta com a permanència amb condicions per confirmar. No s'hi inventa cap valor. El panell permet seleccionar «només aptes amb la permanència completa» si es prefereix no mostrar-les.

En **3.0TD i 6.1TD**, els trams d'elegibilitat per potència s'avaluen amb la P6. Si les potències llegides no són creixents de P1 a P6, la comparativa no es calcula i es deriva a un assessor.
