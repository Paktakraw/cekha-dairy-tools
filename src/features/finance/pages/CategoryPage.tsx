import { Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button, ConfirmDialog, EmptyState, Modal, Spinner } from '../../../shared/components/ui'
import { CategoryForm } from '../components/categories/CategoryForm'
import { CategoryTable } from '../components/categories/CategoryTable'
import { TYPE_LABELS } from '../constants'
import { useCategories } from '../hooks/useCategories'
import type { Category } from '../types/finance'

/** null = ปิด, 'new' = เพิ่มหมวดหมู่, Category = แก้ไขหมวดหมู่นั้น */
type FormState = null | 'new' | Category

export default function CategoryPage() {
  const { categories, loading, error, reload, addCategory, editCategory, removeCategory } = useCategories()
  const [formState, setFormState] = useState<FormState>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const closeForm = () => setFormState(null)

  const confirmDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    await removeCategory(deleting.id)
    setDeletingBusy(false)
    setDeleting(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-900">หมวดหมู่</h2>
        <Button onClick={() => setFormState('new')}>
          <Plus className="h-4 w-4" />
          เพิ่มหมวดหมู่
        </Button>
      </div>

      <div className="mt-4">
        {loading && <Spinner />}

        {!loading && error && (
          <EmptyState
            title="โหลดหมวดหมู่ไม่สำเร็จ"
            description={error}
            action={
              <Button variant="secondary" onClick={reload}>
                <RefreshCw className="h-4 w-4" />
                ลองใหม่
              </Button>
            }
          />
        )}

        {!loading && !error && (
          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryTable
              title={TYPE_LABELS.income}
              categories={categories.filter((c) => c.type === 'income')}
              onEdit={setFormState}
              onDelete={setDeleting}
            />
            <CategoryTable
              title={TYPE_LABELS.expense}
              categories={categories.filter((c) => c.type === 'expense')}
              onEdit={setFormState}
              onDelete={setDeleting}
            />
          </div>
        )}
      </div>

      <Modal open={formState !== null} title={formState === 'new' ? 'เพิ่มหมวดหมู่' : 'แก้ไขหมวดหมู่'} onClose={closeForm}>
        {formState !== null && (
          <CategoryForm
            key={formState === 'new' ? 'new' : formState.id}
            category={formState === 'new' ? undefined : formState}
            onSubmit={(input) => (formState === 'new' ? addCategory(input) : editCategory(formState.id, input))}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="ลบหมวดหมู่"
        message={`ต้องการลบหมวดหมู่ “${deleting?.name ?? ''}” ใช่หรือไม่ หากมีรายการรายรับ-รายจ่ายใช้หมวดหมู่นี้อยู่ จะลบไม่ได้`}
        loading={deletingBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
