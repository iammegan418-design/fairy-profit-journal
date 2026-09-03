import { defineConfig } from 'vite';

export default defineConfig({
  // 使用相對路徑，網站放在網域根目錄或子資料夾（例如 GitHub Pages）都能正常顯示
  base: './',
  server: {
    host: true,   // 同一個 Wi-Fi 下可以用手機開電腦的網址測試
    port: 5173
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
