'use client';
import React, { useEffect } from "react";

const Panorama = () => {
  useEffect(() => {
    // Add the external CSS link for demo styles (if not already present)
    const demoCssHref = 
      "/panorama/assets/index.c1d53924.css"; // use local original CSS to restore original design
    let link = document.querySelector(`link[href="${demoCssHref}"]`) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = demoCssHref;
      document.head.appendChild(link);
    }

    // Removed external Swiper CSS injection to keep original demo styling intact

    let swiperInstance: any | null = null;
    // Add handles for auto-progress cleanup
    let stopAuto: (() => void) | null = null;
    let removeAutoListeners: (() => void) | null = null;

    const initSwiper = () => {
      const SwiperCtor = (window as any).Swiper;
      if (!SwiperCtor) return;

      // Panorama effect plugin (same math as demo)
      function PanoramaPlugin({ swiper: a, extendParams: s, on: o }: any) {
        s({ panoramaEffect: { depth: 200, rotate: 30 } });
        o("beforeInit", () => {
          if (a.params.effect !== "panorama") return;
          a.classNames.push(`${a.params.containerModifierClass}panorama`);
          a.classNames.push(`${a.params.containerModifierClass}3d`);
          const r = { watchSlidesProgress: true };
          Object.assign(a.params, r);
          Object.assign(a.originalParams, r);
        });
        o("progress", () => {
          if (a.params.effect !== "panorama") return;
          const r = a.slidesSizesGrid;
          const { depth: e = 200, rotate: t = 30 } = a.params.panoramaEffect;
          const g = (t * Math.PI) / 180 / 2;
          const h = 1 / (180 / t);
          for (let i = 0; i < a.slides.length; i += 1) {
            const d = a.slides[i];
            const P = (d as any).progress;
            const c = r[i];
            const y = a.params.centeredSlides ? 0 : (a.params.slidesPerView - 1) * 0.5;
            const l = P + y;
            const f = 1 - Math.cos(l * h * Math.PI);
            const m = `${(l * (c / 3)) * f}px`;
            const p = l * t;
            const u = `${(c * 0.5) / Math.sin(g) * f - e}px`;
            (d as HTMLElement).style.transform = a.params.direction === "horizontal"
              ? `translateX(${m}) translateZ(${u}) rotateY(${p}deg)`
              : `translateY(${m}) translateZ(${u}) rotateX(${-p}deg)`;
          }
        });
        o("setTransition", (_r: any, e: number) => {
          if (a.params.effect !== "panorama") return;
          a.slides.forEach((t: HTMLElement) => {
            t.style.transitionDuration = `${e}ms`;
          });
        });
      }

      swiperInstance = new SwiperCtor(".panorama-slider .swiper", {
        effect: "panorama",
        slidesPerView: 1.5,
        loop: true,
        loopAdditionalSlides: 1,
        centeredSlides: true,
        grabCursor: true,
        pagination: {
          el: ".swiper-pagination",
          dynamicBullets: true,
          dynamicMainBullets: 3,
        },
        scrollbar: {
          el: ".swiper-scrollbar",
          draggable: true,
        },
        panoramaEffect: { depth: 150, rotate: 45 },
        breakpoints: {
          480: { slidesPerView: 2, panoramaEffect: { rotate: 35, depth: 150 } },
          640: { slidesPerView: 3, panoramaEffect: { rotate: 30, depth: 150 } },
          1024: { slidesPerView: 4, panoramaEffect: { rotate: 30, depth: 200 } },
          1200: { slidesPerView: 4, panoramaEffect: { rotate: 25, depth: 250 } },
        },
        // Use custom plugin alongside bundle
        modules: [PanoramaPlugin],
      });

      // Hook up percentage range control
      const percentInput = document.getElementById('swiper-percent') as HTMLInputElement | null;
      const percentLabel = document.getElementById('swiper-percent-label') as HTMLSpanElement | null;
      if (percentInput) {
        // Compute percent from translate (loop- and RTL-safe)
        const syncFromSwiper = () => {
          const min = (swiperInstance as any).minTranslate();
          const max = (swiperInstance as any).maxTranslate();
          const logicalT = (swiperInstance as any).rtlTranslate
            ? -((swiperInstance as any).translate || 0)
            : ((swiperInstance as any).translate || 0);
          const denom = max - min || 1;
          const p = (logicalT - min) / denom;
          const val = Math.round(Math.min(1, Math.max(0, p)) * 100);
          percentInput.value = String(val);
          if (percentLabel) percentLabel.textContent = `${val}%`;
        };
        // initial sync
        syncFromSwiper();

        // Utility to drive swiper by percent [0..1]
        const setByPercent = (p: number) => {
          const clamped = Math.min(1, Math.max(0, p));
          const min = (swiperInstance as any).minTranslate();
          const max = (swiperInstance as any).maxTranslate();
          const target = min + clamped * (max - min);
          (swiperInstance as any).translateTo(target, 0, false, false);
        };

        // Auto-progress 0% -> 100% over 10 seconds
        const duration = 10000; // ms
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
            const frac = Math.min(1, (now - start) / duration);
            setByPercent(frac);
            if (!paused && frac < 1) {
              rafId = requestAnimationFrame(tick);
            } else {
              rafId = null;
            }
          };
          rafId = requestAnimationFrame(tick);
        };

        // user drags percentage -> move slides using translateTo for accurate position in loop
        percentInput.addEventListener('input', () => {
          // any user change pauses auto
          pauseAuto();
          const val = Number(percentInput.value);
          const p = Math.min(100, Math.max(0, val)) / 100;
          const min = (swiperInstance as any).minTranslate();
          const max = (swiperInstance as any).maxTranslate();
          const target = min + p * (max - min);
          (swiperInstance as any).translateTo(target, 0, false, false);
        });
        // Pause when user starts interacting with range or swiper
        percentInput.addEventListener('pointerdown', pauseAuto);
        (swiperInstance as any).on('touchStart', pauseAuto);
        (swiperInstance as any).on('scrollbarDragStart', pauseAuto);

        // slides move -> update percentage
        (swiperInstance as any).on('progress', syncFromSwiper);
        (swiperInstance as any).on('setTranslate', syncFromSwiper);
        (swiperInstance as any).on('resize', syncFromSwiper);
        (swiperInstance as any).on('update', syncFromSwiper);

        // expose cleanup hooks
        stopAuto = pauseAuto;
        removeAutoListeners = () => {
          percentInput.removeEventListener('pointerdown', pauseAuto as any);
          if (swiperInstance) {
            (swiperInstance as any).off('touchStart', pauseAuto);
            (swiperInstance as any).off('scrollbarDragStart', pauseAuto);
            (swiperInstance as any).off('progress', syncFromSwiper);
            (swiperInstance as any).off('setTranslate', syncFromSwiper);
            (swiperInstance as any).off('resize', syncFromSwiper);
            (swiperInstance as any).off('update', syncFromSwiper);
          }
        };

        // kick off auto-progress
        startAuto();
      }
    };

    // Load Swiper UMD bundle once and init
    const swiperJsSrc = "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js";
    let existingScript = document.querySelector(`script[src="${swiperJsSrc}"]`) as HTMLScriptElement | null;
    if ((window as any).Swiper) {
      initSwiper();
    } else if (existingScript) {
      existingScript.addEventListener("load", initSwiper, { once: true });
    } else {
      const cdnScript = document.createElement("script");
      cdnScript.src = swiperJsSrc;
      cdnScript.async = true;
      cdnScript.addEventListener("load", initSwiper, { once: true });
      document.body.appendChild(cdnScript);
      existingScript = cdnScript;
    }

    // Cleanup on unmount (stop auto, remove listeners, destroy swiper instance)
    return () => {
      if (stopAuto) stopAuto();
      if (removeAutoListeners) removeAutoListeners();
      if (swiperInstance && typeof swiperInstance.destroy === "function") {
        swiperInstance.destroy(true, true);
      }
    };
  }, []);

  return (
    <>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="panorama-box" style={{ width: '100%' }}>
          <div className="panorama-slider">
            <div className="swiper">
              <div className="swiper-wrapper">
                <div className="swiper-slide">
                  <img
                    className="slide-image"
                    src="https://cdn.pixabay.com/photo/2023/07/19/12/16/car-8136751_1280.jpg"
                    alt=""
                  />
                </div>
                <div className="swiper-slide">
                  <img
                    className="slide-image"
                    src="https://cdn.pixabay.com/photo/2023/03/22/07/52/lizard-7868932_1280.jpg"
                    alt=""
                  />
                </div>
                <div className="swiper-slide">
                  <img
                    className="slide-image"
                    src="https://cdn.pixabay.com/photo/2016/11/14/04/45/elephant-1822636_1280.jpg"
                    alt=""
                  />
                </div>
                <div className="swiper-slide">
                  <img
                    className="slide-image"
                    src="https://cdn.pixabay.com/photo/2023/10/19/21/08/ai-generated-8327632_1280.jpg"
                    alt=""
                  />
                </div>
                <div className="swiper-slide">
                  <img
                    className="slide-image"
                    src="https://cdn.pixabay.com/photo/2016/05/18/10/52/buick-1400243_1280.jpg"
                    alt=""
                  />
                </div>
                <div className="swiper-slide">
                  <img
                    className="slide-image"
                    src="https://cdn.pixabay.com/photo/2023/03/27/08/53/woman-7880177_1280.jpg"
                    alt=""
                  />
                </div>
                <div className="swiper-slide">
                  <img
                    className="slide-image"
                    src="https://cdn.pixabay.com/photo/2019/08/08/23/33/car-4393990_1280.jpg"
                    alt=""
                  />
                </div>
                <div className="swiper-slide">
                  <img
                    className="slide-image"
                    src="https://cdn.pixabay.com/photo/2019/09/04/02/52/forest-4450611_1280.jpg"
                    alt=""
                  />
                </div>
              </div>
              <div className="swiper-pagination"></div>
              {/* moved scrollbar out of .swiper */}
            </div>
          </div>
          {/* Controls below the carousel inside the same box */}
          <div className="panorama-controls" style={{ marginTop: 16 }}>
            <div className="swiper-scrollbar" style={{ marginBottom: 12 }}></div>
            <div className="swiper-percentage">
              <input id="swiper-percent" type="range" min="0" max="100" step="1" defaultValue="0" style={{ width: '100%' }} />
              <span id="swiper-percent-label" style={{ marginLeft: '8px' }}>0%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Panorama;