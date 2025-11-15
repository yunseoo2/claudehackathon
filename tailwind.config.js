/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			// Enhanced dark theme colors
  			dark: {
  				900: '#0A0A0F',
  				800: '#121218',
  				700: '#1A1A24',
  				600: '#252530',
  			},
  			// Neon accent colors
  			neon: {
  				blue: '#00D9FF',
  				cyan: '#00FFF0',
  				purple: '#8B5CF6',
  				pink: '#EC4899',
  			},
  			blue: {
  				DEFAULT: '#3B82F6',
  				light: '#60A5FA',
  				dark: '#1E40AF',
  				50: '#eff6ff',
  				100: '#dbeafe',
  				400: '#60a5fa',
  				500: '#3b82f6',
  				600: '#2563eb',
  			},
  			// Enhanced risk colors with glow variants
  			risk: {
  				high: '#EF4444',
  				'high-glow': 'rgba(239, 68, 68, 0.4)',
  				medium: '#F59E0B',
  				'medium-glow': 'rgba(245, 158, 11, 0.4)',
  				low: '#10B981',
  				'low-glow': 'rgba(16, 185, 129, 0.4)',
  			},
  			// Interactive state colors
  			interactive: {
  				hover: 'rgba(59, 130, 246, 0.12)',
  				active: 'rgba(59, 130, 246, 0.25)',
  				focus: 'rgba(139, 92, 246, 0.25)',
  			}
  		},
  		fontFamily: {
  			serif: ['Playfair Display', 'serif'],
  			body: ['Merriweather', 'serif'],
  			sans: ['Inter', 'sans-serif'],
  		},
  		animation: {
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'fade-in': 'fadeIn 0.5s ease-in-out',
  			'slide-up': 'slideUp 0.4s ease-out',
  			'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
  			'float': 'float 6s ease-in-out infinite',
  			'shimmer': 'shimmer 2s linear infinite',
  			'shake': 'shake 0.5s ease-in-out',
  			'spin-slow': 'spin 20s linear infinite',
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			slideUp: {
  				'0%': { transform: 'translateY(20px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' },
  			},
  			pulseGlow: {
  				'0%, 100%': {
  					boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
  					transform: 'scale(1)',
  				},
  				'50%': {
  					boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)',
  					transform: 'scale(1.05)',
  				},
  			},
  			float: {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-20px)' },
  			},
  			shimmer: {
  				'0%': { backgroundPosition: '-200% 0' },
  				'100%': { backgroundPosition: '200% 0' },
  			},
  			shake: {
  				'0%, 100%': { transform: 'translateX(0)' },
  				'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
  				'20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
  			},
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
