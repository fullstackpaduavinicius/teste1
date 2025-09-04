import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// aceita _id, id ou productId
const pid = (it) => it?._id ?? it?.id ?? it?.productId;

/**
 * Converte o formato do backend (items) pro formato local (itens)
 * Backend: [{ productId, title, price, thumbnail, quantity }]
 * Local:   [{ ...produtoCompleto, quantidade }]
 */
function itemsToItens(items = []) {
  return items
    .filter(Boolean)
    .map((i) => ({
      _id: i._id ?? i.productId ?? i.id,
      id: i.id ?? i.productId ?? i._id,
      productId: i.productId ?? i.id ?? i._id,
      title: i.title,         // opcional
      price: i.price,         // opcional
      thumbnail: i.thumbnail, // opcional
      quantidade: i.quantity ?? i.quantidade ?? i.qty ?? 1,
      ...i,
    }));
}

/**
 * Converte o formato local (itens) para o payload do backend (items)
 * Local:   [{ ...produtoCompleto, quantidade }]
 * Backend: [{ productId, quantity }]
 */
function itensToItems(itens = []) {
  return itens
    .filter(Boolean)
    .map((i) => ({
      productId: pid(i),
      quantity: Number(i.quantidade || 1),
      title: i.title,
      price: i.price,
      thumbnail: i.thumbnail,
    }));
}

// Debounce simples (por instância)
let debounceTimer = null;
const debounce = (fn, delay = 600) => {
  return (...args) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn(...args), delay);
  };
};

export const useCarrinhoStore = create(
  persist(
    (set, get) => ({
      itens: [],

      /* ==================== MUTATIONS LOCAIS ==================== */

      adicionarItem: (produto, quantidade = 1) => {
        const id = pid(produto);
        if (!id) return;

        set((state) => {
          const idx = state.itens.findIndex((i) => String(pid(i)) === String(id));
          if (idx > -1) {
            const itens = state.itens.slice();
            const atual = Number(itens[idx].quantidade || 1);
            const q = Math.max(1, atual + Number(quantidade || 1));
            itens[idx] = { ...itens[idx], quantidade: q };
            return { itens };
          }
          return {
            itens: [
              ...state.itens,
              { ...produto, quantidade: Math.max(1, Number(quantidade || 1)) },
            ],
          };
        });

        get().syncToServerDebounced?.();
      },

      atualizarQuantidade: (id, quantidade) => {
        const alvo = String(id);
        set((state) => {
          const itens = state.itens
            .map((i) => {
              if (String(pid(i)) !== alvo) return i;
              const q = Number(quantidade);
              if (!Number.isFinite(q) || q <= 0) return null; // remove
              return { ...i, quantidade: q };
            })
            .filter(Boolean);
          return { itens };
        });

        get().syncToServerDebounced?.();
      },

      removerItem: (id) => {
        set((state) => ({
          itens: state.itens.filter((i) => String(pid(i)) !== String(id)),
        }));
        get().syncToServerDebounced?.();
      },

      limparCarrinho: () => {
        set({ itens: [] });
        get().syncToServerDebounced?.();
      },

      /* ---------- ALIASES p/ compatibilidade antiga ---------- */
      adicionar: (produto) => get().adicionarItem(produto, 1),
      remover: (id) => get().removerItem(id),
      limpar: () => get().limparCarrinho(),

      /* ==================== SINCRONIZAÇÃO COM BACKEND ==================== */

      /**
       * Sobrescreve o carrinho local com o carrinho do servidor.
       * Aceita:
       *  - objeto com { items: [...] } ou { cart: [...] } ou { itens: [...] }
       *  - array bruto: [...]
       */
      setFromServer: (payload = {}) => {
        let items = [];
        if (Array.isArray(payload)) {
          items = payload;
        } else if (Array.isArray(payload.items)) {
          items = payload.items;
        } else if (Array.isArray(payload.cart)) {
          items = payload.cart;
        } else if (Array.isArray(payload.itens)) {
          items = payload.itens;
        }
        set({ itens: itemsToItens(items) });
      },

      /**
       * PUT carrinho local -> servidor
       * Endpoint: /api/customers/cart (cookies/sessão via credentials: 'include')
       */
      syncToServer: async () => {
        try {
          const itens = get().itens;
          const items = itensToItems(itens);

          await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/customers/cart`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ items }),
          });
        } catch (e) {
          console.warn('Falha ao sincronizar carrinho:', e?.message || e);
        }
      },

      // Versão debounced
      syncToServerDebounced: debounce(async () => {
        await get().syncToServer();
      }, 600),

      /**
       * GET carrinho do servidor -> aplica localmente
       */
      fetchFromServer: async () => {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/customers/cart`,
            { credentials: 'include' }
          );
          if (!res.ok) return;
          const json = await res.json();
          // aceita { items }, { cart } ou array bruto:
          if (Array.isArray(json)) {
            get().setFromServer(json);
          } else if (Array.isArray(json.items)) {
            get().setFromServer({ items: json.items });
          } else if (Array.isArray(json.cart)) {
            get().setFromServer({ items: json.cart });
          } else {
            // fallback: envia o objeto todo
            get().setFromServer(json);
          }
        } catch (e) {
          console.warn('Falha ao obter carrinho do servidor:', e?.message || e);
        }
      },
    }),
    {
      name: 'carrinho',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ itens: s.itens }),
      version: 2,
      migrate: (persisted) => persisted,
    }
  )
);

// Alias p/ manter seu import atual: `import { useCarrinho } from '@/store/carrinho'`
export const useCarrinho = useCarrinhoStore;
