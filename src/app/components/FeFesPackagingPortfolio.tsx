import noodleBoxBlack from "figma:asset/7e8025457accc79323b47f5eb87a3314fdc2d18d.png";
import packWhite from "figma:asset/8208657a6fa70aeb805232a668820cd28fc372af.png";
import mealBoxes from "figma:asset/daa048910ac620e253488c7a0471a6e2792f135b.png";
import takeoutBagWhite from "figma:asset/4017580d2ee946543d9f33dd1885efb6c6f97fc2.png";
import takeoutBagBlack from "figma:asset/c8b53989f6b1c11905e7b1eb1fc9280a7efb0e30.png";
import noodleBoxWhite from "figma:asset/d3525f4100ea32178f84c0216a4661db4da7e141.png";

export function FeFesPackagingPortfolio() {
  return (
    <section className="py-12 md:py-20 px-4 md:px-[10%] bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-12 md:mb-16 items-start">
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-2xl overflow-hidden border border-gray-800 bg-white flex items-center justify-center p-4 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
            <img 
              src={takeoutBagWhite}
              alt="FeFe's Packaging"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wide">
              FeFe's Kitchen
            </h3>
            <p className="text-xl text-pink-500 font-medium mb-4">
              Branded Packaging System
            </p>
            <div className="w-16 h-1 bg-pink-600 mb-6 shadow-[0_0_10px_rgba(219,39,119,0.5)]"></div>
            <p className="text-gray-400 text-base md:text-lg max-w-3xl leading-relaxed mb-6">
              Complete packaging system featuring custom noodle boxes, meal containers, and takeout bags. The design maintains the brand's vibrant identity while ensuring practical, high-quality presentation for delivery and takeout.
            </p>
          </div>
        </div>
        
        {/* Noodle Boxes Grid */}
        <div className="mb-8 md:mb-12">
          <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white text-center">Noodle Box Designs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-pink-500 transition-all bg-white">
              <img 
                src={noodleBoxBlack} 
                alt="FeFe's Kitchen - Noodle Box Design Black" 
                className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-pink-500 transition-all bg-white">
              <img 
                src={noodleBoxWhite} 
                alt="FeFe's Kitchen - Noodle Box Design White" 
                className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>

        {/* Meal Boxes */}
        <div className="mb-8 md:mb-12">
          <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white text-center">Eco-Friendly Meal Boxes</h3>
          <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-pink-500 transition-all bg-white">
            <img 
              src={mealBoxes} 
              alt="FeFe's Kitchen - Eco-Friendly Meal Box Design" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Takeout Bags Grid */}
        <div className="mb-8 md:mb-12">
          <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white text-center">Takeout Bag Designs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-pink-500 transition-all bg-white">
              <img 
                src={takeoutBagWhite} 
                alt="FeFe's Kitchen - Takeout Bag White" 
                className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-pink-500 transition-all bg-white">
              <img 
                src={takeoutBagBlack} 
                alt="FeFe's Kitchen - Takeout Bag Black" 
                className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>

        {/* Detadly Pact */}
        <div className="mb-8 md:mb-12">
          <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white text-center">Detadly Pact Design</h3>
          <div className="group overflow-hidden rounded-lg border border-gray-800 hover:border-pink-500 transition-all bg-white">
            <img 
              src={packWhite} 
              alt="FeFe's Kitchen - PO26 Detadly Pact" 
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Brand Description */}
        <div className="mt-8 md:mt-12 text-center max-w-4xl mx-auto">
          <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Packaging Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-left">
            <div className="bg-[#1a1a1a] p-4 md:p-6 rounded-lg border border-gray-800">
              <h4 className="font-bold text-base md:text-lg mb-2 text-white">Eco-Friendly Materials</h4>
              <p className="text-sm md:text-base text-gray-400">PFAS-free coating, recycled materials, and sustainable packaging solutions for 2026 compliance</p>
            </div>
            <div className="bg-[#1a1a1a] p-4 md:p-6 rounded-lg border border-gray-800">
              <h4 className="font-bold text-base md:text-lg mb-2 text-white">Complete System</h4>
              <p className="text-sm md:text-base text-gray-400">Cohesive branding across noodle boxes, meal containers, takeout bags, and food packaging</p>
            </div>
            <div className="bg-[#1a1a1a] p-4 md:p-6 rounded-lg border border-gray-800">
              <h4 className="font-bold text-base md:text-lg mb-2 text-white">Brand Consistency</h4>
              <p className="text-sm md:text-base text-gray-400">Signature pink branding with detailed technical specifications for production</p>
            </div>
          </div>
          
          <div className="bg-[#1a1a1a] p-6 md:p-8 rounded-lg mt-6 md:mt-8 border border-gray-800">
            <p className="text-sm md:text-base text-gray-300 leading-relaxed italic px-4">
              "A comprehensive packaging solution for FeFe's Kitchen that combines sustainability with striking brand presence. Each piece is thoughtfully designed with precise measurements, eco-friendly materials, and the signature pink branding that makes every takeout experience memorable."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
