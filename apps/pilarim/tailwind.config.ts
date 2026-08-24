import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pilarim: {
          bronze: "#D1653E",
          "bronze-dark": "#B85432",
          ink: "#2C2C2C",
          cream: "#F6F6F6",
          accent: "#D1653E",
          "accent-dark": "#B85432",
          steel: "#9AA6B2",
          charcoal: "#2C2C2C",
        },
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-jp)", "sans-serif"],
        shippori: ["var(--font-shippori-mincho)", "serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
