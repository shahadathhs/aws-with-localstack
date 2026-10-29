import { Box, Line, Svg, Txt } from './kit';

/** LocalStack: the same AWS API, one gateway port, and Lambda running in sibling containers via docker.sock. */
export function Gateway() {
  return (
    <Svg h={222} label="A client calls the LocalStack gateway on port 4566, which routes to service emulators; Lambda runs in sibling containers">
      <Box x={8} y={6} w={284} h={26} lines={['aws cli · SDK · Terraform']} tone="acc" />
      <Line d="M150 32V56" />
      <Txt x={158} y={49}>HTTP :4566</Txt>
      <rect x="8" y="58" width="284" height="106" rx="4" className="bx muted" strokeDasharray="4 3" />
      <Txt x={16} y={74}>LocalStack container</Txt>
      <Box x={18} y={84} w={96} h={40} lines={['edge gateway', ':4566']} />
      <Line d="M114 104H138" />
      <Box x={140} y={84} w={144} h={40} lines={['S3 · SQS · DynamoDB', 'IAM · Lambda API …']} />
      <Txt x={16} y={146}>routes by path, hostname, signature</Txt>
      <Line d="M219 164V188" dashed />
      <Txt x={227} y={182}>docker.sock</Txt>
      <Box x={120} y={188} w={172} h={26} lines={['Lambda sibling containers']} dashed />
    </Svg>
  );
}
