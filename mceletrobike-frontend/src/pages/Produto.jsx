import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useCarrinhoStore } from "../store/carrinho";

const Produto = () => {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const adicionar = useCarrinhoStore((state) => state.adicionar);

  useEffect(() => {
    setCarregando(true);
    setErro(null);
    
    axios.get(`${import.meta.env.VITE_BACKEND_URL || "https://mceletrobike-backend.onrender.com"}/api/produtos/${id}`)
      .then(res => {
        setProduto(res.data);
      })
      .catch(err => {
        const mensagem = err.response?.status === 404 
          ? "Produto não encontrado" 
          : "Erro ao carregar dados do produto";
        setErro(mensagem);
        console.error("Erro ao carregar produto:", {
          error: err.response?.data,
          status: err.response?.status,
          id: id
        });
      })
      .finally(() => setCarregando(false));
  }, [id]);

  if (carregando) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p>Carregando detalhes do produto...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center text-red-500">
        <p>{erro}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gray-200 rounded"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p>Produto não disponível</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <img 
        src={produto.imageUrl} 
        alt={produto.name} 
        className="w-full h-72 object-cover rounded-lg mb-4"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/600x400?text=Imagem+indisponível';
        }}
      />
      <h1 className="text-3xl font-bold mb-2">{produto.name}</h1>
      <p className="text-gray-700 mb-4 whitespace-pre-line">{produto.description}</p>
      <p className="text-2xl font-bold text-green-600 mb-4">
        R$ {produto.price.toFixed(2).replace('.', ',')}
      </p>
      <button
        onClick={() => adicionar(produto)}
        className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
      >
        Adicionar ao carrinho
      </button>
    </div>
  );
};

export default Produto;