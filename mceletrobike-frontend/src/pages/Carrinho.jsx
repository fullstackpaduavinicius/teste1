import { useState } from "react";
import { useCarrinhoStore } from "../store/carrinho";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Carrinho = () => {
  const { itens, removerItem, atualizarQuantidade, limparCarrinho } = useCarrinhoStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const calcularTotal = () => {
    return itens.reduce((total, item) => total + (item.price * (item.quantidade || 1)), 0);
  };

  const finalizarPedido = async () => {
  setError(null);
  setSuccess(null);
  
  if (itens.length === 0) {
    setError("Seu carrinho está vazio");
    return;
  }

  setIsLoading(true);

  try {
    const produtosParaEnvio = itens.map(item => ({
      id: item._id,
      title: item.name.substring(0, 250),
      unit_price: parseFloat(item.price),
      quantity: Number(item.quantidade || 1),
      description: item.description?.substring(0, 250) || `Produto: ${item.name}`,
      picture_url: item.imageUrl || '',
      category_id: item.category || 'eletronics'
    }));

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/pagamento/create_preference`,
      { items: produtosParaEnvio },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": crypto.randomUUID() // Identificador único
        },
        timeout: 10000 // Timeout de 10 segundos
      }
    );

    if (!response.data?.init_point) {
      throw new Error("Resposta inválida do servidor");
    }

    // Salvar dados temporários antes do redirecionamento
    sessionStorage.setItem('pendingOrder', JSON.stringify({
      items: itens,
      total: calcularTotal(),
      preferenceId: response.data.id
    }));

    // Redirecionamento seguro
    window.location.href = import.meta.env.DEV 
      ? response.data.sandbox_init_point 
      : response.data.init_point;

  } catch (error) {
    let errorMessage = "Erro ao processar pagamento";
    
    if (error.response) {
      // Erro da API
      errorMessage = error.response.data?.message || 
                   error.response.data?.error?.message || 
                   `Erro ${error.response.status}`;
    } else if (error.request) {
      // Sem resposta do servidor
      errorMessage = "Sem resposta do servidor. Verifique sua conexão.";
    }

    console.error("Erro no pagamento:", {
      error: error.message,
      response: error.response?.data,
      timestamp: new Date().toISOString()
    });

    setError(errorMessage);
    limparCarrinho(); // Limpa o carrinho em caso de erro
    
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Seu Carrinho</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm underline"
          >
            Fechar
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {itens.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">Seu carrinho está vazio</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Continuar Comprando
          </button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-200">
            {itens.map((item) => (
              <div key={item._id} className="py-6 flex flex-col sm:flex-row">
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/150'}
                  alt={item.name}
                  className="w-full sm:w-32 h-32 object-cover rounded mb-4 sm:mb-0"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150';
                  }}
                />
                <div className="sm:ml-6 flex-1">
                  <h3 className="text-lg font-medium">{item.name}</h3>
                  <p className="text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={() => atualizarQuantidade(item._id, (item.quantidade || 1) - 1)}
                        disabled={(item.quantidade || 1) <= 1}
                        className="px-3 py-1 border rounded-l disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 border-t border-b">
                        {item.quantidade || 1}
                      </span>
                      <button
                        onClick={() => atualizarQuantidade(item._id, (item.quantidade || 1) + 1)}
                        className="px-3 py-1 border rounded-r"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R$ {(item.price * (item.quantidade || 1)).toFixed(2).replace('.', ',')}</p>
                      <button
                        onClick={() => removerItem(item._id)}
                        className="text-red-500 text-sm mt-1 hover:text-red-700"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t mt-6 pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold">
                R$ {calcularTotal().toFixed(2).replace('.', ',')}
              </span>
            </div>

            <button
              onClick={finalizarPedido}
              disabled={isLoading || itens.length === 0}
              className={`mt-4 w-full py-3 rounded-lg font-bold ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 
                itens.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 
                'bg-green-600 hover:bg-green-700 text-white'
              } transition-colors`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processando...
                </span>
              ) : (
                'Finalizar Compra'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Carrinho;