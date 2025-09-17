import { useEffect } from "react";
import "./landing-page.css"

export default function App() {
  useEffect(() => {
    // Smooth scroll for navigation
    const anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
    const handleAnchorClick = (e) => {
      const href = e.currentTarget.getAttribute("href");
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    anchors.forEach((a) => a.addEventListener("click", handleAnchorClick));

    // Enhanced navbar scroll effect
    const nav = document.querySelector("nav");
    const onScroll = () => {
      if (window.scrollY > 50) {
        nav.style.background = "rgba(255, 255, 255, 0.98)";
        nav.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
      } else {
        nav.style.background = "rgba(255, 255, 255, 0.95)";
        nav.style.boxShadow = "none";
      }
    };
    window.addEventListener("scroll", onScroll);

    // Intersection Observer for cards
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    }, observerOptions);

    const cards = Array.from(
      document.querySelectorAll(".value-card, .feature-card")
    );
    cards.forEach((card) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(30px)";
      card.style.transition = "all 0.6s ease";
      observer.observe(card);
    });

    // Cleanup
    return () => {
      anchors.forEach((a) => a.removeEventListener("click", handleAnchorClick));
      window.removeEventListener("scroll", onScroll);
      cards.forEach((card) => observer.unobserve(card));
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Navigation */}
      {/* <nav>
        <div className="nav-container">
          <a href="#" className="logo">Hand to Hand</a>
          <ul className="nav-links">
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#servicios">Servicios</a></li>
            <li><a href="#herramientas">Herramientas</a></li>
            <li><a href="#contacto">Contacto</a></li>
          </ul>
          <button className="cta-nav">Comenzar intercambio</button>
        </div>
      </nav> */}

      {/* Hero Section */}
      <section className="hero" id="inicio">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              Intercambio de divisas <span className="highlight">sin comisiones</span>
            </h1>
            <p>
              Cambia tu dinero al mejor tipo de cambio del mercado. Más de 150 monedas
              disponibles con tecnología segura y transacciones instantáneas.
            </p>

            <div className="trust-badges">
              <span className="badge">Sin comisiones ocultas</span>
              <span className="badge">Tipos de cambio reales</span>
              <span className="badge">Transacciones seguras</span>
            </div>

            <div className="cta-buttons">
              <button className="btn-primary">Cambiar dinero ahora</button>
              <button className="btn-secondary">Ver tipos de cambio</button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="value-cards">
              <div className="value-card">
                <div className="value-icon">💸</div>
                <h3>0% Comisiones</h3>
                <p>Sin tarifas ocultas. Solo pagas el tipo de cambio real del mercado.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">⚡</div>
                <h3>Instantáneo</h3>
                <p>Cambios procesados en segundos. Tu dinero disponible de inmediato.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🔒</div>
                <h3>100% Seguro</h3>
                <p>Regulados por autoridades financieras. Tus fondos están protegidos.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🌍</div>
                <h3>150+ Monedas</h3>
                <p>Desde EUR y USD hasta monedas exóticas. Cobertura mundial completa.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* No Commission Highlight */}
      <section className="no-commission">
        <h2>¿Cansado de las comisiones abusivas?</h2>
        <p>
          En Hand to Hand creemos que cambiar dinero no debería costarte más dinero.
          Comparamos con la competencia:
        </p>

        <div className="commission-comparison">
          <div className="comparison-row">
            <span>Bancos clásicos:</span>
            <span>3-5% de comisión</span>
          </div>
          <div className="comparison-row">
            <span>Casas de cambio:</span>
            <span>2-4% de comisión</span>
          </div>
          <div className="comparison-row">
            <span>Otros exchanges:</span>
            <span>1-2% de comisión</span>
          </div>
          <div className="comparison-row">
            <span>Hand to Hand:</span>
            <span>0% de comisión</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="servicios">
        <div className="container">
          <h2 className="section-title">¿Por qué elegir Hand to Hand?</h2>
          <p className="section-subtitle">
            Más que un simple intercambio de divisas, somos tu socio financiero de confianza
            para todas tus necesidades de cambio de moneda.
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Tipos de cambio reales</h3>
              <p>
                Utilizamos los tipos de cambio interbancarios reales, sin márgenes ocultos.
                Lo que ves es exactamente lo que obtienes.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏦</div>
              <h3>Regulación completa</h3>
              <p>
                Autorizados y supervisados por las principales autoridades financieras
                europeas para garantizar tu seguridad.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Plataforma moderna</h3>
              <p>
                Interfaz intuitiva disponible en web y móvil. Realiza cambios desde cualquier
                lugar en segundos.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Para empresas y particulares</h3>
              <p>
                Soluciones adaptadas tanto para usuarios individuales como para empresas con
                necesidades de intercambio frecuente.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Gestión profesional</h3>
              <p>
                Herramientas avanzadas para programar cambios, alertas de tipos y gestión de
                riesgo cambiario.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3>Soporte experto</h3>
              <p>
                Equipo de especialistas en divisas disponible para asesorarte en tus
                operaciones más complejas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="tools" id="herramientas">
        <div className="container">
          <h2 className="section-title">Herramientas profesionales</h2>
          <div className="tools-grid">
            <div className="tool-placeholder">
              <h3>📊 Monitor de tipos de cambio</h3>
              <p>
                Aquí puedes integrar tu gráfico de monedas. Los usuarios podrán ver en
                tiempo real los tipos de cambio de las principales divisas mundiales con
                históricos y tendencias.
              </p>
            </div>
            <div className="tool-placeholder">
              <h3>🧮 Calculadora de conversión</h3>
              <p>
                Integra tu calculadora de cambio aquí. Permite a los usuarios calcular
                exactamente cuánto recibirán al cambiar entre cualquier par de divisas, sin
                sorpresas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="contacto">
        <div className="container">
          <h2>Comienza a ahorrar en tus cambios de divisas</h2>
          <p>
            Únete a miles de clientes que ya ahorran en comisiones y obtienen los mejores
            tipos de cambio del mercado
          </p>
        </div>
        <div className="container">
          <button className="btn-primary">Abrir cuenta gratuita</button>
        </div>
      </section>
    </>
  );
}
