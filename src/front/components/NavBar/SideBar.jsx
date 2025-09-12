import "./sidebar.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
export function UserMenuSidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const go = (path) => () => { onClose?.(); navigate(path); };
  const handleLogout = () => { onClose?.(); logout(); navigate("/"); };

  return (
    <>
      <div className={`ums-overlay ${open ? "show" : ""}`}
        onClick={onClose}
      />
      <aside className={`ums-panel ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <nav className="ums-content">
          <ul className="ums-menu">
            <li><button onClick={go("/profile")}>Perfil</button></li>
            <li><button onClick={go("/chats")}>Chats</button></li>
            <li><button onClick={go("/posts")}>Posts</button></li>
            <li><button onClick={go("/dasborde")}>Dashboard</button></li>
          </ul>
          <button className="btn-logout ums-full" onClick={handleLogout}>Logout</button>
        </nav>
      </aside>
    </>
  );
}