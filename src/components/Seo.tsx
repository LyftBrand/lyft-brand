import { useLocation } from 'react-router-dom';
import { config } from '../lib/content';
import { INDEXAVEL, SITE_URL } from '../lib/utils';

const BASE = 'Lyft · Moda fitness feminina';

interface Props {
  title?: string;
  description?: string;
  /** Caminho (/uploads/...) ou URL completa. Vira absoluta para WhatsApp/Instagram/Facebook. */
  image?: string;
  jsonLd?: object | object[];
  /** Página que não deve aparecer no Google (ex.: 404). */
  noindex?: boolean;
  type?: 'website' | 'product';
}

const absoluta = (u: string) => (u.startsWith('http') ? u : SITE_URL + u);

export default function Seo({ title, description, image, jsonLd, noindex, type = 'website' }: Props) {
  const { pathname } = useLocation();
  const t = title ? `${title} | Lyft` : `${BASE} | ${config.colecao}`;
  const d = (description ?? `Catálogo da Lyft, marca de moda fitness de Juliana Colet. Conjuntos, macaquinhos e jaquetas com compressão na medida e zero transparência. ${config.parcelamento}. Peça pelo WhatsApp.`).slice(0, 160);
  const url = SITE_URL + (pathname === '/' ? '/' : pathname.replace(/\/$/, ''));
  const img = absoluta(image ?? '/og-image.jpg');
  const robots = noindex || !INDEXAVEL ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';
  const dados = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    // React 19 move título, metas, links e JSON-LD para o <head> sozinho.
    <>
      <title>{t}</title>
      <meta name="description" content={d} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Lyft" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      <meta property="og:image" content={img} />
      <meta property="og:image:alt" content={title ?? 'Lyft · Moda fitness feminina'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t} />
      <meta name="twitter:description" content={d} />
      <meta name="twitter:image" content={img} />

      {config.google_site_verification && <meta name="google-site-verification" content={config.google_site_verification} />}
      {config.meta_domain_verification && <meta name="facebook-domain-verification" content={config.meta_domain_verification} />}

      {dados.map((j, i) => <script key={i} type="application/ld+json">{JSON.stringify(j)}</script>)}
    </>
  );
}

/** Dados da marca para o Google (aparece em todas as páginas). */
export const jsonLdMarca = () => ({
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  '@id': SITE_URL + '/#loja',
  name: 'Lyft',
  alternateName: 'Lyft Brand',
  description: 'Moda fitness feminina. Conjuntos, macaquinhos e jaquetas com compressão na medida e zero transparência.',
  url: SITE_URL + '/',
  logo: SITE_URL + '/logo.svg',
  image: SITE_URL + '/og-image.jpg',
  email: config.email,
  telephone: '+' + config.whatsapp.replace(/\D/g, ''),
  founder: { '@type': 'Person', name: 'Juliana Colet' },
  sameAs: [`https://www.instagram.com/${config.instagram.replace(/^@/, '')}/`],
  areaServed: { '@type': 'Country', name: 'Brasil' },
  paymentAccepted: 'Cartão de crédito',
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', telephone: '+' + config.whatsapp.replace(/\D/g, ''), availableLanguage: 'Portuguese' },
});
