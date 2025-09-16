import { useState } from "react";
import { createPost } from "../../services/postApi";
import { useAuth } from "../../hooks/useAuth";
import "./createpost.css";

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
    <form onSubmit={handleSubmit} className="create-post">
      <h2 className="create-post__title">Crear post</h2>
      <div className="row row-2">
        <label className="field">
          <span className="label">Divisa origen</span>
          <select
            name="divisas_one"
            value={form.divisas_one}
            onChange={handleChange}
            disabled={loading}
            className="control"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="label">Divisa destino</span>
          <select
            name="divisas_two"
            value={form.divisas_two}
            onChange={handleChange}
            disabled={loading}
            className="control"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="row row-2">
        <label className="field">
          <span className="label">Destino</span>
          <input
            type="text"
            name="destination"
            value={form.destination}
            onChange={handleChange}
            placeholder="Ciudad o zona"
            disabled={loading}
            className="control"
          />
        </label>

        <label className="field">
          <span className="label">Cantidad prevista</span>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            disabled={loading}
            className="control"
          />
        </label>
      </div>

      <div className="row row-2 end">
        <label className="field">
          <span className="label">Fecha prevista de intercambio</span>
          <input
            type="date"
            name="exchangeDate"
            min={todayYMD()}
            value={form.exchangeDate}
            onChange={handleChange}
            disabled={loading}
            className="control"
          />
        </label>

        <div className="actions">
          <button type="submit" disabled={loading} className="signup-button">
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </form>
  );
};