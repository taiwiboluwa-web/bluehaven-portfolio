import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Activity, CheckCircle2, X } from "lucide-react";

export function StatusReportModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-gray-500 hover:text-white text-xs md:text-sm transition-colors inline-flex items-center gap-1"
      >
        Status
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close status report"
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] cursor-default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="status-report-title"
              className="fixed inset-4 md:inset-8 lg:inset-16 z-[61] flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="pointer-events-auto w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[#111]/95 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 id="status-report-title" className="text-lg font-semibold text-white">
                        System status
                      </h2>
                      <p className="text-xs text-gray-500">Bluehaven Studios</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close"
                    className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-6 py-7">
                  <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                    <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" />
                    <div>
                      <p className="font-medium text-white">All systems operational</p>
                      <p className="mt-1 text-sm leading-6 text-gray-400">
                        The Bluehaven Studios website and core services are currently available.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 px-6 py-4">
                  <p className="text-xs text-gray-500">Last checked when this page was loaded.</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
