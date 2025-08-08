import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://mceletrobike-backend.onrender.com";

const PaginaConfirmacao = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("validando");

  useEffect(() => {
    const confirmarConta = async () => {
      try {
        await axios.get(`${API_URL}/api/auth/confirm/${token}`);
        setStatus("sucesso");
        setTimeout(() => navigate("/login?confirmado=1"), 2000);
      } catch (err) {
        setStatus("erro");
      }
    };

    confirmarConta();
  }, [token, navigate]);

  return (
    <div className="max-w-md mx-auto text-center mt-12 p-6 border rounded shadow bg-white">
      {status === "validando" && <p className="text-blue-500">⏳ Validando seu token...</p>}
      {status === "sucesso" && <p className="text-green-600 font-bold">✅ Conta confirmada com sucesso! Redirecionando...</p>}
      {status === "erro" && (
        <p className="text-red-600 font-bold">
          ❌ Token inválido ou expirado. Solicite uma nova confirmação.
        </p>
      )}
    </div>
  );
};

export default PaginaConfirmacao;
