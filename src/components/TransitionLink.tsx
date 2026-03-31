'use client';

import { ComponentProps, useRef } from 'react';
import Link from 'next/link';
import { useTransition } from '@/context/TransitionContext';

type TransitionLinkProps = ComponentProps<typeof Link> & {
  transitionTitle?: string;
};

export default function TransitionLink({ href, transitionTitle, onClick, children, ...props }: TransitionLinkProps) {
  const { isTransitioning, triggerLeave } = useTransition();
  const linkRef = useRef<HTMLAnchorElement>(null);

  const hrefString = typeof href === 'string' ? href : (href as { pathname?: string }).pathname ?? '';

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isTransitioning) {
      e.preventDefault();
      return;
    }

    const title = transitionTitle ?? linkRef.current?.textContent?.trim() ?? '';

    e.preventDefault();
    triggerLeave(hrefString, title);

    onClick?.(e);
  }

  return (
    <Link ref={linkRef} href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
