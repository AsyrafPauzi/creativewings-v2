import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Feather,
  Flame,
  Flower,
  KeyRound,
  Lock,
  Mail,
  Palette,
  Send,
  Shield,
  Sparkles,
  Star,
  Timer,
  Trophy,
} from "lucide-react";

export type AuthCreativeVariant =
  | "sign-in"
  | "sign-up"
  | "forgot-password"
  | "forgot-password-sent"
  | "reset-password"
  | "reset-success"
  | "verify-email"
  | "verify-success"
  | "verify-expired"
  | "magic-link";

export interface AuthGradient {
  from: string;
  via?: string;
  to: string;
  angle?: number;
}

export interface AuthStat {
  icon: LucideIcon;
  value: string;
  label: string;
}

export interface AuthCreativeConfig {
  tag: string;
  tagIcon?: LucideIcon;
  breadcrumb?: string;
  headline: string;
  headlineItalic?: boolean;
  kicker?: string;
  body: string;
  gradient: AuthGradient;
  stats: AuthStat[];
  glows?: { className: string; background: string }[];
  card?: {
    stamp: string;
    title: string;
    items: { step: string; text: string; icon?: LucideIcon }[];
    className?: string;
    titleClassName?: string;
  };
  testimonials?: { num: string; who: string; quote: string }[];
  stickers?: LucideIcon[];
  stickerClassNames?: string[];
}

export const AUTH_STATS: AuthStat[] = [
  { icon: Sparkles, value: "12k", label: "CREATORS" },
  { icon: Flame, value: "RM1.2M", label: "PAID OUT" },
  { icon: Star, value: "60+", label: "SCHOOLS" },
];

export const AUTH_CREATIVE: Record<AuthCreativeVariant, AuthCreativeConfig> = {
  "sign-in": {
    tag: "CREATIVE WINGS",
    breadcrumb: "—  /sign-in",
    headline: "Welcome\nback.",
    kicker: "—  SIGN IN TO KEEP FLYING",
    body: "Your portfolio, badges and submissions are exactly where you left them. Pick up where you flew off.",
    gradient: { from: "#F05A7E", via: "#EC7A8E", to: "#125B9A", angle: 145 },
    stats: AUTH_STATS,
    stickers: [Sparkles, Star, Flame, Flower, Palette],
  },
  "sign-up": {
    tag: "CREATE YOUR WINGS",
    breadcrumb: "—  /sign-up  ·  step 1 of 1",
    headline: "Make wings\nof your own.",
    kicker: "—  FREE TO JOIN  ·  60 SECONDS",
    body: "Join 12,000+ creators, contestants and organizers building Malaysia's most playful creative scene.",
    gradient: { from: "#125B9A", via: "#7E69A6", to: "#F05A7E", angle: 200 },
    stats: AUTH_STATS,
    testimonials: [
      {
        num: "01",
        who: "Aisha joined as a Contestant.",
        quote: "“The submission flow was so easy I forgot it was admin.”",
      },
      {
        num: "02",
        who: "Daniel joined as a Creator.",
        quote: "“The submission flow was so easy I forgot it was admin.”",
      },
      {
        num: "03",
        who: "Yibon joined as an Organizer.",
        quote: "“The submission flow was so easy I forgot it was admin.”",
      },
    ],
    stickers: [Star, Palette, Feather],
  },
  "forgot-password": {
    tag: "PASSWORD RESET",
    tagIcon: KeyRound,
    breadcrumb: "—  /forgot-password",
    headline: "Lost the\ndoor key?",
    kicker: "—  IT HAPPENS TO THE BEST OF US",
    body: "Pop in the email you signed up with. We'll send a fresh link so you can pick a new key.",
    gradient: { from: "#F05A7E", via: "#D8568A", to: "#125B9A", angle: 155 },
    stats: AUTH_STATS,
    glows: [
      {
        className:
          "-left-[140px] top-[60px] h-[520px] w-[520px] rounded-full opacity-90",
        background: "radial-gradient(circle, rgba(255,230,163,0.6) 0%, transparent 70%)",
      },
      {
        className: "left-[380px] top-[480px] h-[480px] w-[480px] rounded-full",
        background: "radial-gradient(circle, rgba(127,177,229,0.5) 0%, transparent 70%)",
      },
    ],
    card: {
      stamp: "3 STEPS",
      title: "Reset & fly",
      className: "w-[380px] -rotate-3 p-6",
      titleClassName: "text-[28px] font-black italic leading-[1.05]",
      items: [
        { step: "01", text: "Enter your email" },
        { step: "02", text: "Check your inbox" },
        { step: "03", text: "Pick a new key" },
      ],
    },
    stickers: [KeyRound, Sparkles, Flame],
    stickerClassNames: [
      "right-32 top-20 h-[52px] w-[52px] rotate-[18deg] text-[#FFE6A3] opacity-95",
      "left-20 top-[380px] h-[34px] w-[34px] -rotate-[15deg] text-white opacity-90",
      "right-[76px] top-[540px] h-[34px] w-[34px] rotate-[14deg] text-[#FFD66B] opacity-95",
    ],
  },
  "forgot-password-sent": {
    tag: "LINK ON ITS WAY",
    tagIcon: Send,
    breadcrumb: "—  /forgot-password → sent",
    headline: "Check\nyour inbox.",
    kicker: "—  ONE LINK, ONE HOUR",
    body: "We just sent a reset link. Open it in the next 60 minutes and you're back in the air.",
    gradient: { from: "#F05A7E", via: "#E16AA0", to: "#125B9A", angle: 140 },
    stats: AUTH_STATS,
    glows: [
      {
        className: "-left-[120px] -top-[160px] h-[540px] w-[540px] rounded-full",
        background: "radial-gradient(circle, rgba(255,230,163,0.6) 0%, transparent 70%)",
      },
      {
        className: "left-[380px] top-[480px] h-[480px] w-[480px] rounded-full",
        background: "radial-gradient(circle, rgba(127,177,229,0.5) 0%, transparent 70%)",
      },
    ],
    stickers: [Mail, Send, Sparkles],
    stickerClassNames: [
      "right-[126px] top-[60px] h-[54px] w-[54px] rotate-[14deg] text-[#FFE6A3] opacity-95",
      "left-20 top-[380px] h-9 w-9 -rotate-12 text-white opacity-90",
      "right-[86px] top-[540px] h-[34px] w-[34px] rotate-[18deg] text-[#FCE6EC] opacity-85",
    ],
  },
  "reset-password": {
    tag: "PICK A NEW KEY",
    tagIcon: KeyRound,
    breadcrumb: "—  /reset-password?token=…",
    headline: "Set a\nnew key.",
    kicker: "—  ONE LINK, ONE HOUR",
    body: "Choose a password that's strong but easy to remember. We never store it as plain text.",
    gradient: { from: "#125B9A", via: "#7E69A6", to: "#F05A7E", angle: 175 },
    stats: AUTH_STATS,
    glows: [
      {
        className: "right-[-180px] top-[-120px] h-[520px] w-[520px] rounded-full",
        background: "radial-gradient(circle, rgba(255,230,163,0.6) 0%, transparent 70%)",
      },
      {
        className: "bottom-[-160px] left-[-120px] h-[520px] w-[520px] rounded-full",
        background: "radial-gradient(circle, rgba(252,230,236,0.6) 0%, transparent 70%)",
      },
    ],
    card: {
      stamp: "HOW WE GUARD IT",
      title: "",
      className: "w-[380px] rotate-3 p-6",
      items: [
        { step: "01", text: "Hashed with bcrypt + 12 rounds", icon: Shield },
        { step: "02", text: "Encrypted in transit + at rest", icon: Lock },
        { step: "03", text: "Token expires in 60 minutes", icon: Timer },
      ],
    },
    stickers: [KeyRound, Lock, Shield],
    stickerClassNames: [
      "right-32 top-[60px] h-[52px] w-[52px] rotate-[18deg] text-[#FFE6A3] opacity-95",
      "left-20 top-[380px] h-[34px] w-[34px] -rotate-[15deg] text-white opacity-90",
      "right-[74px] top-[540px] h-9 w-9 rotate-[14deg] text-[#FCE6EC] opacity-85",
    ],
  },
  "reset-success": {
    tag: "PASSWORD CHANGED",
    tagIcon: Sparkles,
    breadcrumb: "—  /reset-password → done",
    headline: "All set.",
    kicker: "—  YOU'RE READY TO TAKE OFF",
    body: "Your new password is locked in. Use it next time you sign in — we won't ask again until you choose to change it.",
    gradient: { from: "#16A34A", via: "#3DA76E", to: "#125B9A", angle: 140 },
    stats: AUTH_STATS,
    glows: [
      {
        className: "-left-[140px] -top-[160px] h-[520px] w-[520px] rounded-full",
        background: "radial-gradient(circle, rgba(255,230,163,0.6) 0%, transparent 70%)",
      },
      {
        className: "left-[380px] top-[480px] h-[520px] w-[520px] rounded-full",
        background: "radial-gradient(circle, rgba(252,230,236,0.6) 0%, transparent 70%)",
      },
    ],
    stickers: [Sparkles, Star, Flame, Flower],
    stickerClassNames: [
      "right-[132px] top-20 h-12 w-12 rotate-[18deg] text-[#FFE6A3] opacity-95",
      "left-[90px] top-[380px] h-8 w-8 -rotate-[15deg] text-white opacity-95",
      "right-[76px] top-[540px] h-[34px] w-[34px] rotate-[14deg] text-[#FFD66B] opacity-95",
      "left-[30px] top-[580px] h-[38px] w-[38px] -rotate-12 text-[#FCE6EC] opacity-95",
    ],
  },
  "verify-email": {
    tag: "CONFIRM YOUR EMAIL",
    breadcrumb: "—  Optional security step",
    headline: "Secure\nyour email.",
    kicker: "—  KEEP YOUR ACCOUNT RECOVERABLE",
    body: "Confirming your email helps protect account recovery and important campaign updates. You can still sign in while it is pending.",
    gradient: { from: "#125B9A", via: "#8C5DA8", to: "#F05A7E", angle: 155 },
    stats: AUTH_STATS,
    card: {
      stamp: "BOARDING PASS",
      title: "CW+ Studio",
      items: [
        { step: "SEAT", text: "01A" },
        { step: "·", text: "Explore, create, and earn early." },
      ],
    },
    stickers: [Mail, Sparkles, Star],
  },
  "verify-success": {
    tag: "EMAIL VERIFIED",
    breadcrumb: "—  /verify?token=... -> ok",
    headline: "You're\nverified.",
    kicker: "—  CLEAR FOR TAKEOFF",
    body: "Your email is locked in. We'll fly you to your dashboard in a moment.",
    gradient: { from: "#16A34A", via: "#3DA76E", to: "#125B9A", angle: 135 },
    stats: AUTH_STATS,
    stickers: [Sparkles, Star, Trophy],
  },
  "verify-expired": {
    tag: "LINK EXPIRED",
    breadcrumb: "—  /verify?token=... -> invalid",
    headline: "This link's\nwings are\nclipped.",
    kicker: "—  EXPIRED OR ALREADY USED",
    body: "It happens. Links are good for 24 hours. We'll send a fresh one and you'll be in the air before your kopi cools.",
    gradient: { from: "#D97706", via: "#A8584A", to: "#125B9A", angle: 155 },
    stats: AUTH_STATS,
    stickers: [Mail, KeyRound, Flame],
  },
  "magic-link": {
    tag: "MAGIC LINK",
    breadcrumb: "—  Passwordless sign-in",
    headline: "Check your\ninbox.",
    kicker: "—  ONE TAP TO SIGN IN",
    body: "We emailed you a one-time login link. Tap it from any device — good for 15 minutes.",
    gradient: { from: "#125B9A", via: "#5C7BB8", to: "#F05A7E", angle: 135 },
    stats: AUTH_STATS,
    stickers: [Mail, Sparkles, Feather],
  },
};

export function gradientStyle(g: AuthGradient): CSSProperties {
  const stops = g.via
    ? `${g.from} 0%, ${g.via} 45%, ${g.to} 100%`
    : `${g.from} 0%, ${g.to} 100%`;
  return {
    backgroundImage: `linear-gradient(${g.angle ?? 135}deg, ${stops})`,
  };
}
