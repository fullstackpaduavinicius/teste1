import { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, ArrowRight, BadgeCheck, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCarrinhoStore } from "../store/carrinho";

const apiBase =
  (import.meta.env.VITE_BACKEND_URL && import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")) ||
  "https://mceletrobike-backend.onrender.com";

const currency = (n) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

async function fetchProduto(id) {
  const { data } = await axios.get(`${apiBase}/api/produtos/${id}`);
  return data;
}

export default function ProductQuickView({ open, onOpenChange, productId, initialProduct }) {
  const navigate = useNavigate();
  const addToCart = useCarrinhoStore((s) => s.adicionarItem ?? s.adicionar);

  const { data: produto, isLoading, isError } = useQuery({
    queryKey: ["produto-quick", productId],
    queryFn: () => fetchProduto(productId),
    enabled: Boolean(open && productId),
    staleTime: 2 * 60 * 1000,
    placeholderData: initialProduct ?? undefined,
  });

  const [qtd, setQtd] = useState(1);

  const img = useMemo(
    () =>
      produto?.imageUrl || "https://via.placeholder.com/800x600?text=Sem+imagem",
    [produto?.imageUrl]
  );

  const handleAdd = () => {
    if (!produto) return;
    addToCart(produto, qtd);
    toast.success(`${produto.name} adicionado ao carrinho`);
  };

  const handleBuyNow = () => {
    handleAdd();
    onOpenChange?.(false);
    navigate("/carrinho");
  };

  const handleViewMore = () => {
    if (!produto?._id) return;
    onOpenChange?.(false);
    navigate(`/produto/${produto._id}`);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[96vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 md:p-6 shadow-soft border border-black/10">
          <div className="flex items-center justify-between mb-3">
            <Dialog.Title className="text-lg font-semibold">
              {produto?.name || "Carregando…"}
            </Dialog.Title>
            <Dialog.Close className="p-2 rounded-lg hover:bg-black/5" aria-label="Fechar">
              <X />
            </Dialog.Close>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Imagem */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-2xl overflow-hidden bg-white border border-black/10"
            >
              <img
                src={img}
                alt={produto?.name || "Produto"}
                className="w-full h-80 object-cover"
                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/800x600?text=Sem+imagem")}
              />
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 text-[11px] font-semibold bg-amarelo text-grafite px-2 py-1 rounded-full">
                <BadgeCheck size={14} /> Pronta entrega
              </span>
            </motion.div>

            {/* Infos */}
            <div>
              <h2 className="text-2xl font-bold text-azul">{produto?.name}</h2>
              {produto?.category && (
                <p className="text-sm text-black/60 mt-1">Categoria: {produto.category}</p>
              )}
              <div className="mt-3 text-2xl font-extrabold text-azul">
                {currency(produto?.price)}
              </div>

              <p className="mt-3 text-black/70 line-clamp-5">
                {produto?.description || "Descrição não disponível para este produto."}
              </p>

              {/* Quantidade */}
              <div className="mt-4 inline-flex items-center rounded-xl border border-black/10 overflow-hidden">
                <button
                  onClick={() => setQtd((q) => Math.max(1, (q || 1) - 1))}
                  className="p-2 hover:bg-black/5"
                  aria-label="Diminuir"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 text-sm font-medium select-none">{qtd}</span>
                <button
                  onClick={() => setQtd((q) => Math.max(1, (q || 1) + 1))}
                  className="p-2 hover:bg-black/5"
                  aria-label="Aumentar"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Ações */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleAdd}
                  disabled={!produto}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-azul text-white px-5 py-3 font-semibold hover:brightness-110 disabled:opacity-50"
                >
                  <ShoppingCart size={18} /> Adicionar ao carrinho
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!produto}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 font-semibold hover:bg-black/5 disabled:opacity-50"
                >
                  Comprar agora <ArrowRight size={18} />
                </button>
                <button
                  onClick={handleViewMore}
                  disabled={!produto}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-azul px-5 py-3 font-semibold hover:underline disabled:opacity-50"
                >
                  Ver mais
                </button>
              </div>

              {/* Estado de erro/carregando */}
              {isLoading && (
                <p className="mt-3 text-sm text-black/60">Carregando informações…</p>
              )}
              {isError && (
                <p className="mt-3 text-sm text-red-600">Erro ao carregar o produto.</p>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
