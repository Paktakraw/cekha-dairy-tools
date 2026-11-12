import { useCallback, useMemo, useState } from 'react'
import { MAX_OPTIONS, MIN_OPTIONS } from '../constants'
import type { ComparisonResult, OptionInput, OptionValidation, UnitGroup } from '../types/unitPrice'
import { compareOptions, validateOption } from '../utils/unitPrice'
import { DEFAULT_RESULT_UNIT_ID } from '../utils/units'

let nextOptionId = 0

function createOption(): OptionInput {
  nextOptionId += 1
  return { id: `option-${nextOptionId}`, name: '', price: '', quantity: '', unit: 'g' }
}

export function useComparison() {
  const [options, setOptions] = useState<OptionInput[]>(() => Array.from({ length: MIN_OPTIONS }, createOption))
  const [resultUnitIds, setResultUnitIds] = useState<Record<UnitGroup, string>>(DEFAULT_RESULT_UNIT_ID)

  const validations = useMemo<Record<string, OptionValidation>>(
    () => Object.fromEntries(options.map((o) => [o.id, validateOption(o)])),
    [options],
  )
  const result = useMemo<ComparisonResult>(() => compareOptions(options), [options])

  const updateOption = useCallback((id: string, patch: Partial<Omit<OptionInput, 'id'>>) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }, [])

  const addOption = useCallback(() => {
    setOptions((prev) => (prev.length >= MAX_OPTIONS ? prev : [...prev, createOption()]))
  }, [])

  const removeOption = useCallback((id: string) => {
    setOptions((prev) => (prev.length <= MIN_OPTIONS ? prev : prev.filter((o) => o.id !== id)))
  }, [])

  const setResultUnit = useCallback((group: UnitGroup, unitId: string) => {
    setResultUnitIds((prev) => ({ ...prev, [group]: unitId }))
  }, [])

  return {
    options,
    validations,
    result,
    resultUnitIds,
    canAdd: options.length < MAX_OPTIONS,
    canRemove: options.length > MIN_OPTIONS,
    updateOption,
    addOption,
    removeOption,
    setResultUnit,
  }
}
