import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

/**
 * Single registration point. Importing plugins in more than one module risks
 * double registration and makes it hard to see what the app actually depends on.
 */
gsap.registerPlugin(ScrollTrigger, Flip, useGSAP);

/** Brand easing, matched to the CSS token of the same name. */
gsap.defaults({ ease: 'power3.out', duration: 0.8 });

/* Dev-only handle for inspecting triggers from the console. */
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__gsap = { gsap, ScrollTrigger, Flip };
}

export { gsap, ScrollTrigger, Flip, useGSAP };
