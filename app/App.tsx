import { PrivacyPolicyModal } from "@/app/components/PrivacyPolicyModal";
import { StatusReportModal } from "@/app/components/StatusReportModal";
import { CreativeStudioLogo } from "@/app/components/CreativeStudioLogo";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { PrimaxPortfolio } from "@/app/components/PrimaxPortfolio";
import { WendeesBakeryPortfolio } from "@/app/components/WendeesBakeryPortfolio";
import { KefasFoodPortfolio } from "@/app/components/KefasFoodPortfolio";
import { FeFesPortfolio } from "@/app/components/FeFesPortfolio";
import { AdeayoPortfolio } from "@/app/components/AdeayoPortfolio";
import { OnaKanOwojaPortfolio } from "@/app/components/OnaKanOwojaPortfolio";
import { AnchorFreightPortfolio } from "@/app/components/AnchorFreightPortfolio";
import { LordsHeritagePortfolio } from "@/app/components/LordsHeritagePortfolio";
import { SouvenirsPortfolio } from "@/app/components/SouvenirsPortfolio";
import { LaMaysPortfolio } from "@/app/components/LaMaysPortfolio";
import { FeFesKitchenPortfolio } from "@/app/components/FeFesKitchenPortfolio";
import { FeFesPackagingPortfolio } from "@/app/components/FeFesPackagingPortfolio";
import { ElejaExchangePortfolio } from "@/app/components/ElejaExchangePortfolio";
import { LaMayScentsPortfolio } from "@/app/components/LaMayScentsPortfolio";
import { DazzledinEssencePortfolio } from "@/app/components/DazzledinEssencePortfolio";
import { EmmaxPortfolio } from "@/app/components/EmmaxPortfolio";
import { LiquidMorphSlideshow } from "@/app/components/LiquidMorphSlideshow";
import { LiquidBackground } from "@/app/components/LiquidBackground";
import { DepthLayer } from "@/app/components/DepthLayer";
import { CustomVideoPlayer } from "@/app/components/CustomVideoPlayer";
import { ReviewsSection } from "@/app/components/ReviewsSection";
import { PortfolioSectionDivider } from "@/app/components/PortfolioSectionDivider";
import { ServiceCard } from "@/app/components/ServiceCard";
import { InfiniteCarousel } from "@/app/components/InfiniteCarousel";
import { GlassMorphCard } from "@/app/components/GlassMorphCard";
import { FloatingParticles } from "@/app/components/FloatingParticles";
import { ScrollProgressBar } from "@/app/components/ScrollProgressBar";
import { Clock } from "@/app/components/Clock";
import { AIPackagingGenerator } from "@/app/components/AIPackagingGenerator";
import { FounderFlipCard } from "@/app/components/FounderFlipCard";
import { ChatBot } from "@/app/components/ChatBot";
import {
  Mail,
  Phone,
  MessageCircle,
  Instagram,
  Music,
  Link as LinkIcon,
  Users,
  Menu,
  X,
  Video,
  Palette,
  Share2,
  GraduationCap,
  TrendingUp,
  Target,
} from "lucide-react";
import bluehavenFullLogo from "figma:asset/318705c2795eaab3aa2bbcbe474e91ea2d50306e.png";
import bluehavenNewLogo from "figma:asset/97dc3295bd62e7ada943dd44b88acc765a6f4ca6.png";
import socialPreviewImage from "figma:asset/0b071b60b90b2963a2f33330f5835ca73ffb4ab9.png";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Helmet, HelmetProvider } from "react-helmet-async";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Add favicon
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = bluehavenNewLogo;

    // Add title
    document.title = "Bluehaven Studios";
    
    // Force-hide accessibility links injected by hosting/framework
    const hideAccessibilityLinks = () => {
      const links = document.querySelectorAll('a');
      links.forEach(link => {
        if (link.textContent?.toLowerCase().includes('skip to main content')) {
          link.style.position = 'absolute';
          link.style.width = '1px';
          link.style.height = '1px';
          link.style.padding = '0';
          link.style.margin = '-1px';
          link.style.overflow = 'hidden';
          link.style.clip = 'rect(0, 0, 0, 0)';
          link.style.whiteSpace = 'nowrap';
          link.style.border = '0';
        }
      });
    };

    hideAccessibilityLinks();
    
    // In case it's injected asynchronously
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) hideAccessibilityLinks();
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const whatsappContact = () => {
    window.open("https://wa.me/2348068483718?text=I%20would%20love%20to%20make%20enquiries%20about%20your%20service", "_blank");
  };

  return (
    <HelmetProvider>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Bluehaven Studios - Creative Digital Agency</title>
        <meta name="title" content="Bluehaven Studios - Creative Digital Agency" />
        <meta name="description" content="Bluehaven Studios is a premier creative agency specializing in branding, social media management, video production, and digital marketing. We transform brands into experiences." />

        {/* Google Site Verification */}
        <meta name="google-site-verification" content="EXh745KLffMBZxUlTg41LO5iqpwrf4ozPJoWhie5FRg" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bluehavenstudios.com/" />
        <meta property="og:title" content="Bluehaven Studios - Creative Digital Agency" />
        <meta property="og:description" content="Bluehaven Studios is a premier creative agency specializing in branding, social media management, video production, and digital marketing. We transform brands into experiences." />
        <meta property="og:image" content={socialPreviewImage} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://bluehavenstudios.com/" />
        <meta property="twitter:title" content="Bluehaven Studios - Creative Digital Agency" />
        <meta property="twitter:description" content="Bluehaven Studios is a premier creative agency specializing in branding, social media management, video production, and digital marketing. We transform brands into experiences." />
        <meta property="twitter:image" content={socialPreviewImage} />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="min-h-screen w-full overflow-x-hidden bg-[#0f0f0f] relative"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        {/* Scroll Progress Bar */}
        <ScrollProgressBar />

        {/* Liquid Background Effect */}
        <DepthLayer depth={0}>
          <LiquidBackground />
        </DepthLayer>

        {/* Header */}
        <DepthLayer depth={8}>
          <header className="bg-black/40 backdrop-blur-md border-b border-white/10 px-4 md:px-[10%] py-3 md:py-5 flex justify-between items-center sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative">
        <div className="flex items-center">
          <h1 className="text-lg md:text-2xl font-bold uppercase tracking-wide bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            BLUEHAVEN STUDIOS
          </h1>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white p-2 rounded-lg"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait">
            {mobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex gap-5 list-none">
            <li>
              <motion.button
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  })
                }
                className="text-white hover:text-gray-300 transition-colors text-sm uppercase tracking-wide relative overflow-hidden px-3 py-2 rounded-lg"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Home
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </li>
            <li>
              <motion.button
                onClick={() => scrollToSection("services")}
                className="text-white hover:text-gray-300 transition-colors text-sm uppercase tracking-wide relative overflow-hidden px-3 py-2 rounded-lg"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Services
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </li>
            <li>
              <motion.button
                onClick={() => scrollToSection("portfolio")}
                className="text-white hover:text-gray-300 transition-colors text-sm uppercase tracking-wide relative overflow-hidden px-3 py-2 rounded-lg"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Portfolio
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </li>
            <li>
              <motion.button
                onClick={() => scrollToSection("process")}
                className="text-white hover:text-gray-300 transition-colors text-sm uppercase tracking-wide relative overflow-hidden px-3 py-2 rounded-lg"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Process
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </li>
            <li>
              <motion.button
                onClick={() => scrollToSection("contact")}
                className="text-white hover:text-gray-300 transition-colors text-sm uppercase tracking-wide relative overflow-hidden px-3 py-2 rounded-lg"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Inquire
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </li>
          </ul>
        </nav>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 shadow-2xl overflow-hidden"
              style={{
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.05)",
              }}
            >
              <ul className="flex flex-col list-none">
                <motion.li
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                  className="border-b border-white/10"
                >
                  <motion.button
                    onClick={() => {
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                      setMobileMenuOpen(false);
                    }}
                    className="text-white hover:bg-white/5 transition-colors text-sm uppercase tracking-wide w-full text-left px-6 py-4"
                    whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    Home
                  </motion.button>
                </motion.li>
                <motion.li
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
                  className="border-b border-white/10"
                >
                  <motion.button
                    onClick={() => scrollToSection("services")}
                    className="text-white hover:bg-white/5 transition-colors text-sm uppercase tracking-wide w-full text-left px-6 py-4"
                    whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Services
                  </motion.button>
                </motion.li>
                <motion.li
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                  className="border-b border-white/10"
                >
                  <motion.button
                    onClick={() => scrollToSection("portfolio")}
                    className="text-white hover:bg-white/5 transition-colors text-sm uppercase tracking-wide w-full text-left px-6 py-4"
                    whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Portfolio
                  </motion.button>
                </motion.li>
                <motion.li
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="border-b border-white/10"
                >
                  <motion.button
                    onClick={() => scrollToSection("process")}
                    className="text-white hover:bg-white/5 transition-colors text-sm uppercase tracking-wide w-full text-left px-6 py-4"
                    whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Process
                  </motion.button>
                </motion.li>
                <motion.li
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    onClick={() => scrollToSection("contact")}
                    className="text-white hover:bg-white/5 transition-colors text-sm uppercase tracking-wide w-full text-left px-6 py-4"
                    whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Inquire
                  </motion.button>
                </motion.li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
          </header>
        </DepthLayer>

        {/* Hero Section */}
        <DepthLayer depth={5}>
          <section className="relative min-h-screen flex items-center justify-center text-white text-center px-4 md:px-5 overflow-hidden z-10">
        {/* Floating Particles */}
        <FloatingParticles />

        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-white rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-white rounded-full blur-3xl"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.1, 0.25, 0.1],
              x: [0, -40, 0],
              y: [0, -25, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        {/* Diagonal accent stripes */}
        <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full border-t-2 border-white transform rotate-12"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full border-t-2 border-white transform -rotate-12"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto pt-10 md:pt-20 pb-16 md:pb-32">
          {/* Main heading with dramatic styling */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6 md:mb-8"
          >
            <div className="inline-block">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  BLUEHAVEN STUDIOS
                </span>
              </h1>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-3 md:mb-4 text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em] text-xs md:text-sm px-4"
          >
            Creativity Beyond Limits
          </motion.div>

          {/* Separator line */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-24 md:w-32 h-1 bg-gradient-to-r from-gray-600 via-gray-200 to-gray-600 mx-auto mb-6 md:mb-8 shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          ></motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="text-base md:text-lg lg:text-xl mb-4 md:mb-6 text-gray-300 max-w-4xl mx-auto leading-relaxed px-4"
          >
            Bring your brand to life through{" "}
            <span className="text-white font-bold bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent">
              Livestreaming
            </span>
            ,{" "}
            <span className="text-white font-bold bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent">
              Graphics Design
            </span>
            ,{" "}
            <span className="text-white font-bold bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent">
              Branding
            </span>
            ,{" "}
            <span className="text-white font-bold bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent">
              Photography
            </span>
            ,{" "}
            <span className="text-white font-bold bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent">
              Videography
            </span>
            ,{" "}
            <span className="text-white font-bold bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent">
              Podcasting
            </span>
            ,{" "}
            <span className="text-white font-bold bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent">
              Storytelling
            </span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className="text-sm md:text-lg lg:text-xl mb-8 md:mb-12 text-gray-400 max-w-3xl mx-auto leading-relaxed px-4"
          >
            "We partner with ambitious brands to build unique identities, 
            high-impact visuals, and unforgettable digital experiences that
            bring your vision to life."
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.0, ease: "easeOut" }}
            className="flex gap-3 md:gap-5 justify-center flex-wrap mb-10 md:mb-16 px-4"
          >
            <motion.button
              onClick={() => scrollToSection("portfolio")}
              className="bg-gradient-to-r from-gray-200 to-white text-black px-6 md:px-12 py-3 md:py-4 text-sm md:text-base font-bold uppercase tracking-wide rounded-lg relative overflow-hidden"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px rgba(255,255,255,0.6)",
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                boxShadow: "0 0 15px rgba(255,255,255,0.4)",
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white to-gray-200"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              />
              <span className="relative z-10">View Portfolio</span>
            </motion.button>
            <motion.button
              onClick={whatsappContact}
              className="text-white px-6 md:px-12 py-3 md:py-4 text-sm md:text-base font-bold uppercase tracking-wide border rounded-lg relative overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                borderColor: "rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 30px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.05)",
              }}
              whileHover={{
                scale: 1.05,
                borderColor: "rgba(255, 255, 255, 0.5)",
                background: "rgba(255, 255, 255, 0.1)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.2), inset 0 0 30px rgba(255,255,255,0.08)",
                transition: { duration: 0.4, ease: "easeInOut" },
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Animated shimmer effect */}
              <motion.div
                className="absolute -inset-full"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                }}
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                }}
              />
              {/* Liquid morphing background */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 50%)",
                }}
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <span className="relative z-10">Let's Talk</span>
            </motion.button>
          </motion.div>

          {/* Services preview icons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.2, ease: "easeOut" }}
            className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto px-4"
          >
            <motion.div
              className="group cursor-pointer p-4 rounded-2xl backdrop-blur-md border border-white/5 relative overflow-hidden"
              onClick={() => scrollToSection("services")}
              whileHover={{
                scale: 1.05,
                borderColor: "rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.08)",
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1), inset 0 0 15px rgba(255,255,255,0.03)",
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute -inset-full opacity-0 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                }}
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
              <div className="flex justify-center mb-2 md:mb-3 relative z-10">
                <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
                  <Target className="w-8 h-8 md:w-12 md:h-12 text-gray-400 group-hover:text-white transition-colors" />
                </motion.div>
              </div>
              <p className="text-xs md:text-sm uppercase tracking-wider text-gray-400 group-hover:text-white transition-colors relative z-10">
                Brand Strategy
              </p>
            </motion.div>

            <motion.div
              className="group cursor-pointer p-4 rounded-2xl backdrop-blur-md border border-white/5 relative overflow-hidden"
              onClick={() => scrollToSection("services")}
              whileHover={{
                scale: 1.05,
                borderColor: "rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.08)",
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1), inset 0 0 15px rgba(255,255,255,0.03)",
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute -inset-full opacity-0 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                }}
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
              <div className="flex justify-center mb-2 md:mb-3 relative z-10">
                <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
                  <Share2 className="w-8 h-8 md:w-12 md:h-12 text-gray-400 group-hover:text-white transition-colors" />
                </motion.div>
              </div>
              <p className="text-xs md:text-sm uppercase tracking-wider text-gray-400 group-hover:text-white transition-colors relative z-10">
                Digital Presence
              </p>
            </motion.div>

            <motion.div
              className="group cursor-pointer p-4 rounded-2xl backdrop-blur-md border border-white/5 relative overflow-hidden"
              onClick={() => scrollToSection("services")}
              whileHover={{
                scale: 1.05,
                borderColor: "rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.08)",
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1), inset 0 0 15px rgba(255,255,255,0.03)",
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute -inset-full opacity-0 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                }}
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
              <div className="flex justify-center mb-2 md:mb-3 relative z-10">
                <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
                  <Video className="w-8 h-8 md:w-12 md:h-12 text-gray-400 group-hover:text-white transition-colors" />
                </motion.div>
              </div>
              <p className="text-xs md:text-sm uppercase tracking-wider text-gray-400 group-hover:text-white transition-colors relative z-10">
                Visual Assets
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.button
            onClick={() => scrollToSection("services")}
            className="text-white opacity-50 hover:opacity-100 transition-opacity relative"
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {/* Pulsing glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
                filter: "blur(10px)",
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <svg
              className="w-6 h-6 md:w-8 md:h-8 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.button>
        </motion.div>
          </section>
        </DepthLayer>

        {/* Portfolio Slideshow Section */}
        <DepthLayer depth={6}>
          <section className="py-12 md:py-20 px-4 md:px-[10%] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-7xl mx-auto"
        >
          <motion.h2
            className="text-2xl md:text-4xl font-bold text-center mb-3 md:mb-4 uppercase tracking-wide bg-gradient-to-r from-gray-400 via-gray-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            animate={{
              textShadow: [
                "0 0 10px rgba(255,255,255,0.2)",
                "0 0 20px rgba(255,255,255,0.4)",
                "0 0 10px rgba(255,255,255,0.2)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Our Recent Work
          </motion.h2>
          <motion.div
            className="w-16 md:w-20 h-1 bg-gradient-to-r from-gray-500 to-gray-200 mx-auto mb-6 md:mb-12 shadow-[0_0_8px_rgba(255,255,255,0.3)]"
            animate={{
              width: ["64px", "80px", "64px"],
              boxShadow: [
                "0 0 8px rgba(255,255,255,0.3)",
                "0 0 16px rgba(255,255,255,0.6)",
                "0 0 8px rgba(255,255,255,0.3)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.p
            className="text-center text-gray-400 mb-8 md:mb-12 text-base md:text-lg px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Showcasing brands we've brought to life
          </motion.p>

          {/* Slideshow Container with 8D Liquid Morph Effects */}
          <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
            <LiquidMorphSlideshow />
          </div>
        </motion.div>
          </section>
        </DepthLayer>

        {/* Featured Showreel Video Section */}
        <DepthLayer depth={4}>
          <section className="py-16 md:py-24 px-4 md:px-[10%] border-y border-gray-800 relative overflow-hidden z-10">
        {/* Floating particles for showreel section */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`showreel-particle-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                background: "radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(59,130,246,0.2) 70%, transparent 100%)",
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

        {/* Liquid morphing background */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)",
            filter: "blur(70px)",
          }}
          animate={{
            scale: [1, 1.4, 1],
            x: [0, -60, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto relative z-10"
        >
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-wide bg-gradient-to-r from-gray-400 via-gray-200 to-white bg-clip-text text-transparent inline-block mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              Featured Showreel
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-gray-500 to-gray-200 mx-auto shadow-[0_0_8px_rgba(255,255,255,0.3)]"></div>
            <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
              Watch our customized branded motion graphics video.
            </p>
          </div>
          
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            <CustomVideoPlayer 
              title="Bluehaven Studios Showreel - Part 1" 
              src="https://res.cloudinary.com/dgvpzqock/video/upload/v1774737350/VN20251030_224855_ull04i.mp4" 
              poster="https://res.cloudinary.com/dgvpzqock/video/upload/so_0,f_auto,q_auto/v1774737350/VN20251030_224855_ull04i.jpg"
            />
            <CustomVideoPlayer 
              title="Bluehaven Studios Showreel - Part 2" 
              src="https://res.cloudinary.com/dgvpzqock/video/upload/v1774737292/VN20251030_225120_qeowzz.mp4" 
              poster="https://res.cloudinary.com/dgvpzqock/video/upload/so_0,f_auto,q_auto/v1774737292/VN20251030_225120_qeowzz.jpg"
            />
          </div>
        </motion.div>
      </section>
        </DepthLayer>

        {/* Infinite Carousel Section */}
        <DepthLayer depth={5}>
          <section className="py-8 relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <InfiniteCarousel
                items={[
                  "Brand Identity Design",
                  "Motion Graphics",
                  "Social Media Content",
                  "Video Production",
                  "3D Rendering",
                  "Photography",
                  "Script Writing",
                  "Logo Systems",
                  "Media Training",
                  "Content Strategy"
                ]}
                duration={40}
                direction="left"
              />
            </motion.div>
          </section>
        </DepthLayer>

        {/* Services Section */}
        <DepthLayer depth={5}>
          <section
            id="services"
        className="py-12 md:py-20 px-4 md:px-[10%] text-center relative z-10"
      >
        {/* Subtle floating particles for services section */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`service-particle-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                background: "radial-gradient(circle, rgba(147,51,234,0.8) 0%, rgba(147,51,234,0.2) 70%, transparent 100%)",
                filter: "blur(0.5px)",
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 15 - 7.5, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: Math.random() * 8 + 8,
                delay: Math.random() * 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 uppercase tracking-wide bg-gradient-to-r from-gray-400 via-gray-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            What We Do
          </h2>
          <div className="w-16 md:w-20 h-1 bg-gradient-to-r from-gray-500 to-gray-200 mx-auto mb-6 md:mb-8 shadow-[0_0_8px_rgba(255,255,255,0.3)]"></div>
        </motion.div>
        
        {/* Philosophy Statement */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto mb-12 md:mb-16"
        >
          <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-4">
            BlueHaven Studios functions as a <span className="text-white font-bold">creative sanctuary</span> where high-end production meets intentional storytelling. The core of our operation centers on a <span className="bg-gradient-to-r from-gray-400 via-gray-200 to-white bg-clip-text text-transparent font-bold">"Creativity Beyond Limits"</span> philosophy, blending technical precision with a focus on raising the next generation of digital creators.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          
          <ServiceCard
            icon={<Video className="w-10 h-10 md:w-12 md:h-12 text-gray-400 group-hover:text-white transition-colors" />}
            title="Visual Production"
            description="Comprehensive videography and photography services that prioritize clean, modern aesthetics and professional-grade finishes."
            delay={0.1}
          />

          <ServiceCard
            icon={<Palette className="w-10 h-10 md:w-12 md:h-12 text-gray-400 group-hover:text-white transition-colors" />}
            title="Brand Identity & Design"
            description="Specialized industrial design packaging and 3D rendering, alongside traditional graphic design and logo systems."
            delay={0.2}
          />

          <ServiceCard
            icon={<Share2 className="w-10 h-10 md:w-12 md:h-12 text-gray-400 group-hover:text-white transition-colors" />}
            title="Content Strategy"
            description="Expert social media management and scriptwriting tailored for both commercial clients and educational institutions."
            delay={0.3}
          />

          <ServiceCard
            icon={<GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-gray-400 group-hover:text-white transition-colors" />}
            title="Media Training"
            description="A strong focus on education through specialized bootcamps and training programs aimed at equipping future media professionals with practical skills."
            delay={0.4}
          />

          <ServiceCard
            icon={<TrendingUp className="w-10 h-10 md:w-12 md:h-12 text-gray-400 group-hover:text-white transition-colors" />}
            title="Strategic Growth"
            description="The current 2025–2026 roadmap emphasizes alignment with global development goals, ensuring that every project contributes to a broader vision of creative excellence and community impact."
            delay={0.5}
          />

          <ServiceCard
            icon={<Target className="w-10 h-10 md:w-12 md:h-12 text-gray-400 group-hover:text-white transition-colors" />}
            title="Our Mission"
            description={
              <>
                By balancing commercial agency work with a dedicated training wing, the studio bridges the gap between professional media execution and sustainable talent development.
                <br /><br />
                <span className="text-gray-200 font-medium">Empowering young creatives through media mastery skills.</span>
              </>
            }
            delay={0.6}
            isFullWidth={true}
          />

        </div>
          </section>
        </DepthLayer>

        {/* Process Section */}
        <DepthLayer depth={4}>
          <section
        id="process"
        className="py-12 md:py-20 px-4 md:px-[10%] relative z-10"
      >
        {/* Animated gradient overlay for depth */}
        <motion.div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.3) 0%, rgba(0,0,0,0) 50%)",
          }}
          animate={{
            opacity: [0.04, 0.06, 0.04],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-4xl font-bold text-center mb-3 md:mb-4 uppercase tracking-wide bg-gradient-to-r from-gray-400 via-gray-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              The Process
            </h2>
            <div className="w-16 md:w-20 h-1 bg-gradient-to-r from-gray-500 to-gray-200 mx-auto mb-10 md:mb-16 shadow-[0_0_8px_rgba(255,255,255,0.3)]"></div>
          </motion.div>

          <div className="space-y-6 md:space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{
                scale: 1.02,
                x: 10,
                transition: { duration: 0.3 },
              }}
              className="flex gap-4 md:gap-8 items-start p-6 md:p-8 border transition-all group rounded-2xl relative overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                borderColor: "rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 30px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.05)",
              }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at left, rgba(147,51,234,0.15) 0%, transparent 70%)",
                }}
                animate={{
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.span
                className="text-3xl md:text-5xl font-bold text-gray-600 group-hover:text-white transition-colors min-w-[40px] md:min-w-[60px] relative z-10"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                01
              </motion.span>
              <div className="relative z-10">
                <h4 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 text-white">
                  Discovery
                </h4>
                <p className="text-sm md:text-lg text-gray-400">
                  We discuss your goals, target audience, and brand vision.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{
                scale: 1.02,
                x: 10,
                transition: { duration: 0.3 },
              }}
              className="flex gap-4 md:gap-8 items-start p-6 md:p-8 border transition-all group rounded-2xl relative overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                borderColor: "rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 30px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.05)",
              }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at left, rgba(59,130,246,0.15) 0%, transparent 70%)",
                }}
                animate={{
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.span
                className="text-3xl md:text-5xl font-bold text-gray-600 group-hover:text-white transition-colors min-w-[40px] md:min-w-[60px] relative z-10"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                02
              </motion.span>
              <div className="relative z-10">
                <h4 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 text-white">
                  Design
                </h4>
                <p className="text-sm md:text-lg text-gray-400">
                  We craft initial concepts and iterate based on your feedback.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{
                scale: 1.02,
                x: 10,
                transition: { duration: 0.3 },
              }}
              className="flex gap-4 md:gap-8 items-start p-6 md:p-8 border transition-all group rounded-2xl relative overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                borderColor: "rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 30px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.05)",
              }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at left, rgba(34,197,94,0.15) 0%, transparent 70%)",
                }}
                animate={{
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.span
                className="text-3xl md:text-5xl font-bold text-gray-600 group-hover:text-white transition-colors min-w-[40px] md:min-w-[60px] relative z-10"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                03
              </motion.span>
              <div className="relative z-10">
                <h4 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 text-white">
                  Delivery
                </h4>
                <p className="text-sm md:text-lg text-gray-400">
                  You receive high-quality final files ready for use.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
          </section>
        </DepthLayer>

        {/* PORTFOLIO SECTION - RESTAURANTS & FOOD */}
        <DepthLayer depth={3}>
          {/* Animated gradient backdrop for portfolio */}
          <motion.div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.4) 0%, rgba(147,51,234,0.4) 50%, rgba(236,72,153,0.4) 100%)",
            }}
            animate={{
              opacity: [0.03, 0.06, 0.03],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <PortfolioSectionDivider
        id="portfolio"
        title="Restaurants & Food"
        subtitle="Bringing culinary brands to life"
      />

      <PrimaxPortfolio />
      <WendeesBakeryPortfolio />
      <KefasFoodPortfolio />
      <FeFesKitchenPortfolio />

      {/* PORTFOLIO SECTION - BRANDED PACKAGING */}
      <PortfolioSectionDivider
        title="Branded Packaging"
        subtitle="Complete packaging solutions that showcase your brand"
      />

      <FeFesPackagingPortfolio />

      {/* PORTFOLIO SECTION - FASHION & RETAIL */}
      <PortfolioSectionDivider
        title="Fashion & Retail"
        subtitle="Stylish brands that make a statement"
      />

      <FeFesPortfolio />
      <AdeayoPortfolio />
      <OnaKanOwojaPortfolio />
      <LaMaysPortfolio />
      <SouvenirsPortfolio />

      {/* PORTFOLIO SECTION - BEAUTY & WELLNESS */}
      <PortfolioSectionDivider
        title="Beauty & Wellness"
        subtitle="Elegant brands for body and mind"
      />

      <LaMayScentsPortfolio />
      <DazzledinEssencePortfolio />

      {/* PORTFOLIO SECTION - SERVICES & LOGISTICS */}
      <PortfolioSectionDivider
        title="Services & Logistics"
        subtitle="Professional brands that deliver"
      />

      <AnchorFreightPortfolio />
      <LordsHeritagePortfolio />
      <ElejaExchangePortfolio />

      {/* PORTFOLIO SECTION - GAMING & TECH */}
      <PortfolioSectionDivider
        title="Gaming & Tech"
        subtitle="High-performance digital brands and hardware"
      />

      <EmmaxPortfolio />
        </DepthLayer>

        {/* Reviews Section */}
        <DepthLayer depth={5}>
          <ReviewsSection />
        </DepthLayer>

        {/* Skills Carousel Section */}
        <DepthLayer depth={5}>
          <section className="py-12 relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 uppercase tracking-wide bg-gradient-to-r from-gray-400 via-gray-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                Our Expertise
              </h2>
              <InfiniteCarousel
                items={[
                  "Visual Storytelling",
                  "Color Grading",
                  "Sound Design",
                  "Motion Design",
                  "Product Photography",
                  "Social Media Strategy",
                  "Video Editing",
                  "Animation",
                  "UI/UX Design",
                  "Creative Direction"
                ]}
                duration={35}
                direction="right"
              />
            </motion.div>
          </section>
        </DepthLayer>

        {/* AI Packaging Design Generator Section - HIDDEN (Re-enable after API key issues resolved) */}
        {/* <DepthLayer depth={5}>
          <AIPackagingGenerator />
        </DepthLayer> */}

        {/* Founder Section */}
        <DepthLayer depth={5}>
          <FounderFlipCard />
        </DepthLayer>

        {/* Footer / Contact Section */}
        <DepthLayer depth={6}>
          <footer
            id="contact"
        className="bg-black/90 backdrop-blur-xl pt-16 md:pt-24 pb-8 px-4 md:px-[10%] border-t border-white/10 relative overflow-hidden z-10"
      >
        {/* Liquid morphing footer background */}
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(147,51,234,0.4) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/4 left-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
          animate={{
            scale: [1, 1.4, 1],
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto relative z-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 mb-16">
            
            {/* Column 1: Brand & CTA */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 uppercase tracking-wider bg-gradient-to-r from-gray-400 via-gray-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                Ready to Get Started?
              </h2>
              <div className="w-12 h-1 bg-gradient-to-r from-gray-500 to-gray-200 mb-6 shadow-[0_0_8px_rgba(255,255,255,0.3)]"></div>
              <p className="text-gray-400 text-sm md:text-base mb-8 leading-relaxed">
                Let's create something amazing together. Partner with us to build unique identities and unforgettable digital experiences.
              </p>
              <motion.button
                onClick={() => window.open("https://wa.me/2348068483718?text=I%20would%20love%20to%20make%20enquiries%20about%20your%20service", "_blank")}
                className="text-black px-6 py-3 text-sm font-bold uppercase tracking-wide inline-flex items-center gap-2 relative overflow-hidden rounded-lg"
                style={{
                  background: "linear-gradient(135deg, #e0e0e0 0%, #ffffff 100%)",
                  boxShadow: "0 0 15px rgba(255,255,255,0.2)",
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 25px rgba(255,255,255,0.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white to-gray-200"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <MessageCircle className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Chat with us</span>
              </motion.button>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">
                Explore
              </h3>
              <ul className="space-y-4">
                <li>
                  <motion.button
                    onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="text-gray-400 hover:text-white transition-colors text-sm relative group"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <span className="relative">
                      Home
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      />
                    </span>
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    onClick={() => scrollToSection("services")}
                    className="text-gray-400 hover:text-white transition-colors text-sm relative group"
                    whileHover={{ x: 5 }}
                  >
                    <span className="relative">
                      Services
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      />
                    </span>
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    onClick={() => scrollToSection("portfolio")}
                    className="text-gray-400 hover:text-white transition-colors text-sm relative group"
                    whileHover={{ x: 5 }}
                  >
                    <span className="relative">
                      Portfolio
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      />
                    </span>
                  </motion.button>
                </li>
                <li>
                  <motion.button
                    onClick={() => scrollToSection("process")}
                    className="text-gray-400 hover:text-white transition-colors text-sm relative group"
                    whileHover={{ x: 5 }}
                  >
                    <span className="relative">
                      Process
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      />
                    </span>
                  </motion.button>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact Info */}
            <div>
              <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">
                Contact Us
              </h3>
              <div className="flex flex-wrap gap-4">
                <motion.a
                  href="mailto:bluehavens.studios@gmail.com"
                  title="Email Us"
                  className="group flex items-center justify-center w-12 h-12 rounded-xl border transition-all relative overflow-hidden"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 4px 30px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.05)",
                  }}
                  whileHover={{
                    scale: 1.1,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors relative z-10" />
                </motion.a>
                <motion.a
                  href="https://wa.me/2348068483718?text=I%20would%20love%20to%20make%20enquiries%20about%20your%20service"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Call Us"
                  className="group flex items-center justify-center w-12 h-12 rounded-xl border transition-all relative overflow-hidden"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 4px 30px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.05)",
                  }}
                  whileHover={{
                    scale: 1.1,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Phone className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors relative z-10" />
                </motion.a>
                <motion.a
                  href="https://wa.me/2348068483718?text=I%20would%20love%20to%20make%20enquiries%20about%20your%20service"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp Business"
                  className="group flex items-center justify-center w-12 h-12 rounded-xl border transition-all relative overflow-hidden"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 4px 30px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.05)",
                  }}
                  whileHover={{
                    scale: 1.1,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors relative z-10" />
                </motion.a>
              </div>
            </div>

            {/* Column 4: Socials */}
            <div>
              <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">
                Follow Us
              </h3>
              <div className="flex flex-wrap gap-4">
                <motion.a
                  href="https://www.instagram.com/blue.havenstudios"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                  className="group flex items-center justify-center w-12 h-12 rounded-xl border transition-all relative overflow-hidden"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 4px 30px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.05)",
                  }}
                  whileHover={{
                    scale: 1.1,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Instagram className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors relative z-10" />
                </motion.a>
                <motion.a
                  href="https://www.tiktok.com/@bluehaven.studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="TikTok"
                  className="group flex items-center justify-center w-12 h-12 rounded-xl border transition-all relative overflow-hidden"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 4px 30px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.05)",
                  }}
                  whileHover={{
                    scale: 1.1,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Music className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors relative z-10" />
                </motion.a>
                <motion.a
                  href="https://www.threads.com/@blue.havenstudios"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Threads"
                  className="group flex items-center justify-center w-12 h-12 rounded-xl border transition-all relative overflow-hidden"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 4px 30px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.05)",
                  }}
                  whileHover={{
                    scale: 1.1,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors relative z-10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 14.5c-.102 2.654-1.316 4.506-3.704 5.106-.894.224-1.87.318-2.856.318-3.704 0-5.894-1.908-5.894-5.166 0-3.258 2.19-5.166 5.894-5.166.986 0 1.962.094 2.856.318 2.388.6 3.602 2.452 3.704 5.106v.484zm-2.85-2.408c-.224-1.302-1.176-2.052-2.556-2.052-1.38 0-2.332.75-2.556 2.052h5.112z" />
                  </svg>
                </motion.a>
                <motion.a
                  href="https://chat.whatsapp.com/Lf3Vw6FaRtZFDevqjOq3EA"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp Group"
                  className="group flex items-center justify-center w-12 h-12 rounded-xl border transition-all relative overflow-hidden"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 4px 30px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.05)",
                  }}
                  whileHover={{
                    scale: 1.1,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Users className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors relative z-10" />
                </motion.a>
                <motion.a
                  href="https://campsite.bio/blue.havenstudios"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="All Links"
                  className="group flex items-center justify-center w-12 h-12 rounded-xl border transition-all relative overflow-hidden"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 4px 30px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.05)",
                  }}
                  whileHover={{
                    scale: 1.1,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LinkIcon className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors relative z-10" />
                </motion.a>
              </div>

              {/* Clock Widget */}
              <div className="mt-8 flex justify-center lg:justify-start">
                <Clock />
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs md:text-sm">
              &copy; {new Date().getFullYear()} Bluehaven Studios. All Rights Reserved.
            </p>
            <div className="flex gap-4">
              <PrivacyPolicyModal />
              <StatusReportModal />
              <a href="#" className="text-gray-500 hover:text-white text-xs md:text-sm transition-colors">Terms of Service</a>
            </div>
          </div>
        </motion.div>
      </footer>
    </DepthLayer>
      </motion.div>

      {/* ChatBot */}
      <ChatBot />
    </HelmetProvider>
  );
}