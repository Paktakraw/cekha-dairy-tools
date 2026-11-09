import type { ReactNode } from 'react'

interface PageHeaderProps {
  children: ReactNode
  /** ความกว้างสูงสุดของเนื้อหาใน header ให้ตรงกับเนื้อหาของหน้า */
  maxWidth?: string
}

/**
 * Header ของหน้า ติดอยู่กับที่ขณะเลื่อนเนื้อหา
 * - ขยายเต็มความกว้างของ main (ใช้ margin ติดลบหักล้าง padding ของ MainLayout ให้ตรงกันทุกขนาดจอ)
 * - ต่ำกว่า lg มีแถบเมนูด้านบน (h-14, sticky) จึงเลื่อนลงมาติดใต้แถบนั้น
 */
export function PageHeader({ children, maxWidth = 'max-w-2xl' }: PageHeaderProps) {
  return (
    <div className="sticky top-14 z-10 -mx-4 -mt-4 border-b border-gray-200 bg-white px-4 py-3 sm:-mx-6 sm:-mt-6 sm:px-6 lg:top-0 lg:-mx-8 lg:-mt-8 lg:px-8">
      <div className={`mx-auto ${maxWidth}`}>{children}</div>
    </div>
  )
}
