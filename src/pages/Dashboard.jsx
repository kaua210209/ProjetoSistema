import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { DollarSign, Users, Package, ShoppingBag, Activity } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ faturamento: 0, totalClientes: 0, totalProdutos: 0, totalVendas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Busca vendas para calcular faturamento e clientes únicos
      const { data: v } = await supabase.from('vendas').select('total, vendedor_id');
      // Busca total de produtos cadastrados
      const { count: cp } = await supabase.from('produtos').select('*', { count: 'exact', head: true });
      
      const faturamento = v?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0;
      const clientesUnicos = new Set(v?.map(item => item.vendedor_id)).size;

      setStats({ 
        faturamento, 
        totalClientes: clientesUnicos, 
        totalProdutos: cp || 0, 
        totalVendas: v?.length || 0 
      });
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-gray-400">Carregando indicadores...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Painel de Controle</h1>
        <p className="text-gray-500 font-medium">Resumo geral de operações finalizadas.</p>
      </header>

      {/* CARDS DE ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Card Faturamento */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><DollarSign size={24}/></div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Faturamento</p>
              <h3 className="text-2xl font-black text-gray-800 tracking-tighter">R$ {stats.faturamento.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        {/* Card Clientes */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Users size={24}/></div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Compradores</p>
              <h3 className="text-2xl font-black text-gray-800 tracking-tighter">{stats.totalClientes}</h3>
            </div>
          </div>
        </div>

        {/* Card Produtos */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><Package size={24}/></div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Itens ativos</p>
              <h3 className="text-2xl font-black text-gray-800 tracking-tighter">{stats.totalProdutos}</h3>
            </div>
          </div>
        </div>

        {/* Card Vendas */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><ShoppingBag size={24}/></div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Vendas</p>
              <h3 className="text-2xl font-black text-gray-800 tracking-tighter">{stats.totalVendas}</h3>
            </div>
          </div>
        </div>

      </div>

      {/* BANNER DE STATUS INFRAESTRUTURA */}
      <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold tracking-tight">Monitoramento Ativo</h2>
          </div>
          <p className="text-gray-400 max-w-md font-medium">
            O sistema está sincronizado com o Supabase. Todas as transações são auditadas por e-mail automaticamente.
          </p>
        </div>
        <Activity className="absolute -right-10 -bottom-10 text-white opacity-5 w-64 h-64 group-hover:scale-110 transition-transform duration-700" />
      </div>
    </div>
  );
}