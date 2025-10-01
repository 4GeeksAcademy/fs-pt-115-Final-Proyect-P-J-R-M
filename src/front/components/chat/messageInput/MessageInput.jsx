import React from "react";
import { Paperclip, X } from "lucide-react";
import "../theme.css";
import "./message-input.css";
import Emojis from "../Emojis/Emojis";
import SendImages from "../sendImages/SendImages";

export default function MessageInput({
    value,
    placeholder = "Escribe un mensaje",
    disabled = false,
    onChange,
    onSend,
    onStartTyping,
    onStopTyping,
    onUploadImage,
    attachments = [],
    onRemoveAttachment,
}) {
    const getEmojis = (emoji) => {
        onChange?.((prev) =>
            typeof prev === "string" ? prev + emoji : (prev || "") + emoji
        );
    };

    return (
        <div className="msg-input">
            {attachments.length > 0 && (
                <div className="msg-input__attachments">
                    {attachments.map((a) => (
                        <div className="msg-input__attachment" key={a.url}>
                            <img src={a.url} alt="" className="msg-input__attachment-img" />
                            <button
                                type="button"
                                className="msg-input__attachment-remove"
                                onClick={() => onRemoveAttachment?.(a.url)}
                                aria-label="Quitar imagen"
                                title="Quitar imagen"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="emojis-container">
                <Emojis getEmojis={getEmojis} />
            </div>


            <SendImages
                uploader={onUploadImage}
                buttonProps={{ className: "msg-input__icon-btn", title: "Adjuntar imagen", "aria-label": "Adjuntar imagen" }}
            >
                <Paperclip size={35} color="#d4af37" />
            </SendImages>

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
                disabled={disabled || (!String(value || "").trim() && attachments.length === 0)}
            >
                Enviar
            </button>
        </div>
    );
}
