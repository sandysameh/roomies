export const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  xxl: "24px",
  xxxl: "32px",
  xxxxl: "40px",
  xxxxxl: "48px",
  xxxxxxl: "64px",
} as const;

export const FONT_SIZES = {
  xs: "10px",
  sm: "12px",
  base: "14px",
  md: "16px",
  lg: "18px",
  xl: "20px",
  xxl: "24px",
  xxxl: "30px",
  xxxxl: "36px",
  xxxxxl: "48px",
  xxxxxxl: "60px",
} as const;

export const COMPONENT_SIZES = {
  button: {
    small: {
      height: "24px",
      padding: "0 8px",
      fontSize: FONT_SIZES.sm,
    },
    medium: {
      height: "32px",
      padding: "0 16px",
      fontSize: FONT_SIZES.base,
    },
    large: {
      height: "40px",
      padding: "0 20px",
      fontSize: FONT_SIZES.md,
    },
    xlarge: {
      height: "48px",
      padding: "0 24px",
      fontSize: FONT_SIZES.md,
    },
  },
  input: {
    small: {
      height: "24px",
      padding: "4px 8px",
      fontSize: FONT_SIZES.sm,
    },
    medium: {
      height: "32px",
      padding: "8px 12px",
      fontSize: FONT_SIZES.base,
    },
    large: {
      height: "40px",
      padding: "12px 16px",
      fontSize: FONT_SIZES.md,
    },
  },
  avatar: {
    small: "24px",
    medium: "32px",
    large: "40px",
    xlarge: "64px",
  },
  icon: {
    small: "14px",
    medium: "16px",
    large: "20px",
    xlarge: "24px",
  },
} as const;

// Layout Sizes
export const LAYOUT_SIZES = {
  header: {
    height: "64px",
  },
  sidebar: {
    width: "240px",
    collapsedWidth: "80px",
  },
  container: {
    maxWidth: "1200px",
  },
  card: {
    minWidth: "320px",
  },
} as const;
export const FONT_WEIGHTS = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const LINE_HEIGHTS = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

export const BORDER_RADIUS = {
  none: "0px",
  sm: "4px",
  base: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  xxl: "24px",
  full: "9999px",
} as const;

export const BREAKPOINTS = {
  xs: "480px",
  sm: "576px",
  md: "768px",
  lg: "992px",
  xl: "1200px",
  xxl: "1600px",
} as const;

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

export const ANIMATION = {
  duration: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },
} as const;
