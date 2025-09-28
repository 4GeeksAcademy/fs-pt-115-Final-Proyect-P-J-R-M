import { addFavoritePost } from "../../services/favoritesApi";
import "./start-chat-button.css";

export function StartChatButton({ userTwo, postId, to = "/chats", label = "Chatear" }) {
  return (
    <button
      onClick={async () => {
        if (!userTwo || !postId) return;
        const token = localStorage.getItem("token");
        try {
          await addFavoritePost(postId,token)
        }catch (error){
          console.error ("Error as save add", error)
        }
        const url = new URL(window.location.origin + to);
        url.searchParams.set("userTwo", String(userTwo));
        url.searchParams.set("postId", String(postId));
        window.location.assign(url.toString());
      }}
      className="start-chat-btn"
      title="Abrir chat"
    >
      {label}
    </button>
  );
}