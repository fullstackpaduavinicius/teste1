import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Produto from "./pages/Produto";
import Admin from "./pages/Admin";
import Loja from "./pages/Loja";
import Carrinho from "./pages/Carrinho";
import PagamentoSucesso from './pages/PagamentoSucesso';
import PagamentoFalha from './pages/PagamentoFalha';
import PagamentoPendente from './pages/PagamentoPendente';
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-prata text-grafite">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/produtos" element={<ProductList />} />
            
            {/* Rotas para detalhes de produto */}
            <Route path="/produto/:id" element={<Produto />} />
            <Route path="/detalhe-produto/:id" element={<ProductDetail />} />
            
            <Route path="/admin" element={<Admin />} />
            <Route path="/loja" element={<Loja />} />
            <Route path="/carrinho" element={<Carrinho />} />
            
            {/* Rotas de status de pagamento */}
            <Route path="/sucesso" element={<PagamentoSucesso />} />
            <Route path="/falha" element={<PagamentoFalha />} />
            <Route path="/pendente" element={<PagamentoPendente />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;