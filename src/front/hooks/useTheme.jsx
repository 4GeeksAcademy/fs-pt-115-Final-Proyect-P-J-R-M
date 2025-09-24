import { createContext, useContext } from "react";

export const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
} 
