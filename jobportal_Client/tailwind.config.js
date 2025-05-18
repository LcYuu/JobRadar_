module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,mjs}",  // Bao gồm tất cả các file trong src
  ],
  theme: {
    extend: {
      backgroundImage: {
        'banner-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      colors: {
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
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'md-custom': '1000px',
        'lg': '1024px',
        'custom-800': '800px',
        'custom': '948px',
        'custom-1360': '1360px',
        'custom-910': '910px',
        'custom-1350': '1350px',
        'custom-1485': '1485px', // Added for exact 1485px breakpoint
        'xl-custom': '1490px',
      },
    },
  },
  plugins: [],
}