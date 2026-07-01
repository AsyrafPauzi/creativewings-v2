"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

import {
  batchReveal,
  heroStagger,
  initMotion,
  refreshMotion,
  revealEach,
  safetyReveal,
} from "@/lib/gsap/motion-utils";

export function AboutMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root || !initMotion()) return;

      const hero = root.querySelector("[data-about-hero]");
      if (hero) {
        heroStagger(hero as HTMLElement, "[data-motion='hero-item']", { y: 32 }, { y: 0, duration: 0.7, stagger: 0.12 });
        heroStagger(
          hero as HTMLElement,
          "[data-motion='hero-cta']",
          { y: 24, scale: 0.97 },
          { y: 0, scale: 1, duration: 0.55, stagger: 0.08 },
          "-=0.4",
        );
      }

      batchReveal(root, "[data-motion='card']", { y: 48, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.65, stagger: 0.12, ease: "back.out(1.4)" });

      root.querySelectorAll<HTMLElement>("[data-motion='icon']").forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0, rotation: -20 },
          {
            scale: 1,
            rotation: 0,
            duration: 0.55,
            ease: "back.out(2.5)",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          },
        );
      });

      revealEach(root, "[data-motion='head']", { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75 });

      refreshMotion();
      return safetyReveal(root, "[data-motion]");
    },
    { scope },
  );

  return (
    <div ref={scope} className="motion-scope">
      {children}
    </div>
  );
}
