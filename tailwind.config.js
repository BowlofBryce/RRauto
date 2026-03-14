/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        surface: {
          0: '#09090B',
          1: '#111113',
          2: '#18181B',
          3: '#1F1F23',
          4: '#27272C',
          5: '#323238',
        },
        border: {
          DEFAULT: '#27272C',
          subtle: '#1F1F23',
          strong: '#3F3F46',
        },
        text: {
          primary: '#FAFAFA',
          secondary: '#A1A1AA',
          tertiary: '#71717A',
          disabled: '#52525B',
        },
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          muted: '#1E3A8A',
          subtle: '#172554',
        },
        success: {
          DEFAULT: '#10B981',
          muted: '#064E3B',
          subtle: '#022C22',
        },
        warning: {
          DEFAULT: '#F59E0B',
          muted: '#78350F',
          subtle: '#451A03',
        },
        danger: {
          DEFAULT: '#EF4444',
          muted: '#7F1D1D',
          subtle: '#450A0A',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4)',
        panel: '0 8px 32px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
