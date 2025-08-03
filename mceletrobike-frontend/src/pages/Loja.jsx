import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Loja = () => {
  const [produtos, setProdutos] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  useEffect(() => {
    axios.get("http://localhost:4000/api/produtos")
      .then(res => setProdutos(res.data))
      .catch(err => console.error("Erro ao buscar produtos", err));
  }, []);

  const categorias = ["Todos", ...new Set(produtos.map(p => p.category))];

  const produtosFiltrados = categoriaAtiva === "Todos"
    ? produtos
    : produtos.filter(p => p.category === categoriaAtiva);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Nossa Loja</h1>

      {/* Filtros por categoria */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categorias.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoriaAtiva(cat)}
            className={`px-4 py-2 rounded-full border transition-colors
              ${categoriaAtiva === cat ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Listagem de produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {produtosFiltrados.map(produto => (
          <div key={produto._id} className="border rounded-xl p-4 shadow hover:shadow-lg transition">
            <img 
              src={produto.imageUrl} 
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
    </div>
  );
};

export default Loja;