/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#ffffff",          // Pure White
        panel: "#f8f9fa",               // Crisp Off-White
        panelHover: "#f1f3f5",          // Zinc 100
        accent: "#000000",              // Pure Black
        accentHover: "#212529",         // Zinc 900
        textMain: "#000000",            // Pure Black
        textMuted: "#495057",           // Zinc 600 (Darker for better legibility)
        borderDark: "#dee2e6",          // Zinc 300
        success: "#0ca678",             // Emerald 600
        warning: "#f08c00",             // Amber 600
        danger: "#e03131",              // Red 600
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'enterprise-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'enterprise': '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'enterprise-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        'glow': '0 0 20px rgba(0, 0, 0, 0.08)',
      },
      backgroundImage: {
        'grid-pattern': 'radial-gradient(circle, #e2e8f0 1.2px, transparent 1.2px)',
      }
    },
  },
  plugins: [],
}
