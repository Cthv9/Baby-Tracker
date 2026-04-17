export default {
  content: ['./index.html', './src/**/*.js'],
  safelist: [
    { pattern: /^(bg|text|border)-(indigo|purple|teal|blue|amber|green|red|slate|sky|emerald|orange)-(100|200|300|400|500|600|700|800)$/ },
  ],
  theme: {
    extend: {
      colors: {
        feeding: { DEFAULT: '#6366f1', light: '#eef2ff', dark: '#4338ca' },
        sleep: { DEFAULT: '#8b5cf6', light: '#f5f3ff', dark: '#6d28d9' },
        diaper: { DEFAULT: '#14b8a6', light: '#f0fdfa', dark: '#0f766e' },
        medical: { DEFAULT: '#3b82f6', light: '#eff6ff', dark: '#1d4ed8' },
        stats: { DEFAULT: '#f59e0b', light: '#fffbeb', dark: '#b45309' },
      },
    },
  },
  plugins: [],
};
