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
        panel: "#fafafa",               // Near White
        panelHover: "#f4f4f5",          // Zinc 100
        accent: "#000000",              // Pure Black
        accentHover: "#27272a",         // Zinc 800
        textMain: "#000000",            // Pure Black
        textMuted: "#71717a",           // Zinc 500
        borderDark: "#e4e4e7",          // Zinc 200
        success: "#10b981",             // Emerald 500
        warning: "#f59e0b",             // Amber 500
        danger: "#ef4444",              // Red 500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'enterprise-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'enterprise': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'enterprise-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'grid-pattern': 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z\' fill=\'%23000000\' fill-opacity=\'0.02\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
      }
    },
  },
  plugins: [],
}
