import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-azul text-white p-4 shadow">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">MC ELECTROBIKE</Link>
        
        <div className="flex items-center space-x-6">
          <nav className="flex space-x-4">
            <Link to="/" className="hover:text-amarelo transition-colors">Início</Link>
            <Link to="/produtos" className="hover:text-amarelo transition-colors"></Link>
            <Link to="/loja" className="hover:text-amarelo transition-colors"></Link>
            <Link to="/admin" className="hover:text-amarelo transition-colors"></Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                Admin
              </button>
            </Link>
            
            <Link to="/carrinho">
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                Ver Carrinho
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;