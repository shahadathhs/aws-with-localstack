import { Box, Line, Svg, Txt } from './kit';

/** Long-lived user keys versus a role: STS checks the trust policy and hands back credentials that expire. */
export function AssumeRole() {
  return (
    <Svg h={198} label="IAM user keys never expire; a role is assumed through STS and yields temporary credentials">
      <Txt x={8} y={16}>IAM user</Txt>
      <Box x={6} y={24} w={86} h={34} lines={['user']} />
      <Line d="M92 41H110" />
      <Box x={112} y={24} w={86} h={34} lines={['access key']} tone="deny" dashed />
      <Line d="M198 41H216" />
      <Box x={218} y={24} w={76} h={34} lines={['API call']} />
      <Txt x={8} y={76} tone="deny">never expires until rotated</Txt>
      <Txt x={8} y={112}>IAM role</Txt>
      <Box x={6} y={120} w={64} h={34} lines={['principal']} />
      <Line d="M70 137H80" />
      <Box x={82} y={120} w={50} h={34} lines={['STS']} tone="acc" />
      <Line d="M132 137H142" />
      <Box x={144} y={120} w={76} h={34} lines={['temp creds']} tone="ok" />
      <Line d="M220 137H230" />
      <Box x={232} y={120} w={62} h={34} lines={['API call']} />
      <Txt x={8} y={172} tone="ok">trust policy checked first</Txt>
      <Txt x={8} y={188} tone="ok">credentials expire in 15 min to 12 h</Txt>
    </Svg>
  );
}
