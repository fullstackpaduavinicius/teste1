import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

// stores (conforme criamos)
import { useAuth } from '@/store/auth';
import { useCarrinho } from '@/store/carrinho';
import { http } from '@/lib/http'; // axios pré-configurado com baseURL `${VITE_BACKEND_URL}/api` e withCredentials

// helper para mapear itens locais -> payload do backend
const toGuestCart = (itens = []) =>
  (Array.isArray(itens) ? itens : []).map((i) => ({
    productId: i._id ?? i.id ?? i.productId,
    title: i.title,
    price: i.price,
    thumbnail: i.thumbnail,
    quantity: Number(i.quantidade ?? i.quantity ?? 1),
  }));

export default function LoginCliente() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const verificado = params.get('verificado') || params.get('confirmado');

  // auth store
  const register = useAuth((s) => s.register);
  const login = useAuth((s) => s.login);

  // carrinho (convidado -> perfil)
  const itensLocais = useCarrinho((s) => s.itens);
  const setCartFromServer = useCarrinho((s) => s.setFromServer);

  // UI state
  const [isRegistering, setIsRegistering] = useState(false);
  const [mensagem, setMensagem] = useState('');

  // campos comuns
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // campos de cadastro
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(true);

  const guestCart = useMemo(() => toGuestCart(itensLocais), [itensLocais]);

  async function onSubmit(e) {
    e.preventDefault();
    setMensagem('');

    try {
      if (isRegistering) {
        if (!name.trim() || !email.trim() || !password.trim()) {
          setMensagem('Preencha nome, e-mail e senha.');
          return;
        }

        await register({ name, email, phone, password, marketingOptIn });
        setMensagem('✅ Cadastro criado! Verifique seu e-mail para confirmar sua conta.');
        toast.success('Cadastro realizado. Verifique seu e-mail 📩');
        setPassword('');
        // Mantém na tela para o usuário ler a instrução
        return;
      }

      // LOGIN
      const res = await login({ email, password, guestCart });
      if (!res?.ok) {
        throw new Error(res?.error || 'Credenciais inválidas');
      }

      // Após login, busque o carrinho do perfil e aplique localmente
      try {
        const { data } = await http.get('/customers/cart'); // retorna { cart: [...] }
        setCartFromServer(data); // sua store aceita { cart } / { items } / array
      } catch (err) {
        console.warn('Falha ao obter carrinho do perfil:', err);
      }

      toast.success('Login realizado!');
      navigate('/conta');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || err?.message || 'Erro no processo.';
      setMensagem(`❌ ${msg}`);
      toast.error('Não foi possível concluir. Verifique os dados.');
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isRegistering ? 'Criar Conta' : 'Entrar'}
      </h2>

      {verificado && (
        <p className="text-green-600 text-sm mb-2 text-center">
          ✅ E-mail verificado! Sua conta foi ativada.
        </p>
      )}

      {mensagem && (
        <p
          className={`mb-4 text-sm text-center ${
            mensagem.includes('✅') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {mensagem}
        </p>
      )}

      <form onSubmit={onSubmit} className="grid gap-4">
        {isRegistering && (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              className="p-2 border rounded"
              required
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Telefone (WhatsApp)"
              className="p-2 border rounded"
            />
          </>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="p-2 border rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          className="p-2 border rounded"
          required
        />

        {isRegistering && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
            />
            Aceito receber promoções e cupons por e-mail
          </label>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {isRegistering ? 'Cadastrar' : 'Entrar'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-sm text-blue-500 hover:underline"
        >
          {isRegistering ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
        </button>
      </div>
    </div>
  );
}
