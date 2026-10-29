import { Svg, Txt } from './kit';

const FIELDS = [
  { key: 'Effect', value: '"Allow"', color: 'var(--c2)', note: 'allow or deny' },
  { key: 'Action', value: '"s3:GetObject"', color: 'var(--c1)', note: 'which API calls' },
  { key: 'Resource', value: '"arn:aws:s3:::ph1-bucket/*"', color: 'var(--c3)', note: 'which things (ARNs)' },
  { key: 'Condition', value: '{ … }', color: 'var(--c5)', note: 'optional: only when…' },
];

/** One policy statement, field by field, each colour-coded against a plain-language legend. */
export function PolicyStatement() {
  return (
    <Svg label="Anatomy of an IAM policy statement: effect, action, resource, condition">
      <Txt x={12} y={22}>{'{'}</Txt>
      {FIELDS.map((f, i) => (
        <text key={f.key} x={24} y={44 + i * 20} style={{ fontSize: 10.5 }}>
          <tspan fill={f.color}>{`"${f.key}"`}</tspan>
          <tspan fill="var(--text3)">: </tspan>
          <tspan fill="var(--text)">{f.value}</tspan>
        </text>
      ))}
      <Txt x={12} y={126}>{'}'}</Txt>
      {FIELDS.map((f, i) => (
        <g key={f.key}>
          <circle cx="16" cy={147 + i * 12 - 3} r="3.5" fill={f.color} />
          <Txt x={26} y={147 + i * 12}>{`${f.key}  ${f.note}`}</Txt>
        </g>
      ))}
    </Svg>
  );
}
