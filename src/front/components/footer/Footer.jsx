import "./footer.css"
import { Link } from "react-router-dom"

export const Footer = () => {

    return (
      <>
      <footer>
        <div className="footer-content">
          <div className="footer-links">
            <Link to={"/terms-and-conditions"}>Terminos y Condiciones</Link>
            <Link to={"/legal/privacy-policy"}>Política de Privacidad</Link>
            <Link to={"/support"}>Soporte</Link>
          </div>
          <p>
            &copy; 2025 Hand to Hand. Todos los derechos reservados.
          </p>
        </div>
      </footer>
      </>
    )
}