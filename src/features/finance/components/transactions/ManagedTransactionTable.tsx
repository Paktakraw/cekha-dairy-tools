import { useState } from 'react'
import { ConfirmDialog, Modal } from '../../../../shared/components/ui'
import { formatCurrency } from '../../../../shared/utils/formatCurrency'
import { formatDate } from '../../../../shared/utils/formatDate'
import type { Category, Transaction, TransactionInput } from '../../types/finance'
import { TransactionForm } from './TransactionForm'
import { TransactionTable } from './TransactionTable'

interface ManagedTransactionTableProps {
  transactions: Transaction[]
  categories: Category[]
  categoryById: Map<string, Category>
  onEdit: (id: string, input: TransactionInput) => Promise<string | null>
  onRemove: (id: string) => Promise<void>
}

/** ตารางรายการ + Modal แก้ไข + Confirm ลบ (ใช้ร่วมกันระหว่างหน้า Transactions และ Summary) */
export function ManagedTransactionTable({
  transactions,
  categories,
  categoryById,
  onEdit,
  onRemove,
}: ManagedTransactionTableProps) {
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const confirmDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    await onRemove(deleting.id)
    setDeletingBusy(false)
    setDeleting(null)
  }

  return (
    <>
      <TransactionTable transactions={transactions} categoryById={categoryById} onEdit={setEditing} onDelete={setDeleting} />

      <Modal open={editing !== null} title="แก้ไขรายการ" onClose={() => setEditing(null)}>
        {editing && (
          <TransactionForm
            key={editing.id}
            categories={categories}
            transaction={editing}
            onSubmit={(input) => onEdit(editing.id, input)}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="ลบรายการ"
        message={
          deleting
            ? `ต้องการลบรายการวันที่ ${formatDate(deleting.transaction_date)} จำนวน ${formatCurrency(deleting.amount)} ใช่หรือไม่ การลบไม่สามารถย้อนกลับได้`
            : ''
        }
        loading={deletingBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}
