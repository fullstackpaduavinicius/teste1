import { create } from "zustand";

export const useCarrinhoStore = create((set) => ({
  itens: [],
  adicionar: (produto) =>
    set((state) => {
      const jaExiste = state.itens.find(item => item._id === produto._id);
      if (jaExiste) {
        return {
          itens: state.itens.map(item =>
            item._id === produto._id
              ? { ...item, quantidade: item.quantidade + 1 }
              : item
          ),
        };
      } else {
        return {
          itens: [...state.itens, { ...produto, quantidade: 1 }],
        };
      }
    }),
  remover: (id) =>
    set((state) => ({
      itens: state.itens.filter(item => item._id !== id),
    })),
  limpar: () => set({ itens: [] }),
}));
