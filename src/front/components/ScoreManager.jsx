import { useState, useEffect } from 'react';

export default function ScoreManager({ userId }) {
  const [scores, setScores] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('userScores');
    if (stored) setScores(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('userScores', JSON.stringify(scores));
  }, [scores]);

  const addScore = () => {
    if (selected === null) return;
    const updatedScores = [...scores, { userId, score: selected }];
    setScores(updatedScores);
    setSelected(null);
    setHovered(null);
  };

  const getAverage = () => {
    const userScores = scores.filter(s => s.userId === userId);
    if (userScores.length === 0) return null;
    const avg = userScores.reduce((acc, s) => acc + s.score, 0) / userScores.length;
    return avg.toFixed(2);
  };

  const getColor = (avg) => {
    if (avg >= 4.5) return 'var(--color-gold)';
    if (avg >= 3) return 'var(--color-muted)';
    return 'gray';
  };

  return (
    <div style={{
      background: 'var(--color-bg-1)',
      padding: '1rem',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-card)',
      textAlign: 'center'
    }}>
      <h3>Puntuar usuario</h3>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            style={{
              cursor: 'pointer',
              color: (hovered || selected) >= star ? 'var(--color-gold)' : 'lightgray',
              transition: 'color 0.2s'
            }}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setSelected(star)}
          >
            ★
          </span>
        ))}
      </div>
      <button
        onClick={addScore}
        style={{
          background: 'var(--color-gold)',
          borderRadius: 'var(--radius-btn)',
          padding: '0.5rem 1rem',
          border: 'none',
          color: '#fff',
          boxShadow: 'var(--shadow-1)'
        }}
      >
        Enviar puntuación
      </button>
      <h4 style={{ color: getColor(getAverage()), marginTop: '1rem' }}>
        Media: {getAverage() ?? 'Sin puntuaciones'}
      </h4>
    </div>
  );
}
