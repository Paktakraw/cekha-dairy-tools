import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // แยกไลบรารีหลักเป็นไฟล์ของตัวเอง: โค้ดแอปเปลี่ยนบ่อยแต่ไลบรารีไม่ค่อยเปลี่ยน เบราว์เซอร์จึง cache ไลบรารีได้
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('react-router') || id.includes('@remix-run')) return 'router'
          if (id.includes('react-dom') || id.includes('scheduler') || /node_modules\/react\//.test(id)) return 'react'
          return undefined
        },
      },
    },
  },
})
