import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Package, Plus, Minus, ImageIcon, Trash2, MapPin } from 'lucide-react';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [endereco, setEndereco] = useState({ rua: '', numero: '', bairro: '', cidade: '' });
  const [temEnderecoSalvo, setTemEnderecoSalvo] = useState(false);
  const [mostrarFormEndereco, setMostrarFormEndereco] = useState(false);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const { user, role } = useAuth();

  useEffect(() => { 
    fetchProdutos();
    buscarEnderecoSalvo();
  }, [user]);

  async function fetchProdutos() {
    const { data } = await supabase.from('produtos').select('*').order('nome');
    setProdutos(data || []);
  }

  async function buscarEnderecoSalvo() {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('rua, numero, bairro, cidade').eq('id', user.id).single();
    if (data?.rua) {
      setEndereco(data);
      setTemEnderecoSalvo(true);
    }
  }

  const adicionarAoCarrinho = (p) => {
    setCarrinho(prev => {
      const ex = prev.find(i => i.id === p.id);
      return ex ? prev.map(i => i.id === p.id ? { ...i, qtd: i.qtd + 1 } : i) : [...prev, { ...p, qtd: 1 }];
    });
  };

  const diminuirQuantidade = (id) => {
    setCarrinho(prev => prev.map(i => i.id === id ? { ...i, qtd: i.qtd - 1 } : i).filter(i => i.qtd > 0));
  };

  const limparCarrinho = () => {
    if (carrinho.length === 0) return;
    if (window.confirm("Deseja esvaziar o seu pedido?")) setCarrinho([]);
  };

  const tentarFinalizar = () => {
    if (!temEnderecoSalvo) setMostrarFormEndereco(true);
    else processarVenda();
  };

  const processarVenda = async () => {
    if (mostrarFormEndereco) {
      await supabase.from('profiles').update(endereco).eq('id', user.id);
      setTemEnderecoSalvo(true);
      setMostrarFormEndereco(false);
    }

    const total = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    const { error } = await supabase.from('vendas').insert([{ 
      vendedor_id: user.id, 
      total, 
      itens: carrinho,
      endereco_entrega: endereco 
    }]);

    if (error) alert(error.message);
    else {
      alert("Pedido confirmado! Enviaremos para: " + endereco.rua);
      setCarrinho([]);
    }
  };

  async function handleAddProduto(e) {
    e.preventDefault();
    const { error } = await supabase.from('produtos').insert([{ nome, preco: parseFloat(preco), imagem_url: imagemUrl }]);
    if (error) alert(error.message);
    else { setNome(''); setPreco(''); setImagemUrl(''); fetchProdutos(); }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* COLUNA DA ESQUERDA: PRODUTOS */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-gray-800 uppercase tracking-tighter">
          <Package className="text-blue-600" /> Cardápio de Produtos
        </h2>

        {role === 'admin' && (
          <form onSubmit={handleAddProduto} className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-5 rounded-[2rem] border border-dashed border-gray-200">
            <input className="p-3 border rounded-xl outline-none text-sm" placeholder="Nome..." value={nome} onChange={e => setNome(e.target.value)} required />
            <input className="p-3 border rounded-xl outline-none text-sm" placeholder="Preço..." type="number" step="0.01" value={preco} onChange={e => setPreco(e.target.value)} required />
            <input className="p-3 border rounded-xl outline-none text-sm" placeholder="URL da Imagem..." value={imagemUrl} onChange={e => setImagemUrl(e.target.value)} />
            <button className="bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">Add</button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {produtos.map(p => (
            <div key={p.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all">
              
              {/* FIX DAS IMAGENS: Altura fixa e object-contain para não distorcer */}
              <div className="w-full bg-white flex items-center justify-center border-b border-gray-50" style={{ height: '220px', overflow: 'hidden' }}>
                {p.imagem_url ? (
                  <img 
                    src={p.imagem_url} 
                    alt={p.nome} 
                    className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <div className="flex flex-col items-center opacity-20"><ImageIcon size={48}/><span className="text-[10px] font-bold">SEM FOTO</span></div>
                )}
              </div>
              
              <div className="p-6 flex flex-col flex-grow justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{p.nome}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Pronta Entrega</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-green-600 font-black text-2xl">R$ {p.preco.toFixed(2)}</p>
                    <button onClick={() => adicionarAoCarrinho(p)} className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-gray-900 transition-all shadow-lg shadow-blue-50 active:scale-90"><Plus/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COLUNA DA DIREITA: CHECKOUT */}
      <div className="bg-white p-8 rounded-[3rem] border shadow-2xl h-fit sticky top-24 border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-black flex items-center gap-2"><ShoppingCart className="text-blue-600" /> Checkout</h2>
            {carrinho.length > 0 && <button onClick={limparCarrinho} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl"><Trash2 size={18}/></button>}
        </div>

        <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2">
          {carrinho.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-3xl border border-gray-100">
              <span className="text-sm font-bold truncate flex-1 text-gray-700">{item.nome}</span>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl p-1">
                <button onClick={() => diminuirQuantidade(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Minus size={14}/></button>
                <span className="text-xs font-black w-4 text-center">{item.qtd}</span>
                <button onClick={() => adicionarAoCarrinho(item)} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg"><Plus size={14}/></button>
              </div>
            </div>
          ))}
          {carrinho.length === 0 && <div className="text-center py-10 opacity-20 font-bold text-xs uppercase italic">Carrinho vazio</div>}
        </div>

        {/* LOGICA DE ENDEREÇO */}
        {mostrarFormEndereco && (
          <div className="bg-blue-50 p-5 rounded-3xl mb-8 border border-blue-100">
            <h3 className="text-[10px] font-black uppercase text-blue-600 mb-4 flex items-center gap-1"><MapPin size={14}/> Dados de Entrega</h3>
            <div className="grid grid-cols-4 gap-2">
              <input className="col-span-3 p-3 text-xs border rounded-xl outline-none" placeholder="Rua/Av" value={endereco.rua} onChange={e => setEndereco({...endereco, rua: e.target.value})} required/>
              <input className="col-span-1 p-3 text-xs border rounded-xl outline-none" placeholder="Nº" value={endereco.numero} onChange={e => setEndereco({...endereco, numero: e.target.value})} required/>
              <input className="col-span-2 p-3 text-xs border rounded-xl outline-none" placeholder="Bairro" value={endereco.bairro} onChange={e => setEndereco({...endereco, bairro: e.target.value})} required/>
              <input className="col-span-2 p-3 text-xs border rounded-xl outline-none" placeholder="Cidade" value={endereco.cidade} onChange={e => setEndereco({...endereco, cidade: e.target.value})} required/>
            </div>
          </div>
        )}

        {temEnderecoSalvo && !mostrarFormEndereco && (
          <div className="mb-8 p-4 bg-green-50 rounded-2xl border border-green-100 flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black text-green-600 uppercase">Entregar em:</p>
              <p className="text-xs font-bold text-gray-700">{endereco.rua}, {endereco.numero}</p>
            </div>
            <button onClick={() => setMostrarFormEndereco(true)} className="text-[9px] font-black text-blue-500 underline uppercase">Alterar</button>
          </div>
        )}

        <div className="border-t pt-8">
          <div className="flex justify-between items-end mb-8">
            <span className="text-sm font-bold text-gray-400">TOTAL</span>
            <span className="text-4xl font-black text-green-600">R$ {carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0).toFixed(2)}</span>
          </div>
          <button 
            onClick={mostrarFormEndereco ? processarVenda : tentarFinalizar} 
            disabled={carrinho.length === 0} 
            className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition disabled:opacity-30"
          >
            {mostrarFormEndereco ? "Confirmar e Pagar" : "Finalizar Pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}