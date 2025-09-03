import { useState } from "react";
import { createPost } from "../../../services/postApi"
import { useAuth } from "../../../hooks/useAuth";

const INITIAL = {
    destination: "",
    description: "",
    divisas_one: "EUR",
    divisas_two: "USD",
};

const CURRENCIES = ["EUR", "USD", "GBP", "JPY", "MXN", "ARS"];

export const CreatePost = ({ onSuccess }) => {
    const [form, setForm] = useState(INITIAL);
    const [error, setError] = useState("");
    const { token } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.destination.trim() || !form.description.trim()) {
            setError("Destino y descripción son obligatorios");
            return;
        }
        if (form.divisas_one === form.divisas_two) {
            setError("Las divisas no pueden ser iguales");
            return;
        }
        if (!token) {
            setError("No hay sesión iniciada");
            return;
        }

        try {
            await createPost(form, token);
            setForm(INITIAL);
            onSuccess?.();
        } catch {
            setError("Error al crear el post");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Crear post</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <label>
                Divisa origen
                <select name="divisas_one" value={form.divisas_one} onChange={handleChange}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </label>

            <label>
                Divisa destino
                <select name="divisas_two" value={form.divisas_two} onChange={handleChange}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </label>

            <label>
                Destino
                <input
                    type="text"
                    name="destination"
                    value={form.destination}
                    onChange={handleChange}
                    placeholder="Ciudad o zona"
                />
            </label>

            <label>
                Descripción
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Detalles del cambio"
                />
            </label>

            <button type="submit">Crear</button>
        </form>
    );
};