import React, { useEffect, useRef, useState } from "react";
import "./language-select.css";

const OPTIONS = [
  { code: "ES", flag: "🇪🇸" },
  { code: "EN", flag: "🇺🇸" },
  { code: "FR", flag: "🇫🇷" },
  { code: "DE", flag: "🇩🇪" },
];

export const LanguageSelector = ({ defaultValue = "ES", onChange }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const rootRef = useRef(null);

  const current = OPTIONS.find(o => o.code === value) ?? OPTIONS[0];

  const selectValue = (code) => {
    setValue(code);
    onChange?.(code);
    setOpen(false);
  };

/*cerrar al clicar fuera*/
  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="langsel" ref={rootRef}>
      <button
        type="button"
        className="langsel-trigger"
        onClick={() => setOpen(v => !v)}
      >
        <span className="flag">{current.flag}</span>
        <span className="code">{current.code}</span>
        <span className="arrow">▾</span>
      </button>

      {open ? (
        <ul className="langsel-menu">
          {OPTIONS.map(opt => (
            <li
              key={opt.code}
              className={`langsel-item ${opt.code === value ? "selected" : ""}`}
              onClick={() => selectValue(opt.code)}
            >
              <span className="flag">{opt.flag}</span>
              <span className="code">{opt.code}</span>
            </li>
          ))}
        </ul>
      ): null}
    </div>
  );
};