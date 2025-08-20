import React from 'react';

const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center w-full h-full min-h-[200px] space-y-6">
    {/* Orbital animation with multiple rings */}
    <div className="relative w-20 h-20">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-400 border-r-blue-400 animate-spin"></div>
      {/* Middle ring */}
      <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-cyan-400 border-l-indigo-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      {/* Inner ring */}
      <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-pink-400 border-r-violet-400 animate-spin" style={{ animationDuration: '2s' }}></div>
      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
    </div>
    
    {/* Loading text with space theme */}
    <div className="text-center">
      <div className="text-2xl font-light tracking-widest bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
        LOADING
      </div>
      <div className="text-sm font-light tracking-[0.3em] text-gray-400 mt-2 opacity-60">
        INITIALIZING SPACE
      </div>
    </div>
    
    {/* Floating particles */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping opacity-40"></div>
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-ping opacity-30" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-ping opacity-50" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-pink-300 rounded-full animate-ping opacity-35" style={{ animationDelay: '1.5s' }}></div>
    </div>
  </div>
);

export default Loader;
