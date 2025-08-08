import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_URL; // ← Corrigido aqui

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const confirmado = params.get("confirmado");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (!email || !password) {
      setMensagem('Preencha todos os campos.');
      return;
    }

    try {
      if (isRegistering) {
        await axios.post(`${API_URL}/api/auth/register`, { email, password });
        setMensagem('✅ Cadastro realizado! Verifique seu e-mail para confirmar sua conta.');
        setEmail('');
        setPassword('');
        setIsRegistering(false);
      } else {
        const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        localStorage.setItem('token', res.data.token);
        navigate('/admin');
      }
    } catch (err) {
      const erro = err?.response?.data?.message || 'Erro no processo.';
      setMensagem(`❌ ${erro}`);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isRegistering ? 'Criar Conta' : 'Login'}
      </h2>

      {confirmado && (
        <p className="text-green-600 text-sm mb-2 text-center">
          ✅ Conta confirmada com sucesso! Faça login.
        </p>
      )}

      {mensagem && (
        <p className={`mb-4 text-sm text-center ${mensagem.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {mensagem}
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="p-2 border rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Senha"
          className="p-2 border rounded"
          required
        />

        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
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
};

export default Login;
