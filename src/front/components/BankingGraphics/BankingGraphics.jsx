import React, { useEffect, useRef, useState } from 'react';
import { getHistoricalRates } from "../../services/frankfurter";

export const BankingGraphics = ({ from = "USD", to = "EUR", start = "2023-01-01" }) => {

    const canvasRef = useRef(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const end = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const drawChart = async () => {
            if (!canvasRef.current) return;

            setError(null);
            setLoading(true);

            try {
                const data = await getHistoricalRates(from, to, start, end);

                if (!data || !data.rates) {
                    setError("No se recibieron datos válidos");
                    setLoading(false);
                    return;
                }

                const allDates = Object.keys(data.rates).sort();
                const dates = allDates.filter(date =>
                    data.rates[date] &&
                    typeof data.rates[date][to] === "number"
                );

                if (dates.length === 0) {
                    setError('No hay datos disponibles para este rango y moneda');
                    setLoading(false);
                    return;
                }

                const values = dates.map(date => data.rates[date][to]);

                const ctx = canvasRef.current.getContext('2d');
                const width = canvasRef.current.width;
                const height = canvasRef.current.height;

                // Fondo con gradiente
                const gradient = ctx.createLinearGradient(0, 0, 0, height);
                gradient.addColorStop(0, '#f0f4f8');
                gradient.addColorStop(1, '#d9e2ec');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);

                // Padding y escala
                const padding = 50;
                const maxVal = Math.max(...values);
                const minVal = Math.min(...values);

                const xStep = (width - 2 * padding) / Math.max(1, dates.length - 1);
                const yScale = (height - 2 * padding) / (maxVal - minVal);

                // Dibujar ejes
                ctx.beginPath();
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                // eje Y
                ctx.moveTo(padding, padding);
                ctx.lineTo(padding, height - padding);
                // eje X
                ctx.lineTo(width - padding, height - padding);
                ctx.stroke();

                // Etiquetas eje Y (max y min)
                ctx.fillStyle = '#222';
                ctx.font = '14px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
                ctx.textBaseline = 'middle';
                ctx.fillText(maxVal.toFixed(4), 10, padding);
                ctx.fillText(minVal.toFixed(4), 10, height - padding);

                // Etiquetas eje X (fechas)
                ctx.textAlign = 'center';
                ctx.fillText(dates[0], padding, height - padding + 25);
                ctx.fillText(dates[dates.length - 1], width - padding, height - padding + 25);

                // Dibujo línea de datos con sombra
                ctx.beginPath();
                values.forEach((val, i) => {
                    const x = padding + i * xStep;
                    const y = height - padding - (val - minVal) * yScale;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.strokeStyle = '#007bff';
                ctx.lineWidth = 3;
                ctx.shadowColor = 'rgba(0, 123, 255, 0.5)';
                ctx.shadowBlur = 10;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Dibujo puntos con borde blanco y sombra
                values.forEach((val, i) => {
                    const x = padding + i * xStep;
                    const y = height - padding - (val - minVal) * yScale;
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, Math.PI * 2);
                    ctx.fillStyle = '#007bff';
                    ctx.shadowColor = 'rgba(0, 123, 255, 0.6)';
                    ctx.shadowBlur = 6;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#fff';
                    ctx.stroke();
                });

                setLoading(false);

            } catch (err) {
                setError('Error al cargar los datos');
                setLoading(false);
            }
        };

        drawChart();
    }, [from, to, start, end]);

    if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

    return (
        <div style={{
            maxWidth: 850,
            margin: '30px auto',
            padding: 20,
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            borderRadius: 12,
            backgroundColor: '#ffffff',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            textAlign: 'center'
        }}>
            <h3 style={{ marginBottom: 20, color: '#333' }}>Tasa de cambio de {from} a {to}</h3>
            {loading && <p style={{ fontStyle: 'italic', color: '#555' }}>Cargando gráfico...</p>}
            <canvas
                ref={canvasRef}
                width={800}
                height={400}
                style={{
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    backgroundColor: '#f9fafb',
                    boxShadow: 'inset 0 0 8px #e1e7f0'
                }}
            />
        </div>
    );
};
