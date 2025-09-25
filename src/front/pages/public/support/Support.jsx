import "./support.css";
import { SupportChat } from "../../../components/supportChat/supportChat";

export const Support = () => {
  return (
    <>
      <section className="support-wrapper">
        <div className="support-container">
          <article className="support-content">
            <h1 className="support-title">Centro de Soporte</h1>
            <p className="support-updated">
              <strong>Última actualización:</strong> 30 de septiembre de 2025
            </p>
            <a href="#perretebot" className="btn btn-outline-warning">Ir al chatbot</a>
            <p>
              <strong>Plataforma:</strong>{" "}
              <span className="highlight">Hand to Hand</span>
            </p>

            <h2>1. Preguntas Frecuentes (FAQ)</h2>
            <ul className="faq-list">
              <li>
                <strong>¿Es Hand to Hand una casa de cambio?</strong><br />
                No. Hand to Hand es una plataforma de contacto entre usuarios. No
                realizamos operaciones de cambio ni actuamos como intermediarios
                financieros.
              </li>
              <li>
                <strong>¿Qué pasa si tengo un problema con otro usuario?</strong><br />
                Te recomendamos contactar directamente con el otro usuario e
                intentar resolver la situación de forma amistosa. Hand to Hand no
                media ni valida los acuerdos entre partes.
              </li>
              <li>
                <strong>¿Puedo eliminar mi cuenta?</strong><br />
                Sí. Puedes solicitar la eliminación de tu cuenta escribiéndonos a{" "}
                <a href="mailto:soporte@handtohand.exchange">
                  soporte@handtohand.exchange
                </a>.
              </li>
              <li>
                <strong>¿Cómo protegen mis datos?</strong><br />
                Cumplimos con el RGPD. Puedes conocer más en nuestra{" "}
                <a href="/legal/privacy-policy">Política de Privacidad</a>.
              </li>
            </ul>

            <h2>2. ¿Necesitas Ayuda Personalizada?</h2>
            <p>
              Si no encontraste lo que buscabas en nuestras preguntas frecuentes,
              puedes escribirnos directamente:
            </p>
            <ul className="contact-list">
              <li>
                <strong>Soporte general:</strong>{" "}
                <a href="mailto:soporte@handtohand.exchange">
                  soporte@handtohand.exchange
                </a>
              </li>
              <li>
                <strong>Privacidad y datos personales:</strong>{" "}
                <a href="mailto:privacidad@handtohand.exchange">
                  privacidad@handtohand.exchange
                </a>
              </li>
              <li>
                <strong>Consultas legales:</strong>{" "}
                <a href="mailto:legal@handtohand.exchange">
                  legal@handtohand.exchange
                </a>
              </li>
            </ul>

            <h2>3. Seguridad y Reportes</h2>
            <p>
              Si detectas una conducta sospechosa, estafa o uso indebido de la
              plataforma, por favor repórtalo inmediatamente a{" "}
              <a href="mailto:seguridad@handtohand.exchange">
                seguridad@handtohand.exchange
              </a>. Tu colaboración es clave para mantener una comunidad segura.
            </p>

            <h2>4. Disponibilidad del Soporte</h2>
            <p>
              Nuestro equipo responde a consultas de lunes a viernes, de 9:00 a
              17:00 (CET). Nos esforzamos por responder en un plazo máximo de 48
              horas hábiles.
            </p>
          </article>

          <aside className="support-tip">
            <strong>Consejo:</strong> Antes de intercambiar divisas, verifica cuidadosamente
            la reputación y datos del otro usuario. Nunca compartas contraseñas ni
            información sensible.
          </aside>
        </div>
      </section>
      <section id="perretebot">
        <SupportChat />
      </section>
    </>
  );
};
