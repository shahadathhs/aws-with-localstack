import { Box, Line, Svg } from './kit';

const TARGETS = ['Lambda', 'SQS queue', 'SNS topic', 'EventBridge'];

/** S3 as an actor: an object event passes the prefix/suffix filter and is pushed to a target. */
export function EventFlow() {
  return (
    <Svg h={176} label="An upload triggers an S3 event notification that is delivered to Lambda, SQS, SNS or EventBridge">
      <Box x={4} y={68} w={54} h={40} lines={['upload', 'PUT']} tone="acc" />
      <Line d="M58 88H74" />
      <Box x={76} y={58} w={96} h={60} lines={['S3 bucket', 'prefix/suffix', 'filter']} />
      {TARGETS.map((name, i) => (
        <g key={name}>
          <Line d={`M172 88C186 88 186 ${25 + i * 42} 198 ${25 + i * 42}`} />
          <Box x={198} y={12 + i * 42} w={94} h={26} lines={[name]} />
        </g>
      ))}
    </Svg>
  );
}
