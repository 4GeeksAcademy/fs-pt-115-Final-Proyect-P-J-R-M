import { useState } from "react";
import { createPost } from "../../services/postApi";
import { useAuth } from "../../hooks/useAuth";

const INITIAL = {
  destination: "",
  description: "",
  divisas_one: "EUR",
  divisas_two: "USD",
  exchangeDate: "",
};

const CURRENCIES = ["EUR", "USD", "GBP", "JPY", "MXN", "ARS"];

function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const CreatePost = ({ onSuccess }) => {
  const [form, setForm] = useState(INITIAL);
  const { token, error, loading } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  
  console.log(form);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.destination.trim() || !form.description.trim()) return;
    if (form.divisas_one === form.divisas_two) return;
    if (!token) return;

    if (form.exchangeDate && form.exchangeDate < todayYMD()) return; 
     

    const payload = {
      destination: form.destination,
      description: form.description,
      divisas_one: form.divisas_one,
      divisas_two: form.divisas_two,
      day_exchange: form.exchangeDate || null,
    };

    await createPost(payload, token);
    setForm(INITIAL);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Crear post</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <label>
        Divisa origen
        <select
          name="divisas_one"
          value={form.divisas_one}
          onChange={handleChange}
          disabled={loading}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <label>
        Divisa destino
        <select
          name="divisas_two"
          value={form.divisas_two}
          onChange={handleChange}
          disabled={loading}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
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
          disabled={loading}
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
          disabled={loading}
        />
      </label>

      <label>
        Fecha prevista de intercambio (opcional)
        <input
          type="date"
          name="exchangeDate"
          min={todayYMD()}
          value={form.exchangeDate}
          onChange={handleChange}
          disabled={loading}
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Creando..." : "Crear"}
      </button>
    </form>
  );
};