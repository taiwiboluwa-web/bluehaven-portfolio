import anchorBlack from "figma:asset/a5ec738fe9697b8a651fd91f22119de99cb39e53.png";
import anchorWhite from "figma:asset/65a53d85adafcde6e82f00e9261944bb2c6356cc.png";
import anchorBlue from "figma:asset/c55bcfa0faed5c2bccc9caa1617a5f49b358b142.png";

export function AnchorFreightPortfolio() {
  return (
    <section className="py-20 px-[10%] bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-12 md:mb-16 items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-2xl overflow-hidden border border-gray-800 bg-[#0e1b2a] flex items-center justify-center p-4 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
            <img 
              src={anchorBlue}
              alt="Anchor Freight Solutions Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wide">
              Anchor Freight Solutions Ltd
            </h3>
            <p className="text-xl text-sky-500 font-medium mb-4">
              Professional Logistics Brand Identity
            </p>
            <div className="w-16 h-1 bg-sky-600 mb-6 shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
            <p className="text-gray-400 text-base md:text-lg max-w-3xl leading-relaxed mb-6">
              A professional logistics brand identity built on trust and reliability. The design system features versatile color applications and cohesive corporate collateral, including distinct notebook mockups that reinforce a strong corporate presence.
            </p>
          </div>
        </div>
        
        {/* Notebook Mockups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-white transition-all">
            <img 
              src={anchorBlack} 
              alt="Anchor Freight Solutions - Black Notebook Mockup" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-white transition-all">
            <img 
              src={anchorWhite} 
              alt="Anchor Freight Solutions - White Notebook Mockup" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-white transition-all">
            <img 
              src={anchorBlue} 
              alt="Anchor Freight Solutions - Blue Notebook Mockup" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Brand Description */}
        <div className="mt-12 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-white">Brand Applications</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Black Edition</h4>
              <p className="text-gray-400">Premium white logo on black background for executive and formal business applications</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">White Edition</h4>
              <p className="text-gray-400">Blue logo on clean white background showcasing versatility and professional clarity</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Blue Edition</h4>
              <p className="text-gray-400">White logo on bold blue creating strong brand presence and recognition</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}