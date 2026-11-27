import { cn } from "@/lib/utils";

/**
 * PerspectiveFlipCard
 * Uses rounded-2xl border radius and 3D depth with translateZ layers.
 */
export function PerspectiveFlipCard({
  className,
  front,
  back,
  h = "h-[430px]",
  w = "w-full",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={cn("group/p-card [perspective:2000px] cursor-pointer", h, w, className)}
    >
      <div
        className={cn(
          "relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] group-hover/p-card:[transform:rotateY(180deg)]",
          "rounded-2xl"
        )}
      >
        {/* Front Face */}
        <div className="absolute inset-0 size-full rounded-2xl border border-[#e5e7eb] bg-white text-[#111827] shadow-[0_4px_15px_rgba(0,0,0,0.05)] [transform-style:preserve-3d] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] opacity-100 group-hover/p-card:opacity-0 transition-opacity duration-300 delay-150 group-hover/p-card:pointer-events-none">
          <div className="size-full [transform-style:preserve-3d] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] p-3">
            {front}
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 size-full rounded-2xl border border-[#e5e7eb] bg-white text-[#111827] shadow-[0_12px_25px_rgba(0,0,0,0.08)] [transform-style:preserve-3d] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)] opacity-0 group-hover/p-card:opacity-100 transition-opacity duration-300 delay-150 pointer-events-none group-hover/p-card:pointer-events-auto">
          <div className="size-full [transform-style:preserve-3d] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] p-6 text-center flex flex-col items-center justify-center">
            {back}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerspectiveFlipCard;
