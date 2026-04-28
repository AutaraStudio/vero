'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

type TooltipIcon = 'info' | 'question' | 'alert';
type TooltipYPos = 'top' | 'bottom';
type TooltipXPos = 'center' | 'left' | 'right';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  icon?: TooltipIcon;
  y?: TooltipYPos;
  x?: TooltipXPos;
  className?: string;
}

export function TooltipContent({ title, body }: { title?: string; body: string }) {
  return (
    <>
      {title && (
        <div className="tooltip__card-title">
          <h3 className="tooltip__card-heading text-label--md color--primary">{title}</h3>
        </div>
      )}
      <div className="tooltip__card-body">
        <p className="tooltip__card-text text-body--sm color--secondary leading--snug">{body}</p>
      </div>
    </>
  );
}

const ICON_PATHS: Partial<Record<TooltipIcon, React.ReactNode>> = {
  info: (
    <>
      <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 15.5H13.3093" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.16 15.5V11.25H11.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.85 8a.5.5 0 1 0 .25.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export function Tooltip({ children, content, icon = 'info', y = 'top', x = 'center', className = '' }: TooltipProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [resolvedY, setResolvedY] = useState<TooltipYPos>(y);
  const [resolvedX, setResolvedX] = useState<TooltipXPos>(x);

  const wrapRef = useRef<HTMLSpanElement>(null);
  const boxRef  = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Compute resolved direction + absolute screen position
  const computePosition = useCallback(() => {
    const wrap = wrapRef.current;
    const box  = boxRef.current;
    if (!wrap || !box) return;

    const iconRect = wrap.getBoundingClientRect();
    const boxRect  = box.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const margin = 16;
    const offset = 10; // gap between icon and tooltip box

    // Y: flip when the preferred side overflows + the opposite side has more room
    let nextY: TooltipYPos = y;
    if (y === 'top' && iconRect.top < boxRect.height + offset + margin) {
      if (vh - iconRect.bottom > iconRect.top) nextY = 'bottom';
    } else if (y === 'bottom' && vh - iconRect.bottom < boxRect.height + offset + margin) {
      if (iconRect.top > vh - iconRect.bottom) nextY = 'top';
    }

    // X: when centered, anchor to whichever side has room
    let nextX: TooltipXPos = x;
    if (x === 'center') {
      const halfBox = boxRect.width / 2;
      const iconCx  = iconRect.left + iconRect.width / 2;
      if (iconCx - halfBox < margin) nextX = 'left';
      else if (iconCx + halfBox > vw - margin) nextX = 'right';
    }

    setResolvedY(nextY);
    setResolvedX(nextX);

    // Resolve absolute screen coords for fixed positioning
    const top = nextY === 'top'
      ? iconRect.top - boxRect.height - offset
      : iconRect.bottom + offset;

    let left: number;
    if (nextX === 'center')      left = iconRect.left + iconRect.width / 2 - boxRect.width / 2;
    else if (nextX === 'left')   left = iconRect.left;
    else                         left = iconRect.right - boxRect.width;

    // Clamp horizontally so the box stays in the viewport
    left = Math.max(margin, Math.min(left, vw - boxRect.width - margin));

    setPos({ top, left });
  }, [x, y]);

  const handleEnter = useCallback(() => {
    setOpen(true);
    // Wait for next frame so the box renders + can be measured
    requestAnimationFrame(computePosition);
  }, [computePosition]);

  const handleLeave = useCallback(() => setOpen(false), []);

  // Recompute on scroll / resize while open
  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => computePosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, computePosition]);

  return (
    <span
      ref={wrapRef}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      className={`tooltip ${className}`.trim()}
    >
      {children}
      <span data-css-tooltip-icon={icon} className="tooltip__icon" tabIndex={0}>
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {ICON_PATHS[icon] ?? ICON_PATHS.info}
        </svg>
      </span>

      {mounted && createPortal(
        <div
          ref={boxRef}
          data-css-tooltip-x={resolvedX}
          data-css-tooltip-y={resolvedY}
          className={`tooltip__box${open ? ' is-open' : ''}`}
          style={{ position: 'fixed', top: pos.top, left: pos.left }}
          role="tooltip"
          aria-hidden={!open}
        >
          <div className="tooltip__box-inner">
            <div className="tooltip__card">{content}</div>
            <div className="tooltip__tip">
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 124 30" fill="none" aria-hidden="true">
                <path d="M103.284 3L121 3C122.657 3 124 1.65685 124 0L0 0C0 1.65685 1.34315 3 3 3L20.7157 3C26.0201 3 31.1071 5.10713 34.8579 8.85786L51.3934 25.3934C57.2513 31.2513 66.7487 31.2513 72.6066 25.3934L89.1421 8.85786C92.8929 5.10714 97.9799 3 103.284 3Z" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </span>
  );
}
