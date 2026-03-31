'use client';

import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

const STEPS = [
  { label: 'Select roles',  path: '/get-started' },
  { label: 'Your details', path: '/get-started/details' },
  { label: 'Contract',     path: '/get-started/contract' },
  { label: 'Payment',      path: '/get-started/payment' },
];

export default function ProgressBar() {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((s) => s.path === pathname);

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
                <li className={stepClass} role="listitem" aria-current={isCurrent ? 'step' : undefined}>
                  <span className="progress-bar__circle" aria-hidden="true">
                    {isCompleted ? '✓' : i + 1}
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
                  />
                )}
              </Fragment>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
