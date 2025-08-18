import { useEffect, useRef } from 'react';
import { PanoramaPlugin } from '../utils/panoramaPlugin';
import { swiperConfig, AUTO_PROGRESS_DURATION, DEMO_CSS_HREF, SWIPER_JS_SRC } from '../config/swiperConfig';

export const usePanoramaSlider = () => {
  const scrollTween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    // Add the external CSS link for demo styles (if not already present)
    let link = document.querySelector(`link[href="${DEMO_CSS_HREF}"]`) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = DEMO_CSS_HREF;
      document.head.appendChild(link);
    }

    let swiperInstance: any | null = null;
    let stopAuto: (() => void) | null = null;
    let removeAutoListeners: (() => void) | null = null;

    const initSwiper = async () => {
      const SwiperCtor = (window as any).Swiper;
      if (!SwiperCtor) return;

      try {
        const gsapMod: any = await import('gsap');
        const { ScrollToPlugin } = await import('gsap/ScrollToPlugin');
        const gsap = gsapMod.gsap || gsapMod.default || gsapMod;
        gsap.registerPlugin(ScrollToPlugin);

        // Auto-scroll the page
        scrollTween.current = gsap.to(window, {
          scrollTo: { y: "max", autoKill: false },
          duration: 40,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        });

        const panoramaBox = document.querySelector('.swiper');
        if (panoramaBox) {
          panoramaBox.addEventListener('mouseenter', () => scrollTween.current?.pause());
          panoramaBox.addEventListener('mouseleave', () => scrollTween.current?.resume());
        }

      } catch (e) {
        console.error("Failed to load GSAP or ScrollToPlugin", e);
      }

      swiperInstance = new SwiperCtor(".panorama-slider .swiper", {
        ...swiperConfig,
        modules: [PanoramaPlugin],
      });

      // Setup percentage control and auto-progress
      const { stopAutoFn, removeListenersFn } = setupPercentageControl(swiperInstance);
      stopAuto = stopAutoFn;
      removeAutoListeners = removeListenersFn;

      // Drive the swiper with vertical page scroll using GSAP ScrollTrigger
      setupScrollTrigger(swiperInstance, stopAuto);
    };

    // Load Swiper UMD bundle once and init
    let existingScript = document.querySelector(`script[src="${SWIPER_JS_SRC}"]`) as HTMLScriptElement | null;
    if ((window as any).Swiper) {
      initSwiper();
    } else if (existingScript) {
      existingScript.addEventListener("load", initSwiper, { once: true });
    } else {
      const cdnScript = document.createElement("script");
      cdnScript.src = SWIPER_JS_SRC;
      cdnScript.async = true;
      cdnScript.addEventListener("load", initSwiper, { once: true });
      document.body.appendChild(cdnScript);
      existingScript = cdnScript;
    }

    // Cleanup on unmount
    return () => {
      if (scrollTween.current) {
        scrollTween.current.kill();
      }
      if (stopAuto) stopAuto();
      if (removeAutoListeners) removeAutoListeners();
      if (swiperInstance && typeof swiperInstance.destroy === "function") {
        swiperInstance.destroy(true, true);
      }
      // Kill ScrollTrigger if it exists
      (async () => {
        try {
          const stMod: any = await import('gsap/ScrollTrigger');
          const ScrollTrigger = stMod.ScrollTrigger || stMod.default || stMod;
          const existing = ScrollTrigger.getById && ScrollTrigger.getById('panorama-scroll');
          if (existing) existing.kill();
        } catch {}
      })();
    };
  }, []);
};

// Map vertical scroll to swiper translation across 0..1 of its translate range
const setupScrollTrigger = async (swiperInstance: any, stopAuto: (() => void) | null) => {
  try {
    const gsapMod: any = await import('gsap');
    const stMod: any = await import('gsap/ScrollTrigger');
    const gsap = gsapMod.gsap || gsapMod.default || gsapMod;
    const ScrollTrigger = stMod.ScrollTrigger || stMod.default || stMod;
    if (!gsap || !ScrollTrigger) return;

    // Register plugin once
    if (!gsap.core?.globals()?.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Pin the stable outer wrapper instead of inner box
    const container = document.querySelector('.panorama-section') as HTMLElement | null;
    if (!container) return;

    // Pause auto progression while scroll-scrubbing
    if (stopAuto) stopAuto();

    // Helper to drive swiper by [0..1]
    const setByPercent = (p: number) => {
      const clamped = Math.min(1, Math.max(0, p));
      const min = swiperInstance.minTranslate();
      const max = swiperInstance.maxTranslate();
      const target = min + clamped * (max - min);
      swiperInstance.translateTo(target, 0, false, false);
    };

    // Compute end distance based on swiper translate range so you can scroll through all images
    const endDistance = () => {
      const min = swiperInstance.minTranslate();
      const max = swiperInstance.maxTranslate();
      const range = Math.abs(max - min) || 1000; // px
      // increase factor to guarantee full coverage
      return `+=${Math.max(1200, Math.round(range * 1.25))}`;
    };

    // Kill any previous trigger
    const existing = (ScrollTrigger as any).getById && (ScrollTrigger as any).getById('panorama-scroll');
    if (existing) existing.kill();

    const trigger = ScrollTrigger.create({
      id: 'panorama-scroll',
      trigger: container,
      start: 'top top',
      end: endDistance, // recalculated on refresh
      scrub: true, // no smoothing so end is exact
      pin: true,
      invalidateOnRefresh: true,
      // markers: true,
      onUpdate: (self: any) => setByPercent(self.progress),
      onRefresh: () => setByPercent(0),
    });

    // Keep ScrollTrigger in sync with Swiper/layout changes so the end is reachable
    const refresh = () => {
      try { ScrollTrigger.refresh(); } catch {}
    };
    swiperInstance.on('imagesReady', refresh);
    swiperInstance.on('resize', refresh);
    swiperInstance.on('update', refresh);
    window.addEventListener('resize', refresh);
    setTimeout(refresh, 0);

    // Cleanup listeners when unmounting or reinitializing
    const cleanup = () => {
      swiperInstance.off('imagesReady', refresh);
      swiperInstance.off('resize', refresh);
      swiperInstance.off('update', refresh);
      window.removeEventListener('resize', refresh);
      try { trigger.kill(); } catch {}
    };

    // Attach cleanup to swiper for safety
    (swiperInstance as any)._scrollTriggerCleanup = cleanup;
  } catch {
    // ignore
  }
};

const setupPercentageControl = (swiperInstance: any) => {
  const percentInput = document.getElementById('swiper-percent') as HTMLInputElement | null;
  const percentLabel = document.getElementById('swiper-percent-label') as HTMLSpanElement | null;
  
  if (!percentInput) {
    return { stopAutoFn: () => {}, removeListenersFn: () => {} };
  }

  // Compute percent from translate (loop- and RTL-safe)
  const syncFromSwiper = () => {
    const min = swiperInstance.minTranslate();
    const max = swiperInstance.maxTranslate();
    const logicalT = swiperInstance.rtlTranslate
      ? -(swiperInstance.translate || 0)
      : (swiperInstance.translate || 0);
    const denom = max - min || 1;
    const p = (logicalT - min) / denom;
    const val = Math.round(Math.min(1, Math.max(0, p)) * 100);
    percentInput.value = String(val);
    if (percentLabel) percentLabel.textContent = `${val}%`;
  };

  // Utility to drive swiper by percent [0..1]
  const setByPercent = (p: number) => {
    const clamped = Math.min(1, Math.max(0, p));
    const min = swiperInstance.minTranslate();
    const max = swiperInstance.maxTranslate();
    const target = min + clamped * (max - min);
    swiperInstance.translateTo(target, 0, false, false);
  };

  // Auto-progress functionality
  let rafId: number | null = null;
  let paused = false;
  
  const pauseAuto = () => {
    paused = true;
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
  };

  const startAuto = () => {
    paused = false;
    if (rafId != null) cancelAnimationFrame(rafId);
    // start from 0%
    setByPercent(0);
    const start = performance.now();
    const tick = (now: number) => {
      const frac = Math.min(1, (now - start) / AUTO_PROGRESS_DURATION);
      setByPercent(frac);
      if (!paused && frac < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };
    rafId = requestAnimationFrame(tick);
  };

  // Event handlers
  const onInputChange = () => {
    pauseAuto();
    const val = Number(percentInput.value);
    const p = Math.min(100, Math.max(0, val)) / 100;
    const min = swiperInstance.minTranslate();
    const max = swiperInstance.maxTranslate();
    const target = min + p * (max - min);
    swiperInstance.translateTo(target, 0, false, false);
  };

  // Setup event listeners
  percentInput.addEventListener('input', onInputChange);
  percentInput.addEventListener('pointerdown', pauseAuto);
  swiperInstance.on('touchStart', pauseAuto);
  swiperInstance.on('scrollbarDragStart', pauseAuto);
  swiperInstance.on('progress', syncFromSwiper);
  swiperInstance.on('setTranslate', syncFromSwiper);
  swiperInstance.on('resize', syncFromSwiper);
  swiperInstance.on('update', syncFromSwiper);

  // Initial sync and start auto-progress
  syncFromSwiper();
  startAuto();

  // Return cleanup functions
  const removeListenersFn = () => {
    percentInput.removeEventListener('input', onInputChange);
    percentInput.removeEventListener('pointerdown', pauseAuto);
    swiperInstance.off('touchStart', pauseAuto);
    swiperInstance.off('scrollbarDragStart', pauseAuto);
    swiperInstance.off('progress', syncFromSwiper);
    swiperInstance.off('setTranslate', syncFromSwiper);
    swiperInstance.off('resize', syncFromSwiper);
    swiperInstance.off('update', syncFromSwiper);
  };

  return {
    stopAutoFn: pauseAuto,
    removeListenersFn,
  };
};
