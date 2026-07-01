"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { prefersReducedMotion, registerGsap } from "@/lib/gsap/register";

interface HomeMotionProps {
  children: ReactNode;
}

type RevealFrom = gsap.TweenVars;
type RevealTo = gsap.TweenVars;

/** Scroll-triggered reveal using fromTo so elements never get stuck at opacity 0. */
function batchReveal(
  root: HTMLElement,
  selector: string,
  from: RevealFrom,
  to: RevealTo,
  start = "top 90%",
) {
  const elements = root.querySelectorAll(selector);
  if (!elements.length) return;

  ScrollTrigger.batch(elements, {
    start,
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(batch, from, {
        ...to,
        stagger: to.stagger ?? 0.1,
        overwrite: "auto",
      });
    },
  });
}

function revealEach(
  root: HTMLElement,
  selector: string,
  from: RevealFrom,
  to: RevealTo,
  start = "top 88%",
) {
  root.querySelectorAll<HTMLElement>(selector).forEach((el, i) => {
    gsap.fromTo(el, from, {
      ...to,
      delay: (to.delay as number | undefined) ?? i * 0.08,
      scrollTrigger: {
        trigger: el,
        start,
        once: true,
        toggleActions: "play none none none",
      },
    });
  });
}

/**
 * Scroll-driven GSAP animations for the homepage.
 * Uses fromTo (not pre-hide + from) so content is never stuck invisible.
 */
export function HomeMotion({ children }: HomeMotionProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const root = scope.current;
      if (!root) return;

      if (prefersReducedMotion()) return;

      const defaults = { duration: 0.7, ease: "power3.out" };

      // Category tabs (desktop)
      const tabs = root.querySelector("[data-gsap='category-tabs']");
      if (tabs) {
        gsap.fromTo(
          tabs.children,
          { y: -16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.04,
            ease: "back.out(1.4)",
            scrollTrigger: { trigger: tabs, start: "top 95%", once: true },
          },
        );
      }

      // Section headings
      revealEach(
        root,
        "[data-gsap='section-head']",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
      );

      // Campaign grid cards
      batchReveal(
        root,
        "[data-gsap='campaign-card']",
        { y: 48, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.65, stagger: 0.08 },
      );

      // Subcategory pills
      batchReveal(
        root,
        "[data-gsap='sub-pill']",
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, stagger: 0.04, ease: "back.out(2)" },
        "top 92%",
      );

      // Spotlight
      const spotlight = root.querySelector("[data-gsap='spotlight']");
      if (spotlight) {
        gsap.fromTo(
          spotlight,
          { x: -60, opacity: 0, rotation: -3 },
          {
            x: 0,
            opacity: 1,
            rotation: 0,
            duration: 0.9,
            scrollTrigger: { trigger: spotlight, start: "top 85%", once: true },
          },
        );
        const spotlightContent = root.querySelectorAll("[data-gsap='spotlight-content'] > *");
        if (spotlightContent.length) {
          gsap.fromTo(
            spotlightContent,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.08,
              scrollTrigger: { trigger: spotlight, start: "top 80%", once: true },
            },
          );
        }
      }

      // Programme cards
      batchReveal(
        root,
        "[data-gsap='programme-card']",
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.75, stagger: 0.12 },
      );

      // Stats row
      batchReveal(
        root,
        "[data-gsap='stat-item']",
        { y: 32, opacity: 0, scale: 0.92 },
        { y: 0, opacity: 1, scale: 1, duration: 0.65, stagger: 0.1, ease: "back.out(1.4)" },
      );

      // SDG icons
      batchReveal(
        root,
        "[data-gsap='sdg-icon']",
        { y: 16, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.35, stagger: 0.03, ease: "back.out(2)" },
        "top 92%",
      );

      // Testimonials — alternate sides
      root.querySelectorAll<HTMLElement>("[data-gsap='testimonial']").forEach((el, i) => {
        gsap.fromTo(
          el,
          { x: i % 2 === 0 ? -32 : 32, y: 20, opacity: 0 },
          {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 0.7,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          },
        );
      });

      // How it works steps
      batchReveal(
        root,
        "[data-gsap='step-card']",
        { y: 48, opacity: 0, rotation: -1 },
        { y: 0, opacity: 1, rotation: 0, duration: 0.7, stagger: 0.14 },
      );

      // Winner cards
      batchReveal(
        root,
        "[data-gsap='winner-card']",
        { scale: 0.85, opacity: 0, y: 24 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "back.out(2)" },
      );

      // Organizer section
      const organizer = root.querySelector("[data-gsap='organizer']");
      if (organizer) {
        const organizerText = organizer.querySelectorAll("[data-gsap='organizer-text'] > *");
        if (organizerText.length) {
          gsap.fromTo(
            organizerText,
            { y: 32, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.65,
              stagger: 0.1,
              scrollTrigger: { trigger: organizer, start: "top 80%", once: true },
            },
          );
        }
        const kpis = organizer.querySelectorAll("[data-gsap='organizer-kpi']");
        if (kpis.length) {
          gsap.fromTo(
            kpis,
            { x: 40, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              scrollTrigger: { trigger: organizer, start: "top 75%", once: true },
            },
          );
        }
      }

      // Newsletter
      batchReveal(
        root,
        "[data-gsap='newsletter-panel']",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 },
      );

      // Subtle orb pulse on organizer band
      root.querySelectorAll<HTMLElement>("[data-gsap='bg-orb']").forEach((orb, i) => {
        gsap.to(orb, {
          scale: 1.06,
          duration: 4 + i,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      // Recalculate after layout/fonts settle
      const refresh = () => ScrollTrigger.refresh();
      requestAnimationFrame(refresh);
      window.addEventListener("load", refresh, { once: true });

      // Safety net: ensure nothing stays hidden if a trigger was missed
      const safetyTimer = window.setTimeout(() => {
        root.querySelectorAll<HTMLElement>("[data-gsap]").forEach((el) => {
          if (gsap.getProperty(el, "opacity") === 0) {
            gsap.set(el, { opacity: 1, clearProps: "transform" });
          }
        });
      }, 2500);

      return () => window.clearTimeout(safetyTimer);
    },
    { scope },
  );

  return (
    <div ref={scope} className="gsap-scope">
      {children}
    </div>
  );
}
