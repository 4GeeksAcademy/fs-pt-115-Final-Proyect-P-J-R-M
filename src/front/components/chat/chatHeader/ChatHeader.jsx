import React from "react";
import "../theme.css";
import "./chat-header.css";
import Avatar from "../avatar/Avatar";


export default function ChatHeader({
    chat,
    userId,
    usersById,
    postsById,
    typingOthers = [],
    onLoadOlder,
    canLoadOlder = false,
}) {
    if (!chat) return <div className="chat-header chat-header--empty">Selecciona un chat</div>;

    const otherId = chat.user_one === userId ? chat.user_two : chat.user_one;
    const other = usersById?.[otherId];
    const title = other?.username || `Usuario ${otherId}`;
    const img = other?.image;

    const post = postsById?.[chat.post_id];
    const sub = post ? `${post.description} ${post.divisas_one} → ${post.divisas_two}` : "";
    const dest = post?.destination ? `📍 ${post.destination}` : "";

    const typingLine =
        typingOthers.length > 0
            ? typingOthers.length === 1
                ? `${usersById?.[typingOthers[0]]?.username || "Usuario"} está escribiendo…`
                : "Varios están escribiendo…"
            : null;

    return (
        <div className="chat-header">
            <div className="chat-header__left">
                {img ? (
                    <img src={img} alt={title} className="chat-header__avatar" />
                ) : (
                    <Avatar seed={title} title={title} size={34} />
                )}
                <div className="chat-header__meta">
                    <div className="chat-header__title">{title}</div>
                    <div className="chat-header__subtitle" aria-live="polite">
                        {typingLine || sub}
                    </div>
                    {dest && <div className="chat-header__dest">{dest}</div>}
                </div>
            </div>

            {canLoadOlder && (
                <button className="chat-header__older-btn" onClick={onLoadOlder} type="button">
                    Cargar anteriores
                </button>
            )}
        </div>
    );
}
