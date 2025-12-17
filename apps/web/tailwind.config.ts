import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4f46e5",
          foreground: "#f8fafc"
        }
      },
      borderRadius: {
        lg: "14px"
      },
      boxShadow: {
        card: "0 10px 40px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: [animate]
};

export default config;
