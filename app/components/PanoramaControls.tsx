import React from 'react';

export const PanoramaControls: React.FC = () => {
  return (
    <div className="panorama-controls" style={{ marginTop: 16 }}>
      <div className="swiper-scrollbar" style={{ marginBottom: 12 }}></div>
      <div className="swiper-percentage">
        <input 
          id="swiper-percent" 
          type="range" 
          min="0" 
          max="100" 
          step="1" 
          defaultValue="0" 
          style={{ width: '100%' }} 
        />
        <span id="swiper-percent-label" style={{ marginLeft: '8px' }}>0%</span>
      </div>
    </div>
  );
};
