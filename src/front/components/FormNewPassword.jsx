import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import "../pages/auth/login/login.css";
import "../index.css";
import { Link } from 'react-router-dom';
import { CircleCheckBig, CircleX } from "lucide-react";



const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const FormNewPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage(
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <CircleX size={35} color="#ed0202" strokeWidth={0.5} />
          <span>Token inválido o ausente.</span>
        </div>
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage(
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <CircleX size={35} color="#ed0202" strokeWidth={0.5} />
          <span>Las contraseñas no coinciden.</span>
        </div>
      );
      return;
    }

    if (typeof newPassword !== 'string' || newPassword.trim().length < 6) {
      setMessage(
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <CircleX size={35} color="#ed0202" strokeWidth={0.5} />
          <span>Las contraseñas deben tener al menos 6 cartcteres.</span>
        </div>
      );
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
        setMessage(
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <CircleCheckBig size={35} color="#d4af37" strokeWidth={0.5} />
            <span>Contraseña actualizada correctamente.</span>
          </div>
        );
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <CircleX size={35} color="#ed0202" strokeWidth={0.5} />
          <span>Error: {data.msg || 'Algo salió mal'}</span>
        </div>
        );
      }
    } catch (error) {
      setMessage(
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <CircleX size={35} color="#ed0202" strokeWidth={0.5} />
          <span>Error de conexión con el servidor</span>
        </div>
      );
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
