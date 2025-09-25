import React from "react";
import PropTypes from "prop-types";
import "../theme.css";
import "./chat-panel.css";
import ChatHeader from "../chatHeader/ChatHeader";
import MessageList from "../messageList/MessageList";
import MessageBubble from "../messageBubble/MessageBubble";
import MessageInput from "../messageInput/MessageInput";
import EmptyState from "../emptyState/EmptyState";
import { MessageSquareMore } from "lucide-react";

export default function ChatPanel({
    headerProps,
    listRef,
    messages,
    usersById,
    activeChatId,
    isMine,
    inputProps,
}) {
    const hasChat = Boolean(headerProps?.chat);

    return (
        <section className={`chat-panel ${hasChat ? "" : "chat-panel--empty"}`}>
            <ChatHeader {...headerProps} />
            {hasChat ? (
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
            ) : (
                <div className="chat-panel__empty">
                    <EmptyState
                        title="Selecciona un chat"
                        subtitle="Crea un chat si no tienes activos"
                        icon={<MessageSquareMore color="#d4af37" size={44} absoluteStrokeWidth />}
                    />
                </div>
            )}
            {hasChat ? <MessageInput {...inputProps} /> : null}
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
        onUploadImage: PropTypes.func,
    }).isRequired,
};

