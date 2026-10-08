import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

export default function NaoEncontrada() {
  return (
    <section className="container-x py-28 text-center">
      <Seo title="Página não encontrada" />
      <p className="eyebrow text-rose-deep">Ops</p>
      <h1 className="display text-[44px] md:text-[64px] mt-4">Essa peça saiu do catálogo.</h1>
      <p className="mt-4 text-ink-soft">Mas tem muita coisa linda esperando por você.</p>
      <Link to="/catalogo" className="btn btn-dark mt-8">Ver o catálogo</Link>
    </section>
  );
}
