const Footer = () => {
  return (
    <footer className="bg-azul text-white p-4 mt-10">
      <div className="container mx-auto text-center text-sm">
        © {new Date().getFullYear()} MC ELECTROBIKE • Todos os direitos reservados
      </div>
    </footer>
  );
};

export default Footer;
