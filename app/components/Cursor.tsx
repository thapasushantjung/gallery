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

    // Force-hide native cursor everywhere (even on elements that set cursor styles)
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-custom-cursor", "true");
    styleEl.textContent = `*, html, body { cursor: none !important; }`;
    document.head.appendChild(styleEl);

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

    const onDown = () => { pressTarget = 0.85; };
    const onUp = () => { pressTarget = 1; };

    const isInSlide = (el: Element | null) => !!el && !!el.closest(".swiper-slide");

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
      const rot = angle * 0.2; // gentle rotation

      // Detect element under pointer; hide cursor node first so it isn't picked
      const prevVis = dot.style.visibility;
      dot.style.visibility = "hidden";
      const el = document.elementFromPoint?.(tx, ty) as Element | null;
      dot.style.visibility = prevVis || "visible";

      const overSlide = isInSlide(el);
      const baseScale = overSlide ? 1.9 : 1.0;

      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${rot}deg) scale(${squishX * press * baseScale}, ${squishY * press * baseScale})`;

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
      try { document.head.removeChild(styleEl); } catch {}
    };
  }, []);

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed left-0 top-0 z-[1000] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform"
      style={{ opacity: 0 }}
      aria-hidden
    >
      {/* White ring */}
      <span className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.12)]" />
      {/* Invert the content inside the circle (transparent bg ensures consistent backdrop rendering) */}
      <span className="pointer-events-none absolute inset-0 rounded-full bg-white/0 backdrop-invert backdrop-contrast-125" />
    </div>
  );
};