import React, { useEffect, useState } from 'react';
import { getCurrencies, getLatestRate } from "../../services/frankfurterApi"
import "./currencyConverter.css"

export const CurrencyConverter = () => {

    const [currencies, setCurrencies] = useState({})
    const [fromCurrency, setFromCurrency] = useState("EUR");
    const [toCurrency, setToCurrency] = useState("USD");
    const [amount, setAmount] = useState(1.0);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCurrencies = async () => {
             const end = new Date().toISOString().split('T')[0]
            try {
                const data = await getCurrencies()
                setCurrencies(data)
            } catch (err) {
                setError("Error al cargar monedas")
            }
        }

        loadCurrencies()
    }, [])

    const handleConvert = async () => {
        setLoading(true)
        setError(null)
        setResult(null)
        try {
            const data = await getLatestRate(fromCurrency, toCurrency)
            const rate = data?.rates?.[toCurrency]
            console.log(rate)
            if (!rate) throw new Error("Tasa de cambio no disponible")

            const converted = amount * rate;
            setResult(converted.toFixed(4)); // Mostrar hasta 4 decimales
        } catch (err) {
            setError(err.message || "Error desconocido");
        } finally {
            setLoading(false)
        }
    }

    return (

        <div className="converter-container">
            <h2>Conversor de Monedas</h2>
            {/* Selección de monedas 1 */}
            <div>
                <label>De: </label>
                <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                    {Object.entries(currencies).map(([code, name]) => (
                        <option key={code} value={code}>
                            {code} - {name}
                        </option>
                    ))}
                </select>
            </div>
                    {/* Selección de monedas 2 */}
            <div>
                <label>A: </label>
                <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
                    {/* Object.entries(obj)=>Convierte un objeto en un array de pares [clave, valor] */}
                    {Object.entries(currencies).map(([code, name]) => (
                        <option key={code} value={code}>
                            {code} - {name}
                        </option>
                    ))}
                </select>
            </div>
                    {/* Cantidad con decimales */}
            <div>
                <label>Cantidad: </label>
                <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                />
            </div>
            {/* Mensajes de resultado o error */}
            <button onClick={handleConvert} disabled={loading}>
                {loading ? 'Convirtiendo...' : 'Convertir'}
            </button>

            {error && <p className="error-message">⚠️ {error}</p>}
            {result && (
                <p>
                    {amount} {fromCurrency} = <strong>{result}</strong> {toCurrency}
                </p>
            )}
        </div>
    )
}
