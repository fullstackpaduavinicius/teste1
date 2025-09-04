import { useEffect } from 'react';
import { useAuth } from '@/store/auth';

export default function Conta(){
  const { user, me, logout } = useAuth(s => ({ user: s.user, me: s.me, logout: s.logout }));

  useEffect(() => { me(); }, []);

  if (!user) return <div className="max-w-md mx-auto p-6">Faça login para ver sua conta.</div>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-2">
      <h1 className="text-2xl font-semibold">Minha conta</h1>
      <div>Nome: {user.name}</div>
      <div>E-mail: {user.email} {user.emailVerified ? '✅' : '❌ não verificado'}</div>
      <div>Marketing: {user.marketingOptIn ? 'Ativo' : 'Desativado'}</div>
      <button onClick={logout} className="mt-4 bg-neutral-900 text-white rounded px-4 py-2">Sair</button>
    </div>
  );
}
