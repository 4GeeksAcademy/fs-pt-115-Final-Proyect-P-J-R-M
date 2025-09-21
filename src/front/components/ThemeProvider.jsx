// src/theme/ThemeProvider.jsx
import { useEffect, useState } from "react";
import { ThemeContext } from "../hooks/useTheme";

const preferenceKey = "theme-preference";

export default function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = localStorage.getItem(preferenceKey);

            if (savedTheme === "dark" || savedTheme === "light") {
                return savedTheme;
            }

            const prefersDark =
                window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches;

            return prefersDark ? "dark" : "light";
        } catch {
            return "light";
        }
    });

    useEffect(() => {
        const htmlElement = document.documentElement;

        if (theme === "dark") {
            htmlElement.classList.add("dark");
        } else {
            htmlElement.classList.remove("dark");
        }

        try {
            localStorage.setItem(preferenceKey, theme);
        } catch (error) {
            console.warn("No se pudo guardar el tema en localStorage:", error);
        }
    }, [theme]);

    // Cogemos automatico si el usuario no tiene tema predefinido
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleSystemThemeChange = (event) => {
            const userPreference = localStorage.getItem(preferenceKey);
            if (!userPreference) {
                setTheme(event.matches ? "dark" : "light");
            }
        };

        mediaQuery.addEventListener("change", handleSystemThemeChange);

        return () => {
            mediaQuery.removeEventListener("change", handleSystemThemeChange);
        };
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
