import { useEffect, useState } from "react";
import { createPost } from "../../services/postApi";
import { getCurrencies } from "../../services/frankfurterApi";
import { useAuth } from "../../hooks/useAuth";
import "./createpost.css";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import Swal from "sweetalert2";
import "../../index.css";
import { City } from "country-state-city";
countries.registerLocale(enLocale);

const countryNames = countries.getNames("en", { select: "official" });
const countryList = Object.entries(countryNames);

const INITIAL = {
  country: "",
  city: "",
  description: "",
  divisas_one: "EUR",
  divisas_two: "USD",
  exchangeDate: "",
};

function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const CreatePost = ({ onSuccess }) => {
  const [form, setForm] = useState(INITIAL);
  const { token, loading } = useAuth();
  const [currencies, setCurrencies] = useState({});
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const data = await getCurrencies();
        setCurrencies(data);
      } catch (err) {
        setCurrencies("Error al cargar monedas");
      }
    };
    loadCurrencies();
  }, []);

  useEffect(() => {
    if (!form.country) {
      setCities([]);
      return;
    }
    const iso = countries.getAlpha2Code(form.country, "en");
    if (!iso) {
      setCities([]);
      return;
    }
    const list = City.getCitiesOfCountry(iso) || [];
    list.sort((a, b) => a.name.localeCompare(b.name));
    setCities(list);
  }, [form.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "country") {
      setForm((prev) => ({ ...prev, country: value, city: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    const payload = {
      destination: `${form.city ? form.city + (form.country ? ", " : "") : ""}${form.country || ""}`,
      description: form.description,
      divisas_one: form.divisas_one,
      divisas_two: form.divisas_two,
      day_exchange: form.exchangeDate || null,
    };
    await createPost(payload, token);
    setForm(INITIAL);
    onSuccess?.();
    try {
      Swal.fire({
        icon: "success",
        title: "¡Post creado!",
        text: "Tu post ha sido publicado correctamente.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No se pudo crear el post. Intenta otra vez.",
      });
    }
  };

  const currentSelect = () => {
    const options = [];
    for (let code in currencies) {
      options.push(
        <option key={code} value={code}>
          {code} — {currencies[code]}
        </option>
      );
    }
    return options;
  };

  return (
    <form onSubmit={handleSubmit} className="create-post">
      <h2 className="create-post__title">Nuevo intercambio</h2>

      <div className="form-grid">
        <label className="field">
          <span className="label">Divisa origen</span>
          <select
            name="divisas_one"
            value={form.divisas_one}
            onChange={handleChange}
            disabled={loading}
            className="control"
          >
            {currentSelect()}
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
            {currentSelect()}
          </select>
        </label>

        <label className="field">
          <span className="label">País</span>
          <select
            name="country"
            value={form.country}
            onChange={handleChange}
            disabled={loading}
            className="control"
          >
            <option value="">Selecciona un país</option>
            {countryList.map(([code, name]) => (
              <option key={code} value={name}>{name}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="label">City</span>
          {cities.length > 0 ? (
            <select
              name="city"
              value={form.city}
              onChange={handleChange}
              disabled={loading || !form.country}
              className="control"
            >
              <option value="">Selecciona una ciudad</option>
              {cities.map((c) => (
                <option key={`${c.name}-${c.stateCode || "NA"}`} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Ej. Madrid"
              className="control"
              disabled={loading || !form.country}
            />
          )}
        </label>

        <label className="field">
          <span className="label">Cantidad prevista</span>
          <input
            type="number"
            name="description"
            value={form.description}
            onChange={handleChange}
            disabled={loading}
            className="control"
            min="0"
            step="any"
            placeholder="500"
          />
        </label>

        <label className="field date-actions">
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
          <button type="submit" disabled={loading} className="btn-create">
            {loading ? "Creando..." : "Crear"}
          </button>
        </label>
      </div>
    </form>
  );
};