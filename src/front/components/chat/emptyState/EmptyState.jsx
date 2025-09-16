import React from "react";
import "./empty-state.css";
import "../theme.css";

export default function EmptyState({
    title = "Selecciona un chat",
    subtitle = "Elige una conversación en la lista de la izquierda",
    icon = "💬",
}) {
    return (
        <div className="empty-state">
            <div className="empty-state__icon" aria-hidden>{icon}</div>
            <div className="empty-state__title">{title}</div>
            <div className="empty-state__subtitle">{subtitle}</div>
        </div>
    );
}
