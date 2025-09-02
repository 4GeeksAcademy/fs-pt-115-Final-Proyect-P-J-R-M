export const PostList = ({ posts = [] }) => {
  if (!posts.length) return <p>No hay posts todavía.</p>;

  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>
          <strong>{p.destination}</strong> — {p.description} ({p.divisas_one} → {p.divisas_two})
        </li>
      ))}
    </ul>
  );
};