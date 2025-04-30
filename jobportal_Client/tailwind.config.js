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
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'fadeIn': 'fadeIn 0.5s ease-out',
      },
    },
  },
  plugins: [],
}
