export default function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm)',
  style = {},
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--color-border)',
        opacity: 0.6,
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
