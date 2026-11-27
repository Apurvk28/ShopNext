import { Award, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const levelColors = {
  bronze: "from-amber-600 to-amber-800",
  silver: "from-gray-400 to-gray-600",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-slate-300 to-slate-500",
};

export function Awards({
  variant = "badge",
  title,
  subtitle,
  description,
  date,
  recipient,
  level = "gold",
  className,
  showIcon = true,
}) {
  if (variant === "stamp") {
    const createSerratedPath = () => {
      const radius = 96;
      const teeth = 44;
      const innerRadius = radius - 7;
      const outerRadius = radius;

      let path = "";
      for (let i = 0; i < teeth; i++) {
        const angle = (i / teeth) * 2 * Math.PI;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(angle) * r + radius;
        const y = Math.sin(angle) * r + radius;
        path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      }
      path += " Z";
      return path;
    };

    const createTextPath = (radius, sweep = 1) => {
      const centerX = 96;
      const centerY = 96;
      return `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 ${sweep} ${centerX + radius} ${centerY}`;
    };

    return (
      <div
        className={cn(
          "relative mx-auto flex h-64 w-64 sm:h-72 sm:w-72 items-center justify-center transition-transform duration-500 hover:scale-105",
          className
        )}
      >
        <svg
          className="absolute inset-0 h-full w-full drop-shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
          viewBox="0 0 192 192"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <path id="top-curve" d={createTextPath(58, 1)} fill="none" />
            <path id="bottom-curve" d={createTextPath(66, 0)} fill="none" />
          </defs>

          <path
            d={createSerratedPath()}
            strokeWidth="1.1"
            className="fill-white stroke-[#111827]"
          />

          <circle
            cx="96"
            cy="96"
            r="78"
            className="fill-white stroke-[#111827]"
            strokeWidth="0.9"
          />

          <circle
            cx="96"
            cy="96"
            r="46"
            className="fill-none stroke-[#e5e7eb]"
            strokeWidth="0.8"
            strokeDasharray="2.5 2.5"
          />

          <text className="text-[14px] font-bold tracking-[0.06em]">
            <textPath
              href="#top-curve"
              startOffset="50%"
              textAnchor="middle"
              className="fill-[#111827]"
            >
              {title}
            </textPath>
          </text>

          <text className="text-[8.5px] font-semibold tracking-[0.12em]">
            <textPath
              href="#bottom-curve"
              startOffset="50%"
              textAnchor="middle"
              className="fill-[#4b5563]"
            >
              {subtitle}
            </textPath>
          </text>
        </svg>

        <div className="relative z-10 text-center px-6">
          {showIcon && (
            <div className="mb-1.5 flex justify-center">
              <Star className="size-7 text-[#ea580c] fill-[#ea580c]" />
            </div>
          )}
          {recipient && (
            <div className="text-[#ea580c] mt-1 text-base sm:text-lg font-bold tracking-tight">
              {recipient}
            </div>
          )}
          {date && (
            <div className="text-xs font-medium text-[#4b5563] italic mt-0.5">
              {date}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <div className={cn("", className)}>
        <div className="rounded-md border border-[#e5e7eb] bg-white p-4 flex justify-start gap-3">
          <Award className="size-8 text-[#ea580c] shrink-0" />
          <div className="border-l border-[#e5e7eb] px-3">
            <h3 className="text-[#ea580c] text-2xl font-bold tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[#4b5563] text-sm font-light">{subtitle}</p>
            )}
            <div className="mt-1 flex items-center gap-3 text-xs text-[#6b7280]">
              {recipient && <span className="italic">by {recipient}</span>}
              {date && <span>{date}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 rounded-xl border border-[#e5e7eb] bg-white", className)}>
      <div
        className={cn(
          "inline-block rounded-md px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r",
          levelColors[level]
        )}
      >
        {level.toUpperCase()}
      </div>
      <h3 className="text-xl font-bold text-[#111827] mt-2">{title}</h3>
      {subtitle && <p className="text-sm text-[#4b5563]">{subtitle}</p>}
      {description && <p className="text-xs text-[#6b7280] mt-1">{description}</p>}
    </div>
  );
}
