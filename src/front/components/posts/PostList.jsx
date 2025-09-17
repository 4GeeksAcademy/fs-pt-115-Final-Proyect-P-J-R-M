import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getPosts, deletePost } from "../../services/postApi";
import { getUsers } from "../../services/userApi";
import { StartChatButton } from "../StartChatButton";
import "./postlist.css";
import { PlaneLanding } from "lucide-react";

export const PostList = ({ refresh = 0 }) => {
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
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const currencies = useMemo(() => {
    return Array.from(new Set(posts.map((p) => p.divisas_two)))
      .filter(Boolean)
      .sort();
  }, [posts]);

  const visible = useMemo(() => {
    return filterTo ? posts.filter((p) => p.divisas_two === filterTo) : posts;
  }, [posts, filterTo]);

  if (!visible.length) return <p className="posts-empty">No hay posts todavía.</p>;

  return (
    <div className="posts-layout">
      <aside className="posts-sidebar">
        <h4 className="posts-sidebar-title">Divisas</h4>
        <button
          onClick={() => setFilterTo("")}
          className="posts-filter-btn"
          aria-pressed={!filterTo}
        >
          Todas
        </button>

        {currencies.map((c) => (
          <button
            key={c}
            onClick={() => setFilterTo(c)}
            className="posts-filter-btn"
            aria-pressed={filterTo === c}
          >
            {c}
          </button>
        ))}
      </aside>

      <ul className="posts-list">
        {visible.map((post) => {
          const author = users.find((u) => u.id === post.user_id);

          return (
            <li key={post.id} className="post-item">
              <header className="post-header">
                <img
                  src={author?.image || "../../rigo-baby.jpg"}
                  alt="avatar"
                  className="post-avatar"
                />
                <div className="post-name">
                  <h4 className="post-author">{author?.username}</h4>
                  {post.day_exchange && (
                    <small className="post-exchange">
                      Intercambio previsto: {post.day_exchange}
                    </small>
                  )}
                </div>
                {user?.id === post.user_id && (
                  <button
                    className="post-delete"
                    onClick={() => handleDelete(post.id)}
                  >
                    Eliminar
                  </button>
                )}
                <StartChatButton userTwo={post.user_id} postId={post.id} />


              </header>

              <div className="post-body">
                <h4 className="post-destination">{post.destination}</h4>{" "}
                <div className="post-currencies">
                  <span className="post-monto">{post.description} {post.divisas_one} →</span>
                  <span className="post-del">
                    <PlaneLanding />
                  </span>
                  <span className="post-arra">{post.divisas_two}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};