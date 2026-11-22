const raw = import.meta.env.VITE_AUTH_EMAIL_DOMAIN

/**
 * โดเมนของอีเมลสังเคราะห์ที่ใช้เป็นตัวตนใน Supabase Auth (username@<โดเมน>)
 * null เมื่อยังไม่ได้ตั้ง VITE_AUTH_EMAIL_DOMAIN ใน .env — service จะแจ้งผู้ใช้แทนการพัง
 */
export const authEmailDomain: string | null =
  typeof raw === 'string' && raw.trim() !== '' ? raw.trim().toLowerCase() : null
