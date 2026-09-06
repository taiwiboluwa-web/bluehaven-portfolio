import lordsBlack from "figma:asset/d998f756ade35de3fb24f728515fbff45bad6fc4.png";
import lordsPurple from "figma:asset/1e99898bfdf296abb3b1c2b3c694c19cd16c9602.png";
import lordsBlackAlt from "figma:asset/cfa503c8ba964464fd2628c9d3c6abc558385cdb.png";
import lordsPurpleFull from "figma:asset/fd6191e9a5047bdbde77ab60ac6fc35eb839f382.png";

export function LordsHeritagePortfolio() {
  return (
    <section className="py-20 px-[10%] bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-12 md:mb-16 items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-2xl overflow-hidden border border-gray-800 bg-[#2d1b4e] flex items-center justify-center p-4 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <img 
              src={lordsPurpleFull}
              alt="Lord's Heritage Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wide">
              Lord's Heritage Care Services
            </h3>
            <p className="text-xl text-violet-400 font-medium mb-4">
              Childcare Services Branding
            </p>
            <div className="w-16 h-1 bg-violet-500 mb-6 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
            <p className="text-gray-400 text-base md:text-lg max-w-3xl leading-relaxed mb-6">
              "Simplifying child care." A welcoming and professional brand identity developed for comprehensive childcare services. The project extends the visual identity into practical, high-quality staff uniforms and merchandise design.
            </p>
          </div>
        </div>
        
        {/* T-shirt Mockups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-white transition-all bg-[#1a1a1a]">
            <img 
              src={lordsBlack} 
              alt="Lord's Heritage - Bluehaven Studios Black T-shirt" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-white transition-all bg-[#1a1a1a]">
            <img 
              src={lordsPurple} 
              alt="Lord's Heritage - Purple T-shirt" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-white transition-all bg-[#1a1a1a]">
            <img 
              src={lordsBlackAlt} 
              alt="Lord's Heritage - Black T-shirt Alternative" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-white transition-all bg-[#1a1a1a]">
            <img 
              src={lordsPurpleFull} 
              alt="Lord's Heritage - Purple Full Design" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Brand Description */}
        <div className="mt-12 text-center max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-white">Design Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-8">
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Brand Identity</h4>
              <p className="text-gray-400">Professional childcare branding with shield emblem representing trust, safety, and heritage</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Color Variations</h4>
              <p className="text-gray-400">Multiple colorways (black, purple) showcasing brand versatility across merchandise</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Core Values</h4>
              <p className="text-gray-400">Love, Nurture, Safe, Idea, and Smile - visualized through custom iconography</p>
            </div>
          </div>
          
          <div className="bg-[#1a1a1a] p-8 rounded-lg border border-gray-800">
            <p className="text-gray-300 leading-relaxed italic">
              "At Lord's Heritage Care Services, every little one receives dedicated support rooted in heritage, empathy, and care. Hearts are empowered, roots are strengthened, and talents are awakened. We nurture growth through safety, service, respect, and inspiration, helping children thrive in an environment filled with love and support."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}