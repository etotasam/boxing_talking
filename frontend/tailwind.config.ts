import type { Config } from 'tailwindcss';
import containerQueries from '@tailwindcss/container-queries';
import colors from 'tailwindcss/colors';
import { DEVICE_BREAKPOINT } from './src/constants/deviceBreakpoint';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'base-bg': colors.neutral[900],
      },
    },
    screens: {
      pc: `${DEVICE_BREAKPOINT.pc}px`,
    },
  },
  plugins: [containerQueries],
} satisfies Config;
