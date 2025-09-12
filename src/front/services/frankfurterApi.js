
const BASE_URL = 'https://api.frankfurter.app'


//  Obtener la lista de monedas
export const getCurrencies = async () => {
  const response = await fetch(`${BASE_URL}/currencies`);

  if (!response.ok) throw new Error("Error al obtener monedas");

  return await response.json();
}

// Obtener la tasa de cambio actual entre dos monedas
//  from - Moneda origen (ej. "USD")
//  to - Moneda destino (ej. "EUR")

export const getLatestRate = async (form, to)=>{
    const response  =await fetch(`${BASE_URL}/latest?from=${form}&to=${to}`)
    if (!response) throw new Error("Error al obtener tasa de cambio")
    
    return await response.json()
    
}

// Obtener el historial de tasas entre dos monedas en un rango de fechas
// from - Moneda origen
// to - Moneda destino
// start - Fecha de inicio (YYYY-MM-DD)
// end - Fecha de fin (YYYY-MM-DD)

export const getHistoricalRates = async (from, to, start, end) => {
    const response = await fetch(`${BASE_URL}/${start}..${end}?from=${from}&to=${to}`)
    if (!response.ok) throw new Error("Error al obtener historial de tasas")
    return await response.json()

}



