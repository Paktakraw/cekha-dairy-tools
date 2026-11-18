/**
 * ตารางช่วงตัวเลขเสื้อผ้า (ค่าประมาณจากตารางมาตรฐานกลาง ไม่ใช่ของแบรนด์ใดแบรนด์หนึ่ง)
 * แหล่งอ้างอิงที่ใช้เทียบ (แต่ละแหล่งตัวเลขไม่ตรงกันเป๊ะ จึงใช้ค่ากลางและติดป้าย "ค่าประมาณ"):
 * - ผู้ชาย: Lord & Taylor https://lordandtaylor.com/pages/mens-tops-size-chart , Rab (EU/JP) https://www.altitude-sports.com/pages/sizing-rab-mens-clothing , Sennheiser measurement tables
 * - ผู้หญิง: size.ly https://www.size.ly/conversion-charts/womens-international-size-conversion-chart , kiwisizing.com , usatourist.com
 * ไซส์ญี่ปุ่นเล็กกว่าอเมริกา/ยุโรป 1 ขั้นสำหรับตัวเดียวกัน (US M ≈ JP L) แหล่งข้อมูลหลายแหล่งไม่ตรงกัน ถือเป็นค่าประมาณ
 * ช่วงเป็น [min, max) หน่วย cm เพื่อให้ขอบไม่ซ้อนกัน
 */
import type { Demographic } from '../types/size'

export interface ChartRow {
  min: number
  max: number
  /** ไซส์ตัวอักษร */
  size: string
  eu: string
  us: string
  jp: string
}

export interface ClothingChart {
  rows: ChartRow[]
}

const menTops: ChartRow[] = [
  { min: 84, max: 90, size: 'XS', eu: '44', us: 'XS', jp: 'S' },
  { min: 90, max: 96, size: 'S', eu: '46', us: 'S', jp: 'M' },
  { min: 96, max: 102, size: 'M', eu: '48–50', us: 'M', jp: 'L' },
  { min: 102, max: 108, size: 'L', eu: '52', us: 'L', jp: 'XL' },
  { min: 108, max: 114, size: 'XL', eu: '54', us: 'XL', jp: 'XXL' },
  { min: 114, max: 120, size: 'XXL', eu: '56', us: 'XXL', jp: '3XL' },
]

const womenTops: ChartRow[] = [
  { min: 78, max: 84, size: 'XS', eu: '32–34', us: '0–2', jp: '5–7' },
  { min: 84, max: 90, size: 'S', eu: '36–38', us: '4–6', jp: '9–11' },
  { min: 90, max: 98, size: 'M', eu: '40–42', us: '8–10', jp: '13–15' },
  { min: 98, max: 106, size: 'L', eu: '44–46', us: '12–14', jp: '17–19' },
  { min: 106, max: 114, size: 'XL', eu: '48–50', us: '16–18', jp: '21–23' },
]

const menWaist: ChartRow[] = [
  { min: 66, max: 72, size: 'XS', eu: '44', us: 'XS', jp: 'S' },
  { min: 72, max: 80, size: 'S', eu: '46', us: 'S', jp: 'M' },
  { min: 80, max: 88, size: 'M', eu: '48–50', us: 'M', jp: 'L' },
  { min: 88, max: 96, size: 'L', eu: '52', us: 'L', jp: 'XL' },
  { min: 96, max: 104, size: 'XL', eu: '54', us: 'XL', jp: 'XXL' },
  { min: 104, max: 112, size: 'XXL', eu: '56', us: 'XXL', jp: '3XL' },
]

const menHip: ChartRow[] = [
  { min: 86, max: 92, size: 'XS', eu: '44', us: 'XS', jp: 'S' },
  { min: 92, max: 98, size: 'S', eu: '46', us: 'S', jp: 'M' },
  { min: 98, max: 104, size: 'M', eu: '48–50', us: 'M', jp: 'L' },
  { min: 104, max: 110, size: 'L', eu: '52', us: 'L', jp: 'XL' },
  { min: 110, max: 116, size: 'XL', eu: '54', us: 'XL', jp: 'XXL' },
  { min: 116, max: 122, size: 'XXL', eu: '56', us: 'XXL', jp: '3XL' },
]

const womenWaist: ChartRow[] = [
  { min: 60, max: 66, size: 'XS', eu: '32–34', us: '0–2', jp: '5–7' },
  { min: 66, max: 72, size: 'S', eu: '36–38', us: '4–6', jp: '9–11' },
  { min: 72, max: 80, size: 'M', eu: '40–42', us: '8–10', jp: '13–15' },
  { min: 80, max: 88, size: 'L', eu: '44–46', us: '12–14', jp: '17–19' },
  { min: 88, max: 96, size: 'XL', eu: '48–50', us: '16–18', jp: '21–23' },
]

const womenHip: ChartRow[] = [
  { min: 84, max: 90, size: 'XS', eu: '32–34', us: '0–2', jp: '5–7' },
  { min: 90, max: 96, size: 'S', eu: '36–38', us: '4–6', jp: '9–11' },
  { min: 96, max: 104, size: 'M', eu: '40–42', us: '8–10', jp: '13–15' },
  { min: 104, max: 112, size: 'L', eu: '44–46', us: '12–14', jp: '17–19' },
  { min: 112, max: 120, size: 'XL', eu: '48–50', us: '16–18', jp: '21–23' },
]

export const TOPS_CHART: Record<Demographic, ChartRow[]> = { men: menTops, women: womenTops }
export const WAIST_CHART: Record<Demographic, ChartRow[]> = { men: menWaist, women: womenWaist }
export const HIP_CHART: Record<Demographic, ChartRow[]> = { men: menHip, women: womenHip }
