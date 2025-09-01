import { useState, useEffect } from "react";
import axios from "axios";
import * as Dialog from "@radix-ui/react-dialog";
import { Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const API_BASE = (
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "https://mceletrobike-backend.onrender.com"
).replace(/\/$/, "");

export default function Admin() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
  });

  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // edição
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/produtos`);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setMessage("❌ Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: Number.parseFloat(form.price) || 0,
        stock: Number.parseInt(form.stock) || 0,
      };
      const res = await axios.post(`${API_BASE}/api/produtos`, payload);
      setMessage("✅ Produto cadastrado com sucesso!");
      toast.success("Produto cadastrado");
      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        imageUrl: "",
      });
      // otimista: insere novo no topo
      setProducts((arr) => [res.data ?? payload, ...arr]);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro ao cadastrar produto.");
      toast.error("Erro ao cadastrar");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      setMessage("⌛ Excluindo produto...");
      await axios.delete(`${API_BASE}/api/produtos/${id}`);
      setProducts((arr) => arr.filter((p) => p._id !== id));
      setMessage("✅ Produto excluído com sucesso!");
      toast.success("Produto excluído");
    } catch (err) {
      console.error("Erro detalhado:", err.response?.data || err.message);
      setMessage(`❌ Erro: ${err.response?.data?.mensagem || "Falha ao excluir produto"}`);
      toast.error("Erro ao excluir");
    }
  }

  /* ===================== EDIÇÃO ===================== */
  function openEdit(product) {
    setEditing(product);
    setEditForm({
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: String(product?.price ?? ""),
      stock: String(product?.stock ?? ""),
      category: product?.category ?? "",
      imageUrl: product?.imageUrl ?? "",
    });
    setEditOpen(true);
  }

  function handleEditChange(e) {
    setEditForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editing?._id) return;

    const payload = {
      ...editForm,
      price: Number.parseFloat(editForm.price) || 0,
      stock: Number.parseInt(editForm.stock) || 0,
    };

    setSavingEdit(true);
    try {
      const { data } = await axios.put(`${API_BASE}/api/produtos/${editing._id}`, payload);
      // atualiza na lista sem refetch
      setProducts((arr) =>
        arr.map((p) => (p._id === editing._id ? { ...p, ...(data ?? payload) } : p))
      );
      toast.success("Produto atualizado");
      setEditOpen(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar produto");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Painel Administrativo</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Formulário de cadastro */}
        <div className="rounded-2xl bg-white p-5 border border-black/10 shadow-soft">
          <h3 className="text-xl font-semibold mb-4">Cadastrar Novo Produto</h3>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <input name="name" placeholder="Nome do produto" value={form.name} onChange={handleChange} className="p-2 rounded-xl border-black/10" required />
            <textarea name="description" placeholder="Descrição" value={form.description} onChange={handleChange} className="p-2 rounded-xl border-black/10 min-h-[88px]" required />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" step="0.01" name="price" placeholder="Preço (ex: 9999.99)" value={form.price} onChange={handleChange} className="p-2 rounded-xl border-black/10" required />
              <input type="number" name="stock" placeholder="Estoque" value={form.stock} onChange={handleChange} className="p-2 rounded-xl border-black/10" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input name="category" placeholder="Categoria" value={form.category} onChange={handleChange} className="p-2 rounded-xl border-black/10" required />
              <input name="imageUrl" placeholder="URL da imagem" value={form.imageUrl} onChange={handleChange} className="p-2 rounded-xl border-black/10" required />
            </div>
            <button type="submit" className="bg-azul text-white px-4 py-2 rounded-xl hover:brightness-110 transition">
              Cadastrar Produto
            </button>
          </form>
        </div>

        {/* Lista */}
        <div className="rounded-2xl bg-white p-5 border border-black/10 shadow-soft">
          <h3 className="text-xl font-semibold mb-4">Produtos Cadastrados</h3>
          {message && (
            <p
              className={`mb-4 p-2 rounded-xl ${
                message.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </p>
          )}

          {loading ? (
            <p>Carregando produtos...</p>
          ) : products.length === 0 ? (
            <p>Nenhum produto cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border text-left">Nome</th>
                    <th className="py-2 px-4 border text-left">Categoria</th>
                    <th className="py-2 px-4 border text-right">Preço</th>
                    <th className="py-2 px-4 border text-center">Estoque</th>
                    <th className="py-2 px-4 border text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border">{product.name}</td>
                      <td className="py-2 px-4 border">{product.category || "-"}</td>
                      <td className="py-2 px-4 border text-right">R$ {(Number(product.price)||0).toFixed(2)}</td>
                      <td className="py-2 px-4 border text-center">{product.stock ?? "-"}</td>
                      <td className="py-2 px-4 border">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="inline-flex items-center gap-1 rounded-lg border border-black/10 px-3 py-1 hover:bg-black/5"
                            title="Editar"
                          >
                            <Pencil size={16} /> Editar
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600 text-white px-3 py-1 hover:brightness-110"
                            title="Excluir"
                          >
                            <Trash2 size={16} /> Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ===== Dialog de Edição ===== */}
      <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <Dialog.Title className="text-lg font-semibold">Editar produto</Dialog.Title>
              <Dialog.Close className="p-2 rounded-lg hover:bg-black/5">
                <X />
              </Dialog.Close>
            </div>

            {editing ? (
              <form onSubmit={handleEditSubmit} className="grid gap-4">
                {/* preview */}
                <div className="flex gap-4">
                  <div className="w-36 h-24 rounded-xl overflow-hidden bg-black/5 border border-black/10">
                    {editForm.imageUrl ? (
                      <img
                        alt="preview"
                        src={editForm.imageUrl}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/300x200?text=Sem+imagem")}
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 grid gap-3">
                    <input
                      name="imageUrl"
                      placeholder="URL da imagem"
                      value={editForm.imageUrl}
                      onChange={handleEditChange}
                      className="p-2 rounded-xl border-black/10"
                      required
                    />
                    <input
                      name="name"
                      placeholder="Nome"
                      value={editForm.name}
                      onChange={handleEditChange}
                      className="p-2 rounded-xl border-black/10"
                      required
                    />
                  </div>
                </div>

                <textarea
                  name="description"
                  placeholder="Descrição"
                  value={editForm.description}
                  onChange={handleEditChange}
                  className="p-2 rounded-xl border-black/10 min-h-[96px]"
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="category"
                    placeholder="Categoria"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="p-2 rounded-xl border-black/10"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    placeholder="Preço"
                    value={editForm.price}
                    onChange={handleEditChange}
                    className="p-2 rounded-xl border-black/10"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    name="stock"
                    placeholder="Estoque"
                    value={editForm.stock}
                    onChange={handleEditChange}
                    className="p-2 rounded-xl border-black/10"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Dialog.Close type="button" className="px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5">
                    Cancelar
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className={`px-4 py-2 rounded-xl bg-azul text-white hover:brightness-110 ${savingEdit ? "opacity-60" : ""}`}
                  >
                    {savingEdit ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-black/60">Selecione um produto para editar.</p>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
