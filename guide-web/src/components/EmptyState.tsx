export function EmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="empty-state">
      <div style={{ fontWeight: 700 }}>{title}</div>
      {subtitle && <div style={{ marginTop: 6 }}>{subtitle}</div>}
    </div>
  );
}
