import "./privacy-policy.css";

export const PrivacyPolicy = () => {
  return (
    <>
      <section className="privacy-wrapper">
        <div className="privacy-container">
          <article className="privacy-content">
            <h1 className="privacy-title">Política de Privacidad</h1>
            <p className="privacy-updated"><strong>Última actualización:</strong> 30 de septiembre de 2025</p>
            <p><strong>Plataforma:</strong> <span className="highlight">Hand to Hand</span></p>

            <h2>1. Responsable del Tratamiento</h2>
            <p>
              <strong>Titular:</strong> Hand to Hand<br />
              <strong>Contacto:</strong> <a href="mailto:privacidad@handtohand.exchange">privacidad@handtohand.exchange</a>
            </p>

            <h2>2. Datos que Recopilamos</h2>
            <ul>
              <li>Nombre y apellidos</li>
              <li>Correo electrónico</li>
              <li>País de residencia</li>
              <li>Idioma preferido</li>
              <li>Información del perfil</li>
              <li>Dirección IP y datos técnicos</li>
              <li>Actividad dentro de la plataforma</li>
            </ul>
            <p><strong>Nota:</strong> No se recopilan datos bancarios ni se procesan pagos.</p>

            <h2>3. Finalidad del Tratamiento</h2>
            <ul>
              <li>Gestionar cuentas de usuario</li>
              <li>Facilitar intercambios entre usuarios</li>
              <li>Enviar comunicaciones del servicio</li>
              <li>Mejorar la plataforma</li>
              <li>Cumplir obligaciones legales</li>
            </ul>

            <h2>4. Base Legal para el Tratamiento</h2>
            <ul>
              <li>Consentimiento del usuario</li>
              <li>Ejecución del contrato</li>
              <li>Interés legítimo</li>
              <li>Obligación legal</li>
            </ul>

            <h2>5. Conservación de los Datos</h2>
            <p>
              Conservamos los datos mientras la cuenta esté activa. Posteriormente, serán eliminados o anonimizados salvo obligación legal.
            </p>

            <h2>6. Destinatarios y Transferencias Internacionales</h2>
            <p>
              No compartimos datos con terceros salvo:
            </p>
            <ul>
              <li>Proveedores de servicios técnicos bajo confidencialidad</li>
              <li>Autoridades cuando sea requerido</li>
              <li>Transferencias internacionales con garantías adecuadas</li>
            </ul>

            <h2>7. Seguridad de los Datos</h2>
            <p>
              Aplicamos medidas técnicas y organizativas para proteger los datos contra accesos no autorizados o pérdida.
            </p>

            <h2>8. Derechos del Usuario</h2>
            <p>
              Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a:
              <a href="mailto:privacidad@handtohand.exchange"> privacidad@handtohand.exchange</a>
            </p>

            <h2>9. Cookies</h2>
            <p>
              Utilizamos cookies técnicas necesarias. Consulta nuestra Política de Cookies para más detalles.
            </p>

            <h2>10. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar esta política. Los cambios serán publicados en esta sección.
            </p>

            <h2>11. Contacto</h2>
            <p>
              Para cualquier consulta, escribe a:
              <a href="mailto:privacidad@handtohand.exchange"> privacidad@handtohand.exchange</a>
            </p>
          </article>
        </div>
      </section>
    </>
  );
};
