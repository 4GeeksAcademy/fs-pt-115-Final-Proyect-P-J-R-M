import { useEffect, useState } from "react";
import { getPosts } from "../../../services/postApi";
import { useAuth } from "../../../hooks/useAuth";
import { CreatePost } from "./CreatePost";
import { PostList } from "./PostList";

export const PostsPage = () => {
    const { token } = useAuth();
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState("");

    const fetchPosts = async () => {
        setError("");
        if (!token) return;
        try {
            const data = await getPosts(token);
            setPosts(data);
        } catch {
            setError("Error al cargar posts");
        }
    };

    useEffect(() => {
        if (token) fetchPosts();
    }, [token]);

    if (!token) {
        return <p>Inicia sesión crear posts.</p>;
    }

    return (
        <div>
            <CreatePost onSuccess={fetchPosts} />
            <hr />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <h3>Posts existentes</h3>
            <PostList posts={posts} />
        </div>
    );
};