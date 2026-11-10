import type { Category, Transaction } from '../../types/finance'
import { TransactionRow } from './TransactionRow'

interface TransactionTableProps {
  transactions: Transaction[]
  categoryById: Map<string, Category>
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

/**
 * ตาราง 3 คอลัมน์ที่ซ้อนข้อมูลสองบรรทัด ให้พอดีหน้าจอมือถือโดยไม่ต้องเลื่อนซ้ายขวา:
 * วันที่ / ประเภท · รายละเอียด / หมวดหมู่ · จำนวนเงิน / ปุ่มจัดการ
 */
export function TransactionTable({ transactions, categoryById, onEdit, onDelete }: TransactionTableProps) {
  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs text-gray-500">
          <tr>
            <th className="px-3 py-2 font-medium">วันที่ / ประเภท</th>
            <th className="px-3 py-2 font-medium">รายละเอียด / หมวดหมู่</th>
            <th className="px-3 py-2 text-right font-medium">จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <TransactionRow
              key={t.id}
              transaction={t}
              categoryName={categoryById.get(t.category_id)?.name ?? 'ไม่ทราบหมวดหมู่'}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
