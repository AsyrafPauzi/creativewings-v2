"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

import {
  batchReveal,
  floatY,
  heroStagger,
  initMotion,
  parallaxY,
  refreshMotion,
  revealEach,
  safetyReveal,
} from "@/lib/gsap/motion-utils";
import { registerGsap } from "@/lib/gsap/register";

export function BrandStoryMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root || !initMotion()) return;
      registerGsap();

      const hero = root.querySelector("[data-brand-hero]");
      if (hero) {
        heroStagger(hero as HTMLElement, "[data-motion='hero-item']", { y: 44 }, { y: 0, duration: 0.85, stagger: 0.1 });
        heroStagger(
          hero as HTMLElement,
          "[data-motion='hero-cta']",
          { y: 28, scale: 0.96 },
          { y: 0, scale: 1, duration: 0.55, stagger: 0.1 },
          "-=0.45",
        );

        const logo = hero.querySelector("[data-brand-logo]");
        if (logo) {
          gsap.fromTo(
            logo,
            { scale: 0.85, rotation: -8, opacity: 0 },
            { scale: 1, rotation: -2, opacity: 1, duration: 1.1, ease: "back.out(1.3)", delay: 0.2 },
          );
        }

        const stickers = hero.querySelectorAll("[data-brand-sticker]");
        gsap.fromTo(
          stickers,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, stagger: 0.08, ease: "back.out(2.5)", delay: 0.5 },
        );
        floatY(Array.from(stickers) as HTMLElement[], 14, 2.6);
      }

      const posters = root.querySelectorAll("[data-brand-poster]");
      posters.forEach((poster, i) => {
        gsap.fromTo(
          poster,
          { y: 80, opacity: 0, rotation: i % 2 === 0 ? -14 : 14 },
          {
            y: 0,
            opacity: 1,
            rotation: 0,
            duration: 0.85,
            delay: 0.1 + i * 0.12,
            ease: "back.out(1.2)",
            scrollTrigger: { trigger: poster, start: "top 92%", once: true },
          },
        );
      });

      revealEach(root, "[data-motion='head']", { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85 });
      batchReveal(root, "[data-motion='card']", { y: 64, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.12 });
      batchReveal(root, "[data-motion='partner']", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.05 });
      batchReveal(root, "[data-motion='team']", { y: 50, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.65, stagger: 0.1 });
      batchReveal(root, "[data-motion='value']", { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, stagger: 0.1 });

      const timeline = root.querySelector("[data-brand-timeline]");
      if (timeline) {
        const items = timeline.querySelectorAll("[data-motion='timeline-item']");
        gsap.fromTo(
          items,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.12,
            scrollTrigger: { trigger: timeline, start: "top 85%", once: true },
          },
        );

        const line = root.querySelector("[data-brand-timeline-line]");
        if (line) {
          gsap.fromTo(
            line,
            { scaleX: 0, transformOrigin: "left center" },
            {
              scaleX: 1,
              duration: 1.2,
              ease: "power2.inOut",
              scrollTrigger: { trigger: timeline, start: "top 85%", once: true },
            },
          );
        }
      }

      const photoBand = root.querySelector("[data-brand-photo]");
      if (photoBand) {
        parallaxY(photoBand, photoBand.querySelector("[data-brand-feather]") ?? photoBand, 60);
        const floats = photoBand.querySelectorAll("[data-brand-float]");
        floatY(Array.from(floats) as HTMLElement[], 18, 3);
      }

      const founder = root.querySelector("[data-brand-founder]");
      if (founder) {
        gsap.fromTo(
          founder,
          { y: 80, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: founder, start: "top 85%", once: true },
          },
        );
      }

      refreshMotion();
      return safetyReveal(root, "[data-motion],[data-brand-poster],[data-brand-sticker]");
    },
    { scope },
  );

  return (
    <div ref={scope} className="motion-scope">
      {children}
    </div>
  );
}
