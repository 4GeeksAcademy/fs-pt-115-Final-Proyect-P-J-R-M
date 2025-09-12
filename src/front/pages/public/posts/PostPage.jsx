import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { CreatePost } from "../../../components/posts/CreatePost";
import { PostList } from "../../../components/posts/PostList";

export const PostsPage = () => {
  const { token } = useAuth();
  const [refresh, setRefresh] = useState(0);

  if (!token) return <p>Inicia sesión para crear posts.</p>;

  return (
    <>
      <CreatePost onSuccess={() => setRefresh(r => r + 1)} />
      <h3>Posts existentes</h3>
      <PostList refresh={refresh} /> 
    </>
  );
};