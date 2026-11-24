import "@fontsource-variable/schibsted-grotesk/wght.css";
import "./selector.css";
import { Selector } from "@/components/Selector";
import { concepts } from "@/lib/concepts";
import { PageTransition } from "@/components/PageTransition";

const rows: { label: string; key: "signature" | "type" | "tech" }[] = [
  { label: "Moment signatura", key: "signature" },
  { label: "Tipografia", key: "type" },
  { label: "Tecnologia", key: "tech" },
];

const extra: Record<string, string[]> = {
  "Sensació": ["Futurista, immersiva, cinematogràfica", "Elegant, exclusiva, serena", "Dinàmica, tecnològica, propera"],
  "Fons": ["Fosc, amb una secció clara (testimonis)", "Alterna grafit i porcellana", "Clar, amb seccions fosques en diagonal"],
  "Risc": [
    "El fosc amb neó és un tòpic; l’evita la disciplina d’instrument",
    "El minimalisme pot semblar buit si falla el moviment",
    "La referència a Stripe és forta; les cintes han de ser pròpies",
  ],
};

export default function Home() {
  return (
    <PageTransition>
      <div className="sel">
        <header className="sel-head">
          <p className="sel-brand" translate="no">
            Assessoria 3.0
          </p>
          <h1>Tres propostes per a la nova pàgina principal</h1>
          <p className="sel-lede">
            Prototips navegables amb animacions reals, versió d’escriptori i mòbil. El protagonista de totes tres és
            SavEnergy IA, el comparador que llegeix la factura.
          </p>
        </header>

        <main>
          <Selector />

          <section className="sel-compare" aria-labelledby="sel-compare-title">
            <h2 id="sel-compare-title">Comparativa</h2>
            <div className="sel-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="sr-only">Aspecte</span>
                    </th>
                    {concepts.map((c) => (
                      <th key={c.key} scope="col">
                        {c.key} · {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(extra)
                    .slice(0, 2)
                    .map(([label, vals]) => (
                      <tr key={label}>
                        <th scope="row">{label}</th>
                        {vals.map((v, i) => (
                          <td key={i}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  {rows.map((r) => (
                    <tr key={r.key}>
                      <th scope="row">{r.label}</th>
                      {concepts.map((c) => (
                        <td key={c.key}>{c[r.key]}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">Risc</th>
                    {extra["Risc"].map((v, i) => (
                      <td key={i}>{v}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="sel-truth" aria-labelledby="sel-truth-title">
            <h2 id="sel-truth-title">Què és real i què és simulat</h2>
            <div className="sel-truth__cols">
              <div>
                <h3>Dades de la web actual (pendents de verificació)</h3>
                <ul>
                  <li>Serveis: llum, gas, fibra i mòbil, alarmes i assegurances.</li>
                  <li>+3.000 estudis, +500.000 € estalviats, més de 30 comercialitzadores.</li>
                  <li>Testimonis de M. R., J. L. i A. P. Es mostren amb l’etiqueta «pendents de verificació» fins que es confirmin expressament.</li>
                  <li>Oficines de Lleida, Badalona, L’Escala i Tarragona, telèfons i correu.</li>
                </ul>
              </div>
              <div>
                <h3>Simulat en aquesta fase</h3>
                <ul>
                  <li>L’anàlisi de SavEnergy IA: el fitxer no surt del navegador i no es connecta al CRM.</li>
                  <li>La factura d’exemple, el perfil horari i la xifra d’estalvi són dades sintètiques i s’hi indica.</li>
                  <li>Cap tarifa mostrada és real. La fase 2 connectarà lector, motor de comparatives i catàleg.</li>
                </ul>
              </div>
            </div>
          </section>
        </main>
        <footer className="sel-foot">Prototip local · no publicat</footer>
      </div>
    </PageTransition>
  );
}
