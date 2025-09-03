import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import * as Slider from "@radix-ui/react-slider";
import * as Tooltip from "@radix-ui/react-tooltip";
import { motion } from "framer-motion";
import {
  Filter,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShoppingCart,
  BadgeCheck,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { useCarrinhoStore } from "../store/carrinho";
import { useDocumentHead } from "../lib/useDocumentHead";
import ProductQuickView from "../components/ProductQuickView";

/* ----------------------------- helpers ----------------------------- */
const currency = (n) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const API = (() => {
  const base = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");
  return base ? `${base}/api/produtos` : "/api/produtos";
})();

async function fetchProdutos() {
  const { data } = await axios.get(API);
  return Array.isArray(data) ? data : [];
}

function useDebounced(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

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

/* --------------------------- Product Card -------------------------- */
function ProductCard({ p, onAdd, onQuickView }) {
  const img = p?.imageUrl || "https://via.placeholder.com/600x400?text=Produto+sem+imagem";
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="rounded-2xl bg-white border border-black/10 shadow-soft overflow-hidden flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={img}
          alt={p?.name}
          className="w-full h-full object-cover"
          onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/600x400?text=Sem+imagem")}
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 text-[11px] font-semibold bg-amarelo text-grafite px-2 py-1 rounded-full">
          <BadgeCheck size={14} /> Pronta entrega
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold line-clamp-1">{p?.name}</h3>
        {p?.description && <p className="text-sm text-black/60 line-clamp-2 mt-1">{p.description}</p>}
        <div className="mt-2 text-azul text-lg font-bold">{currency(p?.price)}</div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <button
            onClick={() => onQuickView?.(p)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-2 hover:bg-black/5 transition"
          >
            Detalhes
          </button>
          <Tooltip.Root delayDuration={150}>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => onAdd?.(p)}
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

/* ------------------------------ Página ----------------------------- */
export default function ProductList() {
  useDocumentHead({
    title: "Produtos – MC ELECTROBIKE",
    description: "Motos elétricas em estoque com entrega em todo o Brasil.",
    url: typeof window !== "undefined" ? window.location.href : undefined,
  });

  const addToCart = useCarrinhoStore((s) => s.adicionarItem ?? s.adicionar);

  const { data: produtos = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["produtos"],
    queryFn: fetchProdutos,
    staleTime: 2 * 60 * 1000,
  });

  /* ------------------------- filtros & ordenação ------------------------ */
  const categorias = useMemo(() => {
    const set = new Set(produtos.map((p) => p?.category).filter(Boolean));
    return ["Todos", ...Array.from(set)];
  }, [produtos]);

  const [busca, setBusca] = useState("");
  const debouncedBusca = useDebounced(busca, 350);

  const [categoria, setCategoria] = useState("Todos");

  const priceBounds = useMemo(() => {
    if (!produtos.length) return [0, 0];
    const prices = produtos.map((p) => Number(p?.price) || 0);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return [min, max];
  }, [produtos]);

  const [precoRange, setPrecoRange] = useState([priceBounds[0], priceBounds[1]]);
  useEffect(() => {
    if (!isNaN(priceBounds[0]) && !isNaN(priceBounds[1])) {
      setPrecoRange([priceBounds[0], priceBounds[1]]);
    }
  }, [priceBounds[0], priceBounds[1]]); // eslint-disable-line

  const [ordem, setOrdem] = useState("relevance");

  const filtrados = useMemo(() => {
    let out = produtos.slice();

    if (debouncedBusca.trim()) {
      const q = debouncedBusca.toLowerCase();
      out = out.filter((p) => {
        const t1 = (p?.name || "").toLowerCase();
        const t2 = (p?.description || "").toLowerCase();
        return t1.includes(q) || t2.includes(q);
      });
    }

    if (categoria !== "Todos") {
      out = out.filter((p) => p?.category === categoria);
    }

    const [minP, maxP] = precoRange;
    out = out.filter((p) => {
      const val = Number(p?.price) || 0;
      return val >= (Number(minP) || 0) && val <= (Number(maxP) || 0);
    });

    switch (ordem) {
      case "price_asc":
        out.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case "price_desc":
        out.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case "name_az":
        out.sort((a, b) => String(a.name).localeCompare(String(b.name), "pt-BR"));
        break;
      case "name_za":
        out.sort((b, a) => String(a.name).localeCompare(String(b.name), "pt-BR"));
        break;
      default:
        break;
    }

    return out;
  }, [produtos, debouncedBusca, categoria, precoRange, ordem]);

  /* ------------------------------ paginação ----------------------------- */
  const [page, setPage] = useState(1);
  const perPage = 12;
  const totalPages = Math.max(1, Math.ceil(filtrados.length / perPage));
  useEffect(() => setPage(1), [debouncedBusca, categoria, precoRange, ordem]); // reset quando filtros mudam
  const pageItems = useMemo(
    () => filtrados.slice((page - 1) * perPage, page * perPage),
    [filtrados, page]
  );

  // estado do Quick View
  const [qvOpen, setQvOpen] = useState(false);
  const [qvProduct, setQvProduct] = useState(null);

  /* ---------------------------- estados de UI --------------------------- */
  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="h-8 w-64 bg-black/10 rounded-md animate-pulse" />
          <div className="h-10 w-48 bg-black/10 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </section>
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

  /* -------------------------------- render ------------------------------ */
  return (
    <div className="space-y-6">
      {/* Header de controle */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-azul">Todos os produtos</h2>
          <p className="text-sm text-black/60">
            {filtrados.length} {filtrados.length === 1 ? "modelo" : "modelos"} encontrados
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Ordenação */}
          <div className="relative">
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              className="appearance-none pr-9 rounded-xl border-black/10"
              title="Ordenar por"
            >
              <option value="relevance">Ordenar: Relevância</option>
              <option value="price_asc">Preço: menor → maior</option>
              <option value="price_desc">Preço: maior → menor</option>
              <option value="name_az">Nome: A → Z</option>
              <option value="name_za">Nome: Z → A</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60" size={16} />
          </div>

          {/* Filtro mobile em Dialog */}
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button className="md:hidden inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2">
                <Filter size={16} /> Filtros
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
              <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <Dialog.Title className="text-lg font-semibold">Filtrar produtos</Dialog.Title>
                  <Dialog.Close className="p-2 rounded-lg hover:bg-black/5"><X /></Dialog.Close>
                </div>
                <Filters
                  categorias={categorias}
                  categoria={categoria}
                  setCategoria={setCategoria}
                  busca={busca}
                  setBusca={setBusca}
                  priceBounds={priceBounds}
                  precoRange={precoRange}
                  setPrecoRange={setPrecoRange}
                />
                <div className="mt-4 flex justify-end">
                  <Dialog.Close className="px-4 py-2 rounded-xl bg-azul text-white hover:brightness-110">
                    Aplicar
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      {/* Controles + Grid */}
      <div className="grid md:grid-cols-[260px_1fr] gap-6">
        <aside className="hidden md:block rounded-2xl bg-white border border-black/10 p-4 shadow-soft h-fit sticky top-6">
          <Filters
            categorias={categorias}
            categoria={categoria}
            setCategoria={setCategoria}
            busca={busca}
            setBusca={setBusca}
            priceBounds={priceBounds}
            precoRange={precoRange}
            setPrecoRange={setPrecoRange}
          />
        </aside>

        <ProductsGrid
          itens={pageItems}
          onAdd={(p) => {
            addToCart(p, 1);
            toast.success(`${p.name} adicionado ao carrinho`);
          }}
          onQuickView={(p) => {
            setQvProduct(p);
            setQvOpen(true);
          }}
        />
      </div>

      {/* Empty state */}
      {filtrados.length === 0 && (
        <div className="rounded-2xl bg-white border border-black/10 p-8 text-center">
          <p className="text-black/70">Nenhum produto encontrado com os filtros atuais.</p>
          <button
            onClick={() => {
              setBusca("");
              setCategoria("Todos");
              setPrecoRange(priceBounds);
            }}
            className="mt-4 px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* Paginação */}
      {filtrados.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-xl border border-black/10 hover:bg-black/5 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="px-3 py-2 rounded-xl border border-black/10 bg-white">
            Página <strong>{page}</strong> de <strong>{totalPages}</strong>
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 rounded-xl border border-black/10 hover:bg-black/5 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      <ProductQuickView
        open={qvOpen}
        onOpenChange={setQvOpen}
        productId={qvProduct?._id}
        initialProduct={qvProduct}
      />
    </div>
  );
}

/* ---------------------------- subcomponentes --------------------------- */
function Filters({
  categorias,
  categoria,
  setCategoria,
  busca,
  setBusca,
  priceBounds,
  precoRange,
  setPrecoRange,
}) {
  const [min, max] = priceBounds;
  const [vMin, vMax] = precoRange;

  return (
    <div className="space-y-5">
      {/* Busca */}
      <div>
        <label className="text-sm font-medium">Buscar</label>
        <div className="mt-2 relative">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Procurar por nome ou descrição"
            className="w-full rounded-xl border-black/10 pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={16} />
        </div>
      </div>

      {/* Categoria */}
      <div>
        <label className="text-sm font-medium">Categoria</label>
        <div className="mt-2 relative">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full appearance-none pr-8 rounded-xl border-black/10"
          >
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60" size={16} />
        </div>
      </div>

      {/* Preço */}
      <div>
        <label className="text-sm font-medium">Preço</label>
        <div className="mt-3">
          <Slider.Root
            min={Math.floor(min)}
            max={Math.ceil(max)}
            value={[vMin, vMax]}
            onValueChange={(vals) => setPrecoRange(vals)}
            step={100}
            className="relative flex items-center select-none touch-none h-5"
          >
            <Slider.Track className="bg-black/10 relative grow rounded-full h-2">
              <Slider.Range className="absolute h-full rounded-full bg-azul" />
            </Slider.Track>
            <Slider.Thumb className="block h-5 w-5 rounded-full bg-white shadow border border-black/10" />
            <Slider.Thumb className="block h-5 w-5 rounded-full bg-white shadow border border-black/10" />
          </Slider.Root>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span>{currency(vMin)}</span>
            <span>{currency(vMax)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          setBusca("");
          setCategoria("Todos");
          setPrecoRange([min, max]);
        }}
        className="w-full px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5"
      >
        Limpar filtros
      </button>
    </div>
  );
}

function ProductsGrid({ itens, onAdd, onQuickView }) {
  if (!itens?.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {itens.map((p) => (
        <ProductCard key={p?._id} p={p} onAdd={onAdd} onQuickView={onQuickView} />
      ))}
    </div>
  );
}
