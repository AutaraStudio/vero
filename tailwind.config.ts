import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        aptos: ['Aptos', 'sans-serif'],
      },
      colors: {
        brand: {
          purple: '#472d6a',
          'purple-deep': '#3a2257',
          yellow: '#fec601',
          green: '#6fd08b',
          orange: '#f15f23',
          blue: '#21a4f4',
          dark: '#1d2331',
          'dark-subtle': '#2a3347',
        },
      },
      maxWidth: {
        container: '1200px',
      },
      borderRadius: {
        sm: 'var(--radius--sm)',
        md: 'var(--radius--md)',
        lg: 'var(--radius--lg)',
        xl: 'var(--radius--xl)',
        full: 'var(--radius--full)',
      },
      boxShadow: {
        card: 'var(--shadow--card)',
        'card-hover': 'var(--shadow--card-hover)',
        nav: 'var(--shadow--nav)',
        'nav-scrolled': 'var(--shadow--nav-scrolled)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}

export default config
