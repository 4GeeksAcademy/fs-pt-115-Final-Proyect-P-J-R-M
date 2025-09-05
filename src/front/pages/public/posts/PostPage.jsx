import { useEffect, useMemo, useState } from "react";
import { getPosts } from "../../../services/postApi";
import { useAuth } from "../../../hooks/useAuth";
import { CreatePost } from "./CreatePost";
import { PostList } from "./PostList";
import { DestinationCurrencyFilter } from "./DestinationCurrencyFilter"; 

export const PostsPage = () => {

  const { token, error, user } = useAuth(); 
  const [posts, setPosts] = useState([]);
  const [to, setTo] = useState("");

  const fetchPosts = async () => {
    if (!token) return;
    const data = await getPosts(token); 
    setPosts(Array.isArray(data) ? data : []);
  };

  useEffect(() => { if (token) fetchPosts(); }, [token]);

  const currencies = useMemo(() => {
    return Array.from(new Set(posts.map(p => String(p.divisas_two ?? "").trim()).filter(Boolean))).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => !to || String(p.divisas_two) === to);
  }, [posts, to]);

  const handleDeleted = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id)); 
  };

  if (!token) return <p>Inicia sesión para crear posts.</p>;

  return (
    <div style={{ display: "flex", gap: "16px" }}>
      <DestinationCurrencyFilter currencies={currencies} active={to} onSelect={setTo} />

      <div style={{ flex: 1 }}>
        <CreatePost onSuccess={fetchPosts} />
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