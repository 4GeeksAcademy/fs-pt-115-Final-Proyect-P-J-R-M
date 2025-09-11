export function StartChatButton({ userTwo, postId, to = "/chats", label = "Chatear" }) {
  return (
    <button
      onClick={() => {
        if (!userTwo || !postId) return;
        const url = new URL(window.location.origin + to);
        url.searchParams.set("userTwo", String(userTwo));
        url.searchParams.set("postId", String(postId));
        window.location.assign(url.toString());
      }}
      style={{
        color: "white",
        border: "none",
        borderRadius: 10,
        padding: "8px 12px",
        cursor: "pointer",
      }}
      title="Abrir chat"
    >
      💬 {label}
    </button>
  );
}