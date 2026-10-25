import { useEffect, useState } from "react";

const VIDEO_SRC = "/assets/bluehaven-intro.mp4";
const POSTER_SRC = "/assets/bluehaven-intro-poster.jpg";

export default function OpeningIntro() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const dismiss = () => {
    setFading(true);
    window.setTimeout(() => setVisible(false), 520);
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }
    const safetyTimer = window.setTimeout(dismiss, 10500);
    document.documentElement.dataset.bluehavenIntroActive = "true";
    return () => {
      window.clearTimeout(safetyTimer);
      delete document.documentElement.dataset.bluehavenIntroActive;
    };
    // Intentionally run once per page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!visible) delete document.documentElement.dataset.bluehavenIntroActive;
  }, [visible]);

  if (!visible) return null;

  return (
    <div role="dialog" aria-label="BlueHaven Studios opening" aria-modal="true" className={`bluehaven-opening-intro ${fading ? "is-fading" : ""}`}>
      <video
        className="bluehaven-opening-video"
        src={VIDEO_SRC}
        poster={POSTER_SRC}
        autoPlay muted playsInline preload="auto" disablePictureInPicture
        aria-label="BlueHaven Studios cinematic logo introduction"
        onCanPlay={() => setVideoReady(true)}
        onEnded={dismiss}
        onError={dismiss}
      />
      {!videoReady && <div className="bluehaven-opening-fallback" aria-hidden="true"><img src={POSTER_SRC} alt="" /><span>BLUEHAVEN STUDIOS</span></div>}
      <button className="bluehaven-opening-skip" type="button" onClick={dismiss}>Skip intro <span aria-hidden="true">↗</span></button>
      <style>{`
        html[data-bluehaven-intro-active="true"] { overflow: hidden; }
        .bluehaven-opening-intro { position:fixed; inset:0; z-index:10000; overflow:hidden; display:grid; place-items:center; background:#050506; opacity:1; transition:opacity 520ms cubic-bezier(.22,1,.36,1); isolation:isolate; }
        .bluehaven-opening-intro.is-fading { opacity:0; pointer-events:none; }
        .bluehaven-opening-video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center; background:#050506; }
        .bluehaven-opening-fallback { position:absolute; inset:0; display:grid; place-items:center; background:#050506; pointer-events:none; }
        .bluehaven-opening-fallback img { position:absolute; width:100%; height:100%; object-fit:cover; opacity:.42; }
        .bluehaven-opening-fallback span { position:relative; color:#fff; font:700 clamp(12px,2vw,20px)/1.2 Arial,sans-serif; letter-spacing:.28em; text-align:center; padding:24px; }
        .bluehaven-opening-skip { position:absolute; z-index:2; right:max(18px,env(safe-area-inset-right)); bottom:max(18px,env(safe-area-inset-bottom)); padding:11px 15px; border:1px solid rgba(255,255,255,.28); border-radius:999px; background:rgba(8,8,10,.5); color:#fff; font:600 12px/1 Arial,sans-serif; letter-spacing:.08em; backdrop-filter:blur(12px); cursor:pointer; }
        .bluehaven-opening-skip:hover { border-color:#ffde59; color:#ffde59; }
        .bluehaven-opening-skip:focus-visible { outline:2px solid #ffde59; outline-offset:4px; }
        @media(max-width:640px) { .bluehaven-opening-video { object-fit:contain; } }
        @media(prefers-reduced-motion:reduce) { .bluehaven-opening-intro { display:none!important; } }
      `}</style>
    </div>
  );
}
