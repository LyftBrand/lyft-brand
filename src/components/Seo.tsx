import { Helmet } from 'react-helmet-async';
import { config } from '../lib/content';

const BASE = 'Lyft · Moda fitness feminina';

export default function Seo({ title, description, image, jsonLd }: { title?: string; description?: string; image?: string; jsonLd?: object }) {
  const t = title ? `${title} | Lyft` : `${BASE} | ${config.colecao}`;
  const d = description ?? `Conjuntos, macaquinhos e jaquetas fitness com compressão na medida e zero transparência. ${config.parcelamento}. Peça pelo WhatsApp.`;
  return (
    <Helmet>
      <title>{t}</title>
      <meta name="description" content={d} />
      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      {image && <meta property="og:image" content={image} />}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
