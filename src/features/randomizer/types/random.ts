/** Row จากตาราง random_groups (ไม่ select user_id) */
export interface RandomGroup {
  id: string
  name: string
  created_at: string
  updated_at: string
}

/** Row จากตาราง random_items (ไม่ select user_id) */
export interface RandomItem {
  id: string
  group_id: string
  label: string
  created_at: string
  updated_at: string
}

export interface RandomData {
  groups: RandomGroup[]
  items: RandomItem[]
}

/** State ของ Session การสุ่ม (ฝั่ง client เท่านั้น ไม่เก็บใน Database) */
export interface SessionState {
  selectedGroupIds: string[]
  /** id ของรายการที่สุ่มได้แล้ว เรียงตามลำดับที่สุ่ม */
  excludedIds: string[]
  lastPickedId: string | null
}
