import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import "./public-rating.css";
import { useAuth } from "../../hooks/useAuth";

export default function PublicRating() {
  const [selected, setSelected] = useState(0);
  const [average, setAverage] = useState(0);
  const [distribution, setDistribution] = useState([]);
  const [thankYou, setThankYou] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const { user, token } = useAuth();
  const isAuthenticated = !!token;

  const fetchSummary = () => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/platform-rating/summary`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setAverage(data.average);
        setDistribution(data.distribution);
      })
      .catch(err => console.error("Error al obtener resumen:", err));
  };

  const fetchUserRating = () => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/platform-rating/user`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (data.score) {
          setSelected(data.score);
          setHasRated(true);
        }
      })
      .catch(err => console.error("Error al obtener tu puntuación:", err));
  };

  useEffect(() => {
    fetchSummary();
    if (isAuthenticated) fetchUserRating();
  }, [isAuthenticated]);

  const handleRating = async (score) => {
    setSelected(score);
    const method = hasRated ? "PATCH" : "POST";

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/platform-rating`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ score })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setThankYou(true);
      setHasRated(true);
      setTimeout(() => fetchSummary(), 300);
    } catch (err) {
      console.error("Error al enviar puntuación:", err);
      alert("No se pudo enviar tu puntuación. Intenta más tarde.");
    }
  };

  const formattedDistribution = distribution.reduce((acc, count, i) => {
    acc[i + 1] = count;
    return acc;
  }, {});

  return (
    <div className="rating-box">
      <h2 className="rating-title">¿Qué opinas de nuestra aplicación?</h2>

      {isAuthenticated ? (
        <div className="stars">
          {[1, 2, 3, 4, 5].map(n => (
            <Star
              key={n}
              size={48}
              strokeWidth={1.25}
              color={n <= selected ? "#d4af37" : "#ccc"}
              className="star-icon"
              onClick={() => handleRating(n)}
            />
          ))}
        </div>
      ) : (
        <p className="rating-message">Inicia sesión para calificar la aplicación</p>
      )}

      {thankYou && <p className="rating-message">¡Gracias por tu opinión!</p>}

      <div className="summary">
        <p>Promedio: <strong>{average.toFixed(1)} ★</strong></p>
        <div className="histogram">
          {Object.entries(formattedDistribution)
            .sort((a, b) => b[0] - a[0])
            .map(([score, count]) => (
              <div key={score} className="bar">
                <span className="bar-label">{score}★</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${count * 8}px` }}></div>
                </div>
                <span className="bar-count">{count}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
