import kefasLogo from "figma:asset/2bc2d0872bc004e56fb14516b9f2d99ed2497f0e.png";
import kefasRollup from "figma:asset/1b9656481927a26a9ae686a7236bf2640c6dfa40.png";
import kefasJacket from "figma:asset/58fc07bc58192e9b819de7ef808b8240dc282813.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ExternalLink } from "lucide-react";

export function KefasFoodPortfolio() {
  return (
    <section className="py-12 md:py-20 px-4 md:px-[10%] bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-12 md:mb-16 items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-2xl overflow-hidden border border-gray-800 bg-black flex items-center justify-center p-4 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
            <ImageWithFallback
              src={kefasLogo}
              alt="Kefas Foods Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wide">
              Kefas Foods
            </h3>
            <p className="text-xl text-green-500 font-medium mb-4">
              Authentic Taste, Premium Quality
            </p>
            <div className="w-16 h-1 bg-green-600 mb-6 shadow-[0_0_10px_rgba(22,163,74,0.5)]"></div>
            <p className="text-gray-400 text-base md:text-lg max-w-3xl leading-relaxed mb-6">
              Kefas Foods delivers premium, authentic food products. We developed a comprehensive brand identity including their distinctive logo and detailed industrial design specifications for physical marketing materials like teardrop roll-up stands. We also designed and developed their e-commerce storefront.
            </p>
            
            <a 
              href="https://www.kefasfood.store/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-full transition-colors duration-300"
            >
              <span>Visit Website</span>
              <ExternalLink size={18} />
            </a>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="group overflow-hidden bg-[#1a1a1a] rounded-xl border border-gray-800 flex flex-col">
            <div className="overflow-hidden bg-[#141414] flex justify-center p-4 md:p-8 flex-1 items-center">
              <ImageWithFallback
                src={kefasRollup}
                alt="Kefas Foods Teardrop Roll-up Stand Design"
                className="w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
            <div className="p-6 md:p-8 border-t border-gray-800">
              <h4 className="text-xl font-bold text-white mb-2 uppercase">Industrial Design Specification</h4>
              <p className="text-gray-400">Detailed blueprint for the Kefas Foods teardrop roll-up stand, including material specifications, hardware mechanics, and high-resolution graphic print layouts showcasing their premium product line.</p>
            </div>
          </div>
          
          <div className="group overflow-hidden bg-[#1a1a1a] rounded-xl border border-gray-800 flex flex-col">
            <div className="overflow-hidden bg-[#141414] flex justify-center p-4 md:p-8 flex-1 items-center">
              <ImageWithFallback
                src={kefasJacket}
                alt="Kefas Foods Varsity Jacket Merchandise"
                className="w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
            <div className="p-6 md:p-8 border-t border-gray-800">
              <h4 className="text-xl font-bold text-white mb-2 uppercase">Bespoke Apparel Engineering</h4>
              <p className="text-gray-400">A meticulously crafted varsity jacket that translates the Kefas brand into tangible streetwear. Featuring precision-embroidered insignias, heavyweight bespoke fabric selections, and a seamless integration of their signature brand palette, this piece elevates corporate merchandise into high-end fashion.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
