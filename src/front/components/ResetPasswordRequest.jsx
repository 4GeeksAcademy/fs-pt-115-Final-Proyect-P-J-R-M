import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "../pages/auth/login/login.css";
import "../index.css";
import { CircleCheckBig, CircleX } from "lucide-react";

export function ResetPasswordRequest() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null); 
  const [showResendOption, setShowResendOption] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/request-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Error al enviar el correo');
      }

      setMessage(
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <CircleCheckBig size={35} color="#d4af37" strokeWidth={0.5} />
          <span>Correo enviado. Por favor, revisa tu bandeja de entrada.</span>
        </div>
      );
      setShowResendOption(true);
    } catch (error) {
      setMessage(
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <CircleX size={35} color="#ed0202" strokeWidth={0.5} />
          <span>{error.message}</span>
        </div>
      );
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">Restablecer contraseña</h1>

        <label htmlFor="email" className="sr-only">Correo electrónico:</label>
        <input
          id="email"
          className="login-input"
          type="email"
          name="email"
          placeholder="Ingresa tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button className="login-button" type="submit">
          Enviar
        </button>

        {message && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text)' }}>
            {message}
          </div>
        )}

        {showResendOption && (
          <p
            style={{
              marginTop: '1rem',
              fontSize: '0.9rem',
              textAlign: 'center',
              color: 'var(--color-muted)',
            }}
          >
            ¿No has recibido tu correo? <br/>
             Revisa tu carpeta de spam o vuelve a intentarlo más tarde.
          </p>
        )}

        <div style={{ marginTop: '20px' }}>
          <Link to="/login" className="login-link">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </form>
    </div>
  );
}
