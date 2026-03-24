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
    <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <span className="text-xl font-black text-blue-600">VENDAS.PRO</span>
        <div className="hidden md:flex gap-6">
          {role === 'admin' && (
            <>
              <Link to="/" className="text-gray-500 hover:text-blue-600 font-bold text-sm uppercase">Dash</Link>
              <Link to="/vendas" className="text-gray-500 hover:text-blue-600 font-bold text-sm uppercase">Vendas</Link>
              <Link to="/clientes" className="text-gray-500 hover:text-blue-600 font-bold text-sm uppercase">Usuários</Link>
            </>
          )}
          <Link to="/produtos" className="text-gray-500 hover:text-blue-600 font-bold text-sm uppercase">Produtos</Link>
        </div>
      </div>
      <button onClick={handleLogout} className="p-2 text-gray-300 hover:text-red-500 transition"><LogOut size={20} /></button>
    </nav>
  );
}