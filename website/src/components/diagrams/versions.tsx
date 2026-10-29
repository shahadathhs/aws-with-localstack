/** S3 version stack: a delete pushes a marker, so a plain GET is a 404 while old versions remain. */
export function VersionsDiagram() {
  return (
    <svg viewBox="0 0 300 190" className="diagram" role="img" aria-label="An S3 key as a stack of three versions, the newest being a delete marker">
      <defs>
        <marker id="a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0L8 4L0 8z" fill="var(--text2)" />
        </marker>
      </defs>
      <text x="20" y="22" className="t-main">key: note.txt</text>
      <rect x="20" y="34" width="150" height="38" rx="3" className="b-deny" strokeDasharray="4 3" />
      <text x="32" y="57" className="t-deny">v3 delete marker</text>
      <rect x="20" y="78" width="150" height="38" rx="3" className="bx" />
      <text x="32" y="101" className="t-main">v2 &quot;second draft&quot;</text>
      <rect x="20" y="122" width="150" height="38" rx="3" className="bx" />
      <text x="32" y="145">v1 &quot;first draft&quot;</text>
      <path d="M200 53H176" className="ln" markerEnd="url(#a)" />
      <text x="206" y="50" className="t-main">GET</text>
      <text x="206" y="64" className="t-deny">404</text>
      <path d="M200 97H176" className="ln" />
      <text x="206" y="94">?versionId=v2</text>
      <text x="206" y="108" className="t-ok">200</text>
      <text x="20" y="178">3 entries stored, 3 billed</text>
    </svg>
  );
}
