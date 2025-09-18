import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { CreatePost } from "../../../components/posts/CreatePost";
import { PostList } from "../../../components/posts/PostList";
import "./postpage.css";

export const PostsPage = () => {
  const { token } = useAuth();
  const [refresh, setRefresh] = useState(0);

  if (!token) return <p>Inicia sesión para crear posts.</p>;

  return (
    <>
      <div className="posts-page">
        <CreatePost onSuccess={() => setRefresh(r => r + 1)} />
        <h1 className="tittle-post-page">Publicaciones</h1>
        
        <PostList refresh={refresh} />
      </div>
    </>
  );
};