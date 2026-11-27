import { Awards } from "@/components/ui/award";

export function ShopNextStamp() {
  return (
    <section className="py-12 md:py-16 flex flex-col items-center justify-center text-center">
      <Awards
        variant="stamp"
        title="SHOPNEXT VERIFIED"
        subtitle="100% AUTHENTIC · QUALITY"
        recipient="Guaranteed"
        date="Trusted Store · 2026"
      />
    </section>
  );
}

export default ShopNextStamp;
