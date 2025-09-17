import { useAuth } from "../../hooks/useAuth";
import "./button-avatar.css";

export function ButtonAvatar({ onClick}) {
  const { user } = useAuth();
  const initial = user?.username
    .charAt(0)
    .toUpperCase();

  return (
    <button
      type="button"
      className="btn-avatar"
      onClick={onClick}
    >
      {user?.image ? (
        <img src={user.image || "../../rigo-baby.jpg"} className="btn-avatar__img" alt="avatar" />
      ) : (
        <span className="btn-avatar__fallback">{initial}</span>
      )}
    </button>
  );
}