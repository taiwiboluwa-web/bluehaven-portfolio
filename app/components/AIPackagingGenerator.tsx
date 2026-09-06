import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Sparkles, Download, Package, Loader2, AlertCircle, Wine, Box, PackageOpen, Beer, Pill, Archive, ShoppingBag, Package2, Boxes } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import watermarkImage from "figma:asset/c8c46b271b9753c34e5546b1d461d483c1f3014a.png";
import { projectId } from "../../../utils/supabase/info";

const PACKAGING_TYPES = [
  "Bottle",
  "Box",
  "Pouch",
  "Can",
  "Tube",
  "Jar",
  "Bag",
  "Carton",
  "Sachet",
  "Container",
];

const PACKAGING_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Bottle: Wine,
  Box: Box,
  Pouch: PackageOpen,
  Can: Beer,
  Tube: Pill,
  Jar: Archive,
  Bag: ShoppingBag,
  Carton: Boxes,
  Sachet: Package2,
  Container: Package,
};

const AI_PROMPT_TEMPLATE = `Using the attached image, create a Professional industrial design packaging illustration sheet for a {PACKAGE_TYPE} package. Centered hero 3D render with realistic materials, soft studio lighting, and commercial-quality finish. Surrounded by technical views: front, side, top, bottom, angled perspective, and flat lay. Include wireframe construction sketches, fold lines, seam details, and dimension arrows in millimeters. Show material and finish callouts (matte, glossy print, plastic, paper, glass, etc.) in handwritten annotations. Add color swatches, realistic product illustration, and subtle shadows. Clean off-white sketchbook background, hybrid realistic render + pencil sketch style, modern product design documentation layout, ultra-detailed, portfolio-ready.

Stable Diffusion CFG: 7–9
Steps: 30–40
Sampler: DPM++
Resolution: 1024×1280 or higher`;

export function AIPackagingGenerator() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [selectedPackaging, setSelectedPackaging] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<"openai" | "stability">("openai");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!logoFile || !selectedPackaging) return;

    setIsGenerating(true);
    setError("");
    setGeneratedImage("");

    try {
      // Convert logo to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(logoFile);
      });
      const logoBase64 = await base64Promise;

      // Call Supabase edge function
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-cf1ab75b/generate-packaging`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logoBase64,
          packagingType: selectedPackaging,
          provider: selectedProvider,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(data.error || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
    } catch (err) {
      console.error("Generation error:", err);
      let errorMessage = "An unexpected error occurred";

      if (err instanceof TypeError && err.message.includes("fetch")) {
        errorMessage = "Cannot connect to API server. Please ensure the Supabase edge function is deployed.";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `bluehaven-packaging-${selectedPackaging.toLowerCase()}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.section
      id="ai-packaging"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-16 md:py-24 px-4 md:px-[10%] relative z-10"
    >
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`ai-particle-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: "radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(168,85,247,0.2) 70%, transparent 100%)",
              filter: "blur(1px)",
            }}
            animate={{
              y: [0, -25, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.7, 0.2],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              delay: Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <motion.div
            className="inline-flex items-center gap-3 mb-4"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-wide bg-gradient-to-r from-purple-400 via-pink-300 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
              AI Packaging Design Generator
            </h2>
            <Sparkles className="w-8 h-8 text-purple-400" />
          </motion.div>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-300 mx-auto mb-6 shadow-[0_0_8px_rgba(168,85,247,0.3)]"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
            Upload your brand logo, select a packaging type, and let AI generate professional packaging mockups with technical documentation
          </p>
        </div>

        {/* Main Generator Interface */}
        <motion.div
          className="max-w-5xl mx-auto p-6 md:p-10 rounded-3xl border relative overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.2), inset 0 0 30px rgba(168,85,247,0.05)",
          }}
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(168,85,247,0.3) 0%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
            {/* Left Column: Upload & Settings */}
            <div className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-white font-bold mb-3 uppercase tracking-wider text-sm">
                  Upload Brand Logo
                </label>
                <motion.div
                  className="relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer group transition-all"
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    borderColor: logoPreview ? "rgba(168,85,247,0.5)" : "rgba(255, 255, 255, 0.2)",
                  }}
                  whileHover={{
                    borderColor: "rgba(168,85,247,0.7)",
                    background: "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {logoPreview ? (
                    <div className="space-y-3">
                      <img src={logoPreview} alt="Logo preview" className="max-h-40 mx-auto rounded-lg" />
                      <p className="text-sm text-gray-400">Click to change logo</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 group-hover:text-purple-400 transition-colors" />
                      <p className="text-gray-400 group-hover:text-gray-300">
                        Click or drag to upload your logo
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, SVG (Max 10MB)</p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Packaging Type Selection */}
              <div>
                <label className="block text-white font-bold mb-3 uppercase tracking-wider text-sm">
                  Select Packaging Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PACKAGING_TYPES.map((type) => {
                    const IconComponent = PACKAGING_ICONS[type] || Package;
                    return (
                      <motion.button
                        key={type}
                        onClick={() => setSelectedPackaging(type)}
                        className="p-3 rounded-xl border text-sm transition-all relative overflow-hidden group"
                        style={{
                          background: selectedPackaging === type ? "rgba(168,85,247,0.2)" : "rgba(255, 255, 255, 0.03)",
                          borderColor: selectedPackaging === type ? "rgba(168,85,247,0.6)" : "rgba(255, 255, 255, 0.1)",
                          color: selectedPackaging === type ? "#fff" : "#9ca3af",
                        }}
                        whileHover={{
                          scale: 1.05,
                          borderColor: "rgba(168,85,247,0.6)",
                          background: "rgba(168,85,247,0.15)",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <IconComponent className="w-5 h-5 mx-auto mb-1" />
                        {type}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* AI Provider Selection */}
              <div>
                <label className="block text-white font-bold mb-3 uppercase tracking-wider text-sm">
                  AI Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    onClick={() => setSelectedProvider("openai")}
                    className="p-3 rounded-xl border text-sm transition-all"
                    style={{
                      background: selectedProvider === "openai" ? "rgba(168,85,247,0.2)" : "rgba(255, 255, 255, 0.03)",
                      borderColor: selectedProvider === "openai" ? "rgba(168,85,247,0.6)" : "rgba(255, 255, 255, 0.1)",
                      color: selectedProvider === "openai" ? "#fff" : "#9ca3af",
                    }}
                    whileHover={{
                      scale: 1.02,
                      borderColor: "rgba(168,85,247,0.6)",
                      background: "rgba(168,85,247,0.15)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    OpenAI DALL-E 3
                  </motion.button>
                  <motion.button
                    onClick={() => setSelectedProvider("stability")}
                    className="p-3 rounded-xl border text-sm transition-all"
                    style={{
                      background: selectedProvider === "stability" ? "rgba(168,85,247,0.2)" : "rgba(255, 255, 255, 0.03)",
                      borderColor: selectedProvider === "stability" ? "rgba(168,85,247,0.6)" : "rgba(255, 255, 255, 0.1)",
                      color: selectedProvider === "stability" ? "#fff" : "#9ca3af",
                    }}
                    whileHover={{
                      scale: 1.02,
                      borderColor: "rgba(168,85,247,0.6)",
                      background: "rgba(168,85,247,0.15)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Stability AI
                  </motion.button>
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                onClick={handleGenerate}
                disabled={!logoFile || !selectedPackaging || isGenerating}
                className="w-full py-4 px-6 rounded-xl font-bold uppercase tracking-wide flex items-center justify-center gap-3 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: logoFile && selectedPackaging && !isGenerating
                    ? "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
                    : "rgba(255, 255, 255, 0.1)",
                  color: "#fff",
                  boxShadow: logoFile && selectedPackaging && !isGenerating
                    ? "0 0 20px rgba(168,85,247,0.4)"
                    : "none",
                }}
                whileHover={logoFile && selectedPackaging && !isGenerating ? {
                  scale: 1.02,
                  boxShadow: "0 0 30px rgba(168,85,247,0.6)",
                } : {}}
                whileTap={{ scale: 0.98 }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate AI Mockup
                  </>
                )}
              </motion.button>

              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 rounded-xl border flex items-start gap-3"
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      borderColor: "rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-red-400 text-sm font-bold mb-1">Generation Failed</p>
                      <p className="text-red-300 text-xs">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Preview & Results */}
            <div className="space-y-6">
              <div>
                <label className="block text-white font-bold mb-3 uppercase tracking-wider text-sm">
                  Generated Mockup
                </label>
                <motion.div
                  className="aspect-[4/5] rounded-2xl border flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {isGenerating ? (
                    <div className="text-center space-y-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-16 h-16 text-purple-400 mx-auto" />
                      </motion.div>
                      <p className="text-gray-400">Generating your packaging design...</p>
                    </div>
                  ) : generatedImage ? (
                    <div className="relative w-full h-full">
                      <img
                        src={generatedImage}
                        alt="Generated packaging mockup"
                        className="w-full h-full object-contain rounded-xl"
                      />
                      {/* Watermark */}
                      <div className="absolute bottom-4 right-4 opacity-40 pointer-events-none">
                        <ImageWithFallback
                          src={watermarkImage}
                          alt="Bluehaven Studios Watermark"
                          className="w-24 h-auto"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <Package className="w-16 h-16 text-gray-600 mx-auto" />
                      <p className="text-gray-500">Your mockup will appear here</p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Download Button */}
              {generatedImage && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleDownload}
                  className="w-full py-3 px-6 rounded-xl font-bold uppercase tracking-wide flex items-center justify-center gap-3 border transition-all"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    color: "#fff",
                  }}
                  whileHover={{
                    borderColor: "rgba(255, 255, 255, 0.4)",
                    background: "rgba(255, 255, 255, 0.08)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="w-5 h-5" />
                  Download Mockup
                </motion.button>
              )}

              {/* API Setup Instructions */}
              <div className="p-4 rounded-xl border space-y-3" style={{
                background: "rgba(168,85,247,0.05)",
                borderColor: "rgba(168,85,247,0.2)",
              }}>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <span className="text-purple-400 font-bold">🔑 Setup Instructions:</span>
                </p>
                <div className="space-y-2 text-xs text-gray-400">
                  <p><strong className="text-purple-300">Step 1 - Get API Key:</strong></p>
                  <ul className="list-disc list-inside pl-2 space-y-1">
                    <li>OpenAI DALL-E: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">platform.openai.com/api-keys</a></li>
                    <li>Stability AI: <a href="https://platform.stability.ai/account/keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">platform.stability.ai/account/keys</a></li>
                  </ul>
                  <p className="mt-2"><strong className="text-purple-300">Step 2 - Deploy Edge Function:</strong></p>
                  <ul className="list-disc list-inside pl-2 space-y-1">
                    <li>Open <strong>Make Settings</strong> (gear icon)</li>
                    <li>Go to <strong>Supabase Edge Function Secrets</strong></li>
                    <li>Add: <code className="bg-black/50 px-1.5 py-0.5 rounded text-purple-300">OPENAI_API_KEY</code> or <code className="bg-black/50 px-1.5 py-0.5 rounded text-purple-300">STABILITY_API_KEY</code></li>
                    <li className="text-yellow-300">Click <strong>Deploy</strong> button (wait 30-60 seconds)</li>
                  </ul>
                  <p className="text-green-400/80 mt-2">✅ After deployment, reload this page and try generating!</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Technical Specifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="p-6 rounded-2xl border" style={{
            background: "rgba(255, 255, 255, 0.02)",
            borderColor: "rgba(255, 255, 255, 0.1)",
          }}>
            <h4 className="text-white font-bold mb-2 uppercase tracking-wide text-sm">Output Quality</h4>
            <p className="text-gray-400 text-sm">Portfolio-ready 1024×1280 resolution with commercial-grade finish</p>
          </div>
          <div className="p-6 rounded-2xl border" style={{
            background: "rgba(255, 255, 255, 0.02)",
            borderColor: "rgba(255, 255, 255, 0.1)",
          }}>
            <h4 className="text-white font-bold mb-2 uppercase tracking-wide text-sm">Technical Views</h4>
            <p className="text-gray-400 text-sm">Multi-angle renders with wireframes, dimensions, and material callouts</p>
          </div>
          <div className="p-6 rounded-2xl border" style={{
            background: "rgba(255, 255, 255, 0.02)",
            borderColor: "rgba(255, 255, 255, 0.1)",
          }}>
            <h4 className="text-white font-bold mb-2 uppercase tracking-wide text-sm">Design Style</h4>
            <p className="text-gray-400 text-sm">Hybrid realistic 3D render with hand-sketched documentation aesthetic</p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
