import dazzledFlat from "figma:asset/df042d4e65ba2df64c7d343976873ac3b4d5c6ef.png";
import dazzled3D from "figma:asset/7da56af8fcbc2666fec87684b9b64e286c3cb4c1.png";

export function DazzledinEssencePortfolio() {
  return (
    <section className="py-20 px-[10%] bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-12 md:mb-16 items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-2xl overflow-hidden border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <img 
              src={dazzledFlat}
              alt="Dazzled in Essence Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wide">
              Dazzled in Essence
            </h3>
            <p className="text-xl text-yellow-500 font-medium mb-4">
              Luxury Brand Sophistication
            </p>
            <div className="w-16 h-1 bg-yellow-600 mb-6 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
            <p className="text-gray-300 text-base md:text-lg max-w-3xl leading-relaxed mb-6">
              "Elegance Reimagined." A luxury brand identity featuring striking gold and deep purple sophistication. The project explores versatile logo applications including clean flat designs and high-end 3D metallic renderings.
            </p>
          </div>
        </div>
        
        {/* Logo Variations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="group overflow-hidden rounded-lg shadow-2xl transition-all hover:shadow-[0_20px_60px_rgba(212,175,55,0.4)] bg-gradient-to-br from-gray-800 to-gray-900 p-12">
            <img 
              src={dazzledFlat} 
              alt="Dazzled in Essence - Flat Logo" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="group overflow-hidden rounded-lg shadow-2xl transition-all hover:shadow-[0_20px_60px_rgba(212,175,55,0.4)] bg-gradient-to-br from-gray-300 to-gray-400 p-12">
            <img 
              src={dazzled3D} 
              alt="Dazzled in Essence - 3D Logo" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Brand Description */}
        <div className="mt-12 text-center max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-white">Brand Essence</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-8">
            <div className="bg-white/5 p-6 rounded-lg border border-gold/20">
              <h4 className="font-bold text-lg mb-2 text-gold">Royal Flourish</h4>
              <p className="text-gray-300">Ornate golden fleur-de-lis symbolizing luxury, heritage, and timeless elegance</p>
            </div>
            <div className="bg-white/5 p-6 rounded-lg border border-purple-500/20">
              <h4 className="font-bold text-lg mb-2 text-purple-400">Purple Majesty</h4>
              <p className="text-gray-300">Deep purple accents representing royalty, sophistication, and premium quality</p>
            </div>
            <div className="bg-white/5 p-6 rounded-lg border border-gold/20">
              <h4 className="font-bold text-lg mb-2 text-gold">3D Dimension</h4>
              <p className="text-gray-300">Dimensional rendering showcasing depth and premium craftsmanship of the brand</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-900/20 to-gold/10 p-8 rounded-lg border border-gold/30">
            <p className="text-gray-200 leading-relaxed italic text-lg">
              "Dazzled in Essence represents the pinnacle of luxury branding. With the tagline 'Elegance Reimagined,' this brand combines regal purple with lustrous gold to create an identity that speaks to discerning clients seeking timeless sophistication. Every detail, from the ornate flourishes to the premium color palette, embodies excellence."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
