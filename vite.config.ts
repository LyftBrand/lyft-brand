import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // content/ é lido no build (import.meta.glob); a Netlify refaz o build a cada publicação no painel.
  server: { fs: { allow: ['.'] } },
});
