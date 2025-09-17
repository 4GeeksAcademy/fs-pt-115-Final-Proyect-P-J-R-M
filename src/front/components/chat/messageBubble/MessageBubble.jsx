import React from "react";
import "../theme.css";
import "./message-bubble.css";
import Avatar from "../avatar/Avatar";

export default function MessageBubble({
    mine,
    content,
    id,
    ephemeral,
    authorName,
    authorImg,
}) {
    return (
        <div
            className={`msg-row ${mine ? "is-mine" : "is-other"} ${ephemeral ? "is-ephemeral" : ""}`}
            title={typeof id === "number" ? `msg #${id}` : undefined}
        >
            {!mine && (
                authorImg ? (
                    <img src={authorImg} alt={authorName || "Usuario"} className="msg-avatar" />
                ) : (
                    <Avatar seed={authorName || "Usuario"} size={28} />
                )
            )}

            <div className={`msg-bubble ${mine ? "msg-bubble--mine" : "msg-bubble--other"}`}>
                {!mine && authorName && (
                    <div className="msg-author">{authorName}</div>
                )}
                {content}
            </div>
        </div>
    );
}
