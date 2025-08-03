import { useState } from "react";
import { useCarrinhoStore } from "../store/carrinho";
import { useNavigate } from "react-router-dom";

const Carrinho = () => {
  const { itens, limparCarrinho } = useCarrinhoStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const finalizarPedido = async () => {
    setError(null);
    
    if (itens.length === 0) {
      setError("Seu carrinho está vazio");
      return;
    }

    setIsLoading(true);

    try {
      // Preparar dados para envio
      const produtosParaEnvio = itens.map(item => ({
        _id: item._id,
        nome: item.name,
        preco: item.price,
        quantidade: item.quantidade || 1,
        descricao: item.description || `Produto: ${item.name}`,
        imageUrl: item.imageUrl || ''
      }));

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pagamento/create_preference`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          produtos: produtosParaEnvio
        })
      });

      // Verificar se a resposta é JSON válido
      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || 
                            responseData.error || 
                            (responseData.cause?.[0]?.message) || 
                            "Erro ao processar pagamento";
        throw new Error(errorMessage);
      }

      // Usar sandbox em desenvolvimento
      const paymentUrl = import.meta.env.DEV 
        ? responseData.sandbox_init_point 
        : responseData.init_point;

      if (!paymentUrl) {
        throw new Error("URL de pagamento não disponível");
      }

      // Limpar carrinho antes do redirecionamento
      limparCarrinho();
      
      // Abrir checkout em nova aba
      window.open(paymentUrl, '_blank', 'noopener,noreferrer');

    } catch (error) {
      console.error("Erro no pagamento:", {
        message: error.message,
        stack: error.stack,
        time: new Date().toISOString()
      });
      
      setError(error.message || "Erro ao finalizar pedido");
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Seu Carrinho</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Seu JSX existente para exibir os itens do carrinho */}

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
  );
};

export default Carrinho;