'use client';
import React, { useEffect } from "react";
import { usePanoramaSlider } from '../hooks/usePanoramaSlider';
import { SlideImage } from './SlideImage';
import { PanoramaControls } from './PanoramaControls';
import { panoramaStyles } from '../styles/panoramaStyles';
import Title from "./Title";

const slideImages = [
  "https://cdn.pixabay.com/photo/2023/07/19/12/16/car-8136751_1280.jpg",
  "https://cdn.pixabay.com/photo/2023/03/22/07/52/lizard-7868932_1280.jpg",
  "https://cdn.pixabay.com/photo/2016/11/14/04/45/elephant-1822636_1280.jpg",
  "https://cdn.pixabay.com/photo/2023/10/19/21/08/ai-generated-8327632_1280.jpg",
  "https://cdn.pixabay.com/photo/2016/05/18/10/52/buick-1400243_1280.jpg",
  "https://cdn.pixabay.com/photo/2023/03/27/08/53/woman-7880177_1280.jpg",
  "https://cdn.pixabay.com/photo/2019/08/08/23/33/car-4393990_1280.jpg",
  "https://cdn.pixabay.com/photo/2019/09/04/02/52/forest-4450611_1280.jpg",
];

export const PanoramaSlider: React.FC = () => {
  usePanoramaSlider();

  return (
    <>
      <div className="panorama-section">
        <div className="absolute top-1/5 left-1/2 -translate-x-1/2 -translate-y-1/2 z-500">
<Title title="SUSHANT GALLERY" />        </div>
        <div className="panorama-box" style={{ width: '100%', overflow: 'visible' }}>
          <div className="panorama-slider">
            <div className="swiper">
              <div className="swiper-wrapper">
                {slideImages.map((src, index) => (
                  <SlideImage key={index} src={src} alt={`Slide ${index + 1}`} />
                ))}
              </div>
              {/* <div className="swiper-pagination"></div> */}
            </div>
          </div>
          {/* <PanoramaControls /> */}
        </div>
      </div>
      <style jsx>{panoramaStyles}</style>
    </>
  );
};
