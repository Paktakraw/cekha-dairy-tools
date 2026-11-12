import { calorieFeature } from '../features/calorie'
import { financeFeature } from '../features/finance'
import { randomizerFeature } from '../features/randomizer'
import { todoFeature } from '../features/todo'
import { unitPriceFeature } from '../features/unit-price'
import type { FeatureConfig } from '../shared/types/feature'

/** เพิ่มฟีเจอร์ใหม่ = ลงทะเบียนที่นี่ที่เดียว Sidebar, Portal และ Router สร้างจากรายการนี้ */
export const featureRegistry: FeatureConfig[] = [todoFeature, randomizerFeature, financeFeature, calorieFeature, unitPriceFeature]
