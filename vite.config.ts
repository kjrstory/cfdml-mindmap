import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const repo = 'cfdml-mindmap';

export default defineConfig({
  base: `/${repo}/`,   // ← 끝에 슬래시 포함! (예: /cfdml-mindmap/)
  plugins: [react()],
});