// Define color schemes for light and dark modes
export const ColorSchemes = {
  light: {
    primary: "#2E7D5A",
    accent: "#F2C94C",
    secondary: "#7BC8B3",
    background: "#FFFFFF",
    surface: "#F8F9FA",
    card: "#FFFFFF",
    textPrimary: "#0F172A",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    border: "#E5E7EB",
    error: "#E53E3E",
    success: "#10B981",
    overlay: "rgba(0, 0, 0, 0.5)",
  },
  dark: {
    primary: "#2E7D5A",
    accent: "#F2C94C",
    secondary: "#7BC8B3",
    background: "#0F172A",
    surface: "#1E293B",
    card: "#1E293B",
    textPrimary: "#FFFFFF",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    border: "#334155",
    error: "#EF4444",
    success: "#10B981",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};

// Static colors (for backward compatibility) - use light scheme
export const Colors = ColorSchemes.light;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radii = {
  small: 8,
  medium: 16,
  large: 24,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  h1: 32,
  h2: 22,
  subtitle: 16,
  body: 14,
  caption: 12,
};

export default {
  Colors,
  ColorSchemes,
  useThemeColors,
  Spacing,
  Radii,
  Typography,
};
