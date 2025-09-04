import { useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/store/auth';

export default function Conta() {
  // 👉 seletores separados (estáveis)
  const user = useAuth((s) => s.user);
  const me = useAuth((s) => s.me);
  const logout = useAuth((s) => s.logout);

  // banner de sucesso após verificação
  const [params] = useSearchParams();
  const verificado = params.get('verificado') || params.get('confirmado');

  // garante que me() rode só 1x (evita duplo disparo no Strict Mode)
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    me();
  }, [me]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-3">
        {verificado && (
          <div className="rounded-md bg-green-50 text-green-800 border border-green-200 p-3">
            ✅ E-mail verificado! Sua conta foi ativada.
          </div>
        )}
        <div>Faça login para ver sua conta.</div>
        <Link to="/entrar" className="underline">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-3">
      {verificado && (
        <div className="rounded-md bg-green-50 text-green-800 border border-green-200 p-3">
          ✅ E-mail verificado! Sua conta foi ativada.
        </div>
      )}

      <h1 className="text-2xl font-semibold">Minha conta</h1>
      <div>Nome: {user.name}</div>
      <div>E-mail: {user.email} {user.emailVerified ? '✅' : '❌ não verificado'}</div>
      <div>Marketing: {user.marketingOptIn ? 'Ativo' : 'Desativado'}</div>

      <button
        onClick={logout}
        className="mt-4 bg-neutral-900 text-white rounded px-4 py-2"
      >
        Sair
      </button>

      <div>
        <Link to="/" className="underline">Voltar à loja</Link>
      </div>
    </div>
  );
}
