import { Plus } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { Button, ConfirmDialog, EmptyState, ErrorState, Modal, Pagination, Spinner } from '../../../shared/components/ui'
import { TaskForm } from '../components/TaskForm'
import { TaskList } from '../components/TaskList'
import { TaskStatusFilter } from '../components/TaskStatusFilter'
import { PAGE_SIZE } from '../constants'
import { useTasks } from '../hooks/useTasks'
import type { Task } from '../types/task'

/** null = ปิด, 'new' = เพิ่มงาน, Task = แก้ไขงานนั้น */
type FormState = null | 'new' | Task

export default function TodoPage() {
  const {
    tasks,
    total,
    page,
    totalPages,
    statuses,
    loading,
    firstLoad,
    error,
    setPage,
    toggleStatusFilter,
    clearStatusFilter,
    reload,
    addTask,
    editTask,
    changeStatus,
    removeTask,
  } = useTasks()
  const [formState, setFormState] = useState<FormState>(null)
  const [deleting, setDeleting] = useState<Task | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const closeForm = () => setFormState(null)

  const confirmDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    await removeTask(deleting.id)
    setDeletingBusy(false)
    setDeleting(null)
  }

  const filtering = statuses.length > 0

  return (
    <>
      <PageHeader>
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-semibold text-gray-900">วันนี้ทำอะไรดี</h1>
          <Button onClick={() => setFormState('new')}>
            <Plus className="h-4 w-4" />
            เพิ่มงาน
          </Button>
        </div>
      </PageHeader>
      <div className="mx-auto max-w-2xl">

      <div className="mt-4">
        <TaskStatusFilter selected={statuses} onToggle={toggleStatusFilter} onClear={clearStatusFilter} />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {firstLoad && <Spinner />}

        {!firstLoad && error && (
          <ErrorState title="โหลดรายการงานไม่สำเร็จ" description={error} onRetry={reload} />
        )}

        {!firstLoad && !error && total === 0 && !loading && (
          <EmptyState
            title={filtering ? 'ไม่มีงานที่ตรงกับตัวกรอง' : 'ยังไม่มีงาน'}
            description={filtering ? 'ลองเลือกสถานะอื่น หรือล้างตัวกรอง' : 'กด “เพิ่มงาน” เพื่อเริ่มสร้างรายการแรก'}
          />
        )}

        {!firstLoad && !error && tasks.length > 0 && (
          <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <TaskList tasks={tasks} onStatusChange={changeStatus} onEdit={setFormState} onDelete={setDeleting} />
          </div>
        )}

        {!firstLoad && !error && (
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
        )}
      </div>

      <Modal open={formState !== null} title={formState === 'new' ? 'เพิ่มงาน' : 'แก้ไขงาน'} onClose={closeForm}>
        {formState !== null && (
          <TaskForm
            key={formState === 'new' ? 'new' : formState.id}
            task={formState === 'new' ? undefined : formState}
            onSubmit={(input) => (formState === 'new' ? addTask(input) : editTask(formState.id, input))}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="ลบงาน"
        message={`ต้องการลบ “${deleting?.title ?? ''}” ใช่หรือไม่ การลบไม่สามารถย้อนกลับได้`}
        loading={deletingBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
    </>
  )
}
