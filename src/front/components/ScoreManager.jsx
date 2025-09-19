import { useState, useEffect } from 'react';

export default function ScoreManager({ userId }) {
  const [scores, setScores] = useState([]);
  const [newScore, setNewScore] = useState(0);

  
  useEffect(() => {
    const stored = localStorage.getItem('userScores');
    if (stored) setScores(JSON.parse(stored));
  }, []);

  
  useEffect(() => {
    localStorage.setItem('userScores', JSON.stringify(scores));
  }, [scores]);

  const addScore = () => {
    if (newScore < 0 || newScore > 5) return;
    const updatedScores = [...scores, { userId, score: newScore }];
    setScores(updatedScores);
    setNewScore(0);
  };

  const getAverage = () => {
    const userScores = scores.filter(scor=> scor.userId === userId);
    if (userScores.length === 0) return null;
    const avg = userScores.reduce((acc, scor) => acc + scor.score, 0) / userScores.length;
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
      boxShadow: 'var(--shadow-card)'
    }}>
      <h3>Puntuar usuario</h3>
      <input
        type="number"
        min="0"
        max="5"
        step="0.1"
        value={newScore}
        onChange={e => setNewScore(parseFloat(e.target.value))}
        style={{ marginRight: '1rem' }}
      />
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
        Enviar
      </button>
      <h4 style={{ color: getColor(getAverage()) }}>
        Media: {getAverage() ?? 'Sin puntuaciones'}
      </h4>
    </div>
  );
}
