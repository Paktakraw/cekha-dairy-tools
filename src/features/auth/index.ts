// ฟีเจอร์ Auth ไม่ใช่เครื่องมือใน Sidebar จึงไม่ export FeatureConfig เข้า Registry
// router ใช้หน้าสาธารณะเหล่านี้ผ่าน lazy import ใน src/app/router.tsx
export { default as LoginPage } from './pages/LoginPage'
export { default as RegisterPage } from './pages/RegisterPage'
