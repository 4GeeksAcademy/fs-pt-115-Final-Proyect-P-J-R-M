import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import "./public-rating.css";

export default function PublicRating() {
  const [selected, setSelected] = useState(0);
  const [average, setAverage] = useState(0);
  const [distribution, setDistribution] = useState([]);
  const [thankYou, setThankYou] = useState(false);

  const hasVoted = localStorage.getItem("hasVoted") === "true"

  const fetchSummary = () => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/platform-rating/summary`)
      .then(res => {
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setAverage(data.average);
        setDistribution(data.distribution);
      })
      .catch(error => {
        console.error("Error al obtener el resumen:", error);
      });
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleRating = async (score) => {
    if (hasVoted) {
      alert("Ya has votado. ¡Gracias por tu opinión!");
      return;
    }
    setSelected(score);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/platform-rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score })
      });

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      localStorage.setItem("hasVoted", "true")
      setThankYou(true);
      setTimeout(() => {
        fetchSummary();
      }, 300);
    } catch (error) {
      console.error("Error al enviar la puntuación:", error);
      alert("No se pudo enviar tu puntuación. Intenta más tarde.");
    }
  };

  // Reindexar distribución
  const formattedDistribution = distribution.reduce((acc, count, index) => {
    acc[index + 1] = count;
    return acc;
  }, {});

  return (
    <div className="rating-box">
      <h2 className="rating-title">¿Qué opinas de Hand to Hand?</h2>

      <div className="stars">
        {[1, 2, 3, 4, 5].map(n => (
          <Star
            key={n}
            size={48}
            strokeWidth={1.25}
            color={n <= selected ? "#d4af37" : "#ccc"}
            className="star-icon"
            onClick={!hasVoted ? () => handleRating(n) : undefined}
            style={{
              cursor: hasVoted ? "not-allowed" : "pointer",
              opacity: hasVoted ? 0.5 : 1
            }}
          />
        ))}
      </div>

      {thankYou && <p className="thank-you">¡Gracias por tu opinión!</p>}
      {hasVoted && !thankYou && (
        <p className="already-voted">Ya has votado. ¡Gracias por compartir tu opinión!</p>
      )}
      <div className="summary">
        <p>Promedio: <strong>{average.toFixed(1)} ★</strong></p>

        <div className="histogram">
          {Object.entries(formattedDistribution)
            .sort((a, b) => Number(b[0]) - Number(a[0]))
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
