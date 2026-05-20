import onaCoaster from "figma:asset/bc89b70e6e1d330be214c857d2c6898a12487874.png";
import onaNotebook from "figma:asset/a870db28d502ad17b4b4974a4ccf93949d4dd468.png";
import onaRoundCoaster from "figma:asset/e8016a92293874beed4c036fcd5610e927ed5248.png";

export function OnaKanOwojaPortfolio() {
  return (
    <section className="py-20 px-[10%] bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-12 md:mb-16 items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-2xl overflow-hidden border border-gray-800 bg-zinc-900 flex items-center justify-center p-4 shadow-[0_0_15px_rgba(168,162,158,0.15)]">
            <img 
              src={onaNotebook}
              alt="Ona Kan Owoja Merchandise"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wide">
              Ona Kan Owoja by Tosin
            </h3>
            <p className="text-xl text-stone-400 font-medium mb-4">
              Brand Identity & Merchandise
            </p>
            <div className="w-16 h-1 bg-stone-500 mb-6 shadow-[0_0_10px_rgba(120,113,108,0.5)]"></div>
            <p className="text-gray-400 text-base md:text-lg max-w-3xl leading-relaxed mb-6">
              "Your all round shopper for everything." Comprehensive brand identity and physical merchandise mockups including custom notebooks, coasters, and promotional materials designed to create a cohesive retail experience.
            </p>
          </div>
        </div>
        
        {/* Mockups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-white transition-all">
            <img 
              src={onaCoaster} 
              alt="Ona Kan Owoja - Square Coaster Mockup" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-white transition-all">
            <img 
              src={onaNotebook} 
              alt="Ona Kan Owoja - Notebook Mockup" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-white transition-all">
            <img 
              src={onaRoundCoaster} 
              alt="Ona Kan Owoja - Rounded Square Coaster Mockup" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Brand Description */}
        <div className="mt-12 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-white">Brand Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Unique Logo Design</h4>
              <p className="text-gray-400">Creative "e" shaped road design incorporating shopping, home, and lifestyle icons representing comprehensive service</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Color Palette</h4>
              <p className="text-gray-400">Navy blue and olive green combination creating a trustworthy and earthy brand feel</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Merchandise Applications</h4>
              <p className="text-gray-400">Logo applied to coasters and notebooks showing versatility across promotional materials</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-white">Service Identity</h4>
              <p className="text-gray-400">Brand positioning as an all-round shopping and errand service with clear visual storytelling</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}