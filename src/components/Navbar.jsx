import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { LogOut, LayoutDashboard, Users, Package, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-8">
        <span className="text-xl font-black text-blue-600 tracking-tighter">VENDAS.PRO</span>
        
        <div className="hidden md:flex gap-6 items-center">
          {/* LOGICA: Só aparece se for ADMIN */}
          {role === 'admin' ? (
            <>
              <Link to="/" className="text-gray-500 hover:text-blue-600 font-bold text-xs uppercase flex items-center gap-1">
                <LayoutDashboard size={14}/> Dash
              </Link>
              <Link to="/vendas" className="text-gray-500 hover:text-blue-600 font-bold text-xs uppercase flex items-center gap-1">
                <ShoppingBag size={14}/> Vendas
              </Link>
              <Link to="/clientes" className="text-gray-500 hover:text-blue-600 font-bold text-xs uppercase flex items-center gap-1">
                <Users size={14}/> Usuários
              </Link>
            </>
          ) : (
            /* O QUE O CLIENTE VÊ: Apenas Produtos */
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Painel do Cliente</span>
          )}
          
          <Link to="/produtos" className="text-gray-900 hover:text-blue-600 font-black text-xs uppercase flex items-center gap-1 bg-blue-50 px-3 py-2 rounded-lg">
            <Package size={14}/> Produtos
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase">
          {role}
        </span>
        <button 
          onClick={handleLogout} 
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Sair do sistema"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}