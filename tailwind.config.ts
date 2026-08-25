import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#08070d",
          soft: "#0e0c17",
          card: "#14111f",
          line: "#241f38",
        },
        ink: {
          DEFAULT: "#ece9f6",
          dim: "#a49ec2",
          faint: "#6b6590",
        },
        violet: {
          DEFAULT: "#8b5cf6",
          deep: "#7c3aed",
        },
        lime: {
          DEFAULT: "#a3e635",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      boxShadow: {
        glow: "0 0 40px -12px rgba(139, 92, 246, 0.5)",
        limeglow: "0 0 30px -10px rgba(163, 230, 53, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
