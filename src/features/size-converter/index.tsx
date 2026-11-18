import { Ruler } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import type { FeatureConfig } from '../../shared/types/feature'
import { ConverterPage, NotesPage, ProfilesPage, SizeConverterLayout } from './lazyPages'

export const sizeConverterFeature: FeatureConfig = {
  id: 'size-converter',
  name: 'ไซส์ไหนคือฉัน',
  description: 'บันทึกสัดส่วนจริง แล้วแปลงเป็นไซส์รองเท้า เสื้อผ้า แหวน หมวก ของแต่ละประเทศ',
  icon: Ruler,
  path: '/size-converter',
  routes: [
    {
      element: <SizeConverterLayout />,
      children: [
        { index: true, element: <Navigate to="converter" replace /> },
        { path: 'converter', element: <ConverterPage /> },
        { path: 'profiles', element: <ProfilesPage /> },
        { path: 'notes', element: <NotesPage /> },
      ],
    },
  ],
}
