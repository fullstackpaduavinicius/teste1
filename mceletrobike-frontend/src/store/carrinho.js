import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// aceita _id, id ou productId
const pid = (it) => it?._id ?? it?.id ?? it?.productId;

export const useCarrinhoStore = create(
  persist(
    (set, get) => ({
      itens: [],

      // Adiciona produto; se já existir, soma quantidade
      adicionarItem: (produto, quantidade = 1) => {
        const id = pid(produto);
        if (!id) return;

        set((state) => {
          const idx = state.itens.findIndex((i) => String(pid(i)) === String(id));
          if (idx > -1) {
            const itens = state.itens.slice();
            const atual = itens[idx].quantidade || 1;
            const q = Math.max(1, atual + (quantidade || 1));
            itens[idx] = { ...itens[idx], quantidade: q };
            return { itens };
          }
          return {
            itens: [
              ...state.itens,
              { ...produto, quantidade: Math.max(1, quantidade || 1) },
            ],
          };
        });
      },

      // Atualiza para um valor absoluto; remove se quantidade <= 0
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
      },

      // Remove todas as unidades desse produto
      removerItem: (id) =>
        set((state) => ({
          itens: state.itens.filter((i) => String(pid(i)) !== String(id)),
        })),

      // Esvazia o carrinho
      limparCarrinho: () => set({ itens: [] }),

      /* ---------- ALIASES p/ compatibilidade com o código antigo ---------- */
      adicionar: (produto) => get().adicionarItem(produto, 1),
      remover: (id) => get().removerItem(id),
      limpar: () => get().limparCarrinho(),
    }),
    {
      name: 'carrinho',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ itens: s.itens }),
      version: 1,
      migrate: (persisted, version) => persisted, // placeholder p/ migrações futuras
    }
  )
);
