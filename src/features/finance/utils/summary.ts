import type { Category, CategoryTotal, Summary, Transaction } from '../types/finance'

const toCents = (amount: number) => Math.round(amount * 100)

/**
 * คำนวณสรุปจากรายการที่ filter แล้ว (pure function)
 * รวมเป็นสตางค์ (จำนวนเต็ม) เพื่อเลี่ยงความคลาดเคลื่อนของทศนิยม
 */
export function summarize(transactions: Transaction[], categories: Category[]): Summary {
  const categoryById = new Map(categories.map((c) => [c.id, c]))
  let incomeCents = 0
  let expenseCents = 0
  const totals = new Map<string, { cents: number; count: number; type: Transaction['type'] }>()

  for (const t of transactions) {
    const cents = toCents(t.amount)
    if (t.type === 'income') incomeCents += cents
    else expenseCents += cents

    const entry = totals.get(t.category_id) ?? { cents: 0, count: 0, type: t.type }
    entry.cents += cents
    entry.count += 1
    totals.set(t.category_id, entry)
  }

  const byCategory: CategoryTotal[] = [...totals.entries()]
    .map(([categoryId, { cents, count, type }]) => ({
      categoryId,
      name: categoryById.get(categoryId)?.name ?? 'ไม่ทราบหมวดหมู่',
      type,
      total: cents / 100,
      count,
    }))
    .sort((a, b) => b.total - a.total)

  return {
    totalIncome: incomeCents / 100,
    totalExpense: expenseCents / 100,
    transactionCount: transactions.length,
    byCategory,
  }
}
