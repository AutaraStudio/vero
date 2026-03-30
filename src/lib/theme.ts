export type ThemeVariant =
  | 'dark'
  | 'brand-purple'
  | 'brand-purple-deep'
  | 'brand-blue'
  | 'brand-green'
  | 'brand-orange'
  | 'brand-yellow';

export const ACCENT_COLORS = ['green', 'orange', 'blue', 'yellow', 'purple'] as const;
export type AccentColor = typeof ACCENT_COLORS[number];

export const accentStyles: Record<AccentColor, {
  bg: string; text: string; border: string;
}> = {
  green:  { bg: 'var(--color--accent-green-bg)',  text: 'var(--color--accent-green-text)',  border: 'var(--color--accent-green-border)'  },
  orange: { bg: 'var(--color--accent-orange-bg)', text: 'var(--color--accent-orange-text)', border: 'var(--color--accent-orange-border)' },
  blue:   { bg: 'var(--color--accent-blue-bg)',   text: 'var(--color--accent-blue-text)',   border: 'var(--color--accent-blue-border)'   },
  yellow: { bg: 'var(--color--accent-yellow-bg)', text: 'var(--color--accent-yellow-text)', border: 'var(--color--accent-yellow-border)' },
  purple: { bg: 'var(--color--accent-purple-bg)', text: 'var(--color--accent-purple-text)', border: 'var(--color--accent-purple-border)' },
};
