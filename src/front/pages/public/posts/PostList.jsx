import { useAuth } from "../../../hooks/useAuth";
import { deletePost } from "../../../services/postApi";

export const PostList = ({ posts = [], currentUserId, onDeleted }) => {
  const { token, user } = useAuth(); 

  if (!posts.length) return <p>No hay posts todavía.</p>;

  const myId = currentUserId ?? user?.id ?? null;

  const handleDelete = async (id) => {
    if (!token) return alert("Inicia sesión.");
    if (!confirm("¿Eliminar este post?")) return;

    try {
      await deletePost(id, token);          
      onDeleted?.(id);                
    } catch (err) {
      alert(err.message || "No se pudo eliminar.");
    }
  };

  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>
          <strong>{p.destination}</strong> — {p.description} ({p.divisas_one} → {p.divisas_two})
          {myId === p.user_id && (
            <button onClick={() => handleDelete(p.id)} style={{ marginLeft: 8 }}>
              Borrar
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};