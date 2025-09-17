import React from "react";
import "../theme.css";
import "./unread-badge.css";

export default function UnreadBadge({ count }) {
    if (!count || count <= 0) return null;
    return (
        <span
            className="unread-badge"
            aria-label={`${count} mensajes sin leer`}
            title={`${count} sin leer`}
        >
            {count}
        </span>
    );
}
