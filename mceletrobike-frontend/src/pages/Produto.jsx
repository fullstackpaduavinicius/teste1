// src/pages/Produto.jsx
import { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import * as Tabs from "@radix-ui/react-tabs";
import { Minus, Plus, ShoppingCart, ArrowRight, ShieldCheck, Truck, CreditCard, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { useCarrinhoStore } from "../store/carrinho";
import { useDocumentHead } from "../lib/useDocumentHead";

const apiBase =
  (import.meta.env.VITE_BACKEND_URL && import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")) ||
  "https://mceletrobike-backend.onrender.com";

const currency = (n) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ------------ Freight mock (ajuste depois com seu backend) ------------ */
const FRETE_BASE = 79.9;
function calcularFrete(totalParcial, cep) {
  if (!cep || String(cep).replace(/\D/g, "").length !== 8) return 0;
  if (totalParcial >= 5000) return 0;
  return FRETE_BASE;
}

/* ------------------------------- Fetching ----------------------------- */
async function fetchProduto(id) {
  const { data } = await axios.get(`${apiBase}/api/produtos/${id}`);
  return data;
}
async function fetchTodos() {
  const { data } = await axios.get(`${apiBase}/api/produtos`);
  return Array.isArray(data) ? data : [];
}

export default function Produto() {
  const { id } = useParams();
  const navigate = useNavigate();

  // store: mantém compatibilidade (adicionarItem ou adicionar)
  const addToCart = useCarrinhoStore((s) => s.adicionarItem ?? s.adicionar);

  const { data: produto, isLoading, isError, refetch } = useQuery({
    queryKey: ["produto", id],
    queryFn: () => fetchProduto(id),
    staleTime: 2 * 60 * 1000,
  });

  const { data: todos = [] } = useQuery({
    queryKey: ["produtos"],
    queryFn: fetchTodos,
    staleTime: 2 * 60 * 1000,
  });

  const relacionados = useMemo(() => {
    if (!produto || !produto.category) return [];
    return todos
      .filter((p) => p._id !== produto._id && p.category === produto.category)
      .slice(0, 4);
  }, [todos, produto]);

  // SEO
  useDocumentHead({
    title: produto?.name ? `${produto.name} – MC ELECTROBIKE` : "Produto – MC ELECTROBIKE",
    description: produto?.description?.slice(0, 150),
    image: produto?.imageUrl,
    url: typeof window !== "undefined" ? window.location.href : undefined,
  });

  // UI
  const [quantidade, setQuantidade] = useState(1);
  const [cep, setCep] = useState("");
  const subtotal = (Number(produto?.price) || 0) * (quantidade || 1);
  const frete = calcularFrete(subtotal, cep);
  const total = subtotal + frete;

  const handleAdd = () => {
    if (!produto) return;
    addToCart(produto, quantidade);
    toast.success(`${produto.name} adicionado ao carrinho`);
  };
  const handleBuyNow = () => {
    handleAdd();
    navigate("/carrinho");
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 rounded-2xl bg-black/10 animate-pulse" />
          <div>
            <div className="h-8 w-3/4 bg-black/10 rounded-md animate-pulse" />
            <div className="mt-2 h-5 w-1/2 bg-black/10 rounded-md animate-pulse" />
            <div className="mt-6 h-10 w-40 bg-black/10 rounded-xl animate-pulse" />
            <div className="mt-4 h-12 w-full bg-black/10 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p className="text-red-600 font-medium">Erro ao carregar dados do produto.</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p>Produto não disponível</p>
        <Link
          to="/"
          className="inline-block mt-4 px-4 py-2 rounded-xl bg-azul text-white hover:brightness-110"
        >
          Voltar para a loja
        </Link>
      </div>
    );
  }

  const img = produto.imageUrl || "https://via.placeholder.com/800x600?text=Sem+imagem";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb simples */}
      <nav className="text-sm text-black/60 mb-4">
        <Link to="/" className="hover:underline">Início</Link> <span>›</span>{" "}
        <Link to="/produtos" className="hover:underline">Produtos</Link> <span>›</span>{" "}
        <span className="text-black/80 line-clamp-1">{produto.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Imagem / mídia */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-2xl overflow-hidden bg-white border border-black/10 shadow-soft"
        >
          <img
            src={img}
            alt={produto.name}
            className="w-full h-96 object-cover"
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/800x600?text=Sem+imagem")}
          />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 text-[11px] font-semibold bg-amarelo text-grafite px-2 py-1 rounded-full">
            <BadgeCheck size={14} /> Pronta entrega
          </span>
        </motion.div>

        {/* Infos principais */}
        <div>
          <h1 className="text-3xl font-bold text-azul leading-tight">{produto.name}</h1>
          {produto.category && (
            <p className="text-sm text-black/60 mt-1">Categoria: {produto.category}</p>
          )}

          <div className="mt-4 text-3xl font-extrabold text-azul">
            {currency(produto.price)}
          </div>

          {/* Stepper de quantidade */}
          <div className="mt-4 flex items-center gap-3">
            <div className="inline-flex items-center rounded-xl border border-black/10 overflow-hidden">
              <button
                onClick={() => setQuantidade((q) => Math.max(1, (q || 1) - 1))}
                className="p-2 hover:bg-black/5"
                aria-label="Diminuir"
                title="Diminuir"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-2 text-sm font-medium select-none">{quantidade}</span>
              <button
                onClick={() => setQuantidade((q) => Math.max(1, (q || 1) + 1))}
                className="p-2 hover:bg-black/5"
                aria-label="Aumentar"
                title="Aumentar"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="text-sm text-black/60">
              Subtotal: <span className="font-semibold">{currency(subtotal)}</span>
            </div>
          </div>

          {/* Ações */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleAdd}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-azul text-white px-5 py-3 font-semibold hover:brightness-110"
            >
              <ShoppingCart size={18} /> Adicionar ao carrinho
            </button>
            <button
              onClick={handleBuyNow}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 font-semibold hover:bg-black/5"
            >
              Comprar agora <ArrowRight size={18} />
            </button>
          </div>

          {/* Frete estimado */}
          <div className="mt-5 rounded-2xl border border-black/10 p-4 bg-white">
            <div className="flex items-center gap-2 font-medium">
              <Truck size={18} /> Calcular frete
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="Digite seu CEP (8 dígitos)"
                inputMode="numeric"
                className="flex-1 rounded-xl border-black/10"
              />
              <button
                onClick={() => {
                  const c = String(cep).replace(/\D/g, "");
                  if (c.length !== 8) {
                    toast.error("CEP inválido.");
                  } else {
                    const valor = calcularFrete(subtotal, c);
                    toast.success(
                      valor === 0 ? "Frete grátis!" : `Frete estimado: ${currency(valor)}`
                    );
                  }
                }}
                className="px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5"
              >
                Calcular
              </button>
            </div>
            <p className="text-xs text-black/60 mt-1">
              Frete grátis para compras acima de <strong>{currency(5000)}</strong>.
            </p>
          </div>

          {/* Blocos de confiança */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-black/70">
            <div className="flex items-center gap-2 rounded-xl bg-white border border-black/10 px-3 py-2">
              <ShieldCheck size={16} /> Garantia e suporte
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white border border-black/10 px-3 py-2">
              <Truck size={16} /> Entrega em todo o Brasil
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white border border-black/10 px-3 py-2">
              <CreditCard size={16} /> Pague no Pix ou cartão
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Descrição / Entrega & Garantia / Pagamento */}
      <div className="mt-10">
        <Tabs.Root defaultValue="descricao" className="w-full">
          <Tabs.List className="inline-flex rounded-xl border border-black/10 bg-white p-1 mb-4">
            <Tabs.Trigger
              value="descricao"
              className="data-[state=active]:bg-azul data-[state=active]:text-white rounded-lg px-4 py-2 text-sm font-medium"
            >
              Descrição
            </Tabs.Trigger>
            <Tabs.Trigger
              value="entrega"
              className="data-[state=active]:bg-azul data-[state=active]:text-white rounded-lg px-4 py-2 text-sm font-medium"
            >
              Entrega & Garantia
            </Tabs.Trigger>
            <Tabs.Trigger
              value="pagamento"
              className="data-[state=active]:bg-azul data-[state=active]:text-white rounded-lg px-4 py-2 text-sm font-medium"
            >
              Pagamento
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="descricao" className="rounded-2xl bg-white border border-black/10 p-5">
            {produto.description ? (
              <p className="whitespace-pre-line text-black/80 leading-relaxed">{produto.description}</p>
            ) : (
              <p className="text-black/60">Descrição indisponível para este produto.</p>
            )}
          </Tabs.Content>

          <Tabs.Content value="entrega" className="rounded-2xl bg-white border border-black/10 p-5">
            <ul className="list-disc pl-5 space-y-2 text-black/80">
              <li>Envio em até 2 dias úteis após a confirmação do pagamento.</li>
              <li>Frete grátis para compras acima de {currency(5000)}.</li>
              <li>Garantia oficial — consulte o prazo específico do modelo.</li>
              <li>Suporte técnico especializado por WhatsApp.</li>
            </ul>
          </Tabs.Content>

          <Tabs.Content value="pagamento" className="rounded-2xl bg-white border border-black/10 p-5">
            <ul className="list-disc pl-5 space-y-2 text-black/80">
              <li>Pix (aprovação imediata).</li>
              <li>Cartão de crédito em até 10x (condições sujeitas à operadora).</li>
              <li>Segurança de ponta a ponta no checkout.</li>
            </ul>
          </Tabs.Content>
        </Tabs.Root>
      </div>

      {/* Relacionados */}
      {relacionados.length > 0 && (
        <div className="mt-10">
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-2xl font-bold text-azul">Você também pode gostar</h2>
            <Link to="/produtos" className="text-azul font-semibold hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relacionados.map((p) => (
              <motion.div
                key={p._id}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="rounded-2xl bg-white border border-black/10 shadow-soft overflow-hidden"
              >
                <Link to={`/produto/${p._id}`}>
                  <img
                    src={p.imageUrl || "https://via.placeholder.com/600x400?text=Sem+imagem"}
                    alt={p.name}
                    className="w-full h-40 object-cover"
                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/600x400?text=Sem+imagem")}
                  />
                </Link>
                <div className="p-4">
                  <div className="font-semibold line-clamp-1">{p.name}</div>
                  <div className="text-azul font-bold mt-1">{currency(p.price)}</div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      to={`/produto/${p._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
                    >
                      Detalhes
                    </Link>
                    <button
                      onClick={() => {
                        addToCart(p, 1);
                        toast.success(`${p.name} adicionado ao carrinho`);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-azul text-white px-3 py-2 text-sm hover:brightness-110"
                    >
                      <ShoppingCart size={16} /> Comprar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
