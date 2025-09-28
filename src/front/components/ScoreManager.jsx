import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function ScoreManager() {
  const { token, refreshUser, user } = useAuth();
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  const [distribution, setDistribution] = useState({});
  const [userScore, setUserScore] = useState(null);

  // Obtiene del backend la distribución general
  const fetchDistribution = async () => {
    try {
      const res = await fetch(`${backendURL}/api/users/score-distribution`);
      const data = await res.json();
      setDistribution(data.votes || {});
    } catch (err) {
      console.error("Error al cargar distribución:", err);
    }
  };

  // Envia al back. la puntuación 
  const submitScore = async (score) => {
    try {
      const res = await fetch(`${backendURL}/api/users/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ score }),
      });
      if (res.ok) {
        await refreshUser();
        setUserScore(score);
        fetchDistribution();
      }
    } catch (err) {
      console.error("Error al enviar puntuación:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDistribution();
      if (user?.score) setUserScore(user.score);
    }
  }, [token, user]);

  const totalVotes = Object.values(distribution).reduce((a, b) => a + b, 0);

  const renderStars = (count, interactive = false) => (
    <div style={{ display: "flex", gap: "2px", cursor: interactive ? "pointer" : "default" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={20}
          strokeWidth={1.5}
          fill={count >= i ? "#d4af37" : "#ccc"}
          color={count >= i ? "#d4af37" : "#ccc"}
          onClick={interactive ? () => submitScore(i) : undefined}
        />
      ))}
    </div>
  );

  return (
    <div style={{
      background: "var(--color-bg-1)",
      padding: "2rem",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow-card)",
      maxWidth: "600px",
      margin: "0 auto",
      textAlign: "left"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem", color: "var(--color-gold)" }}>
        ¿Qué opinas de  este  usuario {user?.username}?
      </h2>

      {token && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "2rem"
        }}>
          <p style={{
            fontSize: "1rem",
            fontWeight: "bold",
            color: "var(--color-gold)",
            margin: 0
          }}>
            Tu puntuación:
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {renderStars(userScore || 0, true)}
          </div>
        </div>
      )}

      {Object.entries(distribution)
        .sort((a, b) => Number(b[0]) - Number(a[0])) // 5 → 1
        .map(([score, count]) => {
          const percentage = totalVotes ? (count / totalVotes) * 100 : 0;
          return (
            <div key={score} style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ width: "100px" }}>{renderStars(Number(score))}</div>
              <div style={{
                flexGrow: 1,
                background: "#eee",
                borderRadius: "4px",
                overflow: "hidden",
                height: "16px",
                marginLeft: "1rem"
              }}>
                <div style={{
                  width: `${percentage}%`,
                  background: "#d4af37",
                  height: "100%",
                  transition: "width 0.3s"
                }} />
              </div>
              <span style={{ marginLeft: "1rem", fontSize: "0.8rem", color: "#555" }}>
                {count} votos
              </span>
            </div>
          );
        })}
    </div>
  );
}
