// src/theme/theme.js
import { extendTheme } from '@chakra-ui/react';

const colors = {
  // Primary Color: Deep Blue (#1A4E8A)
  primary: {
    50: '#e6f0f8',
    100: '#b3d1e8',
    200: '#80b2d8',
    300: '#4d93c8',
    400: '#1a74b8',
    500: '#1A4E8A', // Main primary color
    600: '#153d6f',
    700: '#102d54',
    800: '#0b1e39',
    900: '#060e1e',
  },
  // Secondary Color: Sky Blue (#3B82F6)
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3B82F6', // Main secondary color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // Accent Color: Orange (#F97316)
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#F97316', // Main accent color
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  // Brand colors (using primary as base)
  brand: {
    50: '#e6f0f8',
    100: '#b3d1e8',
    200: '#80b2d8',
    300: '#4d93c8',
    400: '#1a74b8',
    500: '#1A4E8A',
    600: '#153d6f',
    700: '#102d54',
    800: '#0b1e39',
    900: '#060e1e',
  },
};

const gradients = {
  heroBg: 'linear(to-br, #e6f0f8, #f0f7ff 80%)',
  pageBg: 'linear(to-br, #f0f7ff, #e6f0f8 60%, #dbeafe 100%)',
  featureBg: 'linear(to-br, #e6f0f8, #f0f7ff 80%)',
  button: 'linear(to-r, primary.500, primary.600)',
  buttonHover: 'linear(to-r, primary.600, primary.700)',
  buttonAccent: 'linear(to-r, accent.500, accent.600)',
  buttonAccentHover: 'linear(to-r, accent.600, accent.700)',
};

const shadows = {
  hero: '2xl',
  feature: '2xl',
  image: 'xl',
  button: 'lg',
};

const radii = {
  box: '3xl',
  image: '3xl',
  button: 'full',
};

const theme = extendTheme({
  colors,
  radii,
  shadows,
  gradients,
});

export default theme;
export { colors, gradients, shadows, radii };
