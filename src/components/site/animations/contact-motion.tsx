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

export function ContactMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root || !initMotion()) return;

      const hero = root.querySelector("[data-contact-hero]");
      if (hero) {
        heroStagger(hero as HTMLElement, "[data-motion='hero-item']", { y: 40 }, { y: 0, duration: 0.8, stagger: 0.1 });
        heroStagger(
          hero as HTMLElement,
          "[data-motion='hero-cta']",
          { y: 24, scale: 0.97 },
          { y: 0, scale: 1, duration: 0.55, stagger: 0.08 },
          "-=0.45",
        );

        const envelopes = hero.querySelectorAll("[data-contact-envelope]");
        gsap.fromTo(
          envelopes,
          { y: 60, x: 30, opacity: 0, rotation: 12 },
          {
            y: 0,
            x: 0,
            opacity: 1,
            rotation: 0,
            duration: 0.75,
            stagger: 0.15,
            ease: "back.out(1.4)",
            delay: 0.25,
          },
        );
        floatY(Array.from(envelopes) as HTMLElement[], 8, 3.2);
      }

      const blobs = root.querySelectorAll("[data-contact-blob]");
      blobs.forEach((blob, i) => {
        gsap.to(blob, {
          x: i % 2 === 0 ? 20 : -16,
          y: i % 2 === 0 ? 12 : -10,
          duration: 5 + i,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      revealEach(root, "[data-motion='head']", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 });
      batchReveal(root, "[data-motion='card']", { y: 44, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.08 });
      batchReveal(root, "[data-motion='faq']", { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, stagger: 0.06 });
      batchReveal(root, "[data-motion='social']", { y: 32, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.05, ease: "back.out(2)" });
      batchReveal(root, "[data-motion='field']", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08 }, "top 92%");

      const map = root.querySelector("[data-contact-map]");
      if (map) parallaxY(map, map, 50);

      const form = root.querySelector("[data-contact-form]");
      if (form) {
        gsap.fromTo(
          form,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: form, start: "top 88%", once: true },
          },
        );
      }

      refreshMotion();
      return safetyReveal(root, "[data-motion],[data-contact-envelope]");
    },
    { scope },
  );

  return (
    <div ref={scope} className="motion-scope">
      {children}
    </div>
  );
}
