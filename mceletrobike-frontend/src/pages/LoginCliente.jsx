import { useState } from 'react';
import { useAuth } from '@/store/auth';
import { useCarrinho } from '@/store/carrinho';
import { toast } from 'sonner';
import { http } from '@/lib/http'; // <-- nomeado

function getGuestCart() {
  try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
  catch { return []; }
}

export default function LoginCliente() {
  const login = useAuth(s => s.login);
  const setCartFromServer = useCarrinho(s => s.setFromServer);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const guestCart = getGuestCart();
      const result = await login({ email, password, guestCart });
      if (!result?.ok) throw new Error('Credenciais inválidas');

      localStorage.removeItem('cart');

      const { data } = await http.get('/customers/cart'); // /api já está no http.js
      setCartFromServer(data);

      toast.success('Login realizado!');
    } catch (err) {
      console.error(err);
      toast.error('Não foi possível entrar. Verifique seus dados.');
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Entrar</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="E-mail" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border rounded p-2" placeholder="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="w-full bg-black text-white rounded p-2">Entrar</button>
      </form>
    </div>
  );
}
