import { motion } from "motion/react";
import { useState } from "react";
import founderImage from "../../imports/image-1.png";

export function FounderFlipCard() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <section className="py-16 md:py-24 px-4 md:px-[10%] relative z-10">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`founder-particle-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: "radial-gradient(circle, rgba(224,224,224,0.8) 0%, rgba(224,224,224,0.2) 70%, transparent 100%)",
              filter: "blur(1px)",
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 15 - 7.5, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: Math.random() * 8 + 8,
              delay: Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header and Flip Card Side by Side */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Section Header */}
          <motion.div
            className="text-center md:text-left md:max-w-xs"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide bg-gradient-to-r from-gray-200 via-white to-gray-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] mb-3">
              Meet The Founder
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-gray-400 via-white to-gray-400 mx-auto md:mx-0 mb-4 shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
            <p className="text-gray-400 text-sm md:text-base">
              The vision and passion behind BlueHaven Studios
            </p>
          </motion.div>

          {/* Flip Card */}
          <motion.div
            className="perspective-1000 w-full max-w-md cursor-pointer"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
          <motion.div
            className="relative w-full"
            style={{
              transformStyle: "preserve-3d",
            }}
            animate={{
              rotateY: isFlipped ? 180 : 0,
            }}
            transition={{
              duration: 0.8,
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
          >
            {/* Front of Card - Image */}
            <motion.div
              className="absolute w-full h-full rounded-3xl overflow-hidden border shadow-2xl"
              style={{
                backfaceVisibility: "hidden",
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(20px)",
                borderColor: "rgba(255, 255, 255, 0.15)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.3), inset 0 0 30px rgba(255,255,255,0.05)",
              }}
            >
              <div className="relative w-full h-full aspect-[4/5] md:aspect-[16/10]">
                <img
                  src={founderImage}
                  alt="Taiwo Boluwatife - Founder of BlueHaven Studios"
                  className="w-full h-full object-cover object-top"
                />
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                {/* Founder name */}
                <div className="absolute bottom-14 left-0 right-0 text-center px-4">
                  <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg mb-1">
                    Taiwo Boluwatife
                    <span className="text-gray-300"> (Heistaiwo)</span>
                  </h3>
                </div>
                {/* Click to flip indicator */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <motion.p
                    className="text-white text-xs md:text-sm font-bold uppercase tracking-wider drop-shadow-lg"
                    animate={{
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    Click to Read My Story
                  </motion.p>
                </div>
              </div>
            </motion.div>

            {/* Back of Card - Story */}
            <motion.div
              className="w-full rounded-3xl overflow-hidden border shadow-2xl p-6 md:p-8"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                borderColor: "rgba(255, 255, 255, 0.15)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.3), inset 0 0 30px rgba(255,255,255,0.05)",
              }}
            >
              <div className="aspect-[4/5] md:aspect-[16/10] flex flex-col justify-center">
                <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wide bg-gradient-to-r from-gray-200 via-white to-gray-300 bg-clip-text text-transparent mb-4">
                  The Vision Behind BlueHaven
                </h3>
                <div className="space-y-3 text-gray-300 text-xs md:text-sm leading-relaxed overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                  <p>
                    For a long time, I operated behind the scenes, mastering the technical side of how stories are told and how products are seen. I spent years refining the way light hits a surface in a 3D render and the way a live broadcast connects with an audience. But during those six years of growth and mentorship, I realized something vital. Most people can provide a service, but very few can build an identity.
                  </p>
                  <p>
                    I started BlueHaven Studios because I saw a gap between just creating content and actually building a brand. To me, branding isn't just a logo or a beautiful image. It is the distinct DNA of a business. It is the reason why someone chooses one path over a thousand others. I wanted to create a space where technical precision meets deep, human strategy.
                  </p>
                  <p>
                    BlueHaven exists to prove that your brand deserves more than just a placeholder. It deserves a foundation that is as intentional as it is professional. I have always believed that you can find many replacements for a service provider, but you can't replace a partner who truly understands the soul of what you are building. This studio is my commitment to making sure your brand is the one that stays in the mind of your audience long after the first look.
                  </p>
                </div>
                {/* Click to flip back indicator */}
                <motion.p
                  className="text-gray-400 text-xs uppercase tracking-wider text-center mt-6"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Click to See Photo
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </section>
  );
}
