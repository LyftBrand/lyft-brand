import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Na Netlify: URL = endereço principal do site (vira o domínio próprio quando ele for configurado)
// e CONTEXT = production | branch-deploy | deploy-preview.
const SITE = process.env.URL || 'https://lyftbrand.netlify.app';
const CONTEXTO = process.env.CONTEXT || 'dev';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_SITE_URL': JSON.stringify(SITE),
    'import.meta.env.VITE_CONTEXT': JSON.stringify(CONTEXTO),
  },
  // content/ é lido no build (import.meta.glob); a Netlify refaz o build a cada publicação no painel.
  server: { fs: { allow: ['.'] } },
});
