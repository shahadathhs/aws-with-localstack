import type { Copy } from '@/lib/copy';

export function Curriculum({ t }: { t: Copy['curriculum'] & { phases: Copy['phases'] } }) {
  return (
    <table className="ledger">
      <thead>
        <tr>
          <th>{t.phase}</th>
          <th>{t.topic}</th>
          <th className="hidden md:table-cell">{t.lessons}</th>
          <th className="st">{t.status}</th>
        </tr>
      </thead>
      <tbody>
        {t.phases.map((p) => (
          <tr key={p.n}>
            <td className="n">{p.n}</td>
            <td>
              <b>{p.title}</b>
              <div className="sub">{p.text}</div>
            </td>
            <td className="hidden md:table-cell">
              <span className="bar" aria-label={`${p.done}/${p.lessons}`}>
                {Array.from({ length: p.lessons }, (_, i) => (
                  <i key={i} className={i < p.done ? 'on' : ''} />
                ))}
              </span>
            </td>
            <td className={`st ${p.status}`}>{t.statuses[p.status]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
