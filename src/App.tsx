import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingWhatsapp from './components/FloatingWhatsapp';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import Produto from './pages/Produto';
import Marca from './pages/Marca';
import NaoEncontrada from './pages/NaoEncontrada';
import { track } from './lib/utils';

/** Volta ao topo ao trocar de página (mas não ao trocar de cor/filtro). */
function Rolagem() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
    track('page_view', { page_path: pathname });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <Rolagem />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/produto/:slug" element={<Produto />} />
          <Route path="/a-marca" element={<Marca />} />
          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </main>
      <Footer />
      <FloatingWhatsapp />
    </>
  );
}
