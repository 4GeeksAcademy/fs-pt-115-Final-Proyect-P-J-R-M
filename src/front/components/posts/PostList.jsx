import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getPosts, deletePost } from "../../services/postApi";
import { getUsers } from "../../services/userApi";


export const PostList = ({refresh = 0}) => {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterTo, setFilterTo] = useState("");

  useEffect(() => {
    if (!token) return;
    getPosts(token).then(setPosts);
  }, [token, refresh]);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const handleDelete = async (id) => {
    await deletePost(id, token);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const currencies = useMemo(() => {
    return Array.from(new Set(posts.map(p => p.divisas_two))).filter(Boolean).sort();
  }, [posts]);

  const visible = useMemo(() => {
    return filterTo
      ? posts.filter(p => p.divisas_two === filterTo)
      : posts;
  }, [posts, filterTo]);

  if (!visible.length) return <p>No hay posts todavía.</p>;

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <aside style={{ minWidth: 150 }}>
        <h4>Divisa destino</h4>
        <button
          onClick={() => setFilterTo("")}
          style={{ display: "block", marginBottom: 8 }}
        >
          Todas
        </button>
        {currencies.map(c => (
          <button
            key={c}
            onClick={() => setFilterTo(c)}
            style={{
              display: "block",
              marginBottom: 8,
              fontWeight: filterTo === c ? "bold" : "normal",
            }}
          >
            {c}
          </button>
        ))}
      </aside>
      <ul style={{ flex: 1, listStyle: "none", paddingLeft: 0, display: "grid", gap: 12 }}>
        {visible.map((post) => {
          const author = users.find(u => u.id === post.user_id);

          return (
            <li key={post.id} style={{ border: "1px solid #eaeaea", borderRadius: 12, padding: 12 }}>
              <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={author?.image || "/avatar-placeholder.png"}
                  alt="..."
                  style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                />
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                  <strong>{author?.username}</strong>
                  {post.day_exchange && (
                    <small>Intercambio previsto: {post.day_exchange}</small>
                  )}
                </div>
                {user?.id === post.user_id && (
                  <button
                    style={{ marginLeft: "auto" }}
                    onClick={() => handleDelete(post.id)}
                  >
                    Eliminar
                  </button>
                )}
              </header>

              <p style={{ marginTop: 10 }}>
                <strong>{post.destination}</strong> — {post.description} ({post.divisas_one} → {post.divisas_two})
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};