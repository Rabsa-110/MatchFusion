/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: "#05070C",
          900: "#090D16",
          850: "#0C1120",
          800: "#111726",
          700: "#161D30",
          600: "#212B45",
          500: "#333F5E",
        },
        live: {
          DEFAULT: "#1FE99C",
          soft: "#1FE99C33",
        },
        broadcast: {
          DEFAULT: "#2E9BFF",
          soft: "#2E9BFF33",
        },
        intel: {
          DEFAULT: "#9B7CFF",
          soft: "#9B7CFF33",
        },
        alert: {
          DEFAULT: "#FF4D5E",
          soft: "#FF4D5E33",
        },
        ink: {
          DEFAULT: "#F4F7FC",
          muted: "#96A1B8",
          faint: "#5B6478",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "fusion-gradient": "linear-gradient(90deg, #1FE99C 0%, #2E9BFF 52%, #9B7CFF 100%)",
        "fusion-gradient-v": "linear-gradient(180deg, #1FE99C 0%, #2E9BFF 52%, #9B7CFF 100%)",
        "fusion-radial": "radial-gradient(circle at top right, rgba(46,155,255,0.18), transparent 55%), radial-gradient(circle at bottom left, rgba(31,233,156,0.12), transparent 55%)",
        "card-sheen": "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0) 40%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px -20px rgba(46,155,255,0.35)",
        "glow-live": "0 0 24px -4px rgba(31,233,156,0.55)",
        "glow-intel": "0 0 24px -4px rgba(155,124,255,0.45)",
        card: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 20px 40px -24px rgba(0,0,0,0.6)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.4, transform: "scale(0.8)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        rise: {
          "0%": { opacity: 0, transform: "translateY(14px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
        ticker: "ticker 28s linear infinite",
        rise: "rise 0.6s ease both",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
