import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/data/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      xs: '360px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0F5A46',
          600: '#146B54',
          700: '#0B4A3A',
          950: '#062D24',
        },
        energy: {
          amber: '#F59E0B',
          cyan: '#22D3EE',
        },
      },
      maxWidth: {
        shell: '1920px',
        content: '1600px',
      },
      boxShadow: {
        panel: '0 14px 40px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;
