import { Box, Line, Svg, Txt } from './kit';

/** Presigning is local maths: the signer needs no network call, and S3 checks signature and expiry on arrival. */
export function PresignFlow() {
  return (
    <Svg h={206} label="A presigned URL: signed locally, handed to a holder, verified by S3">
      <Box x={6} y={22} w={110} h={42} lines={['signer', 'has credentials']} tone="acc" />
      <Line d="M116 43H184" />
      <Txt x={150} y={36} anchor="middle">signs</Txt>
      <Box x={184} y={16} w={110} h={54} lines={['URL', 'key + signature', '+ expiry']} />
      <Line d="M239 70V98" />
      <Txt x={231} y={88} anchor="end">hand over</Txt>
      <Box x={184} y={98} w={110} h={42} lines={['holder', 'anyone with URL']} />
      <Line d="M184 119H116" />
      <Txt x={150} y={112} anchor="middle">GET/PUT</Txt>
      <Box x={6} y={92} w={110} h={54} lines={['S3', 'checks signature', 'and expiry']} />
      <Txt x={6} y={170} tone="ok">before expiry → 200</Txt>
      <Txt x={6} y={188} tone="deny">after expiry → 403</Txt>
    </Svg>
  );
}
