import { useMemo, useState } from "react";
import { useCarrinhoStore } from "../store/carrinho";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Trash2, Plus, Minus, ShieldCheck, Truck, TicketPercent } from "lucide-react";

/* ------------------------ helpers ------------------------ */
const currency = (n) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const freteBase = 79.9; // valor padrão se não houver frete grátis
function calcularFrete({ total, cep }) {
  // Frete grátis acima de R$ 5.000
  if (total >= 5000) return 0;
  // Regrinha simples por CEP (ajuste depois conforme regra real/Correios/transportadora)
  if (/^\d{8}$/.test((cep || "").replace(/\D/g, ""))) {
    return freteBase;
  }
  return 0; // sem CEP → mostra 0 até calcular
}

/* ----------------------- componente ---------------------- */
export default function Carrinho() {
  const { itens, removerItem, atualizarQuantidade, limparCarrinho } = useCarrinhoStore();
  const navigate = useNavigate();

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // Cupom & Frete
  const [cupom, setCupom] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState(null); // { code: 'ELETRICO10', desconto: 0.1 }
  const [cep, setCep] = useState("");
  const [frete, setFrete] = useState(0);

  const subtotal = useMemo(
    () => itens.reduce((acc, it) => acc + (Number(it.price) || 0) * (it.quantidade || 1), 0),
    [itens]
  );

  const desconto = useMemo(() => {
    if (!cupomAplicado) return 0;
    return subtotal * (cupomAplicado.desconto || 0);
  }, [subtotal, cupomAplicado]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - desconto) + (frete || 0);
  }, [subtotal, desconto, frete]);

  /* --------------------- ações de UX ---------------------- */
  const handleAplicarCupom = (e) => {
    e.preventDefault();
    const code = (cupom || "").trim().toUpperCase();
    if (!code) return;

    // Regras de exemplo — ajuste depois para consultar backend
    if (code === "ELETRICO10") {
      setCupomAplicado({ code, desconto: 0.1 });
      toast.success("Cupom aplicado: 10% OFF");
    } else {
      setCupomAplicado(null);
      toast.error("Cupom inválido");
    }
  };

  const handleCalcularFrete = (e) => {
    e.preventDefault();
    const limpo = (cep || "").replace(/\D/g, "");
    if (limpo.length !== 8) {
      toast.error("CEP inválido. Use 8 dígitos.");
      return;
    }
    const valor = calcularFrete({ total: subtotal - desconto, cep: limpo });
    setFrete(valor);
    toast.success(`Frete calculado: ${currency(valor)}`);
  };

  const aumentar = (id, atual) => {
    const novo = (atual || 1) + 1;
    atualizarQuantidade(id, novo);
    toast.success("Quantidade atualizada");
  };

  const diminuir = (id, atual) => {
    const novo = (atual || 1) - 1;
    if (novo < 1) return;
    atualizarQuantidade(id, novo);
    toast.success("Quantidade atualizada");
  };

  const handleRemover = (id) => {
    removerItem(id);
    toast.success("Item removido do carrinho");
  };

  const finalizarPedido = async () => {
    setErro(null);

    if (itens.length === 0) {
      setErro("Seu carrinho está vazio");
      return;
    }

    setIsLoading(true);
    try {
      const produtosParaEnvio = itens.map((item) => ({
        id: item._id,
        title: String(item.name || "").substring(0, 250),
        unit_price: Number(item.price) || 0,
        quantity: Number(item.quantidade || 1),
        description:
          (item.description ? String(item.description).substring(0, 250) : `Produto: ${item.name}`),
        picture_url: item.imageUrl || "",
        category_id: item.category || "eletronics",
      }));

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/pagamento/create_preference`,
        {
          items: produtosParaEnvio,
          shipping_cost: frete || 0,
          coupon_code: cupomAplicado?.code || null,
          discount_value: desconto || 0,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Request-ID": crypto.randomUUID(),
          },
          withCredentials: true,
          timeout: 15000,
        }
      );

      if (!response.data?.init_point) {
        throw new Error("Resposta inválida do servidor");
      }

      sessionStorage.setItem(
        "pendingOrder",
        JSON.stringify({
          items: itens,
          subtotal,
          discount: desconto,
          shipping: frete || 0,
          total,
          preferenceId: response.data.id,
        })
      );

      window.location.href = response.data.init_point;
    } catch (error) {
      let errorMessage = "Erro ao processar pagamento";
      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error?.message ||
          `Erro ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Sem resposta do servidor. Verifique sua conexão.";
      }

      console.error("Erro no pagamento:", {
        error: error.message,
        response: error.response?.data,
        timestamp: new Date().toISOString(),
      });

      setErro(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------- estados especiais ------------------ */
  if (itens.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
        <h1 className="text-3xl font-bold mb-2">Seu carrinho</h1>
        <p className="text-black/60 mb-6">Você ainda não adicionou produtos.</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 rounded-xl bg-azul text-white font-semibold hover:brightness-110"
        >
          Explorar modelos
        </button>
      </div>
    );
  }

  /* --------------------------- UI -------------------------- */
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Seu carrinho</h1>

      {erro && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
          <p>{erro}</p>
          <button onClick={() => setErro(null)} className="mt-2 text-sm underline">
            Fechar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Lista de itens */}
        <div className="space-y-4">
          {itens.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl bg-white border border-black/10 p-4 shadow-soft"
            >
              <div className="flex gap-4">
                <img
                  src={item.imageUrl || "https://via.placeholder.com/300x200?text=Sem+imagem"}
                  alt={item.name}
                  className="w-28 h-28 object-cover rounded-xl"
                  onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/300x200?text=Sem+imagem")}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold leading-tight line-clamp-1">{item.name}</h3>
                      {item.category && (
                        <p className="text-xs text-black/50 mt-1">Categoria: {item.category}</p>
                      )}
                    </div>

                    {/* Remover com confirmação */}
                    <Dialog.Root>
                      <Dialog.Trigger asChild>
                        <button
                          className="p-2 rounded-lg hover:bg-black/5"
                          aria-label={`Remover ${item.name}`}
                          title="Remover"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </Dialog.Trigger>
                      <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
                        <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-soft">
                          <div className="flex items-center justify-between mb-2">
                            <Dialog.Title className="text-lg font-semibold">Remover item</Dialog.Title>
                            <Dialog.Close className="p-2 rounded-lg hover:bg-black/5">
                              <X />
                            </Dialog.Close>
                          </div>
                          <p className="text-sm text-black/70">
                            Tem certeza que deseja remover <strong>{item.name}</strong> do carrinho?
                          </p>
                          <div className="mt-4 flex justify-end gap-2">
                            <Dialog.Close className="px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5">
                              Cancelar
                            </Dialog.Close>
                            <Dialog.Close
                              className="px-4 py-2 rounded-xl bg-red-600 text-white hover:brightness-110"
                              onClick={() => handleRemover(item._id)}
                            >
                              Remover
                            </Dialog.Close>
                          </div>
                        </Dialog.Content>
                      </Dialog.Portal>
                    </Dialog.Root>
                  </div>

                  {item.description && (
                    <p className="text-sm text-black/60 mt-1 line-clamp-2">{item.description}</p>
                  )}

                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Stepper de quantidade */}
                    <div className="inline-flex items-center rounded-xl border border-black/10 overflow-hidden">
                      <button
                        onClick={() => diminuir(item._id, item.quantidade)}
                        disabled={(item.quantidade || 1) <= 1}
                        className="p-2 disabled:opacity-40 hover:bg-black/5"
                        aria-label="Diminuir"
                        title="Diminuir"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-2 text-sm font-medium select-none">
                        {item.quantidade || 1}
                      </span>
                      <button
                        onClick={() => aumentar(item._id, item.quantidade)}
                        className="p-2 hover:bg-black/5"
                        aria-label="Aumentar"
                        title="Aumentar"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Preços */}
                    <div className="text-right sm:ml-auto">
                      <div className="text-sm text-black/60">
                        Unitário: <span className="font-medium">{currency(item.price)}</span>
                      </div>
                      <div className="text-lg font-bold">{currency((item.price || 0) * (item.quantidade || 1))}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Ações secundárias */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5"
            >
              Continuar comprando
            </button>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200">
                  Limpar carrinho
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
                <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-soft">
                  <div className="flex items-center justify-between mb-2">
                    <Dialog.Title className="text-lg font-semibold">Esvaziar carrinho</Dialog.Title>
                    <Dialog.Close className="p-2 rounded-lg hover:bg-black/5">
                      <X />
                    </Dialog.Close>
                  </div>
                  <p className="text-sm text-black/70">
                    Tem certeza que deseja remover <strong>todos</strong> os itens?
                  </p>
                  <div className="mt-4 flex justify-end gap-2">
                    <Dialog.Close className="px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5">
                      Cancelar
                    </Dialog.Close>
                    <Dialog.Close
                      className="px-4 py-2 rounded-xl bg-red-600 text-white hover:brightness-110"
                      onClick={() => {
                        limparCarrinho();
                        toast.success("Carrinho limpo");
                      }}
                    >
                      Esvaziar
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>

        {/* Resumo (sticky) */}
        <aside className="lg:sticky lg:top-6">
          <div className="rounded-2xl bg-white border border-black/10 p-5 shadow-soft w-full">
            <h2 className="text-lg font-semibold mb-4">Resumo do pedido</h2>

            {/* Frete */}
            <div className="mb-4">
              <label className="text-sm font-medium flex items-center gap-2">
                <Truck size={16} /> Calcular frete
              </label>
              <form onSubmit={handleCalcularFrete} className="mt-2 flex gap-2">
                <input
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="Digite seu CEP (apenas números)"
                  inputMode="numeric"
                  className="flex-1 rounded-xl border-black/10"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5"
                >
                  Calcular
                </button>
              </form>
              {frete > 0 ? (
                <p className="text-xs text-black/60 mt-1">
                  Frete estimado: <strong>{currency(frete)}</strong>
                </p>
              ) : (
                <p className="text-xs text-black/60 mt-1">
                  Compras acima de <strong>{currency(5000)}</strong> têm frete grátis.
                </p>
              )}
            </div>

            {/* Cupom */}
            <div className="mb-4">
              <label className="text-sm font-medium flex items-center gap-2">
                <TicketPercent size={16} /> Cupom de desconto
              </label>
              <form onSubmit={handleAplicarCupom} className="mt-2 flex gap-2">
                <input
                  value={cupom}
                  onChange={(e) => setCupom(e.target.value)}
                  placeholder="Ex.: ELETRICO10"
                  className="flex-1 rounded-xl border-black/10 uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5"
                >
                  Aplicar
                </button>
              </form>
              {cupomAplicado && (
                <p className="text-xs text-green-700 mt-1">
                  Cupom <strong>{cupomAplicado.code}</strong> aplicado: {cupomAplicado.desconto * 100}% OFF
                </p>
              )}
            </div>

            {/* Totais */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Desconto</span>
                <span className={desconto ? "text-green-700 font-medium" : ""}>
                  {desconto ? `- ${currency(desconto)}` : currency(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span>{currency(frete || 0)}</span>
              </div>
              <div className="h-px bg-black/10 my-2" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{currency(total)}</span>
              </div>
            </div>

            {/* Segurança */}
            <div className="mt-3 flex items-center gap-2 text-xs text-black/60">
              <ShieldCheck size={16} />
              Pagamento processado com segurança.
            </div>

            <button
              onClick={finalizarPedido}
              disabled={isLoading || itens.length === 0}
              className={`mt-4 w-full py-3 rounded-xl font-bold text-white transition ${
                isLoading || itens.length === 0
                  ? "bg-black/30 cursor-not-allowed"
                  : "bg-azul hover:brightness-110"
              }`}
            >
              {isLoading ? "Processando..." : "Finalizar compra"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
