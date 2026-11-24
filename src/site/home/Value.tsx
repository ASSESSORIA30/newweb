import type { Dictionary } from "../i18n/ca";

/** Quiet passage after the dense ones: two columns of statements, people first. */
export function Value({ t }: { t: Dictionary }) {
  const [first, ...rest] = t.value.items;
  return (
    <section className="s-value" aria-labelledby="s-value-title">
      <div className="s-wrap s-value__grid">
        <div className="s-value__lead">
          <h2 id="s-value-title" className="s-h2">
            {t.value.title}
          </h2>
          <div className="s-value__human">
            <svg viewBox="0 0 120 100" aria-hidden="true">
              <path d="M60 92 C 20 64, 6 44, 14 26 C 22 8, 46 8, 60 26 C 74 8, 98 8, 106 26 C 114 44, 100 64, 60 92 Z" />
              <path d="M34 52 L52 40 Q58 36 64 40 L84 54" />
            </svg>
            <h3>{first.t}</h3>
            <p>{first.d}</p>
          </div>
        </div>
        <ul className="s-value__list">
          {rest.map((v) => (
            <li key={v.t}>
              <h3>{v.t}</h3>
              <p>{v.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
