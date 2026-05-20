import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Review {
  id: string;
  brand: string;
  name: string;
  role: string;
  content: string;
  avatarUrl: string;
}

const reviews: Review[] = [
  {
    id: "1",
    brand: "Kefas Food",
    name: "kofoworola .A",
    role: "Founder & CEO",
    content: "Bluehaven Studios completely transformed our brand identity. Their meticulous attention to detail and ability to capture the essence of our culinary vision was unparalleled. The new visual language they established has directly contributed to a significant increase in our customer engagement.",
    avatarUrl: "https://images.unsplash.com/photo-1723537742563-15c3d351dbf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMG1hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3NDgxMzA0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "2",
    brand: "Primax",
    name: "Ayoade .M",
    role: "Marketing Director",
    content: "Working with the team was an absolute masterclass in professional media execution. Their strategic approach to our campaign not only elevated our brand aesthetics but also provided us with a cohesive roadmap for future growth. The silver gradient styling is iconic.",
    avatarUrl: "https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMG1hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3NDgxMzA0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "3",
    brand: "Lamays Fashion Hub",
    name: "May .o",
    role: "Creative Director",
    content: "Their dedication to understanding our core mission is what sets them apart. They didn't just deliver exceptional designs; they created an experience that resonated with our target audience. The glassmorphism elements they introduced added a sophisticated touch to our brand identity.",
    avatarUrl: "https://images.unsplash.com/photo-1631387019069-2ff599943f9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGRpcmVjdG9yJTIwaGVhZHNob3R8ZW58MXx8fHwxNzc0ODEzMDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "4",
    brand: "FeFe's Kitchen",
    name: "Esther .F",
    role: "Operations Manager",
    content: "From discovery to delivery, the process was seamless. The studio bridges the gap between raw concept and polished final product beautifully. Their ability to fuse modern design trends with our traditional roots exceeded all our expectations.",
    avatarUrl: "https://images.unsplash.com/photo-1686543972602-da0c7ea61ce2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3VuZGVyJTIwY2VvJTIwaGVhZHNob3R8ZW58MXx8fHwxNzc0ODEzMDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  }
];

export function ReviewsSection() {
  return (
    <section className="py-20 md:py-32 px-4 md:px-[10%] bg-[#0a0a0a] relative overflow-hidden border-t border-white/5">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 uppercase tracking-widest bg-gradient-to-r from-gray-400 via-gray-100 to-gray-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
            Client Perspectives
          </h2>
          <div className="w-20 md:w-24 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto opacity-70"></div>
          <p className="mt-6 text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-light tracking-wide">
            Voices from the brands we've empowered through strategic media execution and creative mastery.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group relative p-5 md:p-6 rounded-2xl bg-[#141414]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-[0_8px_40px_rgba(255,255,255,0.05)] flex flex-col h-full"
            >
              <Quote className="absolute top-5 right-5 w-8 h-8 text-white/[0.03] group-hover:text-white/[0.08] transition-colors duration-500" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-gray-300 text-gray-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                ))}
              </div>

              <p className="text-gray-300 text-sm leading-relaxed flex-grow font-light z-10">
                "{review.content}"
              </p>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition-colors flex-shrink-0">
                  
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm tracking-wide">{review.name}</h4>
                  <p className="text-gray-400 text-xs">
                    {review.role}, <span className="text-gray-200 font-medium">{review.brand}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}