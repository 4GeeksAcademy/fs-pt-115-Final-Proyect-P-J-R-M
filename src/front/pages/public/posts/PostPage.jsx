import { useEffect, useMemo, useState } from "react";
import { getPosts } from "../../../services/postApi";
import { getUsers } from "../../../services/userApi";
import { useAuth } from "../../../hooks/useAuth";
import { CreatePost } from "../../../components/posts/CreatePost";
import { PostList } from "../../../components/posts/PostList";
import { DestinationCurrencyFilter } from "../../../components/posts/DestinationCurrencyFilter";

export const PostsPage = () => {
  const { token, error, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [to, setTo] = useState("");

  const fetchAll = async () => {
    if (!token) return;
    const [postsData, usersData] = await Promise.all([
      getPosts(token),
      getUsers(),
    ]);
    setPosts(Array.isArray(postsData) ? postsData : []);
    setUsers(Array.isArray(usersData) ? usersData : []);
  };

  useEffect(() => { if (token) fetchAll(); }, [token]);

  const userMap = useMemo(() => {
    const m = new Map();
    users.forEach(u => m.set(u.id, u));
    return m;
  }, [users]);

  const postsWithAuthor = useMemo(() => {
    return posts.map(p => ({
      ...p,
      author: p.author || userMap.get(p.user_id) || null,
    }));
  }, [posts, userMap]);

  const currencies = useMemo(() => {
    return Array.from(
      new Set(postsWithAuthor.map(p => String(p.divisas_two ?? "").trim()).filter(Boolean))
    ).sort();
  }, [postsWithAuthor]);

  const filteredPosts = useMemo(() => {
    return postsWithAuthor.filter(p => !to || String(p.divisas_two) === to);
  }, [postsWithAuthor, to]);

  const handleDeleted = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  if (!token) return <p>Inicia sesión para crear posts.</p>;

  return (
    <div style={{ display: "flex", gap: "16px" }}>
      <DestinationCurrencyFilter currencies={currencies} active={to} onSelect={setTo} />

      <div style={{ flex: 1 }}>
        <CreatePost onSuccess={fetchAll} />
        <hr />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <h3>Posts existentes</h3>
        <PostList
          posts={filteredPosts}
          currentUserId={user?.id}
          onDeleted={handleDeleted}
        />
      </div>
    </div>
  );
};