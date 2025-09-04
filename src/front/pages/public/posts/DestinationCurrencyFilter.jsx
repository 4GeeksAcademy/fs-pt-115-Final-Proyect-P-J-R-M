
export function DestinationCurrencyFilter({ currencies = [], active = "", onSelect }) {
  return (
    <div>
      <div><strong>Divisas destino</strong></div>
      <button onClick={() => onSelect("")} disabled={!active}>Todas</button>
      {currencies.map(code => (
        <div key={code}>
          <button onClick={() => onSelect(code)}>
            {code} {active === code ? "(✓)" : ""}
          </button>
        </div>
      ))}
    </div>
  );
}