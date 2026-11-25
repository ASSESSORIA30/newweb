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
  for (const cb of await panel.locator("input[type=checkbox]").all()) await cb.check();
  await panel.locator("input[type=file]").setInputFiles(PDF);
  await p.waitForSelector(".s-live__grid", { timeout: 15000 });

  // confirmació: es marquen per revisar EXACTAMENT els camps que el CRM ha marcat (inclòs el consum anual), i cap altre
  const flagged = await p.locator(".s-live__grid .s-field[data-invalid] input").evaluateAll((els) => els.map((e) => e.id.replace("sev-", "")).sort());
  ok(JSON.stringify(flagged) === JSON.stringify(["annualKwh", "kwh.P1"]), `${tag} · camps per revisar = els del CRM (${flagged.join(", ")})`);
  ok((await p.locator(".s-live__grid .s-field__hint").count()) === 2, `${tag} · cada camp per revisar porta l'avís`);
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
  for (const cb of await panel.locator("input[type=checkbox]").all()) await cb.check();
  await panel.locator("input[type=file]").setInputFiles(PDF);
  await p.waitForSelector(".s-live__grid", { timeout: 15000 });
  await p.locator(".s-live__panel button[type=submit]").click();
  await p.waitForSelector(".s-res__num");
  ok((await p.locator(".s-res__num").innerText()).replace(/\s/g, "") === "364€", "moviment reduït · xifra final immediata, sense comptador");
  await ctx.close();
}

const log = await (await fetch(`http://localhost:${CRM}/__log`)).json();
const ops = log.filter((x) => x.op !== "upload");
ok(ops.length > 0 && ops.every((x) => x.sigOk), "totes les peticions al CRM porten una signatura vàlida");
const sess = ops.find((x) => x.op === "session");
ok(sess && !("turnstileToken" in sess.data) && sess.data.turnstile === "verificat", "Turnstile validat al servidor de la web i no reenviat");
ok(sess.data.ref === "col. c34" && sess.data.utm?.source === "prova", "codi de col·laborador històric i UTM reenviats");
ok(sess.data.consents.privacitat_servei === true && sess.data.consents.factura_temporal === true && sess.data.consentVersion === "2026-11-sev1", "consentiments i versió enviats");
const confirms = ops.filter((x) => x.op === "confirm");
ok(confirms.length === 3 && confirms.every((x) => x.data.values.annualKwh === 2253 && x.data.values["kwh.P1"] === 80), "la confirmació envia tots els valors, inclòs el consum anual");
const lead = ops.find((x) => x.op === "lead");
ok(lead && lead.data.phone === "600111222" && lead.data.acceptCommercial === false && /^[0-9a-f-]{36}$/.test(lead.data.idempotencyKey), "lead: telèfon, clau d'idempotència i consentiment");
ok(log.filter((x) => x.op === "upload").length === 3, "la factura es puja directament a l'URL signada");

await browser.close();
stop();
console.log(failed ? `\n${failed} comprovacions han fallat` : "\nTotes les comprovacions han passat");
process.exit(failed ? 1 : 0);
