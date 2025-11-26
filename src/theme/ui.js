// src/theme/ui.js
// Centralized UI style objects for reuse in all pages/components
import { colors, gradients, shadows, radii } from './theme';

export const heroBoxProps = {
  bgGradient: gradients.heroBg,
  borderRadius: radii.box,
  boxShadow: shadows.hero,
  p: { base: 4, sm: 6, md: 16 },
  w: { base: '100%', md: '90%' },
  minH: { base: 'auto', md: '480px', lg: '540px' },
  mx: 'auto',
  position: 'relative',
  overflow: 'hidden',
};

export const featureBoxProps = {
  bgGradient: gradients.featureBg,
  borderRadius: radii.box,
  boxShadow: shadows.feature,
  w: { base: '100%', md: '60%' },
  my: { base: 6, md: 8 },
  p: { base: 4, sm: 8, md: 24 },
  minH: { base: 'auto', md: '480px', lg: '540px' },
  mx: 'auto',
  position: 'relative',
  overflow: 'hidden',
};

export const imageProps = {
  borderRadius: radii.image,
  boxShadow: shadows.image,
  objectFit: 'cover',
  bg: 'white',
  p: 4,
};

export const buttonProps = {
  colorScheme: 'primary',
  bgGradient: gradients.button,
  color: 'white',
  _hover: { bgGradient: gradients.buttonHover, transform: 'scale(1.05)' },
  borderRadius: radii.button,
  transition: 'all 0.2s',
  boxShadow: shadows.button,
};

export const buttonAccentProps = {
  colorScheme: 'accent',
  bgGradient: gradients.buttonAccent,
  color: 'white',
  _hover: { bgGradient: gradients.buttonAccentHover, transform: 'scale(1.05)' },
  borderRadius: radii.button,
  transition: 'all 0.2s',
  boxShadow: shadows.button,
};

export const primary = colors.primary[500];
export const secondary = colors.secondary[500];
export const accent = colors.accent[500];
export const pageBg = gradients.pageBg;
