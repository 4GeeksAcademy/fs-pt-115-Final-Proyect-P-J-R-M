import React, { useState } from 'react';

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
          Restablecer contraseña
        </h2>

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Correo electrónico:</label>
        <input
          type="email"
          placeholder="Ingresa tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          Enviar
        </button>

        {message && (
          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#2c3e50' }}>{message}</p>
        )}

        {showResendOption && (
          <p
            style={{
              marginTop: '1rem',
              fontSize: '0.9rem',
              textAlign: 'center',
              color: '#7f8c8d',
            }}
          >
            ¿No has recibido tu correo? Revisa tu carpeta de spam o vuelve a intentarlo más tarde.
          </p>
        )}
      </form>
    </div>
  );
}
