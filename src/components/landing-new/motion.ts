import type { Variants } from "motion/react";

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const DUR_FAST = 0.2;
export const DUR_NORM = 0.4;
export const DUR_SLOW = 0.55;
export const VIEWPORT_ONCE = {
  once: true,
  margin: "-80px",
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR_NORM, ease: EASE_OUT },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR_NORM, ease: EASE_OUT },
  },
};

export const heroTitle: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR_SLOW, ease: EASE_OUT },
  },
};

export const heroPanel: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR_SLOW, ease: EASE_OUT, delay: 0.1 },
  },
};

export const cardHover = {
  y: -2,
  scale: 1.005,
  transition: { duration: DUR_FAST, ease: EASE_OUT },
};

export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1, ease: EASE_OUT },
};

export const tabContent: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DUR_NORM, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: EASE_OUT },
  },
};
