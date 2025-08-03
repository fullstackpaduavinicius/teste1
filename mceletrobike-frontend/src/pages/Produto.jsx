import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useCarrinhoStore } from "../store/carrinho";

const Produto = () => {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const adicionar = useCarrinhoStore((state) => state.adicionar);

  useEffect(() => {
    axios.get(`http://localhost:4000/api/produtos`)
      .then(res => {
        const encontrado = res.data.find(p => p._id === id);
        setProduto(encontrado);
      })
      .catch(err => console.error("Erro ao carregar produto", err));
  }, [id]);

  if (!produto) return <p>Carregando...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <img src={produto.imageUrl} alt={produto.name} className="w-full h-72 object-cover rounded-lg mb-4" />
      <h1 className="text-3xl font-bold mb-2">{produto.name}</h1>
      <p className="text-gray-700 mb-4">{produto.description}</p>
      <p className="text-2xl font-bold text-green-600 mb-4">R$ {produto.price.toFixed(2)}</p>
      <button
        onClick={() => adicionar(produto)}
        className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
      >
        Adicionar ao carrinho
      </button>
    </div>
  );
};

export default Produto;
