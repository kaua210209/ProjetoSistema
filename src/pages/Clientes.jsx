import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Users, ShieldCheck, Mail } from 'lucide-react';

export default function Clientes() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();

  useEffect(() => {
    if (role === 'admin') {
      fetchUsuarios();
    }
  }, [role]);

  async function fetchUsuarios() {
    setLoading(true);
    // Buscamos todos da tabela profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('email', { ascending: true });

    if (error) {
      console.error("Erro ao buscar usuários:", error.message);
    } else {
      console.log("Usuários carregados:", data);
      setUsuarios(data || []);
    }
    setLoading(false);
  }

  // Bloqueio de segurança visual
  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <ShieldCheck size={48} className="mb-4 opacity-20" />
        <p className="font-medium text-lg">Acesso Restrito ao Administrador</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black flex items-center gap-2 text-gray-800">
          <Users className="text-blue-600" /> Usuários do Sistema
        </h1>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
          {usuarios.length} Registrados
        </span>
      </div>

      {loading ? (
        <p className="text-center text-gray-400">Carregando usuários...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usuarios.map(u => (
            <div key={u.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                  {u.role}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 truncate" title={u.email}>
                {u.email}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">
                ID: {u.id.substring(0, 13)}...
              </p>
            </div>
          ))}
        </div>
      )}
      
      {usuarios.length === 0 && !loading && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed text-gray-400">
          Nenhum usuário encontrado na tabela profiles.
        </div>
      )}
    </div>
  );
}