import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ GitHub Pages(프로젝트 페이지)로 배포 시 base를 '/<repo>/'로 바꾸세요.
// 예: '/career-roadmap-ver2/'
export default defineConfig({
  plugins: [react()],
  base: '/<repo>/',
})
