"use client";
import React, { useEffect, useRef } from "react";

// White circle cursor with jelly movement (Tailwind-only styles)
export const Cursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    // Respect touch and reduced motion
    const isCoarse = matchMedia?.("(pointer: coarse)").matches;
    const reduced = matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (isCoarse || reduced) {
      dot.style.opacity = "0";
      return;
    }

    const prevBodyCursor = document.body.style.cursor;
    document.body.style.cursor = "none";

    let rafId: number | null = null;
    let tx = -100, ty = -100; // target/pointer
    let x = tx, y = ty;       // smoothed position
    let px = x, py = y;       // previous for velocity

    // Press animation factor (eased each frame)
    let press = 1;       // current
    let pressTarget = 1; // target

    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.opacity = "1";
    };

    const onDown = () => {
      pressTarget = 0.85; // compress on click
    };
    const onUp = () => {
      pressTarget = 1; // release
    };

    const tick = () => {
      // Smooth follow
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;

      // Velocity
      const vx = x - px;
      const vy = y - py;
      const speed = Math.hypot(vx, vy);
      const angle = Math.atan2(vy, vx) * (180 / Math.PI);
      px = x; py = y;

      // Ease press factor
      press += (pressTarget - press) * 0.2;

      // Jelly squish from velocity
      const squishX = 1 + clamp(speed * 0.03, 0, 0.35);
      const squishY = 1 - clamp(speed * 0.02, 0, 0.22);
      const rot = angle * 0.2; // gentle rotation with direction

      // Compose transform: follow + center-offset + jelly + press
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${rot}deg) scale(${squishX * press}, ${squishY * press})`;

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = prevBodyCursor;
    };
  }, []);

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed left-0 top-0 z-[1000] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.12)] will-change-transform"
      style={{ opacity: 0 }}
      aria-hidden
    />
  );
};