import { Box, Line, Svg, Txt } from './kit';

/** S3 has no folders: the console draws a tree from slashes inside flat keys. */
export function FolderIllusion() {
  return (
    <Svg label="The console shows a folder tree; S3 stores only flat keys containing slashes">
      <Txt x={14} y={18}>console shows</Txt>
      <Txt x={152} y={18}>S3 stores</Txt>
      {['docs/', 'notes/', 'today.txt', 'old.txt'].map((name, i) => (
        <Txt key={name} x={20 + [0, 12, 24, 24][i]} y={44 + i * 22} tone="muted">
          {i < 2 ? `▸ ${name}` : name}
        </Txt>
      ))}
      <rect x="10" y="26" width="120" height="96" rx="3" className="bx muted" strokeDasharray="4 3" />
      <Line d="M134 74H148" />
      <Box x={152} y={30} w={140} h={26} lines={['docs/notes/today.txt']} />
      <Box x={152} y={62} w={140} h={26} lines={['docs/notes/old.txt']} />
      <Box x={152} y={94} w={140} h={26} lines={['logs/app.log']} />
      <Txt x={150} y={156} anchor="middle">&quot;/&quot; is just a character in the key.</Txt>
      <Txt x={150} y={174} anchor="middle">Folders are an illusion drawn from prefixes.</Txt>
    </Svg>
  );
}
