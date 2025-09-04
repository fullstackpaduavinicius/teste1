import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";

import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Produto from "./pages/Produto";
import Admin from "./pages/Admin";
import Loja from "./pages/Loja";
import Carrinho from "./pages/Carrinho";
import PagamentoSucesso from "./pages/PagamentoSucesso";
import PagamentoFalha from "./pages/PagamentoFalha";
import PagamentoPendente from "./pages/PagamentoPendente";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import PaginaConfirmacao from "./pages/PaginaConfirmacao";

// Novas páginas (cliente)
import Signup from "./pages/Signup";
import LoginCliente from "./pages/LoginCliente";
import Conta from "./pages/Conta";

function App() {
  return (
    <Router>
      {/* Provider obrigatório para todos os tooltips do app */}
      <Tooltip.Provider delayDuration={200} skipDelayDuration={400}>
        <div className="flex flex-col min-h-screen bg-prata text-grafite">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-6">
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/produtos" element={<ProductList />} />
              <Route path="/produto/:id" element={<Produto />} />
              <Route path="/detalhe-produto/:id" element={<ProductDetail />} />
              <Route path="/loja" element={<Loja />} />
              <Route path="/carrinho" element={<Carrinho />} />

              {/* Rotas administrativas */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/confirmar/:token" element={<PaginaConfirmacao />} />

              {/* Rotas de status de pagamento */}
              <Route path="/sucesso" element={<PagamentoSucesso />} />
              <Route path="/falha" element={<PagamentoFalha />} />
              <Route path="/pendente" element={<PagamentoPendente />} />

              {/* Novas rotas cliente */}
              <Route path="/criar-conta" element={<Signup />} />
              <Route path="/entrar" element={<LoginCliente />} />
              <Route path="/conta" element={<Conta />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Tooltip.Provider>
    </Router>
  );
}

export default App;
