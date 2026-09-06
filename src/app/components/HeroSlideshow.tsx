import { useState, useEffect } from 'react';
import { ImageWithFallback } from "./figma/ImageWithFallback";
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

const slides = [
  {
    image: kefasLogo,
    title: "Kefas Foods",
    subtitle: "Authentic Taste, Premium Quality",
    color: "from-green-900/40 to-emerald-900/40"
  },
  {
    image: emmaxLogo,
    title: "Emmax Gaming",
    subtitle: "High-Performance Gaming Gear",
    color: "from-blue-900/40 to-indigo-900/40"
  },
  {
    image: primaxLogo,
    title: "Primax Bar & Grill",
    subtitle: "Restaurant Branding & Menu Design",
    color: "from-red-900/40 to-orange-900/40"
  },
  {
    image: wendeesBlue,
    title: "Wendee's Bakery",
    subtitle: "Bakery Brand Identity",
    color: "from-blue-900/40 to-sky-900/40"
  },
  {
    image: adeayoLogo,
    title: "Clothings by Adeayo",
    subtitle: "Fashion Brand Identity",
    color: "from-purple-900/40 to-pink-900/40"
  },
  {
    image: fetesLight,
    title: "FeFes",
    subtitle: "Modern Playful Logo Design",
    color: "from-pink-900/40 to-rose-900/40"
  },
  {
    image: fefesCard,
    title: "FeFes Kitchen",
    subtitle: "Restaurant Business Cards",
    color: "from-pink-900/40 to-purple-900/40"
  },
  {
    image: lordsBlack,
    title: "Lord's Heritage Care",
    subtitle: "Childcare Services Merchandise",
    color: "from-blue-900/40 to-indigo-900/40"
  },
  {
    image: anchorBlue,
    title: "Anchor Freight Solutions",
    subtitle: "Logistics Brand Identity",
    color: "from-blue-900/40 to-cyan-900/40"
  },
  {
    image: lamaysBlack,
    title: "LaMay's Fashion Hub",
    subtitle: "Luxury Fashion Branding",
    color: "from-purple-900/40 to-amber-900/40"
  },
  {
    image: elejaLogoDark,
    title: "Eleja Exchange",
    subtitle: "Digital Asset Exchange Branding",
    color: "from-blue-900/40 to-purple-900/40"
  },
  {
    image: dazzledFlat,
    title: "Dazzled in Essence",
    subtitle: "Beauty & Wellness Brand",
    color: "from-yellow-900/40 to-orange-900/40"
  },
  {
    image: lamaysScentsLogo,
    title: "LaMay Scents",
    subtitle: "Fragrance Branding",
    color: "from-pink-900/40 to-rose-900/40"
  },
  {
    image: souvenirsWhite,
    title: "Souvenirs",
    subtitle: "Custom Branding",
    color: "from-gray-900/40 to-zinc-900/40"
  },
  {
    image: onaNotebook,
    title: "OnaKanOwoja",
    subtitle: "Brand Merchandise",
    color: "from-stone-900/40 to-neutral-900/40"
  }
];

export function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.color}`}></div>
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
            <div className="max-w-xs sm:max-w-md md:max-w-2xl w-full">
              <div className="bg-[#1a1a1a]/60 backdrop-blur-sm p-6 md:p-10 rounded-xl border border-gray-700/50">
                <ImageWithFallback 
                  src={slide.image} 
                  alt={slide.title}
                  className="w-full h-auto max-h-[200px] sm:max-h-[300px] md:max-h-[400px] object-contain drop-shadow-2xl mx-auto"
                />
              </div>
            </div>
          </div>
          <div className="absolute bottom-16 md:bottom-20 left-0 right-0 text-center px-4">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">{slide.title}</h3>
            <p className="text-sm md:text-lg text-gray-200">{slide.subtitle}</p>
          </div>
        </div>
      ))}

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20 flex-wrap justify-center w-[90%] md:w-auto">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-white w-4 md:w-8' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}
        className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 md:p-3 rounded-full transition-all z-20"
        aria-label="Previous slide"
      >
        <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goToSlide((currentSlide + 1) % slides.length)}
        className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 md:p-3 rounded-full transition-all z-20"
        aria-label="Next slide"
      >
        <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
