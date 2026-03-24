import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Users, ShieldCheck, ShieldAlert, Mail, Fingerprint } from 'lucide-react';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth(); // Pegamos o cargo de quem está logado

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('email');
    
    if (!error) setClientes(data);
    setLoading(false);
  }

  // Função para promover ou rebaixar usuário
  async function alternarCargo(id, roleAtual) {
    if (role !== 'admin') return alert("Apenas administradores podem alterar cargos.");
    
    const novaRole = roleAtual === 'admin' ? 'basico' : 'admin';
    const confirmacao = window.confirm(`Deseja alterar o cargo de ${roleAtual.toUpperCase()} para ${novaRole.toUpperCase()}?`);
    
    if (confirmacao) {
      const { error } = await supabase
        .from('profiles')
        .update({ role: novaRole })
        .eq('id', id);

      if (error) {
        alert("Erro ao atualizar: " + error.message);
      } else {
        fetchClientes(); // Recarrega a lista para mostrar a mudança
      }
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3 uppercase tracking-tighter">
            <Users className="text-blue-600" size={32} /> Usuários do Sistema
          </h1>
          <p className="text-gray-400 font-medium">Gerencie permissões e visualize cadastros.</p>
        </div>
        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
          {clientes.length} Registrados
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 font-bold text-gray-300 animate-pulse">Carregando usuários...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientes.map((c) => (
            <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              
              {/* Badge de Cargo */}
              <div className="absolute top-6 right-6">
                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  c.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                }`}>
                  {c.role}
                </span>
              </div>

              <div className="flex flex-col gap-6">
                <div className="p-4 bg-gray-50 w-fit rounded-2xl text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Mail size={24} />
                </div>

                <div>
                  <h3 className="font-black text-gray-800 text-lg truncate mb-1">{c.email}</h3>
                  <div className="flex items-center gap-1 text-gray-300">
                    <Fingerprint size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">ID: {c.id.substring(0, 12)}...</span>
                  </div>
                </div>

                {/* BOTÃO DE AÇÃO (SÓ APARECE/FUNCIONA PARA ADMINS) */}
                {role === 'admin' && (
                  <button
                    onClick={() => alternarCargo(c.id, c.role)}
                    className={`mt-2 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${
                      c.role === 'admin' 
                      ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    {c.role === 'admin' ? (
                      <><ShieldAlert size={16} /> Remover Admin</>
                    ) : (
                      <><ShieldCheck size={16} /> Tornar Admin</>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}