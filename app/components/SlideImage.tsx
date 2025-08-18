import React from 'react';

interface SlideImageProps {
  src: string;
  alt: string;
}

export const SlideImage: React.FC<SlideImageProps> = ({ src, alt }) => {
  return (
    <div className="swiper-slide">
      <img
        className="slide-image"
        src={src}
        alt={alt}
        style={{ 
          width: '600px', 
          height: '840px', 
          objectFit: 'cover', 
          display: 'block' 
        }}
      />
    </div>
  );
};
