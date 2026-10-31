/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Senso's red (#CA0508) darkened just enough to clear 4.5:1 with
        // white on it. Reserved for action and for one accent per screen —
        // a loud red used everywhere reads as alarm, which is the wrong
        // feeling for a clinic.
        brand: { DEFAULT: "#B4231C", deep: "#7C1712", tint: "#F7E7DF", raw: "#CA0508" },
        // `muted` was #8A8177, which is 3.55:1 on paper and 3.77:1 on
        // paper-surface — under AA's 4.5:1, and the single cause of all
        // thirty-four contrast failures Lighthouse reported. #6F675E clears
        // it on every light surface the site has: 5.16 on paper, 5.48 on
        // paper-surface, 4.58 on paper-2.
        //
        // It costs some of the gap between ink-2 and muted — the grey ladder
        // is tighter than it was. That is the right side to lose on for a
        // clinic whose readers are largely 55+, which is the same reason
        // body copy here never goes below 18px.
        ink: { DEFAULT: "#221F1B", 2: "#5C554C", muted: "#6F675E", inverse: "#F7F1E8" },
        paper: { DEFAULT: "#FAF6F0", surface: "#FFFDFA", 2: "#F1E8DC", deep: "#201C18" },
        line: { DEFAULT: "#E3D8C8", strong: "#CBBCA6", dark: "#332C25" },
        open: { DEFAULT: "#0E6B4E", tint: "#E4F1EC" },
        shut: { DEFAULT: "#8A5A00", tint: "#FBF0DC" },
      },
      fontFamily: {
        sans: ["Hind Siliguri", "Noto Sans Bengali", "system-ui", "sans-serif"],
        display: ["Anek Display", "Anek Bangla", "Hind Siliguri", "system-ui", "sans-serif"],
        ui: ["Anek UI", "Anek Bangla", "Hind Siliguri", "system-ui", "sans-serif"],
      },
      /**
       * One ladder, tuned for Bangla.
       *
       * Before this the site used forty-four different text sizes — nine of
       * them between 13px and 17.5px, and nine separate clamp() curves for
       * headings, so every heading grew at its own rate as the window moved.
       * That is what made the page feel unsettled rather than any single
       * value being wrong.
       *
       * Line heights run looser than a Latin site would: marks sit above the
       * matra and conjuncts hang below the baseline, so 1.375 that reads as
       * comfortable in English closes up in Bangla. The small end is
       * deliberately short — micro and xs are for things nobody has to read,
       * because the audience here is largely over 55.
       */
      fontSize: {
        // Reading sizes carry no line-height of their own. globals.css already
        // sets it per language on the body — 1.78 for Bangla, 1.62 for Latin —
        // and baking a number into the token here overrode that, which left
        // the English pages set at Bangla leading and looking airy.
        micro: "12px",
        xs: "13px",
        sm: "15px",
        base: "17px",
        lg: "19px",
        // Headings share one curve, so they scale together.
        xl: ["clamp(19px, 2.1vw, 23px)", { lineHeight: "1.4" }],
        "2xl": ["clamp(22px, 2.8vw, 28px)", { lineHeight: "1.32" }],
        "3xl": ["clamp(25px, 3.6vw, 34px)", { lineHeight: "1.26" }],
        "4xl": ["clamp(29px, 4.8vw, 42px)", { lineHeight: "1.2" }],
        "5xl": ["clamp(34px, 6.4vw, 54px)", { lineHeight: "1.14" }],
        hero: ["clamp(44px, 10vw, 76px)", { lineHeight: "1.06" }],
      },

      lineHeight: {
        none: "1",
        tight: "1.2",
        // Tailwind's 1.375. A conjunct stack needs the extra tenth.
        snug: "1.45",
        normal: "1.62",
        relaxed: "1.82",
        loose: "2",
      },

      maxWidth: { prose: "62ch" },
      letterSpacing: { tightest: "-0.03em" },
    },
  },
  plugins: [],
};
