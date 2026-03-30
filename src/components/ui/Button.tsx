import './Button.css';
import Link from 'next/link';
import type { ReactNode, CSSProperties } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'cta';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  external?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  children,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  external = false,
}: ButtonProps) {

  const classes = [
    'btn-blob',
    `btn-blob--${variant}`,
    size !== 'md' ? `btn-blob--${size}` : '',
    className,
  ].filter(Boolean).join(' ');

  /* Exact original HTML structure — dot order: third(2), second(1), first(0) */
  const inner = (
    <>
      {/* Dot wrap — overlays the inner via grid stacking, dots appear to the right */}
      <span className="btn-blob__dot-wrap" aria-hidden="true">
        <span
          className="btn-blob__dot is-third"
          style={{ '--index': 2 } as CSSProperties}
        />
        <span
          className="btn-blob__dot is-second"
          style={{ '--index': 1 } as CSSProperties}
        />
        <span
          className="btn-blob__dot is-first"
          style={{ '--index': 0 } as CSSProperties}
        />
      </span>

      {/* Inner — bg + text stacked in a grid */}
      <span className="btn-blob__inner">
        <span className="btn-blob__bg" aria-hidden="true" />
        <span className="btn-blob__text">{children}</span>
      </span>
    </>
  );

  if (href && !disabled) {
    if (external) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      aria-disabled={disabled}
      onClick={onClick}
    >
      {inner}
    </button>
  );
}
