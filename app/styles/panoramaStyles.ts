export const panoramaStyles = `
  /* Make the carousel 60% of the viewport height */
  .panorama-slider .swiper,
  .panorama-slider .swiper-wrapper,
  .panorama-slider .swiper-slide {
    height: 50vh !important;
  }
  /* Ensure slides shrink to the image width so spaceBetween controls the visible gap */
  .panorama-slider .swiper-slide { width: auto !important; }
  
  /* Images: keep portrait 600x840 ratio, scale with slider height */
  .panorama-slider .slide-image {
    height: 100% !important;         /* equals 60vh via slide height */
    width: auto !important;          /* let aspect-ratio compute width */
    aspect-ratio: 600 / 840;         /* 5:7 portrait */
    display: block;
    object-fit: cover;
    max-width: none !important;
    max-height: none !important;
  }
  
  /* Pin wrapper ensures GSAP pinning behaves as expected */
  .panorama-section {
    position: relative;
    width: 100%;
    overflow: visible;
  }
  
  /* Allow 3D overflow to be visible so content isn't clipped */
  .panorama-box { 
    overflow: visible; 
    padding-block: 20vh !important; 
    perspective: 1200px;
    perspective-origin: center center;
  }
  .panorama-slider { 
    overflow: visible !important;
    transform-style: preserve-3d;
  }
  .panorama-slider .swiper,
  .panorama-slider .swiper-wrapper,
  .panorama-slider .swiper-slide { overflow: visible !important; }
`;
