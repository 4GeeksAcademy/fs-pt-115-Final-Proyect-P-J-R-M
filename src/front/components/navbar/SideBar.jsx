import { useEffect, useRef } from "react";
import "./sidebar.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { CircleQuestionMark, CircleUserRound, Landmark, Mail, MessageCircleMore } from "lucide-react";
import { ButtonAvatar } from "./ButtonAvatar";

export function UserMenuSidebar({ open, onClose, restoreFocusTo }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const panelRef = useRef(null);
  const prevFocusedRef = useRef(null);

  const go = (path) => () => {
    onClose?.();
    navigate(path);
  };

  const handleLogout = () => {
    onClose?.();
    logout();
    navigate("/");
  };
  
  // Esc para cerrar + bloqueo de scroll + gestión de foco accesible
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        e.stopPropagation();
        onClose?.();
      }
    };

    if (open) {
      // guardar elemento con foco
      prevFocusedRef.current = document.activeElement;

      // bloquear scroll
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // enfocar primer elemento "focusable" dentro del panel
      requestAnimationFrame(() => {
        const container = panelRef.current;
        if (!container) return;
        const focusable = container.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (focusable || container).focus();
      });

      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        document.removeEventListener("keydown", onKeyDown);

        // devolver foco al disparador
        if (restoreFocusTo && restoreFocusTo.current) {
          restoreFocusTo.current.focus();
        } else if (prevFocusedRef.current?.focus) {
          prevFocusedRef.current.focus();
        }
      };
    }
  }, [open, onClose, restoreFocusTo]);

  return (
    <>
      <div
        className={`ums-overlay ${open ? "show" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        id="user-menu"
        className={`ums-panel ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-menu-title"
        ref={panelRef}
        tabIndex={-1}
      >
        <nav className="ums-content">
          <h2 id="user-menu-title" className="ums-visually-hidden">
            Menú de usuario
          </h2>

          <ul className="ums-menu">
            <header className="ums-header"><ButtonAvatar />{user?.username}</header>
            <li><button onClick={go("/dasborde")}><CircleUserRound size={30} color="#d4af37" strokeWidth={1.25} absoluteStrokeWidth />Perfil</button></li>
            <li><button onClick={go("/posts")}><Landmark size={30} color="#d4af37" strokeWidth={1.25} absoluteStrokeWidth />Posts</button></li>
            <li><button onClick={go("/chats")}><MessageCircleMore size={30} color="#d4af37" strokeWidth={1.25} absoluteStrokeWidth />Chats</button></li>
          </ul>

          <div className="ums-links">
            <Mail size={16} color="#d4af37" strokeWidth={1.25} />
            <a href="/support">Contacto</a>
            <CircleQuestionMark size={16} color="#d4af37" strokeWidth={1.25} />
            <a href="/support">Preguntas Frecuentes / Chatbot</a>
          </div>

          <button className="btn-logout ums-full" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
}
