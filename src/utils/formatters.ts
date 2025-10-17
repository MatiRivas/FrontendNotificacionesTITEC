// src/utils/formatters.ts
export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export const formatAmount = (amount?: number, currency = 'CLP') =>
  amount == null
    ? ''
    : new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);