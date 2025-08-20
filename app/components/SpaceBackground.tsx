"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  driftSpeed: number;
}

const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      generateStars();
    };

    const generateStars = () => {
      const stars: Star[] = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 8000); // Responsive star density
      
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          driftSpeed: Math.random() * 0.1 + 0.05,
        });
      }
      
      starsRef.current = stars;
    };

    const createGradient = () => {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      
      gradient.addColorStop(0, '#0a0a1a');
      gradient.addColorStop(0.3, '#1a1a2e');
      gradient.addColorStop(0.6, '#16213e');
      gradient.addColorStop(1, '#0f0f23');
      
      return gradient;
    };

    const drawStar = (star: Star, time: number) => {
      const twinkle = Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7;
      const drift = Math.sin(time * star.driftSpeed * 0.001) * 2;
      
      ctx.save();
      ctx.globalAlpha = star.opacity * twinkle;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = star.size * 2;
      
      // Main star
      ctx.beginPath();
      ctx.arc(star.x + drift, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Sparkle effect for larger stars
      if (star.size > 1.5) {
        ctx.globalAlpha = star.opacity * twinkle * 0.6;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.5;
        const sparkleSize = star.size * 3;
        
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(star.x + drift, star.y - sparkleSize);
        ctx.lineTo(star.x + drift, star.y + sparkleSize);
        ctx.stroke();
        
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(star.x + drift - sparkleSize, star.y);
        ctx.lineTo(star.x + drift + sparkleSize, star.y);
        ctx.stroke();
      }
      
      ctx.restore();
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw space gradient background
      ctx.fillStyle = createGradient();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add nebula-like clouds
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#4a5568';
      const cloudOffset = time * 0.00005;
      for (let i = 0; i < 3; i++) {
        const x = (canvas.width * 0.2 * (i + 1)) + Math.sin(cloudOffset + i) * 50;
        const y = (canvas.height * 0.3 * (i + 1)) + Math.cos(cloudOffset + i) * 30;
        const size = 200 + Math.sin(cloudOffset + i * 2) * 50;
        
        const cloudGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        cloudGradient.addColorStop(0, '#6b46c1');
        cloudGradient.addColorStop(0.5, '#3730a3');
        cloudGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = cloudGradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      
      // Draw stars
      starsRef.current.forEach(star => {
        drawStar(star, time);
      });
      
      // Parallax effect based on mouse position
      const parallaxStrength = 0.5;
      starsRef.current.forEach(star => {
        const parallaxX = (mouseRef.current.x - canvas.width / 2) * parallaxStrength * (star.size / 2);
        const parallaxY = (mouseRef.current.y - canvas.height / 2) * parallaxStrength * (star.size / 2);
        star.x += parallaxX * 0.001;
        star.y += parallaxY * 0.001;
        
        // Keep stars within bounds
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    // Initialize
    resizeCanvas();
    animate(0);

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)',
      }}
    />
  );
};

export default SpaceBackground;
