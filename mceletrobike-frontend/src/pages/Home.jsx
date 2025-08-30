// src/pages/Home.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import * as Tabs from "@radix-ui/react-tabs";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ShoppingCart, ArrowRight, BadgeCheck } from "lucide-react";
import { toast } from "sonner";

/* ------------------------- helpers ------------------------- */
const currency = (value) => {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const apiUrl = (() => {
  const base = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");
  return base ? `${base}/api/produtos` : "/api/produtos"; // usa proxy do Vite se VITE_BACKEND_URL não estiver setado
})();

/* ---------------------- data fetching ---------------------- */
async function fetchProdutos() {
  const { data } = await axios.get(apiUrl);
  return Array.isArray(data) ? data : [];
}

/* ----------------------- UI: Skeleton ---------------------- */
function CardSkeleton() {
  return (
    <div className="border rounded-2xl p-4 shadow-soft border-black/5 bg-white">
      <div className="h-40 w-full bg-black/10 rounded-xl animate-pulse" />
      <div className="h-4 w-3/4 bg-black/10 rounded mt-3 animate-pulse" />
      <div className="h-4 w-1/3 bg-black/10 rounded mt-2 animate-pulse" />
      <div className="h-10 w-full bg-black/10 rounded-xl mt-4 animate-pulse" />
    </div>
  );
}

/* ---------------------- UI: ProductCard -------------------- */
function ProductCard({ produto, onAdd }) {
  const img =
    produto?.imageUrl ||
    "https://via.placeholder.com/600x400?text=Produto+sem+imagem";

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="border rounded-2xl p-0 shadow-soft hover:shadow-lg transition bg-white border-black/5 overflow-hidden flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={img} alt={produto?.name} className="w-full h-full object-cover" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 text-[11px] font-semibold bg-amarelo text-grafite px-2 py-1 rounded-full">
          <BadgeCheck size={14} /> Pronta entrega
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold line-clamp-1">{produto?.name}</h3>
        {produto?.description && (
          <p className="text-sm text-black/60 line-clamp-2 mt-1">{produto.description}</p>
        )}

        <div className="mt-2 text-azul text-lg font-bold">
          {currency(produto?.price)}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Link to={`/produto/${produto?._id}`}>
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-2 hover:bg-black/5 transition">
              Detalhes <ArrowRight size={16} />
            </button>
          </Link>

          <Tooltip.Root delayDuration={150}>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => {
                  onAdd?.(produto);
                  toast.success(`${produto?.name} adicionado ao carrinho`);
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-azul text-white px-4 py-2 hover:brightness-110 transition"
              >
                <ShoppingCart size={18} /> Comprar
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content className="rounded-md bg-grafite text-white px-2 py-1 text-xs">
              Adicionar ao carrinho
            </Tooltip.Content>
          </Tooltip.Root>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------- Página Home --------------------- */
export default function Home() {
  const { data: produtos = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["produtos"],
    queryFn: fetchProdutos,
    staleTime: 2 * 60 * 1000,
  });

  // categorias dinâmicas a partir dos produtos (com "Todos" no início)
  const categorias = useMemo(() => {
    const base = Array.from(
      new Set(produtos.map((p) => p?.category).filter(Boolean))
    );
    return ["Todos", ...base];
  }, [produtos]);

  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  const produtosFiltrados =
    categoriaAtiva === "Todos"
      ? produtos
      : produtos.filter((p) => p?.category === categoriaAtiva);

  /* --------------------- estados de carregamento/erro -------------------- */
  if (isLoading) {
    return (
      <div className="space-y-8">
        <section className="rounded-3xl bg-gradient-to-br from-azul via-grafite to-black text-white p-8 md:p-12">
          <div className="h-8 w-56 bg-white/20 rounded-md animate-pulse" />
          <div className="mt-3 h-4 w-80 bg-white/15 rounded-md animate-pulse" />
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="h-6 w-44 bg-white/15 rounded-md animate-pulse" />
            <div className="h-6 w-44 bg-white/15 rounded-md animate-pulse" />
            <div className="h-6 w-44 bg-white/15 rounded-md animate-pulse" />
            <div className="h-6 w-44 bg-white/15 rounded-md animate-pulse" />
          </div>
        </section>

        <section>
          <div className="mb-4 h-8 w-64 bg-black/10 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-600 font-medium">Erro ao carregar produtos.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-grafite text-white hover:brightness-110"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  /* --------------------------- render principal -------------------------- */
  return (
    <div className="space-y-10">
      {/* Hero curto e objetivo */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-azul via-grafite to-black text-white p-8 md:p-12">
        <div className="max-w-3xl">
          <span className="inline-block text-xs tracking-widest uppercase bg-white/10 px-3 py-1 rounded-full mb-4">
            Entrega em todo o Brasil • Garantia oficial
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            MC ELECTROBIKE
            <span className="block text-amarelo">Escolha e receba em casa.</span>
          </h1>
          <p className="mt-3 text-white/85">
            Linha completa de motos elétricas com pronta entrega, suporte e peças.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/produtos"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-grafite px-5 py-3 font-semibold hover:brightness-95"
            >
              Ver todos os modelos <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amarelo/20 blur-3xl" />
      </section>

      {/* Loja embutida com Tabs de categorias */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-azul">Modelos em estoque</h2>
            <p className="text-sm text-black/60">Filtre por categoria ou explore todos.</p>
          </div>
          <Link to="/produtos" className="text-azul font-semibold hover:underline">
            Ver página de produtos
          </Link>
        </div>

        <Tabs.Root
          value={categoriaAtiva}
          onValueChange={setCategoriaAtiva}
          className="w-full"
        >
          <Tabs.List className="inline-flex rounded-xl border border-black/10 bg-white p-1 mb-5">
            {categorias.map((cat) => {
              const count =
                cat === "Todos"
                  ? produtos.length
                  : produtos.filter((p) => p?.category === cat).length;

              return (
                <Tabs.Trigger
                  key={cat}
                  value={cat}
                  className="data-[state=active]:bg-azul data-[state=active]:text-white rounded-lg px-4 py-2 text-sm font-medium"
                >
                  {cat} <span className="ml-1 opacity-70">({count})</span>
                </Tabs.Trigger>
              );
            })}
          </Tabs.List>

          {/* Conteúdo único: mudamos só o filtro via estado */}
          <Tabs.Content value={categoriaAtiva}>
            {produtosFiltrados.length === 0 ? (
              <p className="text-center text-black/50 py-8">
                Nenhum produto encontrado.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {produtosFiltrados.map((produto) => (
                  <ProductCard
                    key={produto?._id}
                    produto={produto}
                    onAdd={() => {
                      // Aqui você pode integrar com seu Zustand do carrinho
                    }}
                  />
                ))}
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </section>

      {/* Banner final curto */}
      <section className="rounded-3xl bg-prata p-7 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-azul">Pronto para economizar no combustível?</h3>
          <p className="text-black/70">
            Garanta já o seu modelo elétrico com condições facilitadas.
          </p>
        </div>
        <Link
          to="/produtos"
          className="inline-flex items-center gap-2 rounded-xl bg-azul text-white px-5 py-3 font-semibold hover:brightness-110"
        >
          Explorar modelos <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
