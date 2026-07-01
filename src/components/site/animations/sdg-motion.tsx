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
  pulseScale,
  refreshMotion,
  revealEach,
  safetyReveal,
} from "@/lib/gsap/motion-utils";

export function SdgMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root || !initMotion()) return;

      const hero = root.querySelector("[data-sdg-hero]");
      if (hero) {
        heroStagger(hero as HTMLElement, "[data-motion='hero-item']", { y: 40 }, { y: 0, duration: 0.8, stagger: 0.1 });
        heroStagger(
          hero as HTMLElement,
          "[data-motion='hero-cta']",
          { y: 24, scale: 0.96 },
          { y: 0, scale: 1, duration: 0.55, stagger: 0.08 },
          "-=0.5",
        );

        const orbit = hero.querySelector("[data-sdg-orbit]");
        if (orbit) {
          const rings = orbit.querySelectorAll("[data-sdg-ring]");
          pulseScale(Array.from(rings) as HTMLElement[]);

          const icons = orbit.querySelectorAll("[data-sdg-orbit-icon]");
          gsap.fromTo(
            icons,
            { scale: 0, opacity: 0, transformOrigin: "center center" },
            {
              scale: 1,
              opacity: 1,
              duration: 0.55,
              stagger: { each: 0.04, from: "center" },
              ease: "back.out(2)",
              delay: 0.4,
            },
          );

          gsap.to(orbit, {
            rotation: 360,
            duration: 120,
            repeat: -1,
            ease: "none",
            transformOrigin: "260px 260px",
          });
        }
      }

      revealEach(root, "[data-motion='head']", { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85 });
      batchReveal(root, "[data-motion='card']", { y: 56, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.06 });
      batchReveal(root, "[data-motion='stat']", { y: 40, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.65, stagger: 0.1, ease: "back.out(1.4)" });
      batchReveal(root, "[data-motion='sdg-chip']", { y: 16, opacity: 0, scale: 0.7 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, stagger: 0.025, ease: "back.out(2)" }, "top 92%");
      batchReveal(root, "[data-motion='brief']", { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, stagger: 0.1 });
      revealEach(root, "[data-motion='alt']", { x: -32, y: 24, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.7 });

      const storyCard = root.querySelector("[data-sdg-story-card]");
      if (storyCard) {
        gsap.fromTo(
          storyCard,
          { y: 60, rotation: 8, opacity: 0 },
          {
            y: 0,
            rotation: -3,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: storyCard, start: "top 85%", once: true },
          },
        );
      }

      const ctaIcons = root.querySelectorAll("[data-sdg-cta-icon]");
      if (ctaIcons.length) {
        batchReveal(root, "[data-sdg-cta-icon]", { y: 30, opacity: 0, rotation: -12 }, { y: 0, opacity: 1, rotation: 0, duration: 0.5, stagger: 0.12, ease: "back.out(2)" });
        floatY(Array.from(ctaIcons) as HTMLElement[], 10, 2.8);
      }

      const partner = root.querySelector("[data-sdg-partner]");
      if (partner) parallaxY(partner, partner, 40);

      refreshMotion();
      return safetyReveal(root, "[data-motion],[data-sdg-orbit-icon]");
    },
    { scope },
  );

  return (
    <div ref={scope} className="motion-scope">
      {children}
    </div>
  );
}
