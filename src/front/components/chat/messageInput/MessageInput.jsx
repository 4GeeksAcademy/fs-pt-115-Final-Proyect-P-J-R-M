import React from "react";
import "../theme.css";
import "./message-input.css";
import Emojis from "../Emojis/Emojis";

export default function MessageInput({
    value,
    placeholder = "Escribe un mensaje",
    disabled = false,
    onChange,
    onSend,
    onStartTyping,
    onStopTyping,
}) {
    const getEmojis = (emoji) => {
        onChange(prev => prev + emoji)
    }

    return (
        <div className="msg-input">
            <Emojis getEmojis={getEmojis} />
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
