/**
 * Shared check / tick icon used across the site.
 * Filled glyph (not stroked) — designed to read confidently at small sizes.
 * Use `currentColor` on the parent to set its colour.
 */
interface CheckIconProps {
  size?: number | string;
  className?: string;
}

export default function CheckIcon({ size, className }: CheckIconProps) {
  return (
    <svg
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? '100%'}
      height={size ?? '100%'}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3.60209 10.4454L1.05312e-06 14.0337L10.0627 26.5459C10.4479 27.0249 11.1774 27.0244 11.562 26.545L30 3.56306L28.4255 1.98742L13.1243 14.3556C11.7762 15.438 9.81813 15.438 8.46955 14.3556L3.60209 10.4454Z"
        fill="currentColor"
      />
    </svg>
  );
}
