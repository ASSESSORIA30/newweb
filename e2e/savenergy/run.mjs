#!/usr/bin/env node
/**
 * Proves de punta a punta del comparador SavEnergy IA contra un CRM SIMULAT (valida la signatura de cada petició).
 * Sense dades reals: Turnstile i la pujada són simulats, i Formspree no ha de rebre res d'aquest flux.
 *
 *   NEXT_PUBLIC_SAVENERGY_ENABLED=true NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAATESTKEY npm run build
 *   node e2e/savenergy/run.mjs
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium, devices } = require("playwright");
const WEB = 3210, CRM = 4210, SECRET = "k".repeat(40), PDF = path.join(here, "factura-sintetica.pdf");
let failed = 0;
const ok = (c, m) => { console.log(c ? "ok  " : "FAIL", m); if (!c) failed += 1; };
const start = (cmd, args, env) => spawn(cmd, args, { env: { ...process.env, ...env }, stdio: "ignore" });
const mock = start(process.execPath, [path.join(here, "mock-crm.mjs")], { SECRET, PORT: String(CRM) });
const web = start("npx", ["next", "start", "-p", String(WEB)], { SAVENERGY_CRM_URL: `http://localhost:${CRM}`, SAVENERGY_SHARED_SECRET: SECRET, TURNSTILE_SECRET_KEY: "test-secret", TURNSTILE_VERIFY_URL: `http://localhost:${CRM}/turnstile`, NEXT_PUBLIC_SAVENERGY_ENABLED: "true" });
const stop = () => { mock.kill(); web.kill(); };
process.on("exit", stop);
for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://localhost:${WEB}/`)).ok) break; } catch { /* arrencant */ } await new Promise((r) => setTimeout(r, 500)); }

const browser = await chromium.launch();
const TURNSTILE = 'window.turnstile={render:(el,o)=>{setTimeout(()=>o.callback("ok-token-0123456789"),50);return "w1"},reset(){},remove(){}};';
for (const [lang, opts, tag] of [["", { viewport: { width: 1440, height: 900 } }, "ca-escriptori"], ["es", { ...devices["iPhone 14"] }, "es-mobil"]]) {
  const desktop = !opts.isMobile;
  const ctx = await browser.newContext(opts);
  const p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  let formspree = 0;
  await p.route("https://formspree.io/**", (r) => { formspree += 1; r.fulfill({ status: 200, body: "{}" }); });
  await p.route("https://challenges.cloudflare.com/**", (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: TURNSTILE }));
  await p.addInitScript(() => localStorage.setItem("a30.consent.v1", JSON.stringify({ v: 1, analytics: true, at: "x" })));
  await p.goto(`http://localhost:${WEB}/${lang}?ref=col.%20c34&utm_source=prova`, { waitUntil: "networkidle" });

  // CTA del hero: salt directe al formulari, sense la presentació animada
  ok((await p.locator("#savenergy-console").count()) === 1 && (await p.locator(".g-sav__console#savenergy-console").count()) === 1, `${tag} · un sol ancoratge #savenergy-console, al contenidor`);
  await p.locator(".g-hero__actions a").first().click();
  await p.waitForTimeout(400);
  const top = await p.evaluate(() => Math.round(document.getElementById("savenergy-console").getBoundingClientRect().top));
  ok(Math.abs(top - 88) <= 4, `${tag} · «Analitza la factura» salta al formulari (${top}px)`);
  ok((await p.locator(".s-console__foot").count()) === 0, `${tag} · sense l'avís de simulació amb el comparador real`);

  // consentiments obligatoris
  const panel = p.locator(".s-live").first();
  await panel.locator(".s-btn--primary").click();
  ok((await panel.locator("[role=alert]").count()) > 0, `${tag} · calen els consentiments abans de triar la factura`);
  for (const cb of await panel.locator(".s-check:not([data-sips-consent]) input[type=checkbox]").all()) await cb.check();
  await panel.locator("input[type=file]").setInputFiles(PDF);
  await p.waitForSelector(".s-live__grid", { timeout: 15000 });

  // confirmació: es marquen per revisar EXACTAMENT els camps que el CRM ha marcat (inclòs el consum anual), i cap altre
  const flagged = await p.locator(".s-live__grid .s-field[data-invalid] input").evaluateAll((els) => els.map((e) => e.id.replace("sev-", "")).sort());
  ok(JSON.stringify(flagged) === JSON.stringify(["annualKwh", "kwh.P1"]), `${tag} · camps per revisar = els del CRM (${flagged.join(", ")})`);
  ok((await p.locator(".s-live__grid .s-field__hint").count()) === 2, `${tag} · cada camp per revisar porta l'avís`);
  ok((await p.locator("#sev-priceMode").inputValue()) === "periodes" && (await p.locator('[id="sev-energyPrice.P1"]').count()) === 1 && (await p.locator('[id="sev-promoKwh"]').count()) === 0, `${tag} · modalitat «per franges»: preus P1–P3 i cap camp d'hores promocionades`);
  ok((await p.locator('[id="sev-annualKwh"]').inputValue()) === "2253" && (await p.locator('[id="sev-kwh.P2"]').inputValue()) === "70", `${tag} · valors llegits presentats per confirmar`);
  const confirmText = await p.locator(".s-live__panel").innerText();
  ok(/ES•+5678JN/.test(confirmText), `${tag} · CUPS emmascarat`);
  await p.locator(".s-live__panel button[type=submit]").click();
  await p.waitForSelector(".s-res", { timeout: 10000 });
  await p.waitForTimeout(1300);

  // resum del millor estalvi (dades del resultat real)
  const hero = await p.locator(".s-res").innerText();
  ok(/364\s*€/.test(hero) && /30\s*€/.test(hero) && /33,7\s*%/.test(hero) && /1\.?079\s*€/.test(hero) && /715\s*€/.test(hero), `${tag} · resum: estalvi anual, mensual, %, cost actual i nou cost`);
  ok((await p.locator(".s-res__num").innerText()).replace(/\s/g, "") === "364€", `${tag} · el comptador acaba a la xifra real`);
  const size = await p.locator(".s-res__num").evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  ok(desktop ? size >= 56 && size <= 64 : size >= 44 && size < 56, `${tag} · xifra principal de ${Math.round(size)}px`);
  ok((await p.locator(".s-res__tag").count()) === 1 && (await p.locator(".s-live__note--key").count()) === 1, `${tag} · avís d'estimació orientativa visible`);
  // targetes
  const cards = p.locator(".s-offer");
  ok((await cards.count()) === 3, `${tag} · tres targetes d'oferta`);
  ok((await p.locator(".s-offer[data-best]").count()) === 1 && (await cards.first().locator(".s-offer__badge").count()) === 1 && (await p.locator(".s-offer__badge").count()) === 1, `${tag} · només la primera porta l'etiqueta de major estalvi`);
  const names = await p.locator(".s-offer__name").allInnerTexts();
  ok(names.join("|") === "Comercialitzadora A|Comercialitzadora B|Comercialitzadora C", `${tag} · comercialitzadores anonimitzades i en l'ordre del CRM`);
  const cardSize = await cards.first().locator(".s-offer__saving b").evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  ok(cardSize >= 36 && cardSize <= 44, `${tag} · estalvi de la targeta de ${Math.round(cardSize)}px`);
  const widths = await p.locator(".s-offer__bar[data-new] i").evaluateAll((els) => els.map((e) => parseFloat(e.style.width)));
  ok(Math.abs(widths[0] - (715.13 / 1079.09) * 100) < 0.5 && widths[0] < widths[1] && widths[1] < widths[2], `${tag} · barres proporcionals al cost (${widths.map((w) => w.toFixed(0)).join(" / ")} %)`);
  const second = await cards.nth(1).innerText();
  ok(!/Perman[eè]ncia:\s*Perman/i.test(second) && (second.match(/12 mes[eo]s/g) ?? []).length === 2 && !/garanti[tz]/i.test(second.replace(/Garant[ií]a? de pre[cu]i?o?/i, "")), `${tag} · sense duplicats de permanència ni de garantia de preu`);
  await cards.first().locator("summary").click();
  ok(/2027-06-30/.test(await cards.first().locator(".s-offer__more").innerText()), `${tag} · les condicions secundàries són al desplegable`);
  const cols = await cards.evaluateAll((els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().left))).size);
  ok(desktop ? cols === 3 : cols === 1, `${tag} · ${desktop ? "tres targetes en horitzontal" : "targetes en vertical"}`);
  ok((await p.evaluate(() => document.documentElement.scrollWidth)) <= (opts.viewport?.width ?? 390) + 1, `${tag} · sense desbordament horitzontal`);
  if (process.env.SHOTS) {
    await p.evaluate(() => window.scrollTo(0, document.querySelector(".s-res").getBoundingClientRect().top + scrollY - 100));
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(process.env.SHOTS, `resultat-${tag}.png`), fullPage: false });
  }

  // conversió
  const cta = p.locator(".s-res__btn");
  ok(/Vull aconseguir aquest estalvi|Quiero conseguir este ahorro/.test(await cta.innerText()) && /Sense compromís|Sin compromiso/.test(await p.locator(".s-res__cta-note").innerText()), `${tag} · botó principal i text de confiança`);
  ok(!/garantit|garantizado/i.test(hero), `${tag} · cap promesa d'estalvi garantit al resum`);
  await cta.click();
  await p.waitForSelector("#sev-name");
  await p.locator(".s-live__panel button[type=submit]").click();
  ok((await p.locator(".s-live__panel [role=alert]").count()) >= 2, `${tag} · validació del formulari de contacte`);
  await p.fill("#sev-name", "Prova Sintètica"); await p.fill("#sev-phone", "600 111 222");
  await p.locator(".s-live__panel input[type=checkbox]").first().check();
  ok(!(await p.locator(".s-live__panel input[type=checkbox]").nth(1).isChecked()), `${tag} · consentiment comercial desmarcat per defecte`);
  await p.locator(".s-live__panel button[type=submit]").click();
  await p.waitForSelector(".s-live.s-done", { timeout: 10000 });
  ok(formspree === 0, `${tag} · el lead de SavEnergy no va a Formspree`);
  ok(errs.length === 0, `${tag} · sense errors de pàgina ${errs.join("|")}`);
  await ctx.close();
}

// moviment reduït: la xifra surt directament, sense comptador
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.route("https://challenges.cloudflare.com/**", (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: TURNSTILE }));
  await p.addInitScript(() => localStorage.setItem("a30.consent.v1", JSON.stringify({ v: 1, analytics: false, at: "x" })));
  await p.goto(`http://localhost:${WEB}/`, { waitUntil: "networkidle" });
  await p.evaluate(() => window.dispatchEvent(new CustomEvent("a30:savenergy-mode", { detail: "upload" })));
  const panel = p.locator(".s-live").first();
  for (const cb of await panel.locator(".s-check:not([data-sips-consent]) input[type=checkbox]").all()) await cb.check();
  await panel.locator("input[type=file]").setInputFiles(PDF);
  await p.waitForSelector(".s-live__grid", { timeout: 15000 });
  await p.locator(".s-live__panel button[type=submit]").click();
  await p.waitForSelector(".s-res__num");
  ok((await p.locator(".s-res__num").innerText()).replace(/\s/g, "") === "364€", "moviment reduït · xifra final immediata, sense comptador");
  await ctx.close();
}

// hores promocionades: el formulari mostra les dues franges comercials ja llegides, no tres preus buits, i es pot corregir la modalitat
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.route("https://challenges.cloudflare.com/**", (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: TURNSTILE }));
  await p.addInitScript(() => localStorage.setItem("a30.consent.v1", JSON.stringify({ v: 1, analytics: false, at: "x" })));
  await p.goto(`http://localhost:${WEB}/?utm_source=promo`, { waitUntil: "networkidle" });
  await p.evaluate(() => window.dispatchEvent(new CustomEvent("a30:savenergy-mode", { detail: "upload" })));
  const panel = p.locator(".s-live").first();
  for (const cb of await panel.locator(".s-check:not([data-sips-consent]) input[type=checkbox]").all()) await cb.check();
  await panel.locator("input[type=file]").setInputFiles(PDF);
  await p.waitForSelector(".s-live__grid", { timeout: 15000 });
  const ids = () => p.locator(".s-live__grid input").evaluateAll((els) => els.map((e) => e.id.replace("sev-", "")));
  const v = (k) => p.locator(`[id="sev-${k}"]`).inputValue();
  ok((await p.locator("#sev-priceMode").inputValue()) === "hores_promocionades", "promo · modalitat detectada: hores promocionades");
  let shown = await ids();
  ok(["promoKwh", "promoPrice", "restKwh", "restPrice"].every((k) => shown.includes(k)) && !shown.some((k) => k.startsWith("energyPrice.")), `promo · es mostren les franges comercials i cap preu P1–P3 (${shown.join(", ")})`);
  ok((await v("promoKwh")) === "212,72" && (await v("promoPrice")) === "0,1349" && (await v("restKwh")) === "369,48" && (await v("restPrice")) === "0,26371", "promo · consums i preus comercials ja omplerts amb la lectura");
  ok((await p.locator("[data-mode-note]").count()) === 1 && (await p.locator(".s-live__grid .s-field[data-invalid]").count()) === 0, "promo · explicació de la modalitat i cap camp per introduir a mà");
  ok((await v("kwh.P1")) === "80" && (await v("kwh.P3")) === "110", "promo · els consums per períodes d'accés es conserven a part");
  // correcció manual de la modalitat: cada opció mostra exclusivament els seus camps
  await p.selectOption("#sev-priceMode", "fix24h");
  shown = await ids();
  ok(shown.includes("energyPrice.24h") && !shown.includes("promoKwh") && !shown.includes("energyPrice.P1"), "promo · «fix 24 h» mostra un únic camp de preu");
  await p.selectOption("#sev-priceMode", "periodes");
  shown = await ids();
  ok(["energyPrice.P1", "energyPrice.P2", "energyPrice.P3"].every((k) => shown.includes(k)) && !shown.includes("promoKwh") && !shown.includes("energyPrice.24h"), "promo · «per franges» mostra P1, P2 i P3");
  await p.selectOption("#sev-priceMode", "desconegut");
  ok(!(await ids()).some((k) => /energyPrice|promo|rest/.test(k)), "promo · «no ho sé» no demana cap preu d'energia");
  await p.selectOption("#sev-priceMode", "hores_promocionades");
  ok((await v("promoPrice")) === "0,1349", "promo · en tornar a la modalitat detectada es conserven els valors llegits");
  ok((await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)), "promo · sense desbordament horitzontal");
  await p.locator(".s-live__panel button[type=submit]").click();
  await p.waitForSelector(".s-res__num");
  ok(errs.length === 0, `promo · sense errors de pàgina ${errs.join("|")}`);
  await ctx.close();
}

// 3.0TD d'empresa: el formulari s'adapta als sis períodes d'energia i de potència
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.route("https://challenges.cloudflare.com/**", (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: TURNSTILE }));
  await p.addInitScript(() => localStorage.setItem("a30.consent.v1", JSON.stringify({ v: 1, analytics: false, at: "x" })));
  await p.goto(`http://localhost:${WEB}/?utm_source=tri`, { waitUntil: "networkidle" });
  await p.evaluate(() => window.dispatchEvent(new CustomEvent("a30:savenergy-mode", { detail: "upload" })));
  const panel = p.locator(".s-live").first();
  for (const cb of await panel.locator(".s-check:not([data-sips-consent]) input[type=checkbox]").all()) await cb.check();
  await panel.locator("input[type=file]").setInputFiles(PDF);
  await p.waitForSelector(".s-live__grid", { timeout: 15000 });
  const ids = await p.locator(".s-live__grid input").evaluateAll((els) => els.map((e) => e.id.replace("sev-", "")));
  const all6 = (k) => [1, 2, 3, 4, 5, 6].every((i) => ids.includes(`${k}.P${i}`));
  ok((await p.locator(".s-live__panel").getAttribute("data-periods")) === "6/6" && all6("kwh") && all6("kw") && all6("energyPrice") && all6("powerPrice"), "3.0TD · sis períodes d'energia i sis de potència, amb els seus preus");
  ok((await p.locator('[id="sev-kw.P6"]').inputValue()) === "45" && (await p.locator('[id="sev-energyPrice.P6"]').inputValue()) === "0,11", "3.0TD · valors llegits presentats, inclosa la potència P6");
  ok(/Consum P6/.test(await p.locator('label[for="sev-kwh.P6"]').innerText()) && /Potència P6/.test(await p.locator('label[for="sev-kw.P6"]').innerText()), "3.0TD · etiquetes genèriques P1–P6");
  const opts = await p.locator("#sev-priceMode option").evaluateAll((els) => els.map((e) => e.value));
  ok(!opts.includes("hores_promocionades") && opts.includes("periodes") && opts.includes("indexat"), `3.0TD · modalitats de sis períodes (${opts.join(", ")})`);
  ok((await p.locator("#sev-customerKind").count()) === 0, "3.0TD · titular empresa identificat: no es torna a preguntar");
  ok((await p.locator("[data-limit]").count()) === 1 && /18,50 € d'energia reactiva/.test(await p.locator("[data-limit]").innerText()), "3.0TD · limitació indicada: la reactiva no entra a la comparativa");
  await p.selectOption("#sev-priceMode", "fix24h");
  ok((await p.locator('[id="sev-energyPrice.24h"]').count()) === 1 && (await p.locator('[id="sev-energyPrice.P1"]').count()) === 0 && (await p.locator('[id="sev-powerPrice.P6"]').count()) === 1, "3.0TD · «fix 24 h» mostra un sol preu d'energia i conserva els sis de potència");
  await p.selectOption("#sev-priceMode", "periodes");
  ok((await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)), "3.0TD · sense desbordament horitzontal");
  await p.locator(".s-live__panel button[type=submit]").click();
  await p.waitForSelector(".s-res__num");
  ok(errs.length === 0, `3.0TD · sense errors de pàgina ${errs.join("|")}`);
  await ctx.close();
}

// SIPS amb autorització expressa: casella opcional i desmarcada; amb l'autorització, el resultat indica l'origen dels consums
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.route("https://challenges.cloudflare.com/**", (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: TURNSTILE }));
  await p.addInitScript(() => localStorage.setItem("a30.consent.v1", JSON.stringify({ v: 1, analytics: false, at: "x" })));
  await p.goto(`http://localhost:${WEB}/?utm_source=sips`, { waitUntil: "networkidle" });
  await p.evaluate(() => window.dispatchEvent(new CustomEvent("a30:savenergy-mode", { detail: "upload" })));
  const panel = p.locator(".s-live").first();
  await p.waitForSelector("[data-sips-consent]");
  const box = panel.locator("[data-sips-consent] input");
  ok(!(await box.isChecked()) && /autoritzo la consulta dels meus consums al SIPS/.test(await panel.locator("[data-sips-consent]").innerText()), "sips · autorització expressa, opcional i desmarcada per defecte");
  for (const cb of await panel.locator("input[type=checkbox]").all()) await cb.check();
  await panel.locator("input[type=file]").setInputFiles(PDF);
  await p.waitForSelector(".s-live__grid", { timeout: 15000 });
  ok((await p.locator('[data-sips="ok"]').count()) === 1 && /3\.?420 kWh \(01\/11\/2025 – 31\/10\/2026\)/.test(await p.locator("[data-sips]").innerText()), "sips · el formulari informa del consum anual real obtingut");
  ok(!/ES\d{16}/.test(await p.locator(".s-live__panel").innerText()), "sips · el CUPS complet no es mostra mai");
  await p.locator(".s-live__panel button[type=submit]").click();
  await p.waitForSelector(".s-res__num");
  ok((await p.locator('[data-consumption="sips"]').count()) === 1 && /Origen dels consums: Consum anual real del SIPS \(01\/11\/2025 – 31\/10\/2026\)/.test(await p.locator("[data-consumption]").innerText()), "sips · el resultat mostra l'origen dels consums");
  ok(errs.length === 0, `sips · sense errors de pàgina ${errs.join("|")}`);
  await ctx.close();
}

// factura antiga i indexada, amb titular dubtós: es mostra el període per corregir-lo i el resultat és només orientatiu
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.route("https://challenges.cloudflare.com/**", (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: TURNSTILE }));
  await p.addInitScript(() => localStorage.setItem("a30.consent.v1", JSON.stringify({ v: 1, analytics: false, at: "x" })));
  await p.goto(`http://localhost:${WEB}/?utm_source=antiga`, { waitUntil: "networkidle" });
  await p.evaluate(() => window.dispatchEvent(new CustomEvent("a30:savenergy-mode", { detail: "upload" })));
  const panel = p.locator(".s-live").first();
  for (const cb of await panel.locator(".s-check:not([data-sips-consent]) input[type=checkbox]").all()) await cb.check();
  await panel.locator("input[type=file]").setInputFiles(PDF);
  await p.waitForSelector(".s-live__grid", { timeout: 15000 });
  ok((await p.locator('[data-notice="factura_antiga"]').count()) === 1 && /antiga/.test(await p.locator("[data-notice]").innerText()), "antiga · avís de factura antiga abans de comparar (no es bloqueja)");
  ok((await p.locator("#sev-periodFrom").inputValue()) === "2024-01-05" && (await p.locator("#sev-periodTo").inputValue()) === "2024-02-04", "antiga · es mostra el període detectat, editable");
  ok((await p.locator("#sev-customerKind").count()) === 1 && (await p.locator("#sev-customerKind").inputValue()) === "empresa", "antiga · titular dubtós: es demana confirmar el tipus de client");
  ok((await p.locator("#sev-priceMode").inputValue()) === "indexat" && (await p.locator('[id="sev-serviceFeeEur"]').inputValue()) === "5,01", "antiga · tarifa indexada i servei recurrent llegits");
  await p.selectOption("#sev-customerKind", "particular");
  await p.locator(".s-live__panel button[type=submit]").click();
  await p.waitForSelector(".s-res__num");
  const hero = await p.locator(".s-res").innerText();
  ok(/Estimació orientativa amb una factura antiga/.test(hero) && (await p.locator("[data-stale]").count()) === 1 && !/Hem trobat una oferta millor/.test(hero), "antiga · resultat presentat com a estimació orientativa, amb advertència");
  ok(!/d'estalvi estimat anual/.test(hero) && /amb els preus d'aquella factura/.test(hero), "antiga · no es presenta com un estalvi actual");
  ok((await p.locator("[data-variable]").count()) === 1 && /variable/.test(await p.locator("[data-variable]").innerText()), "antiga · el cost actual indexat s'identifica com a variable");
  ok((await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)) && errs.length === 0, `antiga · sense desbordament ni errors ${errs.join("|")}`);
  await ctx.close();
}

const log = await (await fetch(`http://localhost:${CRM}/__log`)).json();
const ops = log.filter((x) => x.op !== "upload");
ok(ops.length > 0 && ops.every((x) => x.sigOk), "totes les peticions al CRM porten una signatura vàlida");
const sess = ops.find((x) => x.op === "session");
const ov = ops.filter((x) => x.op === "confirm").map((x) => x.data.values).find((x) => x.periodTo === "2024-02-04");
ok(ov && ov.periodFrom === "2024-01-05" && ov.customerKind === "particular" && ov.serviceFeeEur === 5.01, "antiga · la confirmació envia el període, el tipus de client confirmat i el servei");
ok(ops.filter((x) => x.op === "confirm" && x.data.values.periodTo !== "2024-02-04" && x.data.values["kw.P6"] == null).every((x) => !("customerKind" in x.data.values) && x.data.values.periodTo === "2026-10-19"), "titular identificat: no es demana ni s'envia el tipus de client; el període llegit es confirma");
const tv = ops.filter((x) => x.op === "confirm").map((x) => x.data.values).find((x) => x["kw.P6"] != null);
ok(tv && tv["kw.P6"] === 45 && tv["kwh.P6"] === 1200 && tv["energyPrice.P6"] === 0.11 && tv["powerPrice.P6"] === 0.005 && tv.promoKwh === null && !("customerKind" in tv), "3.0TD · la confirmació envia els sis períodes d'energia, potència i preus");
const sessions = ops.filter((x) => x.op === "session");
ok(sessions.filter((x) => x.data.consents.sips_titular === true).length === 1 && sessions.filter((x) => x.data.consents.sips_titular === false).length === sessions.length - 1, "sips · l'autorització només s'envia quan el visitant la marca");
ok(ops.every((x) => !/"cups"/i.test(JSON.stringify(x.data))), "sips · el navegador no envia mai cap CUPS");
const pv = ops.filter((x) => x.op === "confirm").map((x) => x.data.values).find((x) => x.promoKwh != null);
ok(pv && pv.promoKwh === 212.72 && pv.promoPrice === 0.1349 && pv.restKwh === 369.48 && pv.restPrice === 0.26371 && pv["energyPrice.P1"] === null && pv["energyPrice.P3"] === null, "promo · la confirmació envia les franges comercials i cap preu assignat a P1–P3");
ok(sess && !("turnstileToken" in sess.data) && sess.data.turnstile === "verificat", "Turnstile validat al servidor de la web i no reenviat");
ok(sess.data.ref === "col. c34" && sess.data.utm?.source === "prova", "codi de col·laborador històric i UTM reenviats");
ok(sess.data.consents.privacitat_servei === true && sess.data.consents.factura_temporal === true && sess.data.consentVersion === "2026-11-sev1", "consentiments i versió enviats");
const confirms = ops.filter((x) => x.op === "confirm" && x.data.values.promoKwh == null && x.data.values.periodTo !== "2024-02-04" && x.data.values["kw.P6"] == null);
ok(confirms.every((x) => x.data.values.promoKwh === null && x.data.values["energyPrice.P1"] === 0.24), "per franges · s'envien P1–P3 i cap franja comercial");
ok(confirms.length === 4 && confirms.every((x) => x.data.values.annualKwh === 2253 && x.data.values["kwh.P1"] === 80), "la confirmació envia tots els valors, inclòs el consum anual");
const lead = ops.find((x) => x.op === "lead");
ok(lead && lead.data.phone === "600111222" && lead.data.acceptCommercial === false && /^[0-9a-f-]{36}$/.test(lead.data.idempotencyKey), "lead: telèfon, clau d'idempotència i consentiment");
ok(log.filter((x) => x.op === "upload").length === 7, "la factura es puja directament a l'URL signada");

await browser.close();
stop();
console.log(failed ? `\n${failed} comprovacions han fallat` : "\nTotes les comprovacions han passat");
process.exit(failed ? 1 : 0);
