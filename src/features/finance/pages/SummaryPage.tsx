import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, EmptyState, Pagination, Spinner } from '../../../shared/components/ui'
import { CategorySummary } from '../components/summary/CategorySummary'
import { SummaryCards } from '../components/summary/SummaryCards'
import { TransactionFilters } from '../components/summary/TransactionFilters'
import { ManagedTransactionTable } from '../components/transactions/ManagedTransactionTable'
import { PAGE_SIZE } from '../constants'
import { useCategories } from '../hooks/useCategories'
import { useTransactionFilters } from '../hooks/useTransactionFilters'
import { useTransactions } from '../hooks/useTransactions'
import { summarize } from '../utils/summary'

export default function SummaryPage() {
  const cats = useCategories()
  const f = useTransactionFilters()
  const tx = useTransactions(f.filters)
  const [page, setPage] = useState(1)

  const summary = useMemo(() => summarize(tx.transactions, cats.categories), [tx.transactions, cats.categories])

  const totalPages = Math.max(1, Math.ceil(tx.transactions.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = tx.transactions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  if (cats.loading) return <Spinner />

  const failure = cats.error ?? (tx.firstLoad ? null : tx.error)
  if (failure) {
    return (
      <EmptyState
        title="โหลดข้อมูลไม่สำเร็จ"
        description={failure}
        action={
          <Button
            variant="secondary"
            onClick={() => {
              if (cats.error) void cats.reload()
              else tx.reload()
            }}
          >
            <RefreshCw className="h-4 w-4" />
            ลองใหม่
          </Button>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <TransactionFilters
        filters={f.filters}
        searchInput={f.searchInput}
        categories={cats.categories}
        invalidRange={f.invalidRange}
        isFiltered={f.isFiltered}
        onChange={(patch) => {
          setPage(1)
          f.update(patch)
        }}
        onSearchChange={(value) => {
          setPage(1)
          f.setSearch(value)
        }}
        onReset={() => {
          setPage(1)
          f.reset()
        }}
      />

      {tx.firstLoad ? (
        <Spinner />
      ) : (
        <div className={`flex flex-col gap-6 ${tx.loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}`}>
          <SummaryCards summary={summary} />

          {tx.transactions.length === 0 ? (
            <EmptyState
              title={f.isFiltered ? 'ไม่มีรายการที่ตรงกับตัวกรอง' : 'ยังไม่มีรายการ'}
              description={
                f.isFiltered ? 'ลองปรับหรือกด Reset Filter' : 'ไปที่ “บันทึกรายการ” เพื่อเพิ่มรายการแรก'
              }
            />
          ) : (
            <>
              <CategorySummary summary={summary} />
              <section>
                <h2 className="mb-2 text-lg font-semibold text-gray-900">ประวัติรายการ</h2>
                <div className="flex flex-col gap-3">
                  <ManagedTransactionTable
                    transactions={pageRows}
                    categories={cats.categories}
                    categoryById={cats.categoryById}
                    onEdit={tx.editTransaction}
                    onRemove={tx.removeTransaction}
                  />
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    total={tx.transactions.length}
                    pageSize={PAGE_SIZE}
                    onChange={setPage}
                  />
                </div>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  )
}
