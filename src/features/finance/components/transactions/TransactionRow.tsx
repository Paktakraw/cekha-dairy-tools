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
    <tr className="border-b border-gray-200 align-top last:border-b-0">
      <td className="px-3 py-2 whitespace-nowrap">
        <p className="text-gray-900">{formatDate(transaction.transaction_date)}</p>
        <p className="text-xs text-gray-500">{TYPE_LABELS[transaction.type]}</p>
      </td>
      <td className="px-3 py-2">
        <p className={`break-words ${transaction.description ? 'text-gray-900' : 'text-gray-400'}`}>
          {transaction.description ?? '-'}
        </p>
        <p className="text-xs break-words text-gray-500">{categoryName}</p>
      </td>
      <td className="py-2 pr-1 pl-3 text-right whitespace-nowrap">
        <p className={`font-medium ${income ? 'text-emerald-700' : 'text-red-700'}`}>
          {income ? '+' : '−'}
          {formatCurrency(transaction.amount)}
        </p>
        <div className="mt-1 flex justify-end">
          <IconButton icon={Pencil} label="แก้ไข" onClick={() => onEdit(transaction)} />
          <IconButton icon={Trash2} label="ลบ" tone="danger" onClick={() => onDelete(transaction)} />
        </div>
      </td>
    </tr>
  )
}
