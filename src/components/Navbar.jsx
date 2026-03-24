import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Package, 
  LogOut, 
  UserCog 
} from 'lucide-react';

export default function Navbar() {
  const { signOut, role, user } = useAuth();
  const location = useLocation();

  // Função para verificar se a rota está ativa e mudar a cor
  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-tighter transition-all
    ${isActive(path) 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}
  `;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter italic">
            VENDAS.PRO
          </Link>

          {/* LINKS DE NAVEGAÇÃO */}
          <div className="hidden md:flex items-center gap-2">
            
            {/* Visível apenas para ADMIN */}
            {role === 'admin' && (
              <>
                <Link title="Dashboard" to="/" className={linkClass('/')}>
                  <LayoutDashboard size={18} /> Dash
                </Link>
                <Link title="Vendas" to="/vendas" className={linkClass('/vendas')}>
                  <ShoppingBag size={18} /> Vendas
                </Link>
                <Link title="Clientes" to="/clientes" className={linkClass('/clientes')}>
                  <Users size={18} /> Clientes
                </Link>

              </>
            )}

            {/* Visível para TODOS */}
            <Link title="Produtos" to="/produtos" className={linkClass('/produtos')}>
              <Package size={18} /> Produtos
            </Link>
          </div>
        </div>

        {/* PERFIL E SAIR */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:block text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Bem-vindo</p>
            <p className="text-xs font-bold text-gray-700">{user?.email?.split('@')[0]}</p>
          </div>
          
          <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

          <button 
            onClick={signOut}
            className="flex items-center gap-2 bg-red-50 text-red-500 px-4 py-2 rounded-xl font-black text-xs uppercase hover:bg-red-500 hover:text-white transition-all active:scale-95"
          >
            Sair <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}