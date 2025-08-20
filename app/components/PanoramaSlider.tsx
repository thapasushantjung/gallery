'use client';
import React, { useEffect, useState } from "react";
import { usePanoramaSlider } from '../hooks/usePanoramaSlider';
import { SlideImage } from './SlideImage';
import { panoramaStyles } from '../styles/panoramaStyles';
import Title from "./Title";
import Loader from "./Loader";
import SpaceBackground from "./SpaceBackground";
import gsap from 'gsap';

// Replace hardcoded slides with a type definition
type Slide = {
  src: string;
  title: string;
  description: string;
  date?: string;
};

export const PanoramaSlider: React.FC = () => {
  usePanoramaSlider();
  const [caption, setCaption] = useState<{ title: string; description: string; date?: string } | null>(null);
  const [captionEl, setCaptionEl] = useState<HTMLDivElement | null>(null);  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!captionEl) return;
    // animate in/out
    if (caption) {
      gsap.killTweensOf(captionEl);
      gsap.fromTo(captionEl, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' });
    } else {
      gsap.killTweensOf(captionEl);
      gsap.to(captionEl, { autoAlpha: 0, y: 10, duration: 0.25, ease: 'power2.inOut' });
    }
  }, [caption, captionEl]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts');
      if (!res.ok) {
        console.error('Failed to fetch data');
        return;
      }
      const data = await res.json();
      
      // Handle different response formats - ensure we get an array
      let slidesArray: Slide[] = [];
      if (Array.isArray(data)) {
        slidesArray = data;
      } else if (data && typeof data === 'object') {
        // Check if data has a posts/items/slides property that contains an array
        const possibleArrayProps = ['posts', 'items', 'slides', 'data', 'images'];
        for (const prop of possibleArrayProps) {
          if (Array.isArray(data[prop])) {
            slidesArray = data[prop];
            break;
          }
        }
      }
        console.log('Fetched slides:', slidesArray);
      setSlides(slidesArray);
    } catch (error) {
      console.error('Error fetching images:', error);
      setSlides([]);
    } finally {
      // Add transition delay for smoother experience
      setIsTransitioning(true);
      setTimeout(() => {
        setLoading(false);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 800); // Match transition duration
      }, 500); // Small delay before starting transition
    }
  };
  // Fade in panorama content when loading completes
  useEffect(() => {
    if (!loading) {
      const panoramaContent = document.querySelector('.panorama-content');
      if (panoramaContent) {
        gsap.fromTo(panoramaContent, 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }
        );
      }
    }
  }, [loading]);

  // Fetch slides when component mounts
  useEffect(() => {
    fetchImages();
  }, []);  return (
    <>
      {loading && (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-1000 ease-in-out ${
          isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
        }`}>
          <SpaceBackground />
          <div className="relative z-10">
            <Loader />
          </div>
        </div>
      )}
      <div className={`panorama-section transition-all duration-1000 ease-in-out transform ${
        loading ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
      }`}>
        <div onClick={fetchImages} className="absolute top-1/5 left-1/2 -translate-x-1/2 -translate-y-1/2 z-500">
          <Title title="Gall" />
        </div>
        <div className="panorama-box panorama-content" style={{ width: '100%', overflow: 'visible' }}>
          <div className="panorama-slider">
            <div className="swiper">
              <div className="swiper-wrapper">
                {loading ? (
                  <div className="flex items-center justify-center w-full py-20">
                    <div className="text-xl">Loading images...</div>
                  </div>
                ) : (
                  Array.isArray(slides) && slides.length > 0 ? slides.map((s, index) => (
                    <SlideImage
                      key={index}
                      src={s.src}
                      alt={s.title}
                      title={s.title}
                      description={s.description}
                      date={s.date}
                      onHoverEnter={({ title, description, date }) => setCaption({ title, description, date })}
                      onHoverLeave={() => setCaption(null)}
                    />
                  )) : (
                    <div className="flex items-center justify-center w-full py-20">
                      <div className="text-xl">No images available</div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          {/* Caption panel below the panorama box */}
          <div
            ref={setCaptionEl}
            className="caption-panel px-6 md:px-10 lg:px-14 flex items-center justify-center"
            style={{ pointerEvents: 'none' }}
          >
            {caption && (
              <div className="mt-6 select-none ">
                <div className="caption-title text-center text-2xl md:text-3xl font-semibold tracking-wide">{caption.title}</div>
                <div className="caption-desc text-xl md:text-xl mt-1 max-w-3xl leading-relaxed">{caption.description}</div>
                {caption.date && (
                  <div className="caption-date text-center mt-2 text-2xl md:text-2xl font-medium tracking-wide opacity-90">
                    {caption.date}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{panoramaStyles}</style>
    </>
  );
};
