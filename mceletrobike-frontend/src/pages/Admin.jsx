import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://mceletrobike-backend.onrender.com";

const Admin = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: ""
  });

  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Carrega os produtos ao montar o componente
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/produtos`);
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      setMessage("❌ Erro ao carregar produtos.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/produtos`, {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
      });

      setMessage("✅ Produto cadastrado com sucesso!");
      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        imageUrl: "",
      });
      // Atualiza a lista de produtos após cadastrar
      fetchProducts();
    } catch (err) {
      setMessage("❌ Erro ao cadastrar produto.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await axios.delete(`${API_URL}/api/produtos/${id}`);
        setMessage("✅ Produto excluído com sucesso!");
        // Atualiza a lista de produtos após excluir
        fetchProducts();
      } catch (err) {
        setMessage("❌ Erro ao excluir produto.");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Painel Administrativo</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Formulário de cadastro */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Cadastrar Novo Produto</h3>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <input type="text" name="name" placeholder="Nome do produto" value={form.name} onChange={handleChange} className="p-2 border rounded" required />
            <input type="text" name="description" placeholder="Descrição" value={form.description} onChange={handleChange} className="p-2 border rounded" required />
            <input type="number" step="0.01" name="price" placeholder="Preço (ex: 9999.99)" value={form.price} onChange={handleChange} className="p-2 border rounded" required />
            <input type="number" name="stock" placeholder="Estoque" value={form.stock} onChange={handleChange} className="p-2 border rounded" required />
            <input type="text" name="category" placeholder="Categoria" value={form.category} onChange={handleChange} className="p-2 border rounded" required />
            <input type="text" name="imageUrl" placeholder="URL da imagem" value={form.imageUrl} onChange={handleChange} className="p-2 border rounded" required />
            <button type="submit" className="bg-azul text-white px-4 py-2 rounded hover:bg-amarelo hover:text-black transition">
              Cadastrar Produto
            </button>
          </form>
        </div>

        {/* Lista de produtos */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Produtos Cadastrados</h3>
          {message && <p className={`mb-4 p-2 rounded ${message.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{message}</p>}
          
          {loading ? (
            <p>Carregando produtos...</p>
          ) : products.length === 0 ? (
            <p>Nenhum produto cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border">Nome</th>
                    <th className="py-2 px-4 border">Preço</th>
                    <th className="py-2 px-4 border">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border">{product.name}</td>
                      <td className="py-2 px-4 border">R$ {product.price.toFixed(2)}</td>
                      <td className="py-2 px-4 border">
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;