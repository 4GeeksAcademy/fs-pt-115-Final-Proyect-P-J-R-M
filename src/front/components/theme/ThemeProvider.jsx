import { createContext, useContext, useEffect, useRef, useState } from "react";

const ThemeContext = createContext({
    theme: "dark",
    setTheme: () => { },
    toggleTheme: () => { },
});

export default function ThemeProvider({ children }) {

    const [theme, setTheme] = useState(() => {
        try {
            const saved = window.localStorage?.getItem("theme");
            return saved || "dark";
        } catch {
            return "dark";
        }
    });
    
    const didInit = useRef(false);
    useEffect(() => {
        if (didInit.current) return;
        didInit.current = true;
        try {
            const saved = window.localStorage?.getItem("theme");
            if (!saved && window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) {
                setTheme("dark");
            }
        } catch { }
    }, []);

    useEffect(() => {
        const root = document?.documentElement;
        if (root) root.dataset.theme = theme;
        try {
            window.localStorage?.setItem("theme", theme);
        } catch { }
    }, [theme]);

    const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
