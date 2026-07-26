/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: "#000000",
          dark: "#050505",
          card: "#0D0D0D",
          border: "#1F1F1F",
          neon: "#39FF14",      // Verde Fosforito Neón
          lime: "#00FF66",      // Verde Lima Brillante
          dimNeon: "#1c800a",
          darkGreen: "#051A03",
          white: "#FFFFFF",
        }
      },
      fontFamily: {
        mono: ['Space Mono', 'JetBrains Mono', 'monospace'],
        display: ['Syne', 'Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'brutal': '8px 8px 0px #39FF14',
        'brutal-lg': '14px 14px 0px #39FF14',
        'brutal-white': '8px 8px 0px #FFFFFF',
        'neon-glow': '0 0 40px rgba(57, 255, 20, 0.6)',
      }
    },
  },
  plugins: [],
};
