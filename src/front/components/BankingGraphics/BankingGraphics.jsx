import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import {
  ChartContainer,
  ChartsXAxis,
  ChartsYAxis,
  ChartsTooltip,
  ChartsAxisHighlight
} from '@mui/x-charts';
import { LinePlot, LineHighlightPlot } from '@mui/x-charts/LineChart';

import { getHistoricalRates } from '../../services/frankfurter';





export const BankingGraphics = () => {



  const [series, setSeries] = useState([]);
  const [xAxisDates, setXAxisDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Colores personalizados por moneda (puedes ajustar)
  const currencyColors = {
    EUR: '#1976d2', // Azul
    JPY: '#d32f2f', // Rojo
    GBP: '#388e3c', // Verde
    CAD: '#f9a825'  // Amarillo
  };
  const currencies = ['EUR', 'JPY', 'GBP', 'CAD'];
  const baseCurrency = 'USD';
  const startDate = '2023-01-01';
  const endDate = new Date().toISOString().split('T')[0]; // Fecha actual

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const allRates = await Promise.all(
          currencies.map((currency) =>
            getHistoricalRates(currency, baseCurrency, startDate, endDate)
              .then((data) => ({
                currency,
                rates: data.rates
              }))
          )
        );

        const allDatesSet = new Set();
        allRates.forEach(({ rates }) => {
          Object.keys(rates).forEach((date) => allDatesSet.add(date));
        });

        const sortedDates = Array.from(allDatesSet).sort();
        setXAxisDates(sortedDates);

        const chartSeries = allRates.map(({ currency, rates }) => {
          const data = sortedDates.map((date) => {
            const value = rates[date];
            if (value && typeof value === 'object' && value[baseCurrency] !== undefined) {
              return value[baseCurrency];
            } else if (typeof value === 'number') {
              return value;
            } else {
              return null;
            }
          });

          return {
            type: 'line',
            label: currency,
            data,
            color: currencyColors[currency] || undefined, // color por moneda
            highlightScope: { highlight: 'item' }
          };
        });

        console.log('Series generadas:', chartSeries);
        setSeries(chartSeries);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p style={{ textAlign: 'center' }}>Cargando gráfico...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

  return (
    <div style={{
      width: '100%',
      maxWidth: 900,
      margin: '2px auto',
      padding: 6,
      borderRadius: 12,
      backgroundColor: '#fff',//pendiente de modificar
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
    }}>
      <Typography variant="h6" align="center" gutterBottom>
        Historial de tasas frente al USD
      </Typography>

      <ChartContainer
        series={series}
        height={450}
        xAxis={[{
          id: 'date',
          data: xAxisDates.map(date => new Date(date)),
          scaleType: 'time',
          valueFormatter: (value) => value.toLocaleDateString(),
          height: 40
        }]}
        yAxis={[{
          id: 'price',
          scaleType: 'linear',
          position: 'left',
          label: `Valor en ${baseCurrency}`,
          width: 60
        }]}
      >
        <ChartsAxisHighlight x="line" />
        <LinePlot />
        <LineHighlightPlot />
        <ChartsXAxis
          label="Fecha"
          axisId="date"
          tickLabelStyle={{ fontSize: 10 }}
        />
        <ChartsYAxis
          label={`Valor (${baseCurrency})`}
          axisId="price"
          tickLabelStyle={{ fontSize: 10 }}
        />
        <ChartsTooltip />
      </ChartContainer>
    </div>
  );
};
