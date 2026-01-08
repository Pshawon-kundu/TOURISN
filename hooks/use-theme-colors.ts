import { ColorSchemes } from "@/constants/design";
import { useColorScheme } from "./use-color-scheme";

/**
 * Hook to get theme colors based on the current color scheme (light/dark)
 * @returns colors object with all theme colors
 */
export function useThemeColors() {
  const colorScheme = useColorScheme();
  return ColorSchemes[colorScheme ?? "light"];
}
