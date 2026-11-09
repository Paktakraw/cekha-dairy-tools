import { Plus, RefreshCw, Settings2, Shuffle, type LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { Button, ConfirmDialog, EmptyState, Modal, Spinner } from '../../../shared/components/ui'
import { GroupForm } from '../components/GroupForm'
import { GroupList } from '../components/GroupList'
import { ItemForm } from '../components/ItemForm'
import { PickPanel } from '../components/PickPanel'
import { useGroups } from '../hooks/useGroups'
import { useRandomSession } from '../hooks/useRandomSession'
import type { RandomGroup, RandomItem } from '../types/random'

type Tab = 'pick' | 'manage'

type FormState =
  | null
  | { kind: 'group'; group?: RandomGroup }
  | { kind: 'item'; group: RandomGroup; item?: RandomItem }

type DeleteState = null | { kind: 'group'; group: RandomGroup } | { kind: 'item'; item: RandomItem }

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'pick', label: 'สุ่ม', icon: Shuffle },
  { id: 'manage', label: 'จัดการกลุ่ม', icon: Settings2 },
]

export default function RandomizerPage() {
  const { groups, items, loading, error, reload, addGroup, editGroup, removeGroup, addItem, editItem, removeItem } =
    useGroups()
  const session = useRandomSession(items)

  const [tab, setTab] = useState<Tab>('pick')
  const [formState, setFormState] = useState<FormState>(null)
  const [deleteState, setDeleteState] = useState<DeleteState>(null)
  const [deleting, setDeleting] = useState(false)

  const groupNameById = useMemo(() => new Map(groups.map((g) => [g.id, g.name])), [groups])

  const closeForm = () => setFormState(null)

  const submitGroup = async (name: string, group?: RandomGroup): Promise<string | null> => {
    if (!group) return addGroup(name)
    const error = await editGroup(group.id, name)
    if (error === null) session.handleGroupEdited(group.id)
    return error
  }

  const submitItem = (label: string, group: RandomGroup, item?: RandomItem): Promise<string | null> =>
    item ? editItem(item.id, label) : addItem(group.id, label)

  const confirmDelete = async () => {
    if (!deleteState) return
    setDeleting(true)
    if (deleteState.kind === 'group') {
      const ok = await removeGroup(deleteState.group.id)
      if (ok) session.handleGroupDeleted(deleteState.group.id)
    } else {
      await removeItem(deleteState.item.id)
    }
    setDeleting(false)
    setDeleteState(null)
  }

  const deleteMessage =
    deleteState?.kind === 'group'
      ? `ต้องการลบกลุ่ม “${deleteState.group.name}” พร้อมรายการทั้งหมดในกลุ่มใช่หรือไม่ การลบไม่สามารถย้อนกลับได้`
      : deleteState?.kind === 'item'
        ? `ต้องการลบรายการ “${deleteState.item.label}” ใช่หรือไม่ การลบไม่สามารถย้อนกลับได้`
        : ''

  const formTitle =
    formState?.kind === 'group'
      ? formState.group
        ? 'แก้ไขกลุ่ม'
        : 'เพิ่มกลุ่ม'
      : formState?.kind === 'item'
        ? formState.item
          ? `แก้ไขรายการ`
          : `เพิ่มรายการใน ${formState.group.name}`
        : ''

  return (
    <>
      <PageHeader>
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-semibold text-gray-900">Randomizer</h1>
          <Button onClick={() => setFormState({ kind: 'group' })}>
            <Plus className="h-4 w-4" />
            เพิ่มกลุ่ม
          </Button>
        </div>
      </PageHeader>
      <div className="mx-auto max-w-2xl">

      <div role="tablist" aria-label="โหมดการใช้งาน" className="mt-4 flex gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
              tab === id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {loading && <Spinner />}

        {!loading && error && (
          <EmptyState
            title="โหลดข้อมูลไม่สำเร็จ"
            description={error}
            action={
              <Button variant="secondary" onClick={reload}>
                <RefreshCw className="h-4 w-4" />
                ลองใหม่
              </Button>
            }
          />
        )}

        {!loading && !error && groups.length === 0 && (
          <EmptyState
            title="ยังไม่มีกลุ่ม"
            description="สร้างกลุ่มแรก เช่น “อาหารกลางวัน” แล้วเพิ่มรายการเข้าไปเพื่อเริ่มสุ่ม"
            action={
              <Button onClick={() => setFormState({ kind: 'group' })}>
                <Plus className="h-4 w-4" />
                เพิ่มกลุ่ม
              </Button>
            }
          />
        )}

        {!loading && !error && groups.length > 0 && tab === 'pick' && (
          <PickPanel groups={groups} items={items} groupNameById={groupNameById} session={session} />
        )}

        {!loading && !error && groups.length > 0 && tab === 'manage' && (
          <GroupList
            groups={groups}
            items={items}
            onEditGroup={(group) => setFormState({ kind: 'group', group })}
            onDeleteGroup={(group) => setDeleteState({ kind: 'group', group })}
            onAddItem={(group) => setFormState({ kind: 'item', group })}
            onEditItem={(item) => {
              const group = groups.find((g) => g.id === item.group_id)
              if (group) setFormState({ kind: 'item', group, item })
            }}
            onDeleteItem={(item) => setDeleteState({ kind: 'item', item })}
          />
        )}
      </div>

      <Modal open={formState !== null} title={formTitle} onClose={closeForm}>
        {formState?.kind === 'group' && (
          <GroupForm
            key={formState.group?.id ?? 'new-group'}
            group={formState.group}
            onSubmit={(name) => submitGroup(name, formState.group)}
            onCancel={closeForm}
          />
        )}
        {formState?.kind === 'item' && (
          <ItemForm
            key={formState.item?.id ?? `new-item-${formState.group.id}`}
            item={formState.item}
            onSubmit={(label) => submitItem(label, formState.group, formState.item)}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleteState !== null}
        title={deleteState?.kind === 'group' ? 'ลบกลุ่ม' : 'ลบรายการ'}
        message={deleteMessage}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteState(null)}
      />
    </div>
    </>
  )
}
