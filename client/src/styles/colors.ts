// Primary Brand Colors
export const COLORS = {
  // Primary Gradient Colors
  primary: {
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    gradientHover: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
    gradientActive: "linear-gradient(135deg, #4e5bc6 0%, #5e397e 100%)",
    main: "#667eea",
    dark: "#5a6fd8",
    darker: "#4e5bc6",
    light: "#764ba2",
    lighter: "#8a5bb8",
  },

  // Neutral Colors
  neutral: {
    white: "#ffffff",
    black: "#000000",
    gray50: "#f9fafb",
    gray100: "#f3f4f6",
    gray200: "#e5e7eb",
    gray300: "#d1d5db",
    gray400: "#9ca3af",
    gray500: "#6b7280",
    gray600: "#4b5563",
    gray700: "#374151",
    gray800: "#1f2937",
    gray900: "#111827",
  },

  // Semantic Colors
  success: {
    main: "#52c41a",
    light: "#73d13d",
    dark: "#389e0d",
    background: "#f6ffed",
    border: "#b7eb8f",
  },

  error: {
    main: "#ff4d4f",
    light: "#ff7875",
    dark: "#cf1322",
    background: "#fff2f0",
    border: "#ffccc7",
  },

  warning: {
    main: "#faad14",
    light: "#ffc53d",
    dark: "#d48806",
    background: "#fffbe6",
    border: "#ffe58f",
  },

  info: {
    main: "#1890ff",
    light: "#40a9ff",
    dark: "#096dd9",
    background: "#e6f7ff",
    border: "#91d5ff",
  },

  // Background Colors
  background: {
    primary: "#ffffff",
    secondary: "#f5f5f5",
    tertiary: "#fafafa",
    overlay: "rgba(0, 0, 0, 0.45)",
    disabled: "#d9d9d9",
  },

  // Text Colors
  text: {
    primary: "#1f2937",
    secondary: "#6b7280",
    tertiary: "#9ca3af",
    inverse: "#ffffff",
    disabled: "rgba(0, 0, 0, 0.25)",
    link: "#667eea",
    linkHover: "#5a6fd8",
  },

  // Border Colors
  border: {
    primary: "#d1d5db",
    secondary: "#e5e7eb",
    focus: "#667eea",
    error: "#ff4d4f",
    success: "#52c41a",
  },

  // Shadow Colors
  shadow: {
    primary: "rgba(0, 0, 0, 0.1)",
    secondary: "rgba(0, 0, 0, 0.05)",
    focus: "rgba(102, 126, 234, 0.3)",
    hover: "rgba(102, 126, 234, 0.4)",
  },
} as const;
