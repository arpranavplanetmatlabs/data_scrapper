/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F14",
        panel: "#1A2A33",
        panelLight: "#2A3A43",
        accent: "#7ED957",
        accentHover: "#6bc745",
        textMain: "#E6EEF3",
        textMuted: "#9AA5B1",
        borderDark: "#2D3748",
        success: "#4ade80",
        warning: "#facc15",
        danger: "#f87171",
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neumorph': '5px 5px 10px #0e161c, -5px -5px 10px #263e4a',
        'neumorph-inset': 'inset 5px 5px 10px #0e161c, inset -5px -5px 10px #263e4a',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(26, 42, 51, 0.6) 0%, rgba(26, 42, 51, 0.2) 100%)',
      }
    },
  },
  plugins: [],
}
