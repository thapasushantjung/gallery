"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { STIX_Two_Text, Space_Mono } from "next/font/google";
import gsap from "gsap";

const stixTwoText = STIX_Two_Text({
  variable: "--font-stix-two-text",
  subsets: ["latin"],
});
const spaceMono = Space_Mono({
  weight: "700",
  variable: "--font-space-mono",
  subsets: ["latin"],
});

const EMOJIS = ['✺', '✦', '✧', '★', '☆', '✪', '✫', '✬', '✭', '✮', '✯', '✰', '✲', '✳', '✴', '✵', '✶', '✷', '✸', '✹', '✺', '✻', '✼', '✽', '✾', '✿', '❀', '❁', '❂', '❃', '❄', '❅', '❆', '❇', '❈', '❉', '❊', '❋'];

const Title = ({ title }: { title: string }) => {
  const [isMounted, setIsMounted] = useState(false);
  const stacksRef = useRef<Array<HTMLDivElement | null>>([]);
  const controllersRef = useRef<gsap.core.Tween[]>([]);
  const tweensRef = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const randomEmojis = useMemo(() => {
    const chars = Array.from(title);
    // Return original characters for SSR to avoid hydration mismatch.
    // On the client, after mount, this will re-run and generate random emojis.
    if (!isMounted) {
      return chars;
    }
    return Array.from({ length: title.length }, () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
  }, [title, isMounted]);

  const getDurationForIndex = (i: number) => 2.8 + (i % 7) * 0.35; // 2.8s .. ~5.0s
  const getDelayForIndex = (i: number) => i * 0.06; // slight stagger

  // Re-animate on hover (reset base, recreate controller)
  const handleMouseEnter = () => {
    // Check if any of the animations are currently active
    const isAnimating = controllersRef.current.some(ctrl => ctrl && ctrl.isActive());
    if (isAnimating) {
      return; // Do nothing if animation is in progress
    }

    controllersRef.current.forEach((ctrl, i) => {
      const base = tweensRef.current[i];
      if (!base) return;
      if (ctrl) ctrl.kill();
      // Reset the full repeated tween, not just the current cycle
      base.totalProgress(0).pause();
      controllersRef.current[i] = gsap.to(base, {
        totalProgress: 1,
        duration: getDurationForIndex(i),
        ease: "power4.inOut",
        delay: getDelayForIndex(i),
      });
    });
  };

  useEffect(() => {
    // Kill any existing tweens before re-creating (in case title changes)
    controllersRef.current.forEach((t) => t.kill());
    tweensRef.current.forEach((t) => t.kill());
    controllersRef.current = [];
    tweensRef.current = [];

    stacksRef.current.forEach((el, i) => {
      if (!el) return;

      const base = gsap.to(el, {
        yPercent: -100 * (2 / 3), // move up by 2/3 of the container height
        repeat: 10,
        ease: "none",
      });

      const ctrl = gsap.to(base, {
        totalProgress: 1,
        duration: getDurationForIndex(i),
        ease: "power4.inOut",
        delay: getDelayForIndex(i),
      });

      tweensRef.current.push(base);
      controllersRef.current.push(ctrl);
    });

    return () => {
      controllersRef.current.forEach((t) => t.kill());
      tweensRef.current.forEach((t) => t.kill());
      controllersRef.current = [];
      tweensRef.current = [];
    };
  }, [title, randomEmojis]);

  const chars = Array.from(title);

  return (
    <h1 className={`${spaceMono.className} text-7xl`} onMouseEnter={handleMouseEnter}>
      {chars.map((ch, i) => {
        if (ch === " ") {
          return (
            <span key={`space-${i}`} className="inline-block w-[0.4em]" aria-hidden>
              {" "}
            </span>
          );
        }
        return (
          <span
            key={`${ch}-${i}`}
            className="inline-block align-baseline overflow-hidden leading-none relative"
            style={{
              height: "1em",
              marginRight: "0.02em",
              // Fade the top/bottom edges so the slot-machine scroll looks seamless
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
              maskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
            }}
          >
            <div
              className="flex flex-col leading-none"
              ref={(el) => { stacksRef.current[i] = el; }}
              style={{ willChange: "transform" }}
            >
              <span className="block">{ch}</span>
              <span className="block" aria-hidden>{randomEmojis[i] || ch}</span>
              <span className="block">{ch}</span>
            </div>
          </span>
        );
      })}
    </h1>
  );
};

export default Title;