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
