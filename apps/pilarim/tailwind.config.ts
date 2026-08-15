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
          bronze: "#9a6b3d",
          "bronze-dark": "#7c5630",
          ink: "#1c1917",
          cream: "#f7f3ee",
          accent: "#c45c26",
          "accent-dark": "#9a4519",
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
