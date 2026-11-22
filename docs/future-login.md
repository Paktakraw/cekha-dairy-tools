# Login ในแอป: สถานะปัจจุบันและแนวทางต่อยอด

## สถานะปัจจุบัน (Phase 14, เวอร์ชัน 0.5.x)
แอปใช้ **บัญชีผู้ใช้จริง** แทน Anonymous Sign-in เดิม รายละเอียดอยู่ใน [docs/features/auth.md](features/auth.md)
- สมัครด้วย ชื่อจริง, นามสกุล, username, อีเมล, เบอร์โทร, password; เข้าสู่ระบบด้วย **username + password**
- username, อีเมล, เบอร์โทร ห้ามซ้ำ (บังคับด้วย unique index ที่ตาราง `profiles`)
- ตัวตนใน Supabase Auth คืออีเมลสังเคราะห์ `<username>@<โดเมนจาก VITE_AUTH_EMAIL_DOMAIN>` (ต้องปิด "Confirm email") อีเมลจริงเก็บใน `profiles`
- session เก็บใน localStorage ต่ออายุอัตโนมัติ คงอยู่จนกว่าผู้ใช้กดออกจากระบบ
- `AuthProvider` ยังเป็นจุดเดียวที่จัดการ session; ผู้ใช้ anonymous จากเวอร์ชันเก่าถูกล้าง session ทิ้ง
- ข้อมูลเดิมของ anonymous ถูกล้างทั้งหมดตามการตัดสินใจของผู้ใช้ (`supabase/scripts/reset_all_user_data.sql`)
- ลืมรหัสผ่าน: ผู้ดูแลตั้งรหัสใหม่ให้ ดู [admin-password-reset.md](admin-password-reset.md)

ตารางทุกตารางของทุกฟีเจอร์ไม่ต้องแก้ เพราะใช้ `user_id` อ้างอิง `auth.users` และ RLS `auth.uid() = user_id` อยู่แล้ว

## ยังไม่ทำ (ต้องมี spec และผู้ใช้ยืนยันก่อน)
| เรื่อง | แนวทาง | ข้อควรระวัง |
|---|---|---|
| รีเซ็ตรหัสผ่านทางอีเมลจริง | หน้า "ลืมรหัสผ่าน" รับ username → Edge Function (ใช้สิทธิ์ฝั่งเซิร์ฟเวอร์) หาอีเมลจริงใน `profiles` แล้วส่งลิงก์รีเซ็ตผ่าน SMTP ที่ตั้งเอง | อีเมลสังเคราะห์ส่งจดหมายไม่ได้ จึงต้องมี Edge Function คั่น; ห้ามตอบให้รู้ว่ามี username นั้นหรือไม่; service_role key อยู่ในฝั่ง Edge Function เท่านั้น ห้ามอยู่ในแอป |
| Recovery code | ตอนสมัครออกโค้ดกู้คืนให้จดไว้ ใช้ตั้งรหัสใหม่ | ต้องเก็บแบบแฮช; ทำหายก็กู้ไม่ได้ |
| เปลี่ยนรหัสผ่าน / แก้โปรไฟล์ | หน้าตั้งค่าบัญชี เรียก `supabase.auth.updateUser`; แก้ `profiles` ต้องเพิ่ม policy UPDATE ใน migration ใหม่ และต้องรักษาให้ username ตรงกับตัวตนใน Auth | ถ้าให้เปลี่ยน username ต้องเปลี่ยนอีเมลสังเคราะห์ใน `auth.users` ด้วย |
| ยืนยันอีเมล/เบอร์ (OTP) | เปิด Confirm email พร้อมอีเมลจริง หรือ SMS OTP | ต้องเปลี่ยนตัวตนจากอีเมลสังเคราะห์เป็นอีเมลจริง — กระทบวิธีล็อกอินด้วย username |
| OAuth (Google ฯลฯ) | เปิด Provider ที่ Authentication → Providers แล้วผูกกับ `profiles` | ต้องออกแบบว่า username ของผู้ใช้ OAuth มาจากไหน |

## ข้อควรรู้ด้านความปลอดภัย
- RPC `check_register_available` เรียกได้ก่อนล็อกอิน เพื่อแจ้งฟิลด์ซ้ำตอนสมัคร ผลคือคนภายนอกตรวจเดาได้ว่า username/อีเมล/เบอร์ใดมีในระบบ — ถ้าต้องการเข้มกว่านี้ให้ตัด RPC ออกแล้วแจ้งผลซ้ำจากข้อผิดพลาดของการสมัครแทน (ข้อความจะไม่บอกว่าซ้ำที่ช่องไหน)
- ห้ามเปิด RLS แบบ public เพื่อ "ทำให้ง่ายขึ้น" และห้ามใช้ service_role key ในแอปฝั่ง client
- เปิด CAPTCHA/Attack Protection ที่ Authentication ของ Supabase ได้ถ้าเริ่มมีการสมัครรัว ๆ
