// animations.ts — Framer Motion variants and transitions
// All animation config lives here so feel can be tuned in one place.

import type { Variants, Transition } from 'framer-motion';

// --- Transitions ---

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
};

export const smoothTransition: Transition = {
  type: 'tween',
  duration: 0.2,
  ease: 'easeInOut',
};

export const gentleTransition: Transition = {
  type: 'tween',
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
};

// --- Variants ---

/** Detail panel slide in/out from right */
export const detailPanelVariants: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: gentleTransition,
  },
};

/** Task row enter/exit in lists */
export const taskRowVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
  exit: {
    opacity: 0,
    x: -16,
    height: 0,
    marginBottom: 0,
    transition: {
      opacity: { duration: 0.15 },
      height: { duration: 0.2, delay: 0.1 },
      marginBottom: { duration: 0.2, delay: 0.1 },
    },
  },
};

/** Completion celebration — task shrinks and fades with satisfaction */
export const completionVariants: Variants = {
  initial: {
    opacity: 1,
    scale: 1,
    x: 0,
  },
  complete: {
    opacity: 0,
    scale: 0.95,
    x: 24,
    transition: {
      duration: 0.35,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/** Toast notification */
export const toastVariants: Variants = {
  initial: {
    opacity: 0,
    y: 16,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.95,
    transition: smoothTransition,
  },
};

/** Sidebar expand/collapse */
export const sidebarVariants: Variants = {
  expanded: {
    width: '16rem',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  collapsed: {
    width: '3.5rem',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
};

/** Fade in for sections and content */
export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

/** List stagger container */
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

/** Decay fade — applied dynamically based on decay stage */
export const decayOpacity = (daysSinceUpdate: number) => {
  if (daysSinceUpdate <= 3) return 1;
  if (daysSinceUpdate <= 7) return 0.85;
  if (daysSinceUpdate <= 14) return 0.6;
  if (daysSinceUpdate <= 30) return 0.4;
  return 0.35;
};
