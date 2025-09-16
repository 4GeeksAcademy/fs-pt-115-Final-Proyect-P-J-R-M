import React from "react";
import PropTypes from "prop-types";
import "../theme.css";
import "./chat-panel.css";

import ChatHeader from "../chatHeader/ChatHeader";
import MessageList from "../messageList/MessageList";
import MessageBubble from "../messageBubble/MessageBubble";
import MessageInput from "../messageInput/MessageInput";

/**
 * Componente puramente presentacional del panel principal.
 * Recibe props agrupadas para header, lista y input.
 */
export default function ChatPanel({
    headerProps,       // { chat, userId, usersById, postsById, typingOthers, onLoadOlder, canLoadOlder }
    listRef,           // ref del contenedor scrollable
    messages,          // array de mensajes del chat activo
    usersById,         // mapa id->user (para autor)
    activeChatId,      // id del chat activo (para dataset/ref)
    isMine,            // (m) => boolean (decide si el msg es mío)
    inputProps,        // { value, disabled, placeholder, onChange, onSend, onStartTyping, onStopTyping }
}) {
    return (
        <section className="chat-panel">
            {/* Header */}
            <ChatHeader {...headerProps} />

            {/* Mensajes (con ref para scroll persistente) */}
            <MessageList
                ref={listRef}
                messages={messages}
                usersById={usersById}
                activeChatId={activeChatId}
                renderItem={(m) => {
                    const author = usersById[m.user_id];
                    return (
                        <MessageBubble
                            key={m.id}
                            mine={isMine ? isMine(m) : undefined}
                            content={m.content}
                            id={m.id}
                            authorName={author?.username}
                            authorImg={author?.image}
                        />
                    );
                }}
            />

            {/* Input */}
            <MessageInput {...inputProps} />
        </section>
    );
}

ChatPanel.propTypes = {
    headerProps: PropTypes.object.isRequired,
    listRef: PropTypes.any,
    messages: PropTypes.arrayOf(PropTypes.object).isRequired,
    usersById: PropTypes.object.isRequired,
    activeChatId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    isMine: PropTypes.func,
    inputProps: PropTypes.shape({
        value: PropTypes.string,
        disabled: PropTypes.bool,
        placeholder: PropTypes.string,
        onChange: PropTypes.func,
        onSend: PropTypes.func,
        onStartTyping: PropTypes.func,
        onStopTyping: PropTypes.func,
    }).isRequired,
};
