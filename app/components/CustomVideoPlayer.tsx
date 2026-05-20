import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CustomVideoPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
}

export function CustomVideoPlayer({ 
  src = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", 
  poster, 
  title = "Showreel 2026", 
  autoPlay = false 
}: CustomVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(e => console.log("Auto-play prevented:", e));
    }
  }, [autoPlay]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Playback interrupted:", error);
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / dur) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, "0");
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative group bg-black overflow-hidden flex items-center justify-center ${
        isFullScreen ? "w-screen h-screen" : "w-full aspect-video rounded-2xl border border-gray-800 shadow-2xl"
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        muted={isMuted}
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        playsInline
      />

      {/* Title / Top Bar */}
      <AnimatePresence>
        {showControls && title && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10"
          >
            <h3 className="text-white font-medium tracking-wide text-lg drop-shadow-md">
              {title}
            </h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Big Play Button Overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <Play className="w-10 h-10 md:w-12 md:h-12 text-white ml-2" fill="white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls / Bottom Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 px-4 py-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20"
          >
            {/* Progress Bar */}
            <div 
              className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer relative group/progress"
              onClick={handleProgressClick}
            >
              <div 
                className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover/progress:scale-100 transition-transform shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 md:gap-6">
                <button 
                  onClick={togglePlay}
                  className="text-white hover:text-gray-300 transition-colors focus:outline-none"
                >
                  {isPlaying ? (
                    <Pause size={24} fill="currentColor" />
                  ) : (
                    <Play size={24} fill="currentColor" />
                  )}
                </button>
                
                <button 
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300 transition-colors focus:outline-none"
                >
                  {isMuted ? (
                    <VolumeX size={24} />
                  ) : (
                    <Volume2 size={24} />
                  )}
                </button>

                <div className="text-white/80 text-xs md:text-sm font-medium tabular-nums tracking-wider">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <button 
                onClick={toggleFullScreen}
                className="text-white hover:text-gray-300 transition-colors focus:outline-none"
              >
                {isFullScreen ? (
                  <Minimize size={24} />
                ) : (
                  <Maximize size={24} />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}