import React, { forwardRef, memo } from "react";
import PropTypes from "prop-types";
import "../theme.css";
import "./message-list.css";
import MessageBubble from "../messageBubble/MessageBubble";

const MessageList = forwardRef(function MessageList(
  { messages = [], usersById = {}, activeChatId, renderItem },
  ref
) {
  return (
    <div
      ref={ref}
      className="msg-list"
      data-chat-id={activeChatId || ""}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {messages.map((m) => {
        if (renderItem) return renderItem(m);
        const author = usersById[m.user_id];
        return (
          <MessageBubble
            key={m.id}
            content={m.content}
            id={m.id}
            authorName={author?.username}
            authorImg={author?.image}
          />
        );
      })}
    </div>
  );
});

MessageList.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object),
  usersById: PropTypes.object,
  activeChatId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  renderItem: PropTypes.func,
};

export default memo(MessageList);
