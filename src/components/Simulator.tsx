import React, { useState } from 'react';
import { Plus, Calculator, History, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SimulatorProps {
  simulations: any[];
  onSaveSimulation: (sim: any) => void;
  onDeleteSimulation: (id: string) => void;
}

export default function Simulator({ simulations, onSaveSimulation, onDeleteSimulation }: SimulatorProps) {
  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    installments: '1',
    priority: 'Medium',
    bank: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.totalAmount) return;
    
    onSaveSimulation({
      ...formData,
      totalAmount: parseFloat(formData.totalAmount),
      installments: parseInt(formData.installments),
      createdAt: new Date().toISOString()
    });
    
    setFormData({
      name: '',
      totalAmount: '',
      installments: '1',
      priority: 'Medium',
      bank: ''
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Simulation Form */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl">
          <h3 className="text-lg font-bold flex items-center mb-6">
            <Calculator className="w-5 h-5 mr-2 text-blue-600" />
            Nova Simulação
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">O que você quer comprar?</label>
              <input 
                type="text" 
                placeholder="Ex: MacBook M3" 
                className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Valor Total</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Parcelas</label>
                <select 
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  value={formData.installments}
                  onChange={(e) => setFormData({...formData, installments: e.target.value})}
                >
                  {[1, 2, 3, 4, 5, 6, 10, 12, 18, 24].map(n => (
                    <option key={n} value={n}>{n}x</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Prioridade</label>
              <div className="grid grid-cols-3 gap-2">
                {['Alta', 'Média', 'Baixa'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({...formData, priority: p})}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      formData.priority === p 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
            >
              Simular Planejamento
            </button>
          </form>
        </div>

        <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-xl shadow-blue-100">
          <p className="text-sm font-medium opacity-80 mb-2 font-mono">Dica da IA</p>
          <p className="text-lg font-bold leading-tight italic">
            "Compras parceladas comprometem sua liquidez futura. Tente priorizar pagamentos à vista para descontos maiores."
          </p>
        </div>
      </div>

      {/* Simulation Results/History */}
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-lg font-bold flex items-center">
          <History className="w-5 h-5 mr-2 text-gray-400" />
          Histórico de Planejamento
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {simulations.length === 0 && (
            <div className="col-span-2 py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
              <Calculator className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium italic">Suas simulações aparecerão aqui.</p>
            </div>
          )}
          {simulations.map((sim) => (
            <div key={sim.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-gray-900">{sim.name}</h4>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                  sim.priority === 'Alta' ? 'bg-red-50 text-red-600' : 
                  sim.priority === 'Média' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                }`}>
                  {sim.priority}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Total</p>
                  <p className="text-lg font-black text-gray-900">R$ {sim.totalAmount.toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Parcelas</p>
                  <p className="text-lg font-black text-gray-900">{sim.installments}x R$ {(sim.totalAmount / sim.installments).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-[10px] text-gray-400 font-mono italic">Adicionado em {new Date(sim.createdAt).toLocaleDateString()}</p>
                <button 
                  onClick={() => onDeleteSimulation(sim.id)}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
