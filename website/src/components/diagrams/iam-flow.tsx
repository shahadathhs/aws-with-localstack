/** IAM evaluation order: explicit deny, then explicit allow, otherwise an implicit deny. */
export function IamFlowDiagram() {
  return (
    <svg viewBox="0 0 300 190" className="diagram" role="img" aria-label="IAM evaluation: explicit deny wins, then explicit allow, otherwise implicit deny">
      <rect x="14" y="14" width="124" height="34" rx="3" className="bx" />
      <text x="26" y="35" className="t-main">explicit Deny?</text>
      <path d="M138 31H186" className="ln" />
      <text x="150" y="25">yes</text>
      <rect x="186" y="14" width="100" height="34" rx="3" className="b-deny" />
      <text x="212" y="35" className="t-deny">DENY</text>
      <path d="M76 48V76" className="ln" />
      <text x="82" y="66">no</text>
      <rect x="14" y="76" width="124" height="34" rx="3" className="bx" />
      <text x="26" y="97" className="t-main">explicit Allow?</text>
      <path d="M138 93H186" className="ln" />
      <text x="150" y="87">yes</text>
      <rect x="186" y="76" width="100" height="34" rx="3" className="b-ok" />
      <text x="208" y="97" className="t-ok">ALLOW</text>
      <path d="M76 110V138" className="ln" />
      <text x="82" y="128">no</text>
      <rect x="14" y="138" width="124" height="34" rx="3" className="bx" strokeDasharray="4 3" />
      <text x="26" y="159">nothing matched</text>
      <path d="M138 155H186" className="ln" />
      <rect x="186" y="138" width="100" height="34" rx="3" className="b-deny" strokeDasharray="4 3" />
      <text x="196" y="159" className="t-deny" style={{ fontSize: 10 }}>implicit DENY</text>
    </svg>
  );
}
