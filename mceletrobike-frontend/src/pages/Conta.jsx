import { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, MailCheck, LogOut, ShoppingCart, ArrowLeft, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/store/auth';

export default function Conta() {
  // stores com seletores estáveis
  const user = useAuth((s) => s.user);
  const me = useAuth((s) => s.me);
  const logout = useAuth((s) => s.logout);

  // querystring
  const [params] = useSearchParams();
  const verificado = params.get('verificado') || params.get('confirmado');

  // controla 1x no Strict Mode e estado de carregamento
  const ran = useRef(false);
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    (async () => {
      if (ran.current) return;
      ran.current = true;
      await me();
      setHydrating(false);
    })();
  }, [me]);

  const firstName = useMemo(() => (user?.name ? user.name.split(' ')[0] : ''), [user]);

  const openChat = () => {
    try { window.Tawk_API?.maximize(); } catch {}
  };

  /* ================== SKELETON ================== */
  if (hydrating) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="h-10 w-40 bg-slate-200 rounded mb-4 animate-pulse" />
        <div className="bg-white rounded-2xl shadow p-5 space-y-4">
          <div className="h-6 w-60 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-80 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-56 bg-slate-200 rounded animate-pulse" />
          <div className="flex gap-2 pt-2">
            <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-10 w-36 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  /* ================== NÃO LOGADO ================== */
  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-4">
        {verificado && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-green-200 bg-green-50 text-green-800 p-3 text-sm flex items-center gap-2"
          >
            <MailCheck size={18} /> <span>✅ E-mail verificado! Sua conta foi ativada.</span>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-semibold mb-2">Faça login</h1>
          <p className="text-slate-600 mb-4">Entre para visualizar seus dados e acompanhar pedidos.</p>
          <div className="flex gap-2">
            <Link to="/entrar" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-azul text-white hover:brightness-110">
              Entrar
            </Link>
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50">
              <ArrowLeft size={16}/> Voltar à loja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ================== LOGADO ================== */
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      {verificado && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-green-200 bg-green-50 text-green-800 p-3 text-sm flex items-center gap-2"
        >
          <MailCheck size={18} /> <span>✅ E-mail verificado! Sua conta foi ativada.</span>
        </motion.div>
      )}

      {/* Cabeçalho de boas-vindas */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-azul/10 text-azul grid place-items-center">
          <UserIcon size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Minha conta</h1>
          <p className="text-slate-600">Bem-vindo, {firstName || 'cliente'}!</p>
        </div>
      </div>

      {/* Card com informações */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {user.emailVerified ? (
            <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
              <CheckCircle2 size={14} /> E-mail verificado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
              <XCircle size={14} /> E-mail não verificado
            </span>
          )}

          <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
            {user.marketingOptIn ? 'Recebe promoções' : 'Sem promoções'}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Nome</div>
            <div className="font-medium">{user.name}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">E-mail</div>
            <div className="font-medium">{user.email}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Link to="/carrinho" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-azul text-white hover:brightness-110">
            <ShoppingCart size={16} /> Ir ao carrinho
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50">
            <ArrowLeft size={16}/> Ver produtos
          </Link>
          <button
            onClick={openChat}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50"
          >
            💬 Falar no chat
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white hover:brightness-110"
          >
            <LogOut size={16}/> Sair
          </button>
        </div>
      </div>
    </div>
  );
}
