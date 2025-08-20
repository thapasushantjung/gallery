'use client';
import React, { useEffect, useState } from "react";
import { usePanoramaSlider } from '../hooks/usePanoramaSlider';
import { SlideImage } from './SlideImage';
import { panoramaStyles } from '../styles/panoramaStyles';
import Title from "./Title";
import gsap from 'gsap';

const slides = [
  { src: "https://cdn.pixabay.com/photo/2023/07/19/12/16/car-8136751_1280.jpg", title: "Crimson Velocity", description: "A classic sports car captured at golden hour, radiating power and elegance.", date: "Jul 2023" },
  { src: "https://cdn.pixabay.com/photo/2023/03/22/07/52/lizard-7868932_1280.jpg", title: "Emerald Gaze", description: "An inquisitive reptile basking in soft, diffused light with intricate textures.", date: "Mar 2023" },
  { src: "https://cdn.pixabay.com/photo/2016/11/14/04/45/elephant-1822636_1280.jpg", title: "Gentle Giant", description: "An elephant crossing a dusty savannah—strength, grace, and patience in motion.", date: "Nov 2016" },
  { src: "https://cdn.pixabay.com/photo/2023/10/19/21/08/ai-generated-8327632_1280.jpg", title: "Neon Dreamscape", description: "A surreal cityscape of glowing hues and synthetic reflections.", date: "Oct 2023" },
  { src: "https://cdn.pixabay.com/photo/2016/05/18/10/52/buick-1400243_1280.jpg", title: "Vintage Polished", description: "A mint-condition Buick chrome glistening under studio lights.", date: "May 2016" },
  { src: "https://cdn.pixabay.com/photo/2023/03/27/08/53/woman-7880177_1280.jpg", title: "Candid Reflections", description: "An intimate portrait with delicate highlights and quiet confidence.", date: "Mar 2023" },
  { src: "https://cdn.pixabay.com/photo/2019/08/08/23/33/car-4393990_1280.jpg", title: "Urban Motion", description: "Midnight speed trails weaving through the concrete maze.", date: "Aug 2019" },
  { src: "https://cdn.pixabay.com/photo/2019/09/04/02/52/forest-4450611_1280.jpg", title: "Forest Reverie", description: "Fog-laced pines embracing the morning hush in deep greens.", date: "Sep 2019" },
];

export const PanoramaSlider: React.FC = () => {
  usePanoramaSlider();
  const [caption, setCaption] = useState<{ title: string; description: string; date?: string } | null>(null);
  const [captionEl, setCaptionEl] = useState<HTMLDivElement | null>(null);

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

  const hancleAPI = async () => {
    const res = await fetch('/api/posts');
    if (!res.ok) {
      console.error('Failed to fetch data');
      return;
    }
    const data = await res.json();
    console.log('Fetched IDs:', data);
  }

  return (
    <>
      <div className="panorama-section">
        <div onClick={hancleAPI} className="absolute top-1/5 left-1/2 -translate-x-1/2 -translate-y-1/2 z-500">
          <Title title="Gall" />
        </div>
        <div className="panorama-box" style={{ width: '100%', overflow: 'visible' }}>
          <div className="panorama-slider">
            <div className="swiper">
              <div className="swiper-wrapper">
                {slides.map((s, index) => (
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
                ))}
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
