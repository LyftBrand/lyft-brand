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
import Privacidade from './pages/Privacidade';
import CookieConsent from './components/CookieConsent';
import { LeadProvider } from './components/Lead';
import VoltarAoTopo from './components/VoltarAoTopo';
import { track } from './lib/utils';

/** Volta ao topo ao trocar de página (mas não ao trocar de cor/filtro). */
function Rolagem() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
    // Evento de página para o GA4 (no GTM: gatilho de evento personalizado "page_view").
    // Roda a cada troca de página, inclusive na primeira; o título já é o da página nova.
    track('page_view', { page_path: pathname, page_location: window.location.href, page_title: document.title });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <LeadProvider>
      <Rolagem />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/produto/:slug" element={<Produto />} />
          <Route path="/a-marca" element={<Marca />} />
          <Route path="/politica-de-privacidade" element={<Privacidade />} />
          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </main>
      <Footer />
      <VoltarAoTopo />
      <FloatingWhatsapp />
      <CookieConsent />
    </LeadProvider>
  );
}
