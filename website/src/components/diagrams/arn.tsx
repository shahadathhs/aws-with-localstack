const PARTS = [
  { name: 'partition', value: 'aws', color: 'var(--c1)' },
  { name: 'service', value: 'sqs', color: 'var(--c2)' },
  { name: 'region', value: 'eu-west-1', color: 'var(--c3)' },
  { name: 'account', value: '000000000000', color: 'var(--c4)' },
  { name: 'resource', value: 'orders', color: 'var(--c5)' },
];

/** ARN anatomy: five colon-separated fields, each colour-coded in the string and the legend. */
export function ArnDiagram() {
  return (
    <svg viewBox="0 0 300 190" className="diagram" role="img" aria-label="Anatomy of an ARN: partition, service, region, account, resource">
      <text x="14" y="30" style={{ fontSize: 11 }}>
        <tspan fill="var(--text3)">arn</tspan>
        {PARTS.map((p) => (
          <tspan key={p.name}>
            <tspan fill="var(--text3)">:</tspan>
            <tspan fill={p.color}>{p.value}</tspan>
          </tspan>
        ))}
      </text>
      {PARTS.map((p, i) => (
        <g key={p.name}>
          <circle cx="22" cy={62 + i * 24} r="4" fill={p.color} />
          <text x="34" y={66 + i * 24}>{p.name}</text>
          <text x="132" y={66 + i * 24} className="t-main">{p.value}</text>
        </g>
      ))}
    </svg>
  );
}
