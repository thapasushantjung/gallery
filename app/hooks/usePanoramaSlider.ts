import { useEffect, useRef } from 'react';
import { PanoramaPlugin } from '../utils/panoramaPlugin';
import { swiperConfig, AUTO_PROGRESS_DURATION, DEMO_CSS_HREF, SWIPER_JS_SRC } from '../config/swiperConfig';
import gsap from 'gsap';

// Gentle ramp-in when resuming auto-scroll so it feels smooth
const AUTO_RAMP_IN = 0.15; // seconds - reduced from 0.75 to 0.15

export const usePanoramaSlider = () => {
  const scrollTween = useRef<gsap.core.Tween | null>(null);
  const rampTween = useRef<gsap.core.Tween | null>(null);
  // Track UI/scroll state for robust syncing
  const isHoveringRef = useRef(false);
  const isAutoScrollingRef = useRef(false);
  const resumeTO = useRef<number | null>(null);
  const lastScrollY = useRef(0);
  const lastDir = useRef<1 | -1>(1);

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
        const gsapLocal = gsapMod.gsap || gsapMod.default || gsapMod;
        gsapLocal.registerPlugin(ScrollToPlugin);

        // Helper utilities for auto-scroll management
        const getScrollMax = () => {
          const doc = document.documentElement;
          const body = document.body;
          return Math.max(doc.scrollHeight, body.scrollHeight) - window.innerHeight;
        };
        const clearResumeTO = () => {
          if (resumeTO.current != null) {
            window.clearTimeout(resumeTO.current);
            resumeTO.current = null;
          }
        };
        const killAutoScroll = () => {
          if (rampTween.current) {
            try { rampTween.current.kill(); } catch {}
            rampTween.current = null;
          }
          if (scrollTween.current) {
            try { scrollTween.current.kill(); } catch {}
            scrollTween.current = null;
          }
          isAutoScrollingRef.current = false;
          clearResumeTO();
        };
        const startAutoScroll = (dir?: 1 | -1) => {
          // Start from current position toward 0 or max; when done, flip direction and continue.
          const direction: 1 | -1 = dir ?? lastDir.current ?? 1;
          const max = Math.max(0, getScrollMax());
          const curr = window.scrollY || window.pageYOffset || 0;
          const target = direction > 0 ? max : 0;
          const distance = Math.max(0, Math.abs(target - curr));
          // Keep a similar overall speed as previous implementation (~40s for full travel)
          const fullDuration = 40; // seconds end-to-end
          const speed = max > 0 ? max / fullDuration : 0; // px/sec
          const duration = speed > 0 ? distance / speed : 0;

          // If already at the end, flip direction immediately
          if (duration < 0.02) {
            lastDir.current = (direction > 0 ? -1 : 1);
            return startAutoScroll(lastDir.current);
          }

          // Kill any existing tween and start fresh from current position to avoid jumps
          killAutoScroll();
          scrollTween.current = gsapLocal.to(window, {
            scrollTo: { y: target, autoKill: false },
            duration,
            ease: 'none',
            onStart: () => { isAutoScrollingRef.current = true; },
            onUpdate: () => { isAutoScrollingRef.current = true; },
            onComplete: () => { isAutoScrollingRef.current = false; startAutoScroll((direction > 0 ? -1 : 1)); },          });
          // Start at full speed immediately - no ramp-in delay
          isAutoScrollingRef.current = true;
          lastDir.current = direction;
        };
        const pauseAuto = () => {
          if (rampTween.current) {
            try { rampTween.current.kill(); } catch {}
            rampTween.current = null;
          }
          if (scrollTween.current) scrollTween.current.pause();
          clearResumeTO();
        };
        const scheduleResume = () => {
          if (isHoveringRef.current) return; // never resume while hovering the panorama
          clearResumeTO();
          resumeTO.current = window.setTimeout(() => {
            startAutoScroll(lastDir.current);
          }, 700);
        };

        const onWheel = (e: WheelEvent) => {
          // Any manual wheel input pauses auto and stores direction
          const dy = e.deltaY || 0;
          if (dy !== 0) lastDir.current = dy > 0 ? 1 : -1;
          killAutoScroll();
          scheduleResume();
        };
        const onScroll = () => {
          // Ignore scroll events generated by our own tween
          if (isAutoScrollingRef.current) return;
          // Track direction even for non-wheel scrolls (keyboard/touch)
          const y = window.scrollY || window.pageYOffset || 0;
          const dy = y - (lastScrollY.current || 0);
          if (dy !== 0) lastDir.current = dy > 0 ? 1 : -1;
          lastScrollY.current = y;
          // Treat as manual input: pause/restart from here
          killAutoScroll();
          scheduleResume();
        };
        const onKeyDown = (e: KeyboardEvent) => {
          // Arrow/PageUp/PageDown/Home/End spacebar interactions should pause auto
          const keys = ['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '];
          if (keys.includes(e.key)) {
            killAutoScroll();
            scheduleResume();
          }
        };
        const onTouchStart = () => {
          killAutoScroll();
          scheduleResume();
        };

        const panoramaSection = document.querySelector('.panorama-slider');
        const onEnter = () => {
          isHoveringRef.current = true;
          pauseAuto();
        };
        const onLeave = () => {
          isHoveringRef.current = false;
          scheduleResume();
        };

        // Initialize Swiper first
        swiperInstance = new SwiperCtor(".panorama-slider .swiper", {
          ...swiperConfig,
          modules: [PanoramaPlugin],
        });

        // Setup percentage control and auto-progress
        const { stopAutoFn, removeListenersFn } = setupPercentageControl(swiperInstance);
        stopAuto = stopAutoFn;
        removeAutoListeners = removeListenersFn;

        // Drive the swiper with vertical page scroll using GSAP ScrollTrigger
        await setupScrollTrigger(swiperInstance, stopAuto);

        // Attach hover listeners to the pinned panorama section so manual scrubbing is smooth
        if (panoramaSection) {
          panoramaSection.addEventListener('mouseenter', onEnter);
          panoramaSection.addEventListener('mouseleave', onLeave);
        }

        // Global manual input listeners to pause/resume auto scroll
        window.addEventListener('wheel', onWheel, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('touchstart', onTouchStart, { passive: true });

        // Start auto-scroll after ScrollTrigger has established layout
        // Small delay lets ScrollTrigger refresh complete, ensuring correct scroll range
        setTimeout(() => startAutoScroll(lastDir.current), 0);

        // Store cleanup for listeners
        (swiperInstance as any)._autoScrollCleanup = () => {
          if (panoramaSection) {
            panoramaSection.removeEventListener('mouseenter', onEnter);
            panoramaSection.removeEventListener('mouseleave', onLeave);
          }
          window.removeEventListener('wheel', onWheel as any);
          window.removeEventListener('scroll', onScroll as any);
          window.removeEventListener('keydown', onKeyDown as any);
          window.removeEventListener('touchstart', onTouchStart as any);
          killAutoScroll();
        };
      } catch (e) {
        console.error("Failed to load GSAP or ScrollToPlugin", e);
      }
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
        try { scrollTween.current.kill(); } catch {}
        scrollTween.current = null;
      }
      if (stopAuto) stopAuto();
      if (removeAutoListeners) removeAutoListeners();
      if (swiperInstance && typeof swiperInstance.destroy === "function") {
        // Remove any listeners we attached for auto-scroll
        if ((swiperInstance as any)._autoScrollCleanup) {
          try { (swiperInstance as any)._autoScrollCleanup(); } catch {}
        }
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
    const gsapLocal = gsapMod.gsap || gsapMod.default || gsapMod;
    const ScrollTrigger = stMod.ScrollTrigger || stMod.default || stMod;
    if (!gsapLocal || !ScrollTrigger) return;

    // Register plugin once
    if (!(gsapLocal.core?.globals?.() && gsapLocal.core.globals().ScrollTrigger)) {
      gsapLocal.registerPlugin(ScrollTrigger);
    }

    // Pin the stable outer wrapper instead of inner box
    const container = document.querySelector('.panorama-section') as HTMLElement | null;
    if (!container) return;

    // Pause any swiper's internal auto progression while scroll-scrubbing
    if (stopAuto) stopAuto();

    // Helper to drive swiper by [0..1]
    const setByPercent = (p: number, isRealProgress: boolean = false) => {
      let p_real = p;
      if (!isRealProgress) {
        // p is from UI (0-1), map to real (0.30-0.70)
        const clamped = Math.min(1, Math.max(0, p));
        p_real = 0.30 + clamped * (0.70 - 0.30);
      }
      
      const min = swiperInstance.minTranslate();
      const max = swiperInstance.maxTranslate();
      const target = min + p_real * (max - min);
      swiperInstance.translateTo(target, 0, false, false);
    };

    // Compute end distance based on swiper translate range so you can scroll through all images
    const endDistance = () => {
      const min = swiperInstance.minTranslate();
      const max = swiperInstance.maxTranslate();
      const range = Math.abs(max - min) || 1000; // px
      // increase factor to guarantee full coverage
      return `+=${Math.max(1200, Math.round(range * 1.30))}`;
    };

    // Kill any previous trigger
    const existing = (ScrollTrigger as any).getById && (ScrollTrigger as any).getById('panorama-scroll');
    if (existing) existing.kill();

    const trigger = ScrollTrigger.create({
      id: 'panorama-scroll',
      trigger: container,
      start: 'top top',
      end: endDistance, // recalculated on refresh
      scrub: 0.6, // add gentle smoothing for a silkier feel
      pin: true,
      invalidateOnRefresh: true,
      // markers: true,
      onUpdate: (self: any) => {
        // Map the 0-1 progress to the 0.30-0.70 range
        const limitedProgress = 0.30 + self.progress * (0.70 - 0.30);
        setByPercent(limitedProgress, true);
      },
      onRefresh: () => setByPercent(0.30, true),
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
    const p_real = (logicalT - min) / denom;

    // Map real progress (0.30-0.70) back to UI progress (0-1)
    const p_ui = (p_real - 0.30) / (0.70 - 0.30);

    const val = Math.round(Math.min(1, Math.max(0, p_ui)) * 100);
    percentInput.value = String(val);
    if (percentLabel) percentLabel.textContent = `${val}%`;
  };

  // Utility to drive swiper by percent [0..1]
  const setByPercent = (p: number, isRealProgress: boolean = false) => {
    let p_real = p;
    if (!isRealProgress) {
      // p is from UI (0-1), map to real (0.30-0.70)
      const clamped = Math.min(1, Math.max(0, p));
      p_real = 0.30 + clamped * (0.70 - 0.30);
    }
    
    const min = swiperInstance.minTranslate();
    const max = swiperInstance.maxTranslate();
    const target = min + p_real * (max - min);
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
    // start from 0% (of the UI, which is 30% of real)
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
    setByPercent(p);
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
