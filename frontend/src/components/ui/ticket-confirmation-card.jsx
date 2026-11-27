import * as React from "react";
import { cn } from "@/lib/utils";

const CheckCircleIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const MastercardIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="36"
    height="24"
  >
    <circle cx="8" cy="12" r="7" fill="#EA001B" />
    <circle cx="16" cy="12" r="7" fill="#F79E1B" fillOpacity="0.8" />
  </svg>
);

const DashedLine = () => (
  <div
    className="w-full border-t-2 border-dashed border-[#e5e7eb]"
    aria-hidden="true"
  />
);

const Barcode = ({ value }) => {
  const hashCode = (s) =>
    s.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
  const seed = hashCode(value);
  const random = (s) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const bars = Array.from({ length: 60 }).map((_, index) => {
    const rand = random(seed + index);
    const width = rand > 0.7 ? 2.5 : 1.5;
    return { width };
  });

  const spacing = 1.5;
  const totalWidth =
    bars.reduce((acc, bar) => acc + bar.width + spacing, 0) - spacing;
  const svgWidth = 250;
  const svgHeight = 70;
  let currentX = (svgWidth - totalWidth) / 2;

  return (
    <div className="flex flex-col items-center py-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        aria-label={`Barcode for value ${value}`}
        className="fill-current text-[#111827]"
      >
        {bars.map((bar, index) => {
          const x = currentX;
          currentX += bar.width + spacing;
          return (
            <rect key={index} x={x} y="10" width={bar.width} height="50" />
          );
        })}
      </svg>
      <p className="text-sm text-[#6b7280] tracking-[0.25em] mt-2">{value}</p>
    </div>
  );
};

const ConfettiExplosion = () => {
  const confettiCount = 100;
  const colors = [
    "#ea580c",
    "#f97316",
    "#22c55e",
    "#3b82f6",
    "#eab308",
    "#8b5cf6",
  ];

  return (
    <>
      <style>
        {`
          @keyframes fall {
            0% {
              transform: translateY(-10vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(110vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}
      </style>
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        {Array.from({ length: confettiCount }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-4 rounded-[2px]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${-20 + Math.random() * 10}%`,
              backgroundColor: colors[i % colors.length],
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `fall ${2.5 + Math.random() * 2.5}s ${Math.random() * 2}s linear forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
};

const AnimatedTicket = React.forwardRef(
  (
    {
      className,
      ticketId,
      amount,
      date,
      cardHolder,
      last4Digits,
      barcodeValue,
      title = "Thank you!",
      subtitle = "Your order has been confirmed",
      idLabel = "Order ID",
      footer,
      ...props
    },
    ref
  ) => {
    const [showConfetti, setShowConfetti] = React.useState(false);

    React.useEffect(() => {
      const mountTimer = setTimeout(() => setShowConfetti(true), 100);
      const unmountTimer = setTimeout(() => setShowConfetti(false), 6000);
      return () => {
        clearTimeout(mountTimer);
        clearTimeout(unmountTimer);
      };
    }, []);

    const formattedAmount =
      typeof amount === "number"
        ? new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(amount)
        : "Paid";

    const formattedDate = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .format(date)
      .replace(",", " •");

    return (
      <>
        {showConfetti && <ConfettiExplosion />}
        <div
          ref={ref}
          className={cn(
            "relative w-full max-w-md bg-white text-[#111827] border border-[#e5e7eb] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] z-10 overflow-visible",
            className
          )}
          {...props}
        >
          {/* Ticket cut-out notches matching page background */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#f8f9fa] border-r border-[#e5e7eb]" />
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#f8f9fa] border-l border-[#e5e7eb]" />

          <div className="p-8 flex flex-col items-center text-center">
            <div className="p-3 bg-[#ecfdf5] rounded-full">
              <CheckCircleIcon className="w-10 h-10 text-[#059669]" />
            </div>
            <h1 className="text-2xl font-bold text-[#111827] mt-4 mb-1">
              {title}
            </h1>
            <p className="text-sm text-[#4b5563]">{subtitle}</p>
          </div>

          <div className="px-8 pb-8 space-y-6">
            <DashedLine />

            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-xs text-[#6b7280] uppercase">{idLabel}</p>
                <p className="font-mono font-semibold text-sm text-[#111827]">
                  {ticketId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#6b7280] uppercase">Amount</p>
                <p className="font-bold text-lg text-[#ea580c]">
                  {formattedAmount}
                </p>
              </div>
            </div>

            <div className="text-left">
              <p className="text-xs text-[#6b7280] uppercase">Date &amp; Time</p>
              <p className="font-medium text-sm text-[#111827]">
                {formattedDate}
              </p>
            </div>

            <div className="bg-[#f9fafb] border border-[#e5e7eb] p-4 rounded-xl flex items-center space-x-4 text-left">
              <MastercardIcon />
              <div>
                <p className="font-semibold text-sm text-[#111827]">
                  {cardHolder}
                </p>
                <p className="text-[#6b7280] font-mono text-xs tracking-wider">
                  {last4Digits ? `•••• ${last4Digits}` : "Razorpay Verified"}
                </p>
              </div>
            </div>

            <DashedLine />

            <Barcode value={barcodeValue} />

            {footer && <div className="pt-2">{footer}</div>}
          </div>
        </div>
      </>
    );
  }
);

AnimatedTicket.displayName = "AnimatedTicket";

export { AnimatedTicket };
