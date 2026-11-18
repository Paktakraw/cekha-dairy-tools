import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { sizeNoteService } from '../services/sizeNoteService'
import type { NoteValues, SizeNote } from '../types/size'

interface Loaded {
  key: number
  notes: SizeNote[]
  error: string | null
}

export function useSizeNotes() {
  const toast = useToast()
  const [refreshKey, setRefreshKey] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    let cancelled = false
    const key = refreshKey
    void sizeNoteService.list().then((result) => {
      if (cancelled) return
      setLoaded(result.error !== null ? { key, notes: [], error: result.error } : { key, notes: result.data, error: null })
    })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const loading = loaded === null || loaded.key !== refreshKey
  const firstLoad = loaded === null
  const error = loaded && !loading ? loaded.error : null
  const notes = loaded?.notes ?? []

  const refresh = useCallback(() => setRefreshKey((n) => n + 1), [])

  const addNote = useCallback(
    async (values: NoteValues): Promise<string | null> => {
      const result = await sizeNoteService.create(values)
      if (result.error !== null) return result.error
      toast.success('เพิ่มบันทึกแล้ว')
      refresh()
      return null
    },
    [toast, refresh],
  )

  const editNote = useCallback(
    async (id: string, values: NoteValues): Promise<string | null> => {
      const result = await sizeNoteService.update(id, values)
      if (result.error !== null) return result.error
      toast.success('บันทึกการแก้ไขแล้ว')
      refresh()
      return null
    },
    [toast, refresh],
  )

  const removeNote = useCallback(
    async (id: string): Promise<void> => {
      const result = await sizeNoteService.remove(id)
      if (result.error !== null) {
        toast.error(result.error)
        return
      }
      toast.success('ลบบันทึกแล้ว')
      refresh()
    },
    [toast, refresh],
  )

  return { notes, loading, firstLoad, error, reload: refresh, addNote, editNote, removeNote }
}
