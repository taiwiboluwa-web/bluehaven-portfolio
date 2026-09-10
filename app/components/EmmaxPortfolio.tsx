import emmaxMousepad from "figma:asset/f48609cd648a36359bca8304bb109b6343124b64.png";
import emmaxKeyboard from "figma:asset/70d53cd06610d41a8281a3dd5392d0661770521f.png";
import emmaxMouse from "figma:asset/198b22ba7f8ee351cf170043046e0372370a098e.png";
import emmaxLogo from "figma:asset/13a97c85692fc63be5b64f1d6a49de7f7573056c.png";
import emmaxBackpack from "figma:asset/b182ddab337b85d3899b971869f8d2d20936c8e7.png";
import emmaxJacket from "figma:asset/35ea974cf35398a6abee5dcd47929d7977ca9085.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function EmmaxPortfolio() {
  return (
    <section className="py-12 md:py-20 px-4 md:px-[10%] bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-12 md:mb-16 items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-full overflow-hidden border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <ImageWithFallback
              src={emmaxLogo}
              alt="Emmax Gaming Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 uppercase tracking-wide">
              Emmax Gaming
            </h3>
            <div className="w-16 h-1 bg-blue-500 mb-6 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            <p className="text-gray-400 text-base md:text-lg max-w-3xl leading-relaxed">
              Emmax is a premium gaming brand focused on delivering high-performance gear. We designed custom merchandise including technical blueprints and 3D mockups for their signature mousepads, mechanical keyboards, precision gaming mice, as well as apparel and accessories like varsity jackets and backpacks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="md:col-span-2 lg:col-span-3 group overflow-hidden bg-[#1a1a1a]">
            <div className="aspect-[2/1] md:aspect-[21/9] overflow-hidden">
              <ImageWithFallback
                src={emmaxKeyboard}
                alt="Emmax Mechanical Keyboard Design"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-6 border-t-0 border border-gray-800">
              <h4 className="text-xl font-bold text-white mb-2 uppercase">Mechanical Keyboard</h4>
              <p className="text-gray-400">Technical schematics and product visualization for the flagship Emmax mechanical keyboard, featuring custom dragon branding and RGB elements.</p>
            </div>
          </div>
          
          <div className="group overflow-hidden bg-[#1a1a1a]">
            <div className="aspect-square overflow-hidden">
              <ImageWithFallback
                src={emmaxMousepad}
                alt="Emmax Gaming Mousepad"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-6 border-t-0 border border-gray-800">
              <h4 className="text-xl font-bold text-white mb-2 uppercase">Gaming Mousepad</h4>
              <p className="text-gray-400">Extra-large surface design and packaging concepts with the signature Emmax dragon emblem.</p>
            </div>
          </div>

          <div className="group overflow-hidden bg-[#1a1a1a]">
            <div className="aspect-square overflow-hidden">
              <ImageWithFallback
                src={emmaxMouse}
                alt="Emmax Precision Gaming Mouse"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-6 border-t-0 border border-gray-800">
              <h4 className="text-xl font-bold text-white mb-2 uppercase">Precision Mouse</h4>
              <p className="text-gray-400">Ergonomic shape exploration and technical blueprints for the high-performance gaming mouse.</p>
            </div>
          </div>
          
          <div className="group overflow-hidden bg-[#1a1a1a] lg:col-span-1 md:col-span-2">
            <div className="aspect-square md:aspect-[2/1] lg:aspect-square overflow-hidden bg-white/5">
              <ImageWithFallback
                src={emmaxBackpack}
                alt="Emmax Gaming Backpack"
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-6 border-t-0 border border-gray-800">
              <h4 className="text-xl font-bold text-white mb-2 uppercase">Tech Backpack</h4>
              <p className="text-gray-400">Functional tech backpack design featuring hard-shell protection, custom compartments for gaming gear, and integrated Emmax branding elements.</p>
            </div>
          </div>

          <div className="group overflow-hidden bg-[#1a1a1a] md:col-span-2 lg:col-span-2">
            <div className="aspect-square md:aspect-[2/1] overflow-hidden bg-white/5">
              <ImageWithFallback
                src={emmaxJacket}
                alt="Emmax Varsity Jacket"
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-6 border-t-0 border border-gray-800">
              <h4 className="text-xl font-bold text-white mb-2 uppercase">Varsity Jacket Apparel</h4>
              <p className="text-gray-400">Premium collegiate-style varsity jacket design "Class of 2025" for Emmax West Academy, featuring embroidered dragon patch, leather sleeves, and detailed production specifications.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
