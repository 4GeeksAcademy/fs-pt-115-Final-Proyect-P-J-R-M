import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const isDarkMode = theme === "dark";

    const handleToggleTheme = () => {
        if (typeof setTheme !== "function") return;
        setTheme(isDarkMode ? "light" : "dark");
    };

    return (
        <button
            className="btn"
            onClick={handleToggleTheme}
            aria-pressed={isDarkMode}
            aria-label="Cambiar tema"
        >
            {isDarkMode ? <Moon size={32} color="#ffffff" absoluteStrokeWidth /> : <Sun size={32} color="#ffd700" absoluteStrokeWidth /> }
        </button>
    );
}
