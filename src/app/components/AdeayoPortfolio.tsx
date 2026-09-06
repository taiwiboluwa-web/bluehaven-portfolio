import adeayoLogo from "figma:asset/6cc1ad7b7df17ad8b72f927373f24a2653494634.png";
import adeayoBagPurple from "figma:asset/820b227adfaf7b78bcca76341a23b32b611d42e5.png";
import adeayoBagWhite from "figma:asset/9f267c36cd25cea3749b24a18058510afe3139d7.png";

export function AdeayoPortfolio() {
  return (
    <section className="py-20 px-[10%] bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-12 md:mb-16 items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-2xl overflow-hidden border border-gray-800 bg-[#f9e8f4] flex items-center justify-center p-4 shadow-[0_0_15px_rgba(217,70,239,0.15)]">
            <img 
              src={adeayoLogo}
              alt="Clothings by Adeayo Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wide">
              Clothings by Adeayo
            </h3>
            <p className="text-xl text-fuchsia-500 font-medium mb-4">
              Fashion Brand Identity
            </p>
            <div className="w-16 h-1 bg-fuchsia-600 mb-6 shadow-[0_0_10px_rgba(192,38,211,0.5)]"></div>
            <p className="text-gray-400 text-base md:text-lg max-w-3xl leading-relaxed mb-6">
              Elegant fashion brand identity featuring flowing artistic elements and a sophisticated color palette. The complete design system includes custom typography, a bespoke icon, and premium retail shopping bag applications.
            </p>
          </div>
        </div>
        
        {/* Logo Showcase */}
        <div className="flex justify-center mb-12">
          <div className="rounded-xl border border-gray-800 overflow-hidden max-w-2xl w-full">
            <img 
              src={adeayoLogo} 
              alt="Clothings by Adeayo Logo" 
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Shopping Bag Mockups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-white transition-all">
            <img 
              src={adeayoBagPurple} 
              alt="Adeayo - Purple Shopping Bag Mockup" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-white transition-all">
            <img 
              src={adeayoBagWhite} 
              alt="Adeayo - White Shopping Bag Mockup" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Brand Description */}
        <div className="mt-12 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-white">Brand Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Flowing Design</h4>
              <p className="text-gray-400">Graceful, flowing lines forming the letter "A" symbolizing elegance and movement in fashion</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Fashion Focus</h4>
              <p className="text-gray-400">Sophisticated branding perfect for a clothing line emphasizing style and creativity</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Purple Elegance</h4>
              <p className="text-gray-400">Soft purple background creating a premium, luxurious feel for the fashion brand</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Bold Typography</h4>
              <p className="text-gray-400">Strong, confident lettering balanced with artistic flourishes for memorable impact</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}