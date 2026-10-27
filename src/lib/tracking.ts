/**
 * Optional client-side analytics for BlueHaven Studios.
 *
 * Configure these Vercel environment variables to enable tracking:
 *   VITE_META_PIXEL_ID=123456789012345
 *   VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
 *
 * No identifiers are hard-coded; tracking stays disabled until IDs are supplied.
 */
type TrackingWindow = Window & {
  fbq?: (...args: unknown[]) => void;
  _fbq?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

const META_PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID ?? "").trim();
const GA4_MEASUREMENT_ID = (import.meta.env.VITE_GA4_MEASUREMENT_ID ?? "").trim();

let installed = false;
let lastTrackedPath = "";

function trackPageView() {
  const path = window.location.pathname + window.location.search;
  if (path === lastTrackedPath) return;
  lastTrackedPath = path;

  const trackingWindow = window as TrackingWindow;
  if (META_PIXEL_ID && typeof trackingWindow.fbq === "function") {
    trackingWindow.fbq("track", "PageView");
  }
  if (GA4_MEASUREMENT_ID && typeof trackingWindow.gtag === "function") {
    trackingWindow.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: path,
    });
  }
}

export function installTracking() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  if (META_PIXEL_ID && /^\d{5,20}$/.test(META_PIXEL_ID)) {
    const w = window as TrackingWindow;
    if (typeof w.fbq !== "function") {
      const fbq = function (...args: unknown[]) {
        const fn = fbq as typeof fbq & { callMethod?: (...items: unknown[]) => void; queue?: unknown[][]; loaded?: boolean; version?: string };
        if (fn.callMethod) fn.callMethod(...args);
        else (fn.queue ??= []).push(args);
      } as TrackingWindow["fbq"] & { queue?: unknown[][]; loaded?: boolean; version?: string; push?: (...args: unknown[]) => void };
      if (!fbq) return;
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.push = (...args: unknown[]) => { (fbq.queue ??= []).push(args); };
      w.fbq = fbq;
      w._fbq = fbq;
    }
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
    w.fbq?.("init", META_PIXEL_ID);
  }

  if (GA4_MEASUREMENT_ID && /^G-[A-Z0-9]+$/.test(GA4_MEASUREMENT_ID)) {
    const w = window as TrackingWindow;
    w.dataLayer = w.dataLayer ?? [];
    w.gtag = w.gtag ?? function (...args: unknown[]) { w.dataLayer?.push(args); };
    w.gtag("js", new Date());
    w.gtag("config", GA4_MEASUREMENT_ID, { send_page_view: false });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`;
    document.head.appendChild(script);
  }

  trackPageView();

  // Track client-side route changes in this single-page app.
  const originalPushState = history.pushState.bind(history);
  history.pushState = function (...args: Parameters<History["pushState"]>) {
    originalPushState(...args);
    trackPageView();
  };
  window.addEventListener("popstate", trackPageView);
}
