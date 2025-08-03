import { useState } from "react";
import axios from "axios";

const Admin = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/api/produtos", {
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
    } catch (err) {
      setMessage("❌ Erro ao cadastrar produto.");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Painel Administrativo</h2>
      <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl">
        <input type="text" name="name" placeholder="Nome do produto" value={form.name} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="description" placeholder="Descrição" value={form.description} onChange={handleChange} className="p-2 border rounded" required />
        <input type="number" step="0.01" name="price" placeholder="Preço (ex: 9999.99)" value={form.price} onChange={handleChange} className="p-2 border rounded" required />
        <input type="number" name="stock" placeholder="Estoque" value={form.stock} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="category" placeholder="Categoria" value={form.category} onChange={handleChange} className="p-2 border rounded" required />
        <input type="text" name="imageUrl" placeholder="URL da imagem" value={form.imageUrl} onChange={handleChange} className="p-2 border rounded" required />
        <button type="submit" className="bg-azul text-white px-4 py-2 rounded hover:bg-amarelo hover:text-black transition">Cadastrar Produto</button>
        {message && <p className="mt-2">{message}</p>}
      </form>
    </div>
  );
};

export default Admin;
