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
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '2rem' }}>
            <h2>Restablecer Contraseña</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nueva contraseña:</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Confirmar contraseña:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
            </form>
            {message && <p style={{ marginTop: '2rem' }}>{message}</p>}
        </div>
    );
};
