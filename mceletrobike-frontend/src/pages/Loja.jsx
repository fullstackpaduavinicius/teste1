import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Loja = () => {
  const [produtos, setProdutos] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setCarregando(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/produtos`);
        setProdutos(response.data);
        setErro(null);
      } catch (err) {
        console.error("Erro ao buscar produtos:", {
          status: err.response?.status,
          data: err.response?.data
        });
        setErro("Erro ao carregar produtos. Por favor, tente novamente.");
      } finally {
        setCarregando(false);
      }
    };

    fetchProdutos();
  }, []);

  const categorias = ["Todos", ...new Set(produtos.map(p => p.category))];

  const produtosFiltrados = categoriaAtiva === "Todos"
    ? produtos
    : produtos.filter(p => p.category === categoriaAtiva);

  if (carregando) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">{erro}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Recarregar Página
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Nossa Loja</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {categorias.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoriaAtiva(cat)}
            className={`px-4 py-2 rounded-full transition-colors
              ${categoriaAtiva === cat 
                ? "bg-black text-white" 
                : "bg-gray-100 text-black hover:bg-gray-200"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {produtosFiltrados.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {produtosFiltrados.map(produto => (
            <div key={produto._id} className="border rounded-xl p-4 shadow hover:shadow-lg transition">
              <img 
                src={produto.imageUrl || 'https://via.placeholder.com/300x200?text=Produto+sem+imagem'} 
                alt={produto.name} 
                className="w-full h-48 object-cover rounded-md mb-3"
              />
              <h2 className="text-lg font-semibold">{produto.name}</h2>
              <p className="text-sm text-gray-600 line-clamp-2">{produto.description}</p>
              <p className="mt-2 font-bold text-green-600">
                R$ {produto.price.toFixed(2).replace('.', ',')}
              </p>
              
              <Link to={`/produto/${produto._id}`}>
                <button className="mt-3 px-4 py-2 bg-black text-white rounded w-full hover:bg-gray-800 transition-colors">
                  Ver Detalhes
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Loja;