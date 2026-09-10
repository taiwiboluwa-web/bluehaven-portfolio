import lamaysScentsLogo from "figma:asset/eca5d1b1aae735acb6bdea0539176c17f20e3de2.png";

export function LaMayScentsPortfolio() {
  return (
    <section className="py-20 px-[10%] bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-12 md:mb-16 items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-2xl overflow-hidden border border-gray-800 bg-[#1a1a1a] flex items-center justify-center p-4 shadow-[0_0_15px_rgba(244,114,182,0.15)]">
            <img 
              src={lamaysScentsLogo}
              alt="La May's Scents Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wide">
              La May's Scents
            </h3>
            <p className="text-xl text-pink-400 font-medium mb-4">
              Luxury Fragrance Brand Identity
            </p>
            <div className="w-16 h-1 bg-pink-500 mb-6 shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>
            <p className="text-gray-400 text-base md:text-lg max-w-3xl leading-relaxed mb-6">
              "Smell good, Spend smart." A luxury fragrance brand identity featuring delicate floral motifs, elegant serif typography, and a refined pink and gold color palette that communicates premium quality and sophisticated allure.
            </p>
          </div>
        </div>
        
        {/* Logo Showcase */}
        <div className="flex justify-center mb-12">
          <div className="rounded-xl border border-gray-800 overflow-hidden max-w-2xl w-full bg-[#1a1a1a] p-12">
            <img 
              src={lamaysScentsLogo} 
              alt="La May's Scents Logo" 
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Brand Description */}
        <div className="mt-12 text-center max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-white">Brand Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Feminine Elegance</h4>
              <p className="text-gray-400">Stylized woman's silhouette with flowing hair representing beauty and sophistication</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Perfume Symbolism</h4>
              <p className="text-gray-400">Spray bottle integrated into circular design symbolizing luxury fragrance experience</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Bold Red Palette</h4>
              <p className="text-gray-400">Deep crimson color creating passionate, memorable brand presence in cosmetics market</p>
            </div>
          </div>
          
          <div className="bg-[#1a1a1a] p-8 rounded-lg mt-8 border border-gray-800">
            <p className="text-gray-300 leading-relaxed italic">
              "La May's Scents embodies the perfect balance between luxury and affordability. With the tagline 'Smell good, Spend smart,' this brand brings premium fragrances to everyone. The elegant design featuring a woman's profile and perfume spray represents confidence, beauty, and the transformative power of scent."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}