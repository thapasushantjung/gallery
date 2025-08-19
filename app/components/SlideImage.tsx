import React from 'react';

interface SlideImageProps {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  date?: string; // e.g. "Jul 2023"
  onHoverEnter?: (payload: { title: string; description: string; date?: string; src: string; alt: string }) => void;
  onHoverLeave?: () => void;
}

export const SlideImage: React.FC<SlideImageProps> = ({ src, alt, title = '', description = '', date, onHoverEnter, onHoverLeave }) => {
  return (
    <div
      className="swiper-slide"
      onMouseEnter={() => onHoverEnter?.({ title, description, date, src, alt })}
      onMouseLeave={() => onHoverLeave?.()}
    >
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
