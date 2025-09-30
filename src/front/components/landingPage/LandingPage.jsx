import { useEffect } from "react";
import "./landing-page.css";
import { VideoPerrete } from "../VideoPerrete/VideoPerrete";
import { CurrencyConverter } from "../currencyConverter/CurrencyConverter";
import { BankingGraphics } from "../BankingGraphics/BankingGraphics";
import { Link } from "react-router-dom";
import {
	BadgeDollarSign,
	Handshake,
	ShieldCheck,
	HandCoins,
	ChartNoAxesCombined,
	HeartHandshake,
	MonitorSmartphone,
	Users,
	BriefcaseBusiness,
	MessagesSquare
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import PublicRating from "../public-rating/PublicRating";

export default function LandingPage() {
	const { token } = useAuth();

	useEffect(() => {
		const anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
		const handleAnchorClick = (e) => {
			const href = e.currentTarget.getAttribute("href");
			const target = document.querySelector(href);
			if (target) {
				e.preventDefault();
				// ⚠️ CAMBIO 1: en iOS el smooth puede romper -> usar "auto"
				target.scrollIntoView({ behavior: "auto", block: "start" });
			}
		};
		anchors.forEach((a) => a.addEventListener("click", handleAnchorClick));

		const nav = document.querySelector("nav");
		const onScroll = () => {
			if (!nav) return;
			if (window.scrollY > 50) {
				nav.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
			} else {
				nav.style.boxShadow = "none";
			}
		};
		window.addEventListener("scroll", onScroll);

		// ⚠️ CAMBIO 2: usar clases en vez de estilos inline para animaciones
		const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible"); // añadimos clase
				}
			});
		}, observerOptions);

		const cards = Array.from(
			document.querySelectorAll(".value-card, .feature-card")
		);
		cards.forEach((card) => {
			if (!card) return;
			observer.observe(card);
		});

		return () => {
			anchors.forEach((a) => a.removeEventListener("click", handleAnchorClick));
			window.removeEventListener("scroll", onScroll);
			cards.forEach((card) => observer.unobserve(card));
			observer.disconnect();
		};
	}, []);

	return (
		<>
			<main className="container">
				<section className="hero" id="inicio">
					<div className="hero-content">
						<div className="hero-text">
							<h1>
								Intercambio de divisas{" "}
								<span className="highlight">sin comisiones</span>
							</h1>
							<p>
								Publica tu oferta o encuentra la de otra persona. Conecta mediante
								chat seguro y cierra el intercambio en tu ciudad y moneda
								preferida.
							</p>
							<div className="trust-badges">
								<span className="badge">Sin comisiones ocultas</span>
								<span className="badge">Trato directo entre personas</span>
								<span className="badge">Plataforma segura</span>
							</div>
							<VideoPerrete />
						</div>

						<div className="hero-visual">
							<div className="value-cards">
								<div className="value-card">
									<div className="value-icon">
										<BadgeDollarSign
											size={35}
											color="#2c3e50"
											strokeWidth={1.5}
										/>
									</div>
									<h3>0% Comisiones</h3>
									<p>
										Intercambia sin pagar nada extra. Solo acuerdas el tipo de
										cambio con la otra persona.
									</p>
								</div>
								<div className="value-card">
									<div className="value-icon">
										<Handshake size={35} color="#2c3e50" strokeWidth={1.5} />
									</div>
									<h3>Acuerdos instantáneos</h3>
									<p>
										Encuentra a alguien interesado y conecta al instante mediante
										chat integrado.
									</p>
								</div>
								<div className="value-card">
									<div className="value-icon">
										<ShieldCheck size={35} color="#2c3e50" strokeWidth={1.5} />
									</div>
									<h3>Intercambio entre personas</h3>
									<p>
										Nosotros ponemos la plataforma, el acuerdo lo haces tú
										directamente con otro usuario.
									</p>
								</div>
								<div className="value-card">
									<div className="value-icon">
										<HandCoins size={36} color="#2c3e50" strokeWidth={1.5} />
									</div>
									<h3>150+ Monedas</h3>
									<p>
										Encuentra a alguien que busque tu moneda, desde EUR y USD
										hasta divisas exóticas.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="no-commission">
					<h2>¿Cansado de las comisiones abusivas?</h2>
					<p>
						En Hand to Hand creemos que cambiar dinero no debería costarte más
						dinero. Comparamos con la competencia:
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
							<span style={{ marginRight: "4px" }}>Hand to Hand:</span>
							<span>0% de comisión</span>
						</div>
					</div>
				</section>

				<section className="features" id="servicios">
					<div className="container">
						<h2 className="section-title">¿Por qué elegir Hand to Hand?</h2>
						<p className="section-subtitle">
							No somos un banco ni una casa de cambio. Somos el punto de
							encuentro para que usuarios se conecten y acuerden su propio
							intercambio de divisas.
						</p>
						<div className="features-grid">
							<div className="feature-card">
								<div className="feature-icon">
									<ChartNoAxesCombined
										size={44}
										color="#2c3e50"
										strokeWidth={1.5}
									/>
								</div>
								<h3>Tipos de cambio reales</h3>
								<p>
									Consulta el mercado en tiempo real y acuerda directamente con
									la otra persona el tipo de cambio que más te convenga.
								</p>
							</div>
							<div className="feature-card">
								<div className="feature-icon">
									<HeartHandshake
										size={44}
										color="#2c3e50"
										strokeWidth={1.5}
									/>
								</div>
								<h3>Intercambio HTH</h3>
								<p>
									Todo ocurre entre personas: uno publica un post con su oferta y
									otro usuario interesado abre un chat para cerrar el trato.
								</p>
							</div>
							<div className="feature-card">
								<div className="feature-icon">
									<MonitorSmartphone
										size={44}
										color="#2c3e50"
										strokeWidth={1.5}
									/>
								</div>
								<h3>Plataforma moderna</h3>
								<p>
									Interfaz intuitiva disponible en web y móvil. Gestiona tus
									intercambios desde cualquier lugar en segundos.
								</p>
							</div>
							<div className="feature-card">
								<div className="feature-icon">
									<Users size={44} color="#2c3e50" strokeWidth={1.5} />
								</div>
								<h3>Para empresas y particulares</h3>
								<p>
									Tanto si viajas, como si tienes negocio internacional, encuentra
									personas con quienes intercambiar divisas de forma rápida.
								</p>
							</div>
							<div className="feature-card">
								<div className="feature-icon">
									<BriefcaseBusiness
										size={44}
										color="#2c3e50"
										strokeWidth={1.5}
									/>
								</div>
								<h3>Gestión flexible</h3>
								<p>
									Publica tus propias condiciones, acepta las de otros usuarios o
									negocia el intercambio a tu medida.
								</p>
							</div>
							<div className="feature-card">
								<div className="feature-icon">
									<MessagesSquare
										size={44}
										color="#2c3e50"
										strokeWidth={1.5}
									/>
								</div>
								<h3>Chat integrado</h3>
								<p>
									Comunícate con la otra parte en tiempo real antes de cerrar
									cualquier intercambio.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="tools" id="herramientas">
					<div className="container">
						<h2 className="section-title">Herramientas profesionales</h2>
						<div className="tools-grid">
							<div className="tool-placeholder">
								<h3>📊 Monitor de tipos de cambio</h3>
								{/* <BankingGraphics /> */}
							</div>
							<div className="tool-placeholder">
								<h3>🧮 Calculadora de conversión</h3>
								{/* <CurrencyConverter /> */}
							</div>
						</div>
					</div>
				</section>
			</main>

			<section className="cta-section" id="contacto">
				<div className="container">
					<h2>Comienza a ahorrar en tus cambios de divisas</h2>
					<p>
						Únete a miles de personas que ya intercambian directamente sin
						comisiones ni intermediarios bancarios.
					</p>
				</div>
				<Link to="/signup" className="btn-primary">
					¿Aún no estás registrado?
				</Link>
			</section>

			<section
				className="score-section"
				style={{ textAlign: "center", marginTop: "2rem" }}
			>
				{/* <PublicRating /> */}
			</section>
		</>
	);
}
