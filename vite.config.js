import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Quittr-Web/', // 👈 change this to your GitHub repo name
  plugins: [react()],
});
