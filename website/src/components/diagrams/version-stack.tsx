const VERSIONS = ['v3 "third draft"', 'v2 "second draft"', 'v1 "first draft"'];

/** One S3 key as a stack of versions. `after` adds the delete marker on top, which turns the GET into a 404. */
export function VersionStack({ after = false }: { after?: boolean }) {
  const top = after ? 70 : 30;
  return (
    <svg viewBox="0 0 300 212" className="diagram" role="img" aria-label={after ? 'A versioned key after DELETE: a delete marker on top of three versions' : 'A versioned key with three versions'}>
      <text x="20" y="18" className="t-main">key: v/f.txt</text>
      {after && (
        <>
          <rect x="20" y="30" width="150" height="34" rx="3" className="b-deny" strokeDasharray="4 3" />
          <text x="32" y="51" className="t-deny">v4 delete marker</text>
        </>
      )}
      {VERSIONS.map((v, i) => (
        <g key={v}>
          <rect x="20" y={top + i * 44} width="150" height="34" rx="3" className="bx" />
          <text x="32" y={top + i * 44 + 21} className={i === 0 && !after ? 't-main' : undefined}>{v}</text>
        </g>
      ))}
      <path d="M196 47H176" className="ln" />
      <text x="200" y="52" className="t-main">GET</text>
      <text x="200" y="66" className={after ? 't-deny' : 't-ok'}>{after ? '404 NoSuchKey' : '200  (v3)'}</text>
    </svg>
  );
}
