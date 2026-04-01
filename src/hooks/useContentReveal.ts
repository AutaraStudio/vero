'use client';

/**
 * useContentReveal — Osmo GSAP scroll reveal system
 *
 * Reveals elements as they scroll into view, with configurable stagger,
 * distance, and nested group support.
 *
 * DEPENDENCIES:
 *   - gsap (npm install gsap)
 *   - gsap/ScrollTrigger plugin
 *
 * USAGE PATTERN:
 *   1. Wrap reveal content in <RevealGroup> or <RevealNested>
 *   2. Call useContentReveal() in the parent page/layout component
 *   3. The hook scans the DOM and wires everything up
 */

import { useEffect } from 'react';

export function useContentReveal() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function init() {
      const { default: gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const ctx = gsap.context(() => {
        document
          .querySelectorAll<HTMLElement>('[data-reveal-group]')
          .forEach(groupEl => {
            const staggerSec =
              (parseFloat(groupEl.getAttribute('data-stagger') ?? '') || 100) / 1000;
            const distance = groupEl.getAttribute('data-distance') || '1.25rem';
            const triggerStart = groupEl.getAttribute('data-start') || 'top 80%';

            const DURATION = 0.7;
            const EASE = 'power4.out';

            if (prefersReduced) {
              gsap.set(groupEl, { clearProps: 'all', y: 0, autoAlpha: 1 });
              return;
            }

            const directChildren = Array.from(groupEl.children).filter(
              (el): el is HTMLElement => el.nodeType === 1
            );

            if (!directChildren.length) {
              gsap.set(groupEl, { y: distance, autoAlpha: 0 });
              ScrollTrigger.create({
                trigger: groupEl,
                start: triggerStart,
                once: true,
                onEnter: () =>
                  gsap.to(groupEl, {
                    y: 0,
                    autoAlpha: 1,
                    duration: DURATION,
                    ease: EASE,
                    onComplete: () => void gsap.set(groupEl, { clearProps: 'all' }),
                  }),
              });
              return;
            }

            type ItemSlot = { type: 'item'; el: HTMLElement };
            type NestedSlot = {
              type: 'nested';
              parentEl: HTMLElement;
              nestedEl: HTMLElement;
              includeParent: boolean;
              nestedChildren: HTMLElement[];
            };
            type Slot = ItemSlot | NestedSlot;

            const slots: Slot[] = [];

            directChildren.forEach(child => {
              const nestedGroup: HTMLElement | null = child.matches(
                '[data-reveal-group-nested]'
              )
                ? child
                : child.querySelector(':scope [data-reveal-group-nested]');

              if (nestedGroup) {
                const includeParent =
                  child.getAttribute('data-ignore') !== 'true' &&
                  (child.getAttribute('data-ignore') === 'false' ||
                    nestedGroup.getAttribute('data-ignore') === 'false');

                const nestedChildren = Array.from(nestedGroup.children).filter(
                  (el): el is HTMLElement =>
                    el.nodeType === 1 && el.getAttribute('data-ignore') !== 'true'
                );

                slots.push({ type: 'nested', parentEl: child, nestedEl: nestedGroup, includeParent, nestedChildren });
              } else {
                if (child.getAttribute('data-ignore') === 'true') return;
                slots.push({ type: 'item', el: child });
              }
            });

            slots.forEach(slot => {
              if (slot.type === 'item') {
                const isNestedSelf = slot.el.matches('[data-reveal-group-nested]');
                const d = isNestedSelf ? distance : (slot.el.getAttribute('data-distance') || distance);
                gsap.set(slot.el, { y: d, autoAlpha: 0 });
              } else {
                if (slot.includeParent) gsap.set(slot.parentEl, { y: distance, autoAlpha: 0 });
                const nestedD = slot.nestedEl.getAttribute('data-distance') || distance;
                slot.nestedChildren.forEach(target => gsap.set(target, { y: nestedD, autoAlpha: 0 }));
              }
            });

            slots.forEach(slot => {
              if (slot.type === 'nested' && slot.includeParent) {
                gsap.set(slot.parentEl, { y: distance });
              }
            });

            ScrollTrigger.create({
              trigger: groupEl,
              start: triggerStart,
              once: true,
              onEnter: () => {
                const tl = gsap.timeline();

                slots.forEach((slot, slotIndex) => {
                  const slotTime = slotIndex * staggerSec;

                  if (slot.type === 'item') {
                    tl.to(slot.el, {
                      y: 0, autoAlpha: 1, duration: DURATION, ease: EASE,
                      onComplete: () => void gsap.set(slot.el, { clearProps: 'all' }),
                    }, slotTime);
                  } else {
                    if (slot.includeParent) {
                      tl.to(slot.parentEl, {
                        y: 0, autoAlpha: 1, duration: DURATION, ease: EASE,
                        onComplete: () => void gsap.set(slot.parentEl, { clearProps: 'all' }),
                      }, slotTime);
                    }

                    const nestedMs = parseFloat(slot.nestedEl.getAttribute('data-stagger') ?? '');
                    const nestedStaggerSec = isNaN(nestedMs) ? staggerSec : nestedMs / 1000;

                    slot.nestedChildren.forEach((nestedChild, nestedIndex) => {
                      tl.to(nestedChild, {
                        y: 0, autoAlpha: 1, duration: DURATION, ease: EASE,
                        onComplete: () => void gsap.set(nestedChild, { clearProps: 'all' }),
                      }, slotTime + nestedIndex * nestedStaggerSec);
                    });
                  }
                });
              },
            });
          });
      });

      cleanup = () => ctx.revert();
    }

    init();
    return () => cleanup?.();
  }, []);
}
