type StatCardProps = {
  label: string;
  value: string | number;
  tone?: "blue" | "green";
};

const toneClassMap: Record<NonNullable<StatCardProps["tone"]>, string> = {
  blue: "text-sky-700",
  green: "text-emerald-700",
};

export function StatCard({ label, value, tone = "blue" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-sky-200 bg-white p-3">
      <p className={`font-mono text-xs ${toneClassMap[tone]}`}>{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
