type Tone = "success" | "warning" | "danger" | "neutral";

export function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: Tone;
}) {
  return <span className={`badge ${tone}`}>{label}</span>;
}
