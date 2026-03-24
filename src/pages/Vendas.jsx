import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FileText, Trash2, Clock } from 'lucide-react';

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const { role } = useAuth();

  useEffect(() => { fetchVendas(); }, []);

  async function fetchVendas() {
    const { data } = await supabase.from('vendas').select('*, profiles(email)').order('created_at', { ascending: false });
    setVendas(data || []);
  }

  async function excluirVenda(id) {
    if (!confirm("Remover esta venda permanentemente?")) return;
    const { error } = await supabase.from('vendas').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchVendas();
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-black mb-8 flex items-center gap-2 uppercase">
        <FileText className="text-blue-600" /> Relatório de Vendas
      </h1>
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-xs text-gray-400 font-black uppercase">
            <tr>
              <th className="p-5">Data/Hora</th>
              <th className="p-5">Utilizador</th>
              <th className="p-5">Produtos</th>
              <th className="p-5 text-right">Total</th>
              {role === 'admin' && <th className="p-5 text-center">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendas.map(v => (
              <tr key={v.id} className="hover:bg-gray-50 transition">
                <td className="p-5 text-xs text-gray-500 flex items-center gap-2"><Clock size={12}/> {new Date(v.created_at).toLocaleString()}</td>
                <td className="p-5 font-medium">{v.profiles?.email}</td>
                <td className="p-5">
                    {v.itens?.map((i, idx) => <span key={idx} className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-lg mr-1">{i.qtd}x {i.nome}</span>)}
                </td>
                <td className="p-5 text-right font-black text-green-600">R$ {v.total?.toFixed(2)}</td>
                {role === 'admin' && (
                  <td className="p-5 text-center">
                    <button onClick={() => excluirVenda(v.id)} className="text-red-400 hover:text-red-600 transition"><Trash2 size={18} /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}