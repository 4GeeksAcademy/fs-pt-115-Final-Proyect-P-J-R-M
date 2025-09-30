import React, { memo } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import "../theme.css";
import "./sidebar.css";
import Avatar from "../avatar/Avatar";
import UnreadBadge from "../unreadBadge/UnreadBadge";
import { MessageCircleX } from "lucide-react";

function Sidebar({
    chats,
    usersById,
    postsById,
    userId,
    activeChatId,
    unreadByChat,
    onSelectChat,
    onDeleteChat,
}) {
    const handleDelete = async (chatId, title, e) => {
        e.stopPropagation();

        const confirm = await Swal.fire({
            icon: "warning",
            title: "¿Estás seguro de borrar este chat?",
            html: `<p class="finalize__text">Se eliminará la conversación con <b>${title}</b>.</p>`,
            showCancelButton: true,
            confirmButtonText: "Sí, borrar",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
        });

        if (confirm.isConfirmed) {
            onDeleteChat?.(chatId);
            await Swal.fire({
                icon: "success",
                title: "Chat eliminado",
                timer: 1800,
                showConfirmButton: false,
                timerProgressBar: true,
            });
        }
    };

    return (
        <aside className="chat-sidebar" aria-label="Conversaciones">
            <div className="chat-sidebar__header">
                <span>Chats</span>
            </div>

            <ul className="chat-sidebar__list">
                {chats
                    .filter((c) => c.is_active === true)
                    .map((c) => {
                        const otherId = c.user_one === userId ? c.user_two : c.user_one;
                        const other = usersById[otherId];
                        const title = other?.username || `Usuario ${otherId}`;
                        const img = other?.image;

                        const post = postsById[c.post_id];
                        const subtitle = post
                            ? `${post.description} · ${post.divisas_one} → ${post.divisas_two}`
                            : `Post #${c.post_id}`;

                        const unread = unreadByChat?.[c.id] || 0;
                        const isActive = c.id === activeChatId;

                        return (
                            <li key={c.id} className="chat-item__wrap">
                                <button
                                    type="button"
                                    className={`chat-item ${isActive ? "is-active" : ""}`}
                                    onClick={() => onSelectChat?.(c.id)}
                                    aria-current={isActive ? "true" : "false"}
                                    aria-label={`Abrir chat con ${title}`}
                                >
                                    <div className="chat-item__left">
                                        {img ? (
                                            <img src={img} alt={title} className="chat-item__avatar" />
                                        ) : (
                                            <Avatar seed={title} title={title} />
                                        )}
                                        <div className="chat-item__meta">
                                            <div className="chat-item__title u-truncate">{title}</div>
                                            <div className="chat-item__subtitle u-truncate">{subtitle}</div>
                                        </div>
                                    </div>

                                    <UnreadBadge count={unread} />
                                    <span
                                        type="button"
                                        className="chat-item__delete"
                                        onClick={(e) => handleDelete(c.id, title, e)}
                                        aria-label={`Eliminar chat con ${title}`}
                                        title="Eliminar chat"
                                    >
                                        <MessageCircleX size={25} strokeWidth={1.25} />
                                    </span>
                                </button>
                            </li>
                        );
                    })}
            </ul>
        </aside>
    );
}

Sidebar.propTypes = {
    chats: PropTypes.arrayOf(PropTypes.object).isRequired,
    usersById: PropTypes.object.isRequired,
    postsById: PropTypes.object.isRequired,
    userId: PropTypes.number.isRequired,
    activeChatId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    unreadByChat: PropTypes.object,
    onSelectChat: PropTypes.func,
    onDeleteChat: PropTypes.func,
};

export default memo(Sidebar);
