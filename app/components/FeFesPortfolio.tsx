import fetesLight from "figma:asset/02727bfe17ced13dc5028d6f270d3eec43ea5c13.png";

export function FeFesPortfolio() {
  return (
    <section className="py-20 px-[10%] bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-12 md:mb-16 items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-2xl overflow-hidden border border-gray-800 bg-black flex items-center justify-center p-4 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
            <img 
              src={fetesLight}
              alt="FeFes Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wide">
              FeFes
            </h3>
            <p className="text-xl text-pink-500 font-medium mb-4">
              Modern Playful Logo Design
            </p>
            <div className="w-16 h-1 bg-pink-600 mb-6 shadow-[0_0_10px_rgba(219,39,119,0.5)]"></div>
            <p className="text-gray-400 text-base md:text-lg max-w-3xl leading-relaxed mb-6">
              A modern, playful logo design featuring a vibrant pink color palette. The typography is bold and energetic, capturing the lively essence of the brand while remaining clean and versatile.
            </p>
          </div>
        </div>
        
        {/* Logo Showcase */}
        <div className="flex justify-center mb-12">
          <div className="bg-[#1a1a1a] p-12 rounded-xl border border-gray-800 max-w-3xl w-full">
            <img 
              src={fetesLight} 
              alt="FeFes Logo - Pink and White Variations" 
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Brand Description */}
        <div className="mt-12 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-white">Brand Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Bold Typography</h4>
              <p className="text-gray-400">Custom lettering with playful curves and modern style creating a distinctive brand presence</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Color Variations</h4>
              <p className="text-gray-400">Pink and white color combinations designed for versatility across different backgrounds</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">3D Effect</h4>
              <p className="text-gray-400">Layered design creating depth and dimension for eye-catching visual impact</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Modern Appeal</h4>
              <p className="text-gray-400">Contemporary aesthetic perfect for youth-oriented brands and lifestyle products</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}