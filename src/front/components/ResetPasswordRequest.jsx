import React, { useState } from 'react';
import axios from 'axios';

export function ResetPasswordRequest() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/request-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || 'Error al enviar el correo');
    }

    setMessage(data.msg);
  } catch (error) {
    setMessage(error.message);
  }
};

  return (
    <div>
      <h2>Restablecer contraseña</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Ingresa tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Enviar </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}



