import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import primaxLogo from "figma:asset/af5a8fc9c64c0440dad680de29cbde577ff765c9.png";
import adeayoLogo from "figma:asset/6cc1ad7b7df17ad8b72f927373f24a2653494634.png";
import fetesLight from "figma:asset/02727bfe17ced13dc5028d6f270d3eec43ea5c13.png";
import lordsBlack from "figma:asset/d998f756ade35de3fb24f728515fbff45bad6fc4.png";
import anchorBlue from "figma:asset/c55bcfa0faed5c2bccc9caa1617a5f49b358b142.png";
import lamaysBlack from "figma:asset/c327827d1376e3582ffaebb8c81398f851840dbc.png";
import fefesCard from "figma:asset/017a226ee4f731f8ed5e8b9634438d7070ea1bbb.png";
import elejaLogoDark from "figma:asset/da2fbe02536606e39395841fa852863673516fe2.png";
import wendeesBlue from "figma:asset/89543834dc9fac8d6c3c7e5d1fd7e565785a5dad.png";
import onaNotebook from "figma:asset/a870db28d502ad17b4b4974a4ccf93949d4dd468.png";
import souvenirsWhite from "figma:asset/d8985e21a43878d8dcaba7ff78421dc080247cd2.png";
import lamaysScentsLogo from "figma:asset/eca5d1b1aae735acb6bdea0539176c17f20e3de2.png";
import dazzledFlat from "figma:asset/df042d4e65ba2df64c7d343976873ac3b4d5c6ef.png";
import emmaxLogo from "figma:asset/13a97c85692fc63be5b64f1d6a49de7f7573056c.png";
import kefasLogo from "figma:asset/2bc2d0872bc004e56fb14516b9f2d99ed2497f0e.png";

const portfolioItems = [
  {
    image: kefasLogo,
    title: "Kefas Foods",
    subtitle: "Authentic Taste, Premium Quality",
    gradient: "from-emerald-500/20 via-green-500/10 to-teal-500/20",
    accentColor: "rgba(16, 185, 129, 0.3)",
  },
  {
    image: emmaxLogo,
    title: "Emmax Gaming",
    subtitle: "High-Performance Gaming Gear",
    gradient: "from-blue-500/20 via-indigo-500/10 to-violet-500/20",
    accentColor: "rgba(99, 102, 241, 0.3)",
  },
  {
    image: primaxLogo,
    title: "Primax Bar & Grill",
    subtitle: "Restaurant Branding & Menu Design",
    gradient: "from-red-500/20 via-orange-500/10 to-amber-500/20",
    accentColor: "rgba(249, 115, 22, 0.3)",
  },
  {
    image: wendeesBlue,
    title: "Wendee's Bakery",
    subtitle: "Bakery Brand Identity",
    gradient: "from-sky-500/20 via-blue-500/10 to-cyan-500/20",
    accentColor: "rgba(14, 165, 233, 0.3)",
  },
  {
    image: adeayoLogo,
    title: "Clothings by Adeayo",
    subtitle: "Fashion Brand Identity",
    gradient: "from-purple-500/20 via-fuchsia-500/10 to-pink-500/20",
    accentColor: "rgba(217, 70, 239, 0.3)",
  },
  {
    image: fetesLight,
    title: "FeFes",
    subtitle: "Modern Playful Logo Design",
    gradient: "from-pink-500/20 via-rose-500/10 to-red-500/20",
    accentColor: "rgba(244, 63, 94, 0.3)",
  },
  {
    image: fefesCard,
    title: "FeFes Kitchen",
    subtitle: "Restaurant Business Cards",
    gradient: "from-fuchsia-500/20 via-purple-500/10 to-violet-500/20",
    accentColor: "rgba(192, 132, 252, 0.3)",
  },
  {
    image: lordsBlack,
    title: "Lord's Heritage Care",
    subtitle: "Childcare Services Merchandise",
    gradient: "from-indigo-500/20 via-blue-500/10 to-sky-500/20",
    accentColor: "rgba(59, 130, 246, 0.3)",
  },
  {
    image: anchorBlue,
    title: "Anchor Freight Solutions",
    subtitle: "Logistics Brand Identity",
    gradient: "from-cyan-500/20 via-teal-500/10 to-emerald-500/20",
    accentColor: "rgba(20, 184, 166, 0.3)",
  },
  {
    image: lamaysBlack,
    title: "LaMay's Fashion Hub",
    subtitle: "Luxury Fashion Branding",
    gradient: "from-violet-500/20 via-purple-500/10 to-fuchsia-500/20",
    accentColor: "rgba(168, 85, 247, 0.3)",
  },
  {
    image: elejaLogoDark,
    title: "Eleja Exchange",
    subtitle: "Digital Asset Exchange Branding",
    gradient: "from-blue-500/20 via-purple-500/10 to-pink-500/20",
    accentColor: "rgba(147, 51, 234, 0.3)",
  },
  {
    image: dazzledFlat,
    title: "Dazzled in Essence",
    subtitle: "Beauty & Wellness Brand",
    gradient: "from-amber-500/20 via-yellow-500/10 to-orange-500/20",
    accentColor: "rgba(251, 191, 36, 0.3)",
  },
  {
    image: lamaysScentsLogo,
    title: "LaMay Scents",
    subtitle: "Fragrance Branding",
    gradient: "from-rose-500/20 via-pink-500/10 to-fuchsia-500/20",
    accentColor: "rgba(236, 72, 153, 0.3)",
  },
  {
    image: souvenirsWhite,
    title: "Souvenirs",
    subtitle: "Custom Branding",
    gradient: "from-slate-500/20 via-gray-500/10 to-zinc-500/20",
    accentColor: "rgba(148, 163, 184, 0.3)",
  },
  {
    image: onaNotebook,
    title: "OnaKanOwoja",
    subtitle: "Brand Merchandise",
    gradient: "from-stone-500/20 via-neutral-500/10 to-gray-500/20",
    accentColor: "rgba(120, 113, 108, 0.3)",
  }
];


export function LiquidMorphSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % portfolioItems.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % portfolioItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + portfolioItems.length) % portfolioItems.length);
  };

  const currentItem = portfolioItems[currentSlide];


  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Floating liquid morphism blobs in background */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${currentItem.accentColor} 0%, transparent 70%)`,
          filter: "blur(80px)",
          left: "10%",
          top: "20%",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 80, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full opacity-15 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${currentItem.accentColor} 0%, transparent 70%)`,
          filter: "blur(70px)",
          right: "15%",
          bottom: "25%",
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 1.4, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Single slide with liquid morph container */}
      <motion.div
        key={currentSlide}
        initial={{ opacity: 0, scale: 0.7, rotateY: -45, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, rotateY: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 1.3, rotateY: 45, filter: "blur(10px)" }}
        transition={{
          duration: 1,
          ease: [0.68, -0.55, 0.265, 1.55],
        }}
        className="relative max-w-sm md:max-w-md lg:max-w-lg w-full"
        style={{
          transformStyle: "preserve-3d",
          perspective: "1200px",
        }}
      >
        {/* Liquid morphing card container */}
        <motion.div
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: `0 20px 60px 0 rgba(0, 0, 0, 0.4), inset 0 0 60px ${currentItem.accentColor}`,
          }}
          animate={{
            borderRadius: [
              "40% 60% 65% 35% / 40% 50% 50% 60%",
              "60% 40% 35% 65% / 60% 50% 50% 40%",
              "45% 55% 50% 50% / 55% 45% 55% 45%",
              "55% 45% 60% 40% / 45% 55% 45% 55%",
              "40% 60% 65% 35% / 40% 50% 50% 60%",
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Animated liquid waves */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${currentItem.accentColor} 0%, transparent 60%)`,
              opacity: 0.4,
            }}
            animate={{
              scale: [1, 1.5, 1.2, 1],
              opacity: [0.3, 0.6, 0.4, 0.3],
              x: [0, 20, -10, 0],
              y: [0, -15, 10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Secondary liquid wave */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 70% 30%, ${currentItem.accentColor} 0%, transparent 50%)`,
              opacity: 0.3,
            }}
            animate={{
              scale: [1.2, 1, 1.4, 1.2],
              opacity: [0.2, 0.5, 0.3, 0.2],
              x: [10, -20, 5, 10],
              y: [5, 15, -10, 5],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Liquid shimmer sweep */}
          <motion.div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
              backgroundSize: "200% 200%",
            }}
            animate={{
              backgroundPosition: ["0% 0%", "200% 200%", "0% 0%"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Floating liquid particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/50"
              style={{
                width: `${4 + Math.random() * 4}px`,
                height: `${4 + Math.random() * 4}px`,
                left: `${10 + i * 15}%`,
                top: `${20 + Math.random() * 60}%`,
                filter: "blur(2px)",
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.8, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Card content */}
          <div className="relative z-10 p-8 md:p-12">
            <motion.div
              className="flex items-center justify-center mb-6"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ImageWithFallback
                src={currentItem.image}
                alt={currentItem.title}
                className="w-full h-auto max-h-[180px] md:max-h-[240px] object-contain"
                style={{
                  filter: "drop-shadow(0 10px 30px rgba(255,255,255,0.3))",
                }}
              />
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3
                className="text-xl md:text-2xl font-bold mb-2"
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 4px 20px rgba(255,255,255,0.3)",
                }}
              >
                {currentItem.title}
              </h3>
              <p className="text-sm md:text-base text-gray-300">
                {currentItem.subtitle}
              </p>
            </motion.div>
          </div>

          {/* Pulsing border glow */}
          <motion.div
            className="absolute inset-0 rounded-[inherit] pointer-events-none"
            style={{
              boxShadow: `0 0 0 1px ${currentItem.accentColor}`,
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
              boxShadow: [
                `0 0 20px 2px ${currentItem.accentColor}`,
                `0 0 40px 4px ${currentItem.accentColor}`,
                `0 0 20px 2px ${currentItem.accentColor}`,
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Navigation arrows with liquid morph */}
      <motion.button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-30 p-3 md:p-4 rounded-full"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
        }}
        whileHover={{
          scale: 1.15,
          background: "rgba(255, 255, 255, 0.2)",
          boxShadow: "0 12px 48px 0 rgba(0, 0, 0, 0.5)",
        }}
        whileTap={{ scale: 0.9 }}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </motion.button>

      <motion.button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-30 p-3 md:p-4 rounded-full"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
        }}
        whileHover={{
          scale: 1.15,
          background: "rgba(255, 255, 255, 0.2)",
          boxShadow: "0 12px 48px 0 rgba(0, 0, 0, 0.5)",
        }}
        whileTap={{ scale: 0.9 }}
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </motion.button>

      {/* Slide indicators */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-30 flex-wrap justify-center max-w-md">
        {portfolioItems.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="rounded-full"
            style={{
              background:
                index === currentSlide
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(255, 255, 255, 0.3)",
            }}
            animate={{
              width: index === currentSlide ? "28px" : "8px",
              height: "8px",
              scale: index === currentSlide ? [1, 1.15, 1] : 1,
            }}
            whileHover={{
              scale: 1.3,
              background: "rgba(255, 255, 255, 0.8)",
            }}
            transition={{
              duration: 0.3,
              scale: {
                duration: 1.5,
                repeat: index === currentSlide ? Infinity : 0,
              },
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
