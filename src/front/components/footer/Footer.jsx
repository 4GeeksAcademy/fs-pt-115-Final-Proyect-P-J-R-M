import "./footer.css"

export const Footer = () => {

    return (
      <>
      <footer>
        <div className="footer-content">
          <div className="footer-links">
            <a href="/TermsAndConditions">Términos y Condiciones</a>
            <a href="/PrivacyPolicy">Política de Privacidad</a>
            <a href="#">Soporte</a>
          </div>
          <p>
            &copy; 2025 Hand to Hand. Todos los derechos reservados.
          </p>
        </div>
      </footer>
      </>
    )
}