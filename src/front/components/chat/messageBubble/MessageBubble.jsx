import React from "react";
import "../theme.css";
import "./message-bubble.css";
import Avatar from "../avatar/Avatar";

function isImageContent(content) {
    if (typeof content !== "string") return false;
    const url = content.trim();
    if (!/^https?:\/\//i.test(url)) return false;
    const hasImageExt = /\.(png|jpe?g|gif|webp|avif|heic|heif)(\?|#|$)/i.test(url);
    const isCloudinary = /res\.cloudinary\.com|\/image\/upload\//i.test(url);
    return hasImageExt || isCloudinary;
}

export default function MessageBubble({
    mine,
    content,
    id,
    ephemeral,
    authorName,
    authorImg,
}) {
    const isImage = isImageContent(content);

    return (
        <div
            className={`msg-row ${mine ? "is-mine" : "is-other"} ${ephemeral ? "is-ephemeral" : ""}`}
            title={typeof id === "number" ? `msg #${id}` : undefined}
        >
            {!mine &&
                (authorImg ? (
                    <img src={authorImg} alt={authorName || "Usuario"} className="msg-avatar" />
                ) : (
                    <Avatar seed={authorName || "Usuario"} size={28} />
                ))}

            <div className={`msg-bubble ${mine ? "msg-bubble--mine" : "msg-bubble--other"}`}>
                {!mine && authorName && <div className="msg-author">{authorName}</div>}

                {isImage ? (
                    <a
                        href={content}
                        target="_blank"
                        rel="noreferrer"
                        className="msg-image-link"
                        aria-label="Abrir imagen"
                    >
                        <img src={content} alt="imagen" className="msg-image" />
                    </a>
                ) : (
                    content
                )}
            </div>
        </div>
    );
}

