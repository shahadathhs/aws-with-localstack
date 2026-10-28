export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M4 18V7M4 7l8 4M12 11l8-4M12 11v9M20 7v11" />
      <circle cx="4" cy="7" r="1.6" fill="var(--accent)" />
      <circle cx="12" cy="11" r="1.6" fill="var(--accent)" />
      <circle cx="20" cy="7" r="1.6" fill="var(--accent)" />
    </svg>
  );
}
