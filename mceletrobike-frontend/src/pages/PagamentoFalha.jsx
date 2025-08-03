const PagamentoSucesso = () => {
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-green-600">Pagamento falhou!</h1>
      <p className="mt-4 text-lg">Seu pedido não foi recebido com sucesso.</p>
      <a href="/" className="mt-6 inline-block bg-blue-600 text-white py-2 px-4 rounded">
        Voltar para a loja
      </a>
    </div>
  );
};

export default PagamentoSucesso;
