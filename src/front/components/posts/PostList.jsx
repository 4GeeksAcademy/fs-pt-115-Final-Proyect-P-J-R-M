import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getPosts, deletePost } from "../../services/postApi";
import { getUsers } from "../../services/userApi";
import { StartChatButton } from "../startChatButton/StartChatButton";
import "./postlist.css";
import { PlaneLanding, Trash2 } from "lucide-react";

export const PostList = ({ refresh = 0 }) => {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterTo, setFilterTo] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const currencySymbols = {
    AUD: "A$", BGN: "лв", BRL: "R$", CAD: "C$", CHF: "CHF", CNY: "¥",
    CZK: "Kč", DKK: "kr", EUR: "€", GBP: "£", HKD: "HK$", HUF: "Ft",
    IDR: "Rp", ILS: "₪", INR: "₹", ISK: "kr", JPY: "¥", KRW: "₩",
    MXN: "MX$", MYR: "RM", NOK: "kr", NZD: "NZ$", PHP: "₱", PLN: "zł",
    RON: "lei", SEK: "kr", SGD: "S$", THB: "฿", TRY: "₺", USD: "$", ZAR: "R",
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

  const normalizeCountry = (dest) => (dest || "").split(",").slice(-1)[0]?.trim();

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const okTo = !filterTo || p.divisas_two === filterTo;
      const country = normalizeCountry(p.destination);
      const okCountry = !filterCountry || (country && country.toLowerCase() === filterCountry.toLowerCase());
      return okTo && okCountry;
    });
  }, [posts, filterTo, filterCountry]);

  const countryOptions = useMemo(() => {
    const list = posts
      .filter((p) => !filterTo || p.divisas_two === filterTo)
      .map((p) => normalizeCountry(p.destination))
      .filter(Boolean);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b, "es"));
  }, [posts, filterTo]);

  const sidebarCurrencies = useMemo(() => {
    const list = posts
      .filter((p) => {
        const country = (p.destination || "").split(",").slice(-1)[0]?.trim();
        const okCountry = !filterCountry || (country && country.toLowerCase() === filterCountry.toLowerCase());
        return okCountry;
      })
      .map((p) => p.divisas_two)
      .filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [posts, filterCountry]);
  useEffect(() => {
    if (filterCountry && !countryOptions.includes(filterCountry)) setFilterCountry("");
  }, [countryOptions, filterCountry]);

  useEffect(() => {
    setPage(1);
  }, [filterTo, filterCountry, refresh, token]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const visible = filtered.slice(start, end);

  if (!filtered.length) return <p className="posts-empty">No hay posts todavía.</p>;

  return (
    <div className="posts-layout">
      <aside className="posts-sidebar" role="toolbar" aria-label="Filtros">
        <button
          onClick={() => { setFilterTo(""); setFilterCountry(""); }}
          className="posts-filter-btn"
          aria-pressed={!filterTo && !filterCountry}
        >
          Todas
        </button>
        {sidebarCurrencies.map((c) => {
          const symbol = currencySymbols[c] || c;
          const isActive = filterTo === c;
          return (
            <button key={c} onClick={() => setFilterTo(c)} className="posts-filter-btn" aria-pressed={isActive}>
              <span className="front">{c}</span>
              <span className="back">{symbol}</span>
            </button>
          );
        })}
      </aside>

      <div>
        <div className="posts-header">
          <span>Usuario</span>
          <span className="filter-destino">
            <label htmlFor="country-filter" className="filter-label">Destino:</label>
            <select
              id="country-filter"
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="country-filter__select"
            >
              <option value="">Todos los países</option>
              {countryOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </span>
          <span>Intercambio</span>
          <span>Fecha</span>
        </div>

        <ul className="posts-list">
          {visible.map((post) => {
            const author = users.find((u) => u.id === post.user_id);
            return (
              <li key={post.id} className="post-item">
                <div className="post-body-horizontal">
                  <div className="post-user">
                    <img src={author?.image || "../../rigo-baby.jpg"} alt="avatar" className="post-avatar" />
                    <h4 className="post-author">{author?.username}</h4>
                  </div>
                  <section className="post-info">
                    <div className="detail">
                      <span className="value">{post.destination}</span>
                    </div>
                  </section>
                  <section className="post-money">
                    <div className="detail detail--amount">
                      <span className="value value--stack">
                        <span>{post.description} {post.divisas_one}</span>
                        <PlaneLanding size={18} className="text-gold" />
                        <span>{post.divisas_two}</span>
                      </span>
                    </div>
                  </section>
                  <section className="post-date">
                    <div className="detail">
                      <span className="value">{post.day_exchange ? post.day_exchange : "Por concretar"}</span>
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

        <nav className="posts-pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
          <span>{page} de {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
        </nav>
      </div>
    </div>
  );
};