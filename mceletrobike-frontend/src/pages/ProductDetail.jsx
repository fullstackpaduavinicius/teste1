import { useParams } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();

  return (
    <section>
      <h2 className="text-3xl font-semibold mb-4">Detalhes do Produto #{id}</h2>
      <p>Informações completas do produto...</p>
    </section>
  );
};

export default ProductDetail;
