import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, FileText } from "lucide-react";

export function PrivacyPolicyModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-500 hover:text-white text-xs md:text-sm transition-colors inline-flex items-center gap-1"
      >
        Privacy Policy
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glassmorphism Container */}
              <div className="bg-[#141414]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_60px_rgba(255,255,255,0.1)] flex flex-col h-full overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
                      <FileText className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-2xl font-bold uppercase tracking-wide bg-gradient-to-r from-gray-400 via-gray-200 to-white bg-clip-text text-transparent">
                        Privacy Policy
                      </h2>
                      <p className="text-xs md:text-sm text-gray-400 mt-1">
                        Business Registration Certificate
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all group"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-white transition-colors" />
                  </button>
                </div>

                {/* Document Viewer */}
                <div className="flex-1 p-4 md:p-6 overflow-hidden">
                  <div className="w-full h-full bg-[#0f0f0f] rounded-xl border border-white/10 overflow-hidden shadow-inner">
                    <iframe
                      src="/src/imports/BLUEHAVEN_STUDIOS_CERTIFICATE.pdf"
                      className="w-full h-full"
                      title="Bluehaven Studios Certificate"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 md:px-8 md:py-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs md:text-sm text-gray-400 text-center sm:text-left">
                    <span className="text-gray-300 font-medium">BLUEHAVEN STUDIOS</span> | Business Registration No. <span className="text-white font-bold">9455932</span>
                  </p>
                  
                  <a
                    href="/src/imports/BLUEHAVEN_STUDIOS_CERTIFICATE.pdf"
                    download
                    className="px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-wide bg-gradient-to-r from-gray-200 to-white text-black rounded-lg hover:from-white hover:to-gray-200 transition-all hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  >
                    Download Certificate
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
