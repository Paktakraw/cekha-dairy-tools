import { Pencil, Trash2 } from 'lucide-react'
import { IconButton } from '../../../../shared/components/ui'
import { formatCurrency } from '../../../../shared/utils/formatCurrency'
import { formatDate } from '../../../../shared/utils/formatDate'
import { TYPE_LABELS } from '../../constants'
import type { Transaction } from '../../types/finance'

interface TransactionRowProps {
  transaction: Transaction
  categoryName: string
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

export function TransactionRow({ transaction, categoryName, onEdit, onDelete }: TransactionRowProps) {
  const income = transaction.type === 'income'
  return (
    <tr className="border-b border-gray-200 last:border-b-0">
      <td className="px-3 py-2 whitespace-nowrap text-gray-700">{formatDate(transaction.transaction_date)}</td>
      <td className="px-3 py-2 whitespace-nowrap text-gray-700">{TYPE_LABELS[transaction.type]}</td>
      <td className="px-3 py-2 text-gray-900">{categoryName}</td>
      <td className="max-w-56 px-3 py-2 break-words text-gray-600">{transaction.description ?? '-'}</td>
      <td
        className={`px-3 py-2 text-right font-medium whitespace-nowrap ${income ? 'text-emerald-700' : 'text-red-700'}`}
      >
        {income ? '+' : '−'}
        {formatCurrency(transaction.amount)}
      </td>
      <td className="px-1 py-1 whitespace-nowrap">
        <IconButton icon={Pencil} label="แก้ไข" onClick={() => onEdit(transaction)} />
        <IconButton icon={Trash2} label="ลบ" tone="danger" onClick={() => onDelete(transaction)} />
      </td>
    </tr>
  )
}
