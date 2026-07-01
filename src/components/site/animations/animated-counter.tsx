"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { prefersReducedMotion, registerGsap } from "@/lib/gsap/register";

interface AnimatedCounterProps {
  value: string;
  className?: string;
  style?: CSSProperties;
}

/** Animates numeric portions of a display string (e.g. "12,400" or "RM 1.2M"). */
export function AnimatedCounter({ value, className, style }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useGSAP(
    () => {
      registerGsap();
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      const match = value.match(/^([^0-9]*)([\d,.]+)(.*)$/);
      if (!match) return;

      const [, prefix, numStr, suffix] = match;
      const target = parseFloat(numStr.replace(/,/g, ""));
      if (!Number.isFinite(target)) return;

      const hasDecimals = numStr.includes(".");
      const obj = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: () => {
              const formatted = hasDecimals
                ? obj.val.toFixed(1)
                : Math.round(obj.val).toLocaleString();
              setDisplay(`${prefix}${formatted}${suffix}`);
            },
          });
        },
      });
    },
    { dependencies: [value] },
  );

  return (
    <span ref={ref} className={className} style={style}>
      {display}
    </span>
  );
}
