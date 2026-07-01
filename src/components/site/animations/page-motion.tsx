"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

import {
  batchReveal,
  floatY,
  heroStagger,
  initMotion,
  refreshMotion,
  revealEach,
  safetyReveal,
} from "@/lib/gsap/motion-utils";

interface PageMotionProps {
  children: ReactNode;
  /** Optional hero scope selector inside children */
  hero?: boolean;
}

/**
 * Standard scroll reveals for marketing pages.
 * Mark elements with data-motion="..." attributes.
 */
export function PageMotion({ children, hero = false }: PageMotionProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root || !initMotion()) return;

      if (hero) {
        const heroEl = root.querySelector("[data-motion='hero']") ?? root;
        heroStagger(heroEl as HTMLElement, "[data-motion='hero-item']", { y: 36 }, { y: 0, duration: 0.75, stagger: 0.1 });
        heroStagger(
          heroEl as HTMLElement,
          "[data-motion='hero-cta']",
          { y: 24, scale: 0.97 },
          { y: 0, scale: 1, duration: 0.55, stagger: 0.08 },
          "-=0.45",
        );
      }

      revealEach(root, "[data-motion='head']", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 });
      batchReveal(root, "[data-motion='card']", { y: 48, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.65 });
      batchReveal(root, "[data-motion='card-pop']", { scale: 0.85, opacity: 0, y: 28 }, { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "back.out(2)" });
      batchReveal(root, "[data-motion='pill']", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.04, ease: "back.out(2)" }, "top 92%");

      root.querySelectorAll<HTMLElement>("[data-motion='alt']").forEach((el, i) => {
        gsap.fromTo(
          el,
          { x: i % 2 === 0 ? -36 : 36, y: 20, opacity: 0 },
          {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 0.7,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          },
        );
      });

      batchReveal(root, "[data-motion='fade']", { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.7 });
      batchReveal(
        root,
        "[data-motion='section']",
        { y: 56, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, stagger: 0.1 },
      );

      const floats = root.querySelectorAll("[data-motion-float]");
      if (floats.length) floatY(Array.from(floats) as HTMLElement[], 14, 2.8);

      root.querySelectorAll("[data-motion-blob]").forEach((blob, i) => {
        gsap.to(blob, {
          x: i % 2 === 0 ? 18 : -14,
          y: i % 2 === 0 ? 10 : -8,
          duration: 5 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      root.querySelectorAll<HTMLElement>("[data-motion='poster']").forEach((poster, i) => {
        gsap.fromTo(
          poster,
          { y: 70, opacity: 0, rotation: i % 2 === 0 ? -10 : 10 },
          {
            y: 0,
            opacity: 1,
            rotation: 0,
            duration: 0.8,
            delay: 0.15 + i * 0.1,
            ease: "back.out(1.3)",
            scrollTrigger: { trigger: poster, start: "top 92%", once: true },
          },
        );
      });

      refreshMotion();
      return safetyReveal(root, "[data-motion],[data-motion-poster]");
    },
    { scope },
  );

  return (
    <div ref={scope} className="motion-scope">
      {children}
    </div>
  );
}
