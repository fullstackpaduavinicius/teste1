import { NavLink, Link } from "react-router-dom";
import { useMemo } from "react";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ShoppingCart } from "lucide-react";
import { useCarrinhoStore } from "../store/carrinho";

function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

export default function Header() {
  const itens = useCarrinhoStore((s) => s.itens);
  const totalQty = useMemo(
    () => (Array.isArray(itens) ? itens.reduce((acc, it) => acc + (it?.quantidade || 1), 0) : 0),
    [itens]
  );
  const bumpKey = `cart-${totalQty}`;

  return (
    <header className="bg-azul text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl sm:text-2xl font-extrabold tracking-tight">
          MC ELECTROBIKE
        </Link>

        <div className="flex items-center gap-4">
          {/* Navegação (somente Admin visível) */}
          <nav className="hidden sm:flex items-center gap-4">
            {/* 
            <NavLink
              to="/"
              className={({ isActive }) =>
                classNames("px-3 py-2 rounded-lg transition-colors", isActive ? "bg-white text-azul" : "hover:text-amarelo")
              }
            >
              Início
            </NavLink>

            <NavLink
              to="/produtos"
              className={({ isActive }) =>
                classNames("px-3 py-2 rounded-lg transition-colors", isActive ? "bg-white text-azul" : "hover:text-amarelo")
              }
            >
              Produtos
            </NavLink>

            <NavLink
              to="/loja"
              className={({ isActive }) =>
                classNames("px-3 py-2 rounded-lg transition-colors", isActive ? "bg-white text-azul" : "hover:text-amarelo")
              }
            >
              Loja
            </NavLink>
            */}
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                classNames(
                  "px-3 py-2 rounded-lg transition-colors",
                  isActive ? "bg-white text-azul" : "hover:text-amarelo"
                )
              }
            >
              Admin
            </NavLink>
          </nav>

          {/* Botão do Carrinho */}
          <Tooltip.Provider delayDuration={150}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Link to="/carrinho" aria-label={`Ir para o carrinho (${totalQty} itens)`}>
                  <motion.button
                    key={bumpKey}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={classNames(
                      "relative inline-flex items-center gap-2 rounded-xl",
                      "bg-white text-azul hover:brightness-110",
                      "px-3 sm:px-4 py-2 font-semibold shadow-soft border border-white/10"
                    )}
                  >
                    <ShoppingCart size={18} />
                    <span className="hidden sm:inline">Carrinho</span>

                    {/* badge */}
                    <span
                      className={classNames(
                        "absolute -top-2 -right-2 min-w-[22px] h-[22px]",
                        "rounded-full bg-amarelo text-grafite text-xs font-extrabold",
                        "flex items-center justify-center px-1 shadow"
                      )}
                      aria-hidden="true"
                    >
                      {totalQty > 99 ? "99+" : totalQty}
                    </span>

                    {/* ping sutil */}
                    <span
                      key={`ping-${bumpKey}`}
                      className="pointer-events-none absolute -top-2 -right-2 inline-flex h-[22px] w-[22px] rounded-full"
                    >
                      <span className="absolute inline-flex h-full w-full rounded-full bg-amarelo opacity-75 animate-ping"></span>
                    </span>

                    <span className="sr-only" aria-live="polite">
                      {totalQty} itens no carrinho
                    </span>
                  </motion.button>
                </Link>
              </Tooltip.Trigger>
              <Tooltip.Content sideOffset={8} className="rounded-md bg-grafite text-white px-2 py-1 text-xs">
                {totalQty === 0 ? "Carrinho vazio" : `${totalQty} ${totalQty === 1 ? "item" : "itens"} no carrinho`}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
      </div>
    </header>
  );
}
