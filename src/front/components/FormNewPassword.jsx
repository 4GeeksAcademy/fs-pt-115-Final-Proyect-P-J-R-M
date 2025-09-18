import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';


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

        console.log("DEBUG: Enviando contraseña =", newPassword);




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
    <div
      style={{
        background: '#e8e9ea',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '"Poltawski Nowy", serif',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#f0f0f0',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <h2 style={{ color: '#d4af37', textAlign: 'center', marginBottom: '1.5rem' }}>
          Restablecer Contraseña
        </h2>

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nueva contraseña:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            marginBottom: '1rem',
            fontFamily: '"Poltawski Nowy", serif',
          }}
        />

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Confirmar contraseña:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            marginBottom: '1.5rem',
            fontFamily: '"Poltawski Nowy", serif',
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '6px',
            border: 'none',
            background: 'linear-gradient(135deg, #d4af37, #f0f0f0)',
            color: '#fff',
            fontWeight: '600',
            fontSize: '1rem',
            fontFamily: '"Poltawski Nowy", serif',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>

        {message && (
          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#2c3e50' }}>{message}</p>
        )}
      </form>
    </div>
  );
 };
