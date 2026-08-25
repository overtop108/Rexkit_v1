interface KpiCardProps {
  label: string;
  value: string;
  suffix: string;
  subtext: string;
  progress: number;
  color: 'indigo' | 'blue' | 'amber' | 'red';
}

const colorMap = {
  indigo: '#5B4FE8',
  blue: '#2F6FED',
  amber: '#D97706',
  red: '#E11D48',
};

export function KpiCard({ label, value, suffix, subtext, progress, color }: KpiCardProps) {
  const fillColor = colorMap[color];

  return (
    <div className="bg-white rounded-2xl border border-[#E6E8EF] p-6">
      <div className="text-[13px] tracking-wide uppercase text-[#7A8194] font-medium mb-3">
        {label}
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-[40px] font-bold text-[#1F2430] leading-none">{value}</span>
        {suffix && <span className="text-lg text-[#7A8194]">{suffix}</span>}
      </div>
      <p className="text-sm text-[#6B7280] mb-4">{subtext}</p>
      <div className="w-full h-1.5 rounded-full bg-[#EDEFF4] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: fillColor }}
        />
      </div>
    </div>
  );
}
