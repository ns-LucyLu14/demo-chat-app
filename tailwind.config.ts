import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      colors: {
        background: "var(--background)",
        secondaryBackground: "var(--secondaryBackground)",
        primaryHover: "var(--primaryHover)",
        secondaryHover: "var(--level2Hover)",
        primaryText: "var(--primaryText)",
        secondaryText: "var(--secondaryText)",
        tertiaryText: "var(--tertiaryText)",
        invertedPrimaryText: "var(--invertedPrimaryText)",
        invertedTertiaryText: "var(--invertedTertiaryText)",
      },
    },
  },
  plugins: [],
} satisfies Config;
