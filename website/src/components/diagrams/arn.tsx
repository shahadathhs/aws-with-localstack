const FIELDS = [
  { name: 'partition', color: 'var(--c1)' },
  { name: 'service', color: 'var(--c2)' },
  { name: 'region', color: 'var(--c3)' },
  { name: 'account', color: 'var(--c4)' },
  { name: 'resource', color: 'var(--c5)' },
];

const DEFAULT_ARN = 'arn:aws:sqs:eu-west-1:000000000000:orders';

/** Splits `arn:partition:service:region:account:resource`; the resource may itself contain colons. */
function parseArn(arn: string) {
  const [, ...rest] = arn.split(':');
  const values = [...rest.slice(0, 4), rest.slice(4).join(':')];
  return FIELDS.map((f, i) => ({ ...f, value: values[i] ?? '' }));
}

/** ARN anatomy: five colon-separated fields, each colour-coded in the string and the legend. */
export function ArnDiagram({ arn = DEFAULT_ARN }: { arn?: string }) {
  const PARTS = parseArn(arn);
  return (
    <svg viewBox="0 0 300 190" className="diagram" role="img" aria-label="Anatomy of an ARN: partition, service, region, account, resource">
      <text x="14" y="30" style={{ fontSize: Math.min(11, 280 / (arn.length * 0.62)) }}>
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
          <text x="132" y={66 + i * 24} className={p.value ? 't-main' : undefined}>{p.value || '(empty)'}</text>
        </g>
      ))}
    </svg>
  );
}
