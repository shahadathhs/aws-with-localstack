import { Box, Line, Svg, Txt } from './kit';

const LAYERS = [
  { name: '1  CLI flags', note: '--region us-east-1' },
  { name: '2  environment', note: 'AWS_PROFILE, AWS_DEFAULT_REGION' },
  { name: '3  config files', note: '~/.aws/config + credentials' },
  { name: '4  built-in defaults', note: 'e.g. us-east-1' },
];

/** Who wins when the same setting is given in several places: the higher layer overrides the lower. */
export function ResolutionLadder() {
  return (
    <Svg h={178} label="AWS CLI settings resolution: flags override environment variables, which override config files, which override defaults">
      {LAYERS.map((l, i) => (
        <g key={l.name}>
          <Box x={60} y={6 + i * 42} w={232} h={34} lines={[l.name, l.note]} tone={i === 0 ? 'acc' : 'plain'} />
        </g>
      ))}
      <Line d="M16 150V12" />
      <Txt x={26} y={22}>wins</Txt>
      <Txt x={26} y={150}>loses</Txt>
    </Svg>
  );
}
