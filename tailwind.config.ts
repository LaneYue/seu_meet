import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2933",
        mist: "#eef4f0",
        campus: "#2f6f5e",
        lake: "#2f80a8",
        brick: "#b65f42",
        gold: "#c79631"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(31, 41, 51, 0.08)"
      }
    }
  },
  plugins: []
}

export default config
