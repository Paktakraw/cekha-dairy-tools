import { ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { IconButton } from '../../../shared/components/ui'
import type { RandomGroup, RandomItem } from '../types/random'
import { ItemList } from './ItemList'

interface GroupListProps {
  groups: RandomGroup[]
  items: RandomItem[]
  onEditGroup: (group: RandomGroup) => void
  onDeleteGroup: (group: RandomGroup) => void
  onAddItem: (group: RandomGroup) => void
  onEditItem: (item: RandomItem) => void
  onDeleteItem: (item: RandomItem) => void
}

export function GroupList({
  groups,
  items,
  onEditGroup,
  onDeleteGroup,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: GroupListProps) {
  // เก็บเฉพาะกลุ่มที่ยุบอยู่ กลุ่มใหม่จึงขยายเป็นค่าเริ่มต้น
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set())

  const toggle = (groupId: string) =>
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })

  const allCollapsed = groups.length > 0 && groups.every((g) => collapsedIds.has(g.id))
  const toggleAll = () => setCollapsedIds(allCollapsed ? new Set() : new Set(groups.map((g) => g.id)))

  const handleAddItem = (group: RandomGroup) => {
    // เพิ่มรายการในกลุ่มที่ยุบอยู่ ให้ขยายออกมาเพื่อเห็นผล
    setCollapsedIds((prev) => {
      if (!prev.has(group.id)) return prev
      const next = new Set(prev)
      next.delete(group.id)
      return next
    })
    onAddItem(group)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <IconButton
          icon={allCollapsed ? ChevronsUpDown : ChevronsDownUp}
          label={allCollapsed ? 'ขยายทุกกลุ่ม' : 'ยุบทุกกลุ่ม'}
          onClick={toggleAll}
        />
      </div>
      <ul className="flex flex-col gap-3">
        {groups.map((group) => {
          const groupItems = items.filter((i) => i.group_id === group.id)
          const expanded = !collapsedIds.has(group.id)
          const panelId = `group-panel-${group.id}`
          return (
            <li key={group.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1">
                  <IconButton
                    icon={expanded ? ChevronDown : ChevronRight}
                    label={expanded ? `ยุบกลุ่ม ${group.name}` : `ขยายกลุ่ม ${group.name}`}
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => toggle(group.id)}
                  />
                  <button
                    type="button"
                    onClick={() => toggle(group.id)}
                    tabIndex={-1}
                    className="min-w-0 text-left font-medium break-words text-gray-900"
                  >
                    {group.name} <span className="text-sm font-normal text-gray-400">({groupItems.length})</span>
                  </button>
                </div>
                <div className="flex shrink-0">
                  <IconButton icon={Plus} label={`เพิ่มรายการใน ${group.name}`} onClick={() => handleAddItem(group)} />
                  <IconButton icon={Pencil} label={`แก้ไขกลุ่ม ${group.name}`} onClick={() => onEditGroup(group)} />
                  <IconButton
                    icon={Trash2}
                    label={`ลบกลุ่ม ${group.name}`}
                    tone="danger"
                    onClick={() => onDeleteGroup(group)}
                  />
                </div>
              </div>
              {expanded && (
                <div id={panelId} className="mt-2">
                  <ItemList items={groupItems} onEdit={onEditItem} onDelete={onDeleteItem} />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
