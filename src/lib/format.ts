export const formatCurrency = (value: number | null, digits = 0) =>
  value === null ? "—" : new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: digits }).format(value);

export const formatNumber = (value: number) => new Intl.NumberFormat("en-AU").format(value);
export const formatPercent = (value: number | null) => value === null ? "—" : `${(value * 100).toFixed(1)}%`;
export const formatMultiple = (value: number | null) => value === null ? "—" : `${value.toFixed(2)}×`;
