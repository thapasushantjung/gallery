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
    max-width: none !portant;
    max-height: none !important;
    /* Smooth transitions for hover effects */
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), filter 0.45s ease;
    transform-origin: center center;
    will-change: transform, filter;
    /* Space theme integration */
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6),
                0 0 20px rgba(107, 70, 193, 0.2);
  }
  
  /* Pin wrapper ensures GSAP pinning behaves as expected */
  .panorama-section {
    position: relative;
    width: 100%;
    overflow: visible;
    /* Subtle backdrop for better contrast */
    background: rgba(10, 10, 26, 0.1);
    backdrop-filter: blur(1px);
  }
  
  /* Allow 3D overflow to be visible so content isn't clipped */
  .panorama-box { 
    overflow: visible; 
    padding-top: 18vh; /* slightly reduce for better balance */
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

  /* Interactions: zoom hovered image, grayscale the rest */
  .panorama-slider .swiper:hover .slide-image {
    filter: grayscale(90%);
  }
  .panorama-slider .swiper:hover .swiper-slide:hover .slide-image {
    transform: scale(1.05);
    filter: grayscale(0%);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8),
                0 0 30px rgba(107, 70, 193, 0.4);
  }
  /* Optional cursor hint */
  .panorama-slider .swiper-slide { cursor: zoom-in; }

  /* Caption styles */
  .panorama-section .caption-panel {
    color: #e7e9ee;
    text-shadow: 0 1px 2px rgba(0,0,0,0.4);
  }
  .panorama-section .caption-title { opacity: 0.9; }
  .panorama-section .caption-desc { opacity: 0.8; }
`;
