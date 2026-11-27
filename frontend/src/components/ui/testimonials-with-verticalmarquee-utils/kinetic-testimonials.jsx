import { useMemo } from "react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function TestimonialCard({ item }) {
  return (
    <Card className="rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-[#fdba74] hover:shadow-[0_8px_24px_rgba(234,88,12,0.08)]">
      <CardContent className="p-5 flex flex-col gap-3.5">
        <div className="flex items-center gap-0.5 text-[#f59e0b]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-current" />
          ))}
        </div>

        <p className="text-sm leading-relaxed text-[#374151]">
          “{item.review}”
        </p>

        <div className="flex items-center gap-3 pt-1">
          <Avatar className="h-9 w-9 border border-[#e5e7eb]">
            <AvatarImage src={item.avatar} alt={item.name} />
            <AvatarFallback>{getInitials(item.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#111827] truncate">
              {item.name}
            </p>
            <p className="text-xs text-[#6b7280] truncate">{item.handle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MarqueeColumn({ items, reverse = false, duration = 28, className }) {
  return (
    <div className={cn("group relative overflow-hidden h-full", className)}>
      <div
        className="flex flex-col gap-4 will-change-transform group-hover:[animation-play-state:paused]"
        style={{
          animation: `${reverse ? "scroll-down-smooth" : "scroll-up-smooth"} ${duration}s linear infinite`,
        }}
      >
        {[...items, ...items].map((item, idx) => (
          <TestimonialCard key={`${item.name}-${idx}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function KineticTestimonial({
  testimonials = [],
  title,
  subtitle,
  desktopColumns = 5,
  tabletColumns = 3,
  mobileColumns = 2,
  speed = 1,
  className,
}) {
  const columns = useMemo(() => {
    if (!testimonials.length) return [];
    const totalCols = Math.max(desktopColumns, tabletColumns, mobileColumns);
    return Array.from({ length: totalCols }, (_, colIdx) => {
      const shifted = [];
      for (let i = 0; i < testimonials.length; i++) {
        shifted.push(testimonials[(i + colIdx * 2) % testimonials.length]);
      }
      return shifted;
    });
  }, [testimonials, desktopColumns, tabletColumns, mobileColumns]);

  const baseDuration = 28 / Math.max(speed, 0.25);

  return (
    <div className={cn("w-full", className)}>
      {(title || subtitle) && (
        <div className="text-center mb-8 px-4">
          {title && (
            <h3 className="text-2xl font-bold text-[#111827]">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-[#4b5563] mt-2">{subtitle}</p>
          )}
        </div>
      )}

      <div className="relative h-[500px] w-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 h-full">
          {columns.map((colItems, colIdx) => {
            const visibilityClass =
              colIdx < mobileColumns
                ? "block"
                : colIdx < tabletColumns
                  ? "hidden md:block"
                  : "hidden lg:block";

            return (
              <MarqueeColumn
                key={colIdx}
                items={colItems}
                reverse={colIdx % 2 === 1}
                duration={baseDuration + (colIdx % 3) * 4}
                className={visibilityClass}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
