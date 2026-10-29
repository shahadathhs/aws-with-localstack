import { Box, Line, Svg, Txt } from './kit';

/** Access to an object passes independent gates; all of them must say yes. */
export function AccessGates() {
  return (
    <Svg h={214} label="The gates a request passes: public access block, bucket and IAM policies, legacy ACLs">
      <Txt x={12} y={18}>request</Txt>
      <Line d="M60 14H90" />
      <Box x={92} y={2} w={196} h={28} lines={['1  public access block']} tone="deny" />
      <Line d="M190 30V46" />
      <Box x={92} y={46} w={196} h={42} lines={['2  bucket or IAM policy', 'same account: either allows']} />
      <Line d="M190 88V104" />
      <Box x={92} y={104} w={196} h={28} lines={['3  ACLs (legacy, off)']} dashed tone="muted" />
      <Line d="M190 132V148" />
      <Box x={92} y={148} w={196} h={28} lines={['object']} tone="ok" />
      <Txt x={12} y={66}>all gates</Txt>
      <Txt x={12} y={80}>must say yes</Txt>
      <Txt x={150} y={200} anchor="middle">cross-account: both sides must allow</Txt>
    </Svg>
  );
}
