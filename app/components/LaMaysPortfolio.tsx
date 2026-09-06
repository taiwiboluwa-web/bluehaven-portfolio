import { ImageWithFallback } from "./figma/ImageWithFallback";
import logoBlack from "figma:asset/777b4e5a77e627aeaa4ce39cade1e49cb009cfb3.png";
import logoWhite from "figma:asset/62d235325c15e1eaff3f81acb9d82756df2b81b4.png";
import bagWhite from "figma:asset/162566d71bdad862aa76f42f495b65d76900e1ad.png";
import boxBlack from "figma:asset/95191881655586aca3d327ec2eb5afbf35455dcf.png";
import boxWhite from "figma:asset/ff3dba176cacbc88344821a8ae415f0f160684e8.png";
import bagBlack from "figma:asset/6f5230ba4b09ea03cc70c63488d62b2b74d93b6e.png";

export function LaMaysPortfolio() {
  return (
    <section className="py-20 px-[10%] bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-12 md:mb-16 items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-2xl overflow-hidden border border-gray-800 bg-[#140b1e] flex items-center justify-center p-4 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <ImageWithFallback 
              src={logoBlack}
              alt="LaMay's Fashion Hub Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wide">
              LaMay's Fashion Hub
            </h3>
            <p className="text-xl text-purple-400 font-medium mb-4">
              Luxury Fashion Branding
            </p>
            <div className="w-16 h-1 bg-purple-500 mb-6 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
            <p className="text-gray-400 text-base md:text-lg max-w-3xl leading-relaxed mb-6">
              A luxurious fashion brand identity distinguished by elegant purple and gold accents. The project features premium retail packaging designs including sophisticated shopping bag and gift box mockups that reflect the brand's high-end positioning.
            </p>
          </div>
        </div>
        
        {/* Brand Deliverables Gallery */}
        <div className="space-y-8 md:space-y-12">
          {/* Packaging Series */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div className="group overflow-hidden rounded-xl border border-gray-800 bg-[#141414] hover:border-purple-500/50 transition-all">
              <div className="aspect-[4/3] overflow-hidden flex items-center justify-center p-8">
                <ImageWithFallback 
                  src={bagBlack} 
                  alt="LaMay's Fashion Hub - Black Shopping Bag" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 border-t border-gray-800 bg-[#0f0f0f]">
                <h4 className="text-lg font-bold text-white mb-1">Premium Retail Bag</h4>
                <p className="text-sm text-gray-400">Matte black finish with gold foil stamping</p>
              </div>
            </div>
            
            <div className="group overflow-hidden rounded-xl border border-gray-800 bg-[#141414] hover:border-purple-500/50 transition-all">
              <div className="aspect-[4/3] overflow-hidden flex items-center justify-center p-8 bg-[#141414]">
                <ImageWithFallback 
                  src={bagWhite} 
                  alt="LaMay's Fashion Hub - White Shopping Bag" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 border-t border-gray-800 bg-[#0f0f0f]">
                <h4 className="text-lg font-bold text-white mb-1">Boutique Carrier</h4>
                <p className="text-sm text-gray-400">Crisp white variation for luxury retail experience</p>
              </div>
            </div>

            <div className="group overflow-hidden rounded-xl border border-gray-800 bg-[#141414] hover:border-purple-500/50 transition-all">
              <div className="aspect-[4/3] overflow-hidden flex items-center justify-center p-8">
                <ImageWithFallback 
                  src={boxBlack} 
                  alt="LaMay's Fashion Hub - Black Gift Box" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 border-t border-gray-800 bg-[#0f0f0f]">
                <h4 className="text-lg font-bold text-white mb-1">Signature Gift Box</h4>
                <p className="text-sm text-gray-400">Elegant black box with gold ribbon detailing</p>
              </div>
            </div>

            <div className="group overflow-hidden rounded-xl border border-gray-800 bg-[#141414] hover:border-purple-500/50 transition-all">
              <div className="aspect-[4/3] overflow-hidden flex items-center justify-center p-8 bg-[#141414]">
                <ImageWithFallback 
                  src={boxWhite} 
                  alt="LaMay's Fashion Hub - White Gift Box" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 border-t border-gray-800 bg-[#0f0f0f]">
                <h4 className="text-lg font-bold text-white mb-1">Exclusive Packaging</h4>
                <p className="text-sm text-gray-400">Pristine white gift box for special collections</p>
              </div>
            </div>
          </div>

          {/* Core Brand Marks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div className="group overflow-hidden rounded-xl border border-gray-800 bg-black hover:border-purple-500/50 transition-all">
              <div className="aspect-square md:aspect-video overflow-hidden flex items-center justify-center p-8">
                <ImageWithFallback 
                  src={logoBlack} 
                  alt="LaMay's Fashion Hub - Dark Logo" 
                  className="max-w-[70%] max-h-[70%] object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            
            <div className="group overflow-hidden rounded-xl border border-gray-800 bg-[#141414] hover:border-purple-500/50 transition-all">
              <div className="aspect-square md:aspect-video overflow-hidden flex items-center justify-center p-8">
                <ImageWithFallback 
                  src={logoWhite} 
                  alt="LaMay's Fashion Hub - Light Logo" 
                  className="max-w-[70%] max-h-[70%] object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Description */}
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">Brand Identity Elements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-xl bg-[#111] border border-gray-800">
              <h4 className="font-bold text-lg mb-2 text-white">Monogram Design</h4>
              <p className="text-gray-400 text-sm">Stylized "LM" monogram with flowing dress silhouette representing high fashion.</p>
            </div>
            <div className="p-6 rounded-xl bg-[#111] border border-gray-800">
              <h4 className="font-bold text-lg mb-2 text-white">Luxury Colors</h4>
              <p className="text-gray-400 text-sm">Purple and gold combination creating a premium, sophisticated brand presence.</p>
            </div>
            <div className="p-6 rounded-xl bg-[#111] border border-gray-800">
              <h4 className="font-bold text-lg mb-2 text-white">Golden Accents</h4>
              <p className="text-gray-400 text-sm">Gold ring frame and typography elevating the brand to luxury fashion status.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
