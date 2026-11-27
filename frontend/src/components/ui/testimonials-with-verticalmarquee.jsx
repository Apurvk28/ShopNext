import { motion } from "motion/react";
import KineticTestimonial from "@/components/ui/testimonials-with-verticalmarquee-utils/kinetic-testimonials";

const testimonials = [
  {
    name: "Aarav Mehta",
    handle: "Verified Buyer · Mumbai",
    review:
      "The oversized tee fabric feels super breathable and heavyweight. Easily my favorite everyday staple from ShopNext.",
    avatar: "https://cdn.21st.dev/assets/stock/avatar/ar.svg",
  },
  {
    name: "Diya Sharma",
    handle: "Verified Buyer · Bengaluru",
    review:
      "Ordered the Breton long sleeve and knit cardigan — both arrived in two days with zero creases and spot-on sizing.",
    avatar: "https://cdn.21st.dev/assets/stock/avatar/jm.svg",
  },
  {
    name: "Kabir Verma",
    handle: "Style Club · Delhi",
    review:
      "Clean silhouettes, honest INR pricing, and the checkout flow is effortless. Already came back for two more polos.",
    avatar: "https://cdn.21st.dev/assets/stock/avatar/sk.svg",
  },
  {
    name: "Naina Kapoor",
    handle: "Verified Buyer · Pune",
    review:
      "The Lilac crewneck sweatshirt kept its exact shape and softness even after multiple washes. Worth every rupee.",
    avatar: "https://cdn.21st.dev/assets/stock/avatar/lt.svg",
  },
  {
    name: "Rohan Iyer",
    handle: "Verified Buyer · Chennai",
    review:
      "Rare to find minimalist basics that actually drape well. The Oxford shirt fits like it was tailored.",
    avatar: "https://cdn.21st.dev/assets/stock/avatar/mo.svg",
  },
  {
    name: "Ananya Roy",
    handle: "Verified Buyer · Kolkata",
    review:
      "Packaging, stitching, and customer support are top notch. ShopNext has become my go-to for seasonal wardrobe drops.",
    avatar: "https://cdn.21st.dev/assets/stock/avatar/dn.svg",
  },
];

export default function TestimonialsVerticalMarquee() {
  const titleWords = "Loved by thousands of happy shoppers".split(" ");

  return (
    <section className="relative w-full bg-transparent py-8">
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="flex flex-col items-center gap-4 text-center py-8 md:py-12">
          <h2 className="text-3xl md:text-5xl font-bold text-[#111827] tracking-tight">
            {titleWords.map((word, index) => (
              <motion.span
                key={`title-${word}-${index}`}
                initial={{ opacity: 0, filter: "blur(6px)", y: 12 }}
                whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-base md:text-lg text-[#4b5563] max-w-2xl px-4"
          >
            Hear from our community of shoppers who trust ShopNext for everyday
            essentials and seasonal drops.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="w-full"
        >
          <KineticTestimonial
            testimonials={testimonials}
            title=""
            subtitle=""
            desktopColumns={5}
            tabletColumns={3}
            mobileColumns={2}
            speed={1}
          />
        </motion.div>
      </div>
    </section>
  );
}
