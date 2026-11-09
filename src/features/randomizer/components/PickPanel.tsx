import type { useRandomSession } from '../hooks/useRandomSession'
import { usePickAnimation } from '../hooks/usePickAnimation'
import type { RandomGroup, RandomItem } from '../types/random'
import { ExcludedList } from './ExcludedList'
import { GroupSelector } from './GroupSelector'
import { RandomPicker } from './RandomPicker'

interface PickPanelProps {
  groups: RandomGroup[]
  items: RandomItem[]
  groupNameById: Map<string, string>
  session: ReturnType<typeof useRandomSession>
}

/** แท็บ "สุ่ม": เลือกกลุ่ม + ปุ่มสุ่ม (พร้อม animation) + รายการที่สุ่มไปแล้ว */
export function PickPanel({ groups, items, groupNameById, session }: PickPanelProps) {
  const { spinning, preview, start } = usePickAnimation(session.current, session.pick)
  const lastPickedGroupName = session.lastPicked ? (groupNameById.get(session.lastPicked.group_id) ?? null) : null

  return (
    <div className="flex flex-col gap-6">
      <GroupSelector
        groups={groups}
        items={items}
        selectedGroupIds={session.selectedGroupIds}
        disabled={spinning}
        onToggle={session.toggleGroup}
      />
      <RandomPicker
        lastPicked={session.lastPicked}
        lastPickedGroupName={lastPickedGroupName}
        poolCount={session.pool.length}
        currentCount={session.current.length}
        hasSelection={session.selectedGroupIds.length > 0}
        spinning={spinning}
        previewLabel={preview?.label ?? null}
        onPick={start}
        onReset={session.reset}
      />
      <ExcludedList items={session.excluded} groupNameById={groupNameById} />
    </div>
  )
}
