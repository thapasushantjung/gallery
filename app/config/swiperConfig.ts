export const swiperConfig = {
  effect: "panorama",
  slidesPerView: "auto" as const,
  spaceBetween: 8,
  // Disable loop so min/max translate cover the entire strip
  loop: false,
  loopAdditionalSlides: 0,
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
    480: { panoramaEffect: { rotate: 35, depth: 150 } },
    640: { panoramaEffect: { rotate: 30, depth: 150 } },
    1024: { panoramaEffect: { rotate: 30, depth: 200 } },
    1200: { panoramaEffect: { rotate: 25, depth: 250 } },
  },
};

export const AUTO_PROGRESS_DURATION = 10000; // ms
export const DEMO_CSS_HREF = "/panorama/assets/index.c1d53924.css";
export const SWIPER_JS_SRC = "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js";
