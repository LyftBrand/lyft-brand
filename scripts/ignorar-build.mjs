// A Netlify roda isto antes de cada publicação (ignore no netlify.toml).
// Saída 0 = pula (não gasta crédito). Saída 1 = publica.
// O que o painel salva (content/ e public/uploads/) espera o botão "Colocar o site no ar" do /admin,
// que usa um build hook: a Netlify nunca pula publicação vinda de build hook.
// Mudança de código publica na hora e leva junto o que estiver salvo.
import { execSync } from 'node:child_process';

const { CACHED_COMMIT_REF: antes, COMMIT_REF: agora } = process.env;
const publicar = (motivo) => { console.log(`publicar: ${motivo}`); process.exit(1); };
const pular = (motivo) => { console.log(`pular: ${motivo}`); process.exit(0); };

// "Trigger deploy" manual no painel da Netlify, ou primeira publicação: publica.
if (!antes || !agora || antes === agora) publicar('publicação manual');

let arquivos;
try {
  arquivos = execSync(`git diff --name-only ${antes} ${agora}`, { encoding: 'utf8' }).split('\n').filter(Boolean);
} catch {
  publicar('não deu para comparar as versões');
}

const soConteudo = arquivos.every((f) => f.startsWith('content/') || f.startsWith('public/uploads/'));
if (soConteudo) pular('só alterações do painel; entram no ar pelo botão Colocar o site no ar');
publicar('mudança no código do site');
