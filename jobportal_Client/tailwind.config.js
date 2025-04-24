module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,mjs}",  // Bao gồm tất cả các file trong src
  ],
  theme: {
    extend: {
      backgroundImage: {
        'banner-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },

      primary: {
        DEFAULT: "#9f5bff",
        foreground: "hsl(var(--primary-foreground))",
      },
      secondary: {
        DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))",
      },
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
        foreground: "hsl(var(--destructive-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
    },
  },
  plugins: [],
}
