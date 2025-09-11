import { StartChatButton } from "../StartChatButton";
import { getExchangeDate, stripExchangeTag } from "./ExchangeDate";

export const PostList = ({ posts = [], currentUserId, onDeleted, onOpenChat }) => {
  if (!posts.length) return <p>No hay posts todavía.</p>;

  return (
    <ul style={{ listStyle: "none", paddingLeft: 0, display: "grid", gap: 12 }}>
      {posts.map((p) => {
        const author = p.author;
        const isOwner = currentUserId && (currentUserId === (author?.id ?? p.user_id));
        const exchangeDate = getExchangeDate(p);
        const description = stripExchangeTag(p.description || "");

        return (
          <li key={p.id} style={{ border: "1px solid #eaeaea", borderRadius: 12, padding: 12 }}>
            <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={author?.image || "/avatar-placeholder.png"}
                alt={`Avatar de ${author?.username ?? "usuario"}`}
                style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
              />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                <strong>{author?.username ?? "Usuario"}</strong>
                
                {exchangeDate && (
                  <small>Intercambio previsto: {new Date(exchangeDate).toLocaleDateString()}</small>
                )}
              </div>

              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                {<StartChatButton userTwo={p.user_id} postId={p.id} />}
                {isOwner && (
                  <button type="button" onClick={() => onDeleted?.(p.id)}>Eliminar</button>
                )}
              </div>
            </header>

            <p style={{ marginTop: 10 }}>
              <strong>{p.destination}</strong> — {description} ({p.divisas_one} → {p.divisas_two})
            </p>
          </li>
        );
      })}
    </ul>
  );
};