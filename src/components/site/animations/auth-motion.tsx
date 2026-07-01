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

export function AuthMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root || !initMotion()) return;

      const creative = root.querySelector("[data-auth-creative]");
      if (creative) {
        heroStagger(
          creative as HTMLElement,
          "[data-auth-creative-item]",
          { y: 36 },
          { y: 0, duration: 0.8, stagger: 0.1 },
        );
        heroStagger(
          creative as HTMLElement,
          "[data-auth-stat]",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 },
          "-=0.35",
        );

        const floats = creative.querySelectorAll("[data-auth-float]");
        if (floats.length) floatY(Array.from(floats) as HTMLElement[], 12, 2.8);

        const tickets = creative.querySelectorAll("[data-auth-ticket]");
        if (tickets.length) {
          gsap.fromTo(
            tickets,
            { x: -28, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.55, stagger: 0.1, delay: 0.35, ease: "power3.out" },
          );
        }

        creative.querySelectorAll("[data-auth-glow]").forEach((glow, i) => {
          gsap.to(glow, {
            scale: 1.08,
            opacity: 0.75,
            duration: 4 + i,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });
      }

      const formRoot =
        (root.querySelector("[data-auth-form]") as HTMLElement | null) ??
        (root.querySelector("[data-auth-split-form]") as HTMLElement | null);

      if (formRoot) {
        heroStagger(formRoot, "[data-motion='hero-item']", { y: 28 }, { y: 0, duration: 0.65, stagger: 0.1 });
        heroStagger(
          formRoot,
          "[data-motion='hero-cta']",
          { y: 18, scale: 0.98 },
          { y: 0, scale: 1, duration: 0.45, stagger: 0.08 },
          "-=0.4",
        );
        batchReveal(
          formRoot,
          "[data-motion='field']",
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.38, stagger: 0.06 },
          "top 96%",
        );
        batchReveal(
          formRoot,
          "[data-motion='card']",
          { y: 24, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.08 },
        );
      }

      revealEach(root, "[data-motion='head']", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 });

      refreshMotion();
      return safetyReveal(root, "[data-motion],[data-auth-creative-item],[data-auth-ticket]");
    },
    { scope },
  );

  return (
    <div ref={scope} className="motion-scope flex min-h-0 flex-1 flex-col">
      {children}
    </div>
  );
}
