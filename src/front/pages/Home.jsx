import { CurrencyConverter } from "../components/currencyConverter/CurrencyConverter";
import { BankingGraphics } from "../components/BankingGraphics/BankingGraphics"
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";


export const Home = () => {
	const { signUp, login, token, error } = useAuth()
	const newUser =
	{
		username: "username",
		email: "email",
		password: "password",
		dni: "dni",
		image: "image",
		country: "country",
		score: "score"
	}

	return (
		<>
			<h1>hellow</h1>
			{error && <p>{error}</p>}
			<p>{token}</p>
			<button onClick={() => login({ email: newUser.email, password: newUser.password })} className="btn btn-success">Login</button>
			<button onClick={() => signUp(newUser)} className="btn btn-success">Sign Up</button>

			{/* enlace para restablecer contraseña */}
			<div style={{ marginTop: "20px" }}>
				<Link to="/request-reset" style={{ color: "#007BFF", textDecoration: "none" }}>
					¿Olvidaste tu contraseña?
				</Link>
			</div>
			<CurrencyConverter />
			<BankingGraphics />
		</>

	)
}; 