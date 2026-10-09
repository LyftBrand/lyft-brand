import { useState, type ImgHTMLAttributes } from 'react';
import { img, srcSet } from '../lib/utils';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> & {
  src: string;
  /** Larguras geradas pelo CDN. */
  widths?: number[];
  quality?: number;
  priority?: boolean;
};

/** Imagem com srcset do Image CDN, carregamento preguiçoso e fade-in suave. */
export default function SmartImage({ src, widths = [400, 700, 1000, 1400], quality = 75, priority, className = '', alt = '', sizes = '100vw', ...rest }: Props) {
  // A imagem principal (priority) aparece direto, sem fade: conta para o LCP do PageSpeed.
  const [ok, setOk] = useState(!!priority);
  return (
    <img
      src={img(src, widths[widths.length - 1], quality)}
      srcSet={srcSet(src, widths, quality)}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      ref={(el) => { if (el?.complete && el.naturalWidth && !ok) setOk(true); }}
      onLoad={() => setOk(true)}
      className={`transition-opacity duration-700 ${ok ? 'opacity-100' : 'opacity-0'} ${className}`}
      {...rest}
    />
  );
}
