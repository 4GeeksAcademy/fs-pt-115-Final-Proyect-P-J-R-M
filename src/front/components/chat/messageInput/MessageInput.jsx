import React from "react";
import "../theme.css";
import "./message-input.css";

export default function MessageInput({
    value,
    placeholder = "Escribe un mensaje",
    disabled = false,
    onChange,
    onSend,
    onStartTyping,
    onStopTyping,
}) {
    return (
        <div className="msg-input">
            <input
                className="msg-input__field"
                value={value}
                placeholder={placeholder}
                disabled={disabled}
                onChange={(e) => {
                    onChange?.(e.target.value);
                    if (e.target.value) onStartTyping?.();
                    else onStopTyping?.();
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        onSend?.();
                    }
                }}
            />
            <button
                type="button"
                className="msg-input__btn"
                onClick={onSend}
                disabled={disabled || !String(value || "").trim()}
            >
                Enviar
            </button>
        </div>
    );
}
