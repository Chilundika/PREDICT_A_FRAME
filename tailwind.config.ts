import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        cyber: {
          purple: "#8b5cf6",
          teal: "#06b6d4",
          pink: "#ec4899",
          dark: "#0a0a0f",
          darker: "#1a0b2e",
          blue: "#16213e",
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        'cyber-bg': 'linear-gradient(135deg, #0a0a0f 0%, #1a0b2e 50%, #16213e 100%)',
      },
      boxShadow: {
        'cyber': '0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
        'cyber-lg': '0 4px 15px rgba(139, 92, 246, 0.3)',
        'cyber-xl': '0 6px 20px rgba(139, 92, 246, 0.4)',
      },
      animation: {
        "fade-out": "1s fadeOut 3s ease-out forwards",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        glow: {
          "0%": { 
            textShadow: "0 0 10px #8b5cf6, 0 0 20px #8b5cf6, 0 0 30px #8b5cf6",
          },
          "100%": { 
            textShadow: "0 0 20px #8b5cf6, 0 0 30px #8b5cf6, 0 0 40px #8b5cf6",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
