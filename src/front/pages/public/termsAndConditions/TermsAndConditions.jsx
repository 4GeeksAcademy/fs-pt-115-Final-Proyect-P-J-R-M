import "./terms-and-conditions.css"

export const TermsAndConditions = () => {
  return (
    <section className="terms-wrapper">
      <div className="terms-container">
        <article className="terms-content">
          <h1 className="terms-title">Términos y Condiciones de Uso</h1>
          <p className="terms-updated"><strong>Última actualización:</strong> 30 de septiembre de 2025</p>
          <p><strong>Plataforma:</strong> <span className="highlight">Hand to Hand</span></p>

          <h2>1. Objeto del Servicio</h2>
          <p>
            Hand to Hand es una plataforma digital cuyo propósito es poner en contacto a personas que deseen intercambiar divisas de forma particular, directa y voluntaria.
            Hand to Hand <strong>no</strong> realiza intermediación financiera, no ejecuta ni procesa transacciones monetarias, ni actúa como casa de cambio, banco o entidad autorizada.
          </p>

          <h2>2. Condiciones de Uso</h2>
          <ul>
            <li>El uso de la plataforma implica aceptación total de estos términos.</li>
            <li>Solo usuarios mayores de 18 años pueden registrarse.</li>
            <li>El usuario es responsable de la información que proporciona y de los acuerdos que celebre con otros usuarios.</li>
          </ul>

          <h2>3. Naturaleza del Servicio</h2>
          <p>
            Hand to Hand no gestiona, verifica ni valida los intercambios ni actúa como intermediario en ningún acuerdo entre usuarios.
            Las herramientas informativas disponibles son meramente orientativas.
          </p>

          <h2>4. Limitación de Responsabilidad</h2>
          <p>
            Hand to Hand no asume responsabilidad por pérdidas económicas, estafas, conflictos, ni incidentes ocurridos como resultado del uso de la plataforma.
            Todo uso se realiza bajo exclusiva responsabilidad del usuario.
          </p>

          <h2>5. Suspensión o Eliminación de Cuentas</h2>
          <p>
            Se podrá suspender o eliminar una cuenta ante conductas sospechosas, fraudulentas, o que violen estos términos.
          </p>

          <h2>6. Protección de Datos</h2>
          <p>
            Cumplimos con el Reglamento General de Protección de Datos (RGPD). Consulta nuestra Política de Privacidad para más información.
            Puedes ejercer tus derechos escribiendo a <a href="mailto:privacidad@handtohand.exchange">privacidad@handtohand.exchange</a>.
          </p>

          <h2>7. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos. El uso continuado implica la aceptación de los cambios.
          </p>

          <h2>8. Legislación Aplicable</h2>
          <p>
            Estos términos se rigen por la legislación internacional con atención especial a la normativa europea.
            En caso de disputa, se aplicará la jurisdicción correspondiente dentro del Espacio Económico Europeo (EEE).
          </p>

          <h2>9. Contacto</h2>
          <p>
            Para cualquier consulta, puedes escribirnos a <a href="mailto:contacto@handtohand.exchange">contacto@handtohand.exchange</a>.
          </p>
        </article>

        <aside className="terms-warning">
          <strong>Advertencia:</strong> Hand to Hand no es una entidad financiera ni está autorizada como proveedor de servicios de pago.
          Es responsabilidad del usuario cumplir con la normativa aplicable en materia de cambio de divisas.
        </aside>
      </div>
    </section>
  );
};
