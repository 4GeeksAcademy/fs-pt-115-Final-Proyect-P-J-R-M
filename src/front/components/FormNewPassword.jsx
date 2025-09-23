import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import "../pages/auth/login/login.css";
import "../index.css";
import { Link } from 'react-router-dom';


const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const FormNewPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage('❌ Token inválido o ausente');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('❌ Las contraseñas no coinciden');
      return;
    }

    if (typeof newPassword !== 'string' || newPassword.trim().length < 6) {
      setMessage('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/api/users/reset-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Contraseña actualizada correctamente');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(`❌ Error: ${data.msg || 'Algo salió mal'}`);
      }
    } catch (error) {
      setMessage('❌ Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">Restablecer Contraseña</h1>

        <label htmlFor="newPassword" className="sr-only">Nueva contraseña:</label>
        <input
          id="newPassword"
          className="login-input"
          type="password"
          name="newPassword"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <label htmlFor="confirmPassword" className="sr-only">Confirmar contraseña:</label>
        <input
          id="confirmPassword"
          className="login-input"
          type="password"
          name="confirmPassword"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button className="login-button" type="submit" disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>

        {message && (
          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text)' }}>
            {message}
          </p>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/" className="login-link">
            Volver a la página principal
          </Link>
        </div>
      </form>
    </div>
  );
};
