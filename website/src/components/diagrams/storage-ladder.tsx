import { Box, Svg, Txt } from './kit';

const CLASSES = ['Standard', 'Standard-IA', 'Glacier Instant', 'Glacier Flexible', 'Deep Archive'];

/** The storage-class ladder: each step down is cheaper to keep and slower or pricier to read back. */
export function StorageLadder() {
  return (
    <Svg h={246} label="Storage classes from Standard down to Glacier Deep Archive">
      {CLASSES.map((name, i) => (
        <Box key={name} x={12 + i * 22} y={8 + i * 32} w={150} h={24} lines={[name]} tone={i === 0 ? 'acc' : 'plain'} />
      ))}
      <Txt x={12} y={188}>each step down: cheaper to keep,</Txt>
      <Txt x={12} y={202}>slower or pricier to read back</Txt>
      <Txt x={12} y={222}>off the ladder: One Zone-IA,</Txt>
      <Txt x={12} y={236}>Intelligent-Tiering</Txt>
    </Svg>
  );
}
