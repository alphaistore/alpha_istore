/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--ink-muted)',
          subtle: 'var(--ink-subtle)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
          border: 'var(--surface-border)',
        },
        background: 'var(--background)',
        status: {
          success: '#166534',
          danger: '#991b1b',
          warning: '#92400e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      letterSpacing: {
        tightish: '-0.011em',
      },
      boxShadow: {
        smooth: '0 4px 24px rgba(0, 0, 0, 0.04)',
        'smooth-lg': '0 12px 48px rgba(0, 0, 0, 0.08)',
        ring: '0 0 0 4px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
  safelist: [
    'grid-cols-2',
    'grid-cols-3',
    'grid-cols-4',
    'sm:grid-cols-2',
    'lg:grid-cols-3',
    'xl:grid-cols-4',
  ],
  corePlugins: {
    preflight: false,
  },
};