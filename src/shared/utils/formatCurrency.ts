const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** 1000 -> "฿1,000.00" */
export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}
