import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getPosts, deletePost } from "../../services/postApi";
import { getUsers } from "../../services/userApi";
import { StartChatButton } from "../StartChatButton";
import "./postlist.css";
import { PlaneLanding, Trash2 } from "lucide-react";

export const PostList = ({ refresh = 0 }) => {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterTo, setFilterTo] = useState("");

  const currencySymbols = {
    AUD: "A$",
    BGN: "лв",
    BRL: "R$",
    CAD: "C$",
    CHF: "CHF",
    CNY: "¥",
    CZK: "Kč",
    DKK: "kr",
    EUR: "€",
    GBP: "£",
    HKD: "HK$",
    HUF: "Ft",
    IDR: "Rp",
    ILS: "₪",
    INR: "₹",
    ISK: "kr",
    JPY: "¥",
    KRW: "₩",
    MXN: "MX$",
    MYR: "RM",
    NOK: "kr",
    NZD: "NZ$",
    PHP: "₱",
    PLN: "zł",
    RON: "lei",
    SEK: "kr",
    SGD: "S$",
    THB: "฿",
    TRY: "₺",
    USD: "$",
    ZAR: "R",
  };

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
      <aside className="posts-sidebar" role="toolbar" aria-label="Filtros por divisa destino">
        <h4 className="posts-sidebar-title"></h4>
        <button
          onClick={() => setFilterTo("")}
          className="posts-filter-btn"
          aria-pressed={!filterTo}
        >
          Todas
        </button>

        {currencies.map((c) => {
          const symbol = currencySymbols[c] || c;
          const isActive = filterTo === c;

          return (
            <button
              key={c}
              onClick={() => setFilterTo(c)}
              className="posts-filter-btn"
              aria-pressed={isActive}
            >
              <span className="front">{c}</span>
              <span className="back">{symbol}</span>
            </button>
          );
        })}
      </aside>

      <ul className="posts-list">
        {visible.map((post) => {
          const author = users.find((u) => u.id === post.user_id);

          return (
            <li key={post.id} className="post-item">
              <div className="post-body-horizontal">
                <div className="post-user">
                  <img
                    src={author?.image || "../../rigo-baby.jpg"}
                    alt="avatar"
                    className="post-avatar"
                  />
                  <h4 className="post-author">{author?.username}</h4>
                </div>

                <section className="post-info">
                  <div className="detail">
                    <span className="label">Destino</span>
                    <span className="value">{post.destination}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Fecha prevista</span>
                    <span className="value">{post.day_exchange ? post.day_exchange : "Por concretar"}</span>
                  </div>
                </section>

                <section className="post-money">
                  <div className="detail detail--amount">
                    <span className="label">Cantidad</span>
                    <span className="value">
                      {post.description} {post.divisas_one} <PlaneLanding size={18} className="text-gold" /> {post.divisas_two}
                    </span>
                  </div>
                </section>

                <div className="post-actions">
                  {user?.id === post.user_id ? (
                    <button className="post-delete" onClick={() => handleDelete(post.id)}>
                      <Trash2 />
                    </button>
                  ) : (
                    <StartChatButton userTwo={post.user_id} postId={post.id} />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};