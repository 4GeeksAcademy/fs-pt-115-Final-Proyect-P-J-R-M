import "./footer.css"

export const Footer = () => {

  return (
    <>
      <footer>
        <div className="footer-content">
          <div className="footer-links">
            <a href="/terms-and-conditions">Términos y Condiciones</a>
            <a href="/legal/privacy-policy">Política de Privacidad</a>
            <a href="/support">Soporte</a>
          </div>
          <p>
            &copy; 2025 Hand to Hand. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </>
  )
}