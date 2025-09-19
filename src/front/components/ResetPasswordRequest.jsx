import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "../pages/auth/login/login.css";
import "../index.css";


export function ResetPasswordRequest() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
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

      setMessage('✅ Correo enviado. Por favor, revisa tu bandeja de entrada.');
      setShowResendOption(true);
    } catch (error) {
      setMessage(`❌ ${error.message}`);
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
          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text)' }}>
            {message}
          </p>
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
            ¿No has recibido tu correo? Revisa tu carpeta de spam o vuelve a intentarlo más tarde.
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
