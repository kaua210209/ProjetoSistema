import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Produtos from './pages/Produtos';
import Vendas from './pages/Vendas';

// Componente de Proteção
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, role, loading } = useAuth();
  
  if (loading) return <div className="p-10 text-center font-bold font-sans text-gray-400">Verificando permissões...</div>;
  if (!user) return <Navigate to="/login" />;
  
  // BLOQUEIO REAL: Se a página é só admin e o usuário é básico
  if (adminOnly && role !== 'admin') {
    return <Navigate to="/produtos" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {children}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* 🔐 Rotas EXCLUSIVAS do ADMIN */}
          <Route path="/" element={<PrivateRoute adminOnly><Dashboard /></PrivateRoute>} />
          <Route path="/vendas" element={<PrivateRoute adminOnly><Vendas /></PrivateRoute>} />
          <Route path="/clientes" element={<PrivateRoute adminOnly><Clientes /></PrivateRoute>} />
          
          {/* 🔓 Rota LIBERADA (Admin e Básico) */}
          <Route path="/produtos" element={<PrivateRoute><Produtos /></PrivateRoute>} />
          
          {/* Redirecionamento padrão para evitar telas em branco */}
          <Route path="*" element={<Navigate to="/produtos" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}