import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  Modal,
  Pagination,
  Spinner,
} from '../../../shared/components/ui'
import { FoodForm } from '../components/FoodForm'
import { ESTIMATE_LABEL, PAGE_SIZE } from '../constants'
import { useFoods } from '../hooks/useFoods'
import type { Food } from '../types/calorie'
import { formatKcal } from '../utils/format'

/** null = ปิด, 'new' = เพิ่มอาหาร, Food = แก้ไขอาหารนั้น */
type FormState = null | 'new' | Food

export default function FoodListPage() {
  const { foods, loading, error, reload, addFood, editFood, removeFood } = useFoods()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [formState, setFormState] = useState<FormState>(null)
  const [deleting, setDeleting] = useState<Food | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const term = query.trim().toLowerCase()
  const filtered = term === '' ? foods : foods.filter((f) => f.name.toLowerCase().includes(term))
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const closeForm = () => setFormState(null)

  const confirmDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    await removeFood(deleting.id)
    setDeletingBusy(false)
    setDeleting(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-900">รายการอาหาร</h2>
        <Button onClick={() => setFormState('new')}>
          <Plus className="h-4 w-4" />
          เพิ่มอาหาร
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {loading && <Spinner />}

        {!loading && error && <ErrorState title="โหลดรายการอาหารไม่สำเร็จ" description={error} onRetry={reload} />}

        {!loading && !error && (
          <>
            <Input
              label="ค้นหาอาหาร"
              type="search"
              placeholder="พิมพ์ชื่ออาหาร"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
            />

            {filtered.length === 0 ? (
              <EmptyState
                title={term === '' ? 'ยังไม่มีอาหาร' : 'ไม่พบอาหารที่ค้นหา'}
                description={term === '' ? 'กด “เพิ่มอาหาร” เพื่อเพิ่มรายการแรก' : 'ลองเปลี่ยนคำค้นหา หรือเพิ่มอาหารใหม่'}
                action={
                  term !== '' ? (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <Search className="h-3 w-3" aria-hidden="true" />“{query.trim()}”
                    </span>
                  ) : undefined
                }
              />
            ) : (
              <div className="flex flex-col gap-3">
                <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
                  {pageRows.map((food) => (
                    <li key={food.id} className="flex items-center justify-between gap-2 py-1 pr-1 pl-3">
                      <div className="min-w-0 py-1">
                        <p className="text-sm font-medium break-words text-gray-900">{food.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatKcal(food.kcal_per_unit)} / {food.serving_unit}
                          {food.source === 'seed' && <span className="ml-2">({ESTIMATE_LABEL})</span>}
                        </p>
                      </div>
                      <div className="flex shrink-0">
                        <IconButton icon={Pencil} label={`แก้ไข ${food.name}`} onClick={() => setFormState(food)} />
                        <IconButton icon={Trash2} label={`ลบ ${food.name}`} tone="danger" onClick={() => setDeleting(food)} />
                      </div>
                    </li>
                  ))}
                </ul>
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  total={filtered.length}
                  pageSize={PAGE_SIZE}
                  onChange={setPage}
                />
              </div>
            )}
            <p className="text-xs text-gray-400">
              รายการตั้งต้นเป็นค่าโดยประมาณ ต่อ 1 หน่วย แคลอรี่จริงขึ้นกับร้านและปริมาณ แก้ไขหรือเพิ่มอาหารของตัวเองได้
            </p>
          </>
        )}
      </div>

      <Modal open={formState !== null} title={formState === 'new' ? 'เพิ่มอาหาร' : 'แก้ไขอาหาร'} onClose={closeForm}>
        {formState !== null && (
          <FoodForm
            key={formState === 'new' ? 'new' : formState.id}
            food={formState === 'new' ? undefined : formState}
            onSubmit={(input) => (formState === 'new' ? addFood(input) : editFood(formState.id, input))}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="ลบอาหาร"
        message={`ต้องการลบ “${deleting?.name ?? ''}” ออกจากรายการอาหารใช่หรือไม่ ประวัติที่เคยบันทึกไว้จะไม่หาย`}
        loading={deletingBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
