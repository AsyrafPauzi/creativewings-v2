import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { prefersReducedMotion, registerGsap } from "@/lib/gsap/register";

type Vars = gsap.TweenVars;

export function initMotion() {
  registerGsap();
  return !prefersReducedMotion();
}

export function refreshMotion() {
  requestAnimationFrame(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}

/** Scroll batch reveal — always fromTo so content never sticks invisible. */
export function batchReveal(
  root: HTMLElement,
  selector: string,
  from: Vars,
  to: Vars,
  start = "top 90%",
) {
  const elements = root.querySelectorAll(selector);
  if (!elements.length) return;

  ScrollTrigger.batch(elements, {
    start,
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(batch, from, { ...to, stagger: to.stagger ?? 0.08, overwrite: "auto" });
    },
  });
}

export function revealEach(
  root: HTMLElement,
  selector: string,
  from: Vars,
  to: Vars,
  start = "top 88%",
) {
  root.querySelectorAll<HTMLElement>(selector).forEach((el, i) => {
    gsap.fromTo(el, from, {
      ...to,
      delay: (to.delay as number | undefined) ?? i * 0.06,
      scrollTrigger: { trigger: el, start, once: true },
    });
  });
}

/** Hero copy — transform only; text stays visible if GSAP is interrupted. */
export function heroStagger(
  scope: HTMLElement,
  selector: string,
  from: Vars,
  to: Vars,
  position?: gsap.Position,
) {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.fromTo(scope.querySelectorAll(selector), from, to, position);
  return tl;
}

export function floatY(elements: HTMLElement | HTMLElement[], amount = 12, duration = 2.4) {
  const list = Array.isArray(elements) ? elements : [elements];
  list.forEach((el, i) => {
    gsap.to(el, {
      y: `+=${amount}`,
      duration: duration + i * 0.25,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: i * 0.15,
    });
  });
}

export function pulseScale(elements: HTMLElement | HTMLElement[]) {
  const list = Array.isArray(elements) ? elements : [elements];
  list.forEach((el, i) => {
    gsap.to(el, {
      scale: 1.06,
      duration: 3 + i,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  });
}

/** Parallax on scroll — lightweight, GPU-friendly. */
export function parallaxY(
  trigger: Element,
  target: Element,
  distance = 80,
) {
  gsap.fromTo(
    target,
    { y: -distance * 0.3 },
    {
      y: distance * 0.3,
      ease: "none",
      scrollTrigger: {
        trigger,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
      },
    },
  );
}

export function safetyReveal(root: HTMLElement, selector: string, delayMs = 2000) {
  const timer = window.setTimeout(() => {
    root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      if (gsap.getProperty(el, "opacity") === 0) {
        gsap.set(el, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, clearProps: "transform" });
      }
    });
  }, delayMs);
  return () => window.clearTimeout(timer);
}
