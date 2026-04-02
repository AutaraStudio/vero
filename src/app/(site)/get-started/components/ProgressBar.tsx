'use client';

import { usePathname } from 'next/navigation';
import { Fragment, useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

const STEPS = [
  { label: 'Select roles',  path: '/get-started' },
  { label: 'Your details', path: '/get-started/details' },
  { label: 'Contract',     path: '/get-started/contract' },
  { label: 'Payment',      path: '/get-started/payment' },
];

export default function ProgressBar() {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((s) => s.path === pathname);

  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const connectorFillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const prevIndexRef = useRef<number>(-1);

  useEffect(() => {
    const prev = prevIndexRef.current;
    const isFirstMount = prev === -1;

    if (!isFirstMount && currentIndex > prev) {
      // Step `prev` just completed — animate circle pop
      const completedCircle = circleRefs.current[prev];
      if (completedCircle) {
        gsap.fromTo(
          completedCircle,
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.35, ease: 'vero.out' }
        );
        const checkPath = completedCircle.querySelector('.progress-bar__check-path');
        if (checkPath) {
          gsap.set(checkPath, { drawSVG: '0%' });
          gsap.to(checkPath, { drawSVG: '100%', duration: 0.3, delay: 0.25, ease: 'power2.out' });
        }
      }

      // Connector fill animation
      if (prev < STEPS.length - 1) {
        const fill = connectorFillRefs.current[prev];
        if (fill) {
          gsap.fromTo(
            fill,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.4, ease: 'power2.inOut', transformOrigin: 'left center' }
          );
        }
      }
    }

    // Kill previous step's pulse
    if (prev >= 0) {
      const prevCircle = circleRefs.current[prev];
      if (prevCircle) {
        const prevPulse = prevCircle.querySelector('.progress-bar__pulse');
        if (prevPulse) gsap.killTweensOf(prevPulse);
      }
    }

    // Start pulse on current step
    if (currentIndex >= 0) {
      const currentCircle = circleRefs.current[currentIndex];
      if (currentCircle) {
        const pulse = currentCircle.querySelector('.progress-bar__pulse');
        if (pulse) {
          gsap.fromTo(
            pulse,
            { scale: 1, opacity: 0.4 },
            { scale: 1.8, opacity: 0, duration: 1.2, ease: 'power2.out', repeat: -1 }
          );
        }
      }
    }

    prevIndexRef.current = currentIndex;
  }, [currentIndex]);

  return (
    <nav className="get-started-progress" aria-label="Checkout progress">
      <div className="container">
        <ol className="progress-bar" role="list">
          {STEPS.map((step, i) => {
            const isCompleted = i < currentIndex;
            const isCurrent = i === currentIndex;
            const stepClass = [
              'progress-bar__step',
              isCompleted ? 'is-completed' : '',
              isCurrent ? 'is-current' : '',
            ].filter(Boolean).join(' ');

            return (
              <Fragment key={step.path}>
                <li
                  className={stepClass}
                  role="listitem"
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span
                    className="progress-bar__circle"
                    aria-hidden="true"
                    ref={(el) => { circleRefs.current[i] = el; }}
                  >
                    {isCompleted ? (
                      <svg
                        className="progress-bar__checkmark"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path className="progress-bar__check-path" d="M3 8.5L6.5 12L13 5" />
                      </svg>
                    ) : (
                      <>
                        {isCurrent && (
                          <span className="progress-bar__pulse" aria-hidden="true" />
                        )}
                        <span className="progress-bar__step-number">{i + 1}</span>
                      </>
                    )}
                  </span>
                  <span className="progress-bar__label text-label--sm">
                    {step.label}
                  </span>
                </li>
                {i < STEPS.length - 1 && (
                  <li
                    aria-hidden="true"
                    className={`progress-bar__connector${isCompleted ? ' is-completed' : ''}`}
                    role="presentation"
                  >
                    <span
                      className="progress-bar__connector-fill"
                      ref={(el) => { connectorFillRefs.current[i] = el; }}
                    />
                  </li>
                )}
              </Fragment>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
