import { PlusCircle, RefreshCw, Tags } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, CollapsibleSection, EmptyState, Spinner } from '../../../shared/components/ui'
import { ManagedTransactionTable } from '../components/transactions/ManagedTransactionTable'
import { TransactionForm } from '../components/transactions/TransactionForm'
import { TransactionTypeFilter } from '../components/transactions/TransactionTypeFilter'
import { RECENT_LIMIT, TYPE_LABELS } from '../constants'
import { useCategories } from '../hooks/useCategories'
import { useTransactions } from '../hooks/useTransactions'
import { EMPTY_FILTERS, type TransactionFilters } from '../types/finance'

export default function TransactionPage() {
  const cats = useCategories()
  const [typeFilter, setTypeFilter] = useState<TransactionFilters['type']>('')
  const filters = useMemo(() => ({ ...EMPTY_FILTERS, type: typeFilter }), [typeFilter])
  const tx = useTransactions(filters, RECENT_LIMIT)

  if (cats.loading) return <Spinner />

  if (cats.error) {
    return (
      <EmptyState
        title="โหลดหมวดหมู่ไม่สำเร็จ"
        description={cats.error}
        action={
          <Button variant="secondary" onClick={cats.reload}>
            <RefreshCw className="h-4 w-4" />
            ลองใหม่
          </Button>
        }
      />
    )
  }

  if (cats.categories.length === 0) {
    return (
      <EmptyState
        title="ยังไม่มีหมวดหมู่"
        description="ต้องมีหมวดหมู่อย่างน้อย 1 รายการก่อนบันทึกรายรับ-รายจ่าย"
        action={
          <Link to="/finance/categories" className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-gray-900 underline">
            <Tags className="h-4 w-4" />
            ไปหน้าหมวดหมู่เพื่อสร้าง
          </Link>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <CollapsibleSection title="เพิ่มรายการ" icon={PlusCircle} defaultOpen={false}>
        <TransactionForm categories={cats.categories} onSubmit={tx.addTransaction} resetOnSuccess />
      </CollapsibleSection>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-900">รายการล่าสุด</h2>
          <TransactionTypeFilter value={typeFilter} onChange={setTypeFilter} />
        </div>
        {tx.firstLoad && <Spinner />}

        {!tx.firstLoad && tx.error && (
          <EmptyState
            title="โหลดรายการไม่สำเร็จ"
            description={tx.error}
            action={
              <Button variant="secondary" onClick={tx.reload}>
                <RefreshCw className="h-4 w-4" />
                ลองใหม่
              </Button>
            }
          />
        )}

        {!tx.firstLoad && !tx.error && tx.transactions.length === 0 && (
          <EmptyState
            title={typeFilter ? `ยังไม่มีรายการ${TYPE_LABELS[typeFilter]}` : 'ยังไม่มีรายการ'}
            description={typeFilter ? 'ลองเลือก “ทั้งหมด” หรือประเภทอื่น' : 'บันทึกรายการแรกด้วยแบบฟอร์มด้านบน'}
          />
        )}

        {!tx.firstLoad && !tx.error && tx.transactions.length > 0 && (
          <div className={tx.loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <ManagedTransactionTable
              transactions={tx.transactions}
              categories={cats.categories}
              categoryById={cats.categoryById}
              onEdit={tx.editTransaction}
              onRemove={tx.removeTransaction}
            />
          </div>
        )}
      </section>
    </div>
  )
}
