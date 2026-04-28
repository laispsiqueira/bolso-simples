import React from 'react';
import { Check, Zap, Shield, Crown } from 'lucide-react';

export default function Plans() {
  const tiers = [
    {
      name: 'FREE',
      price: 'R$ 0',
      description: 'Essencial para quem está começando.',
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      features: ['Extração por IA (Limite 5/mês)', 'Dashboard Básico', 'Regras Manuais (Até 10)', 'Simulador de Compras'],
      active: true
    },
    {
      name: 'PRO',
      price: 'R$ 29,90',
      description: 'Para quem busca precisão e liberdade.',
      icon: <Shield className="w-6 h-6 text-purple-500" />,
      features: ['Extração Ilimitada', 'Backup em Nuvem', 'Regras Ilimitadas', 'Exportação CSV/Excel', 'Categorização Turbo'],
      highlight: true
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black tracking-tight text-gray-900">Escolha seu plano</h2>
        <p className="text-gray-500 max-w-xl mx-auto">Potencialize sua gestão financeira com recursos avançados de inteligência artificial.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tiers.map((tier) => (
          <div 
            key={tier.name}
            className={`relative p-8 rounded-3xl border transition-all ${
              tier.highlight 
              ? 'bg-white border-blue-200 shadow-2xl scale-105 z-10' 
              : 'bg-white border-gray-100 shadow-xl'
            }`}
          >
            {tier.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                MAIS POPULAR
              </div>
            )}
            
            <div className="mb-6">
              <div className="mb-4">{tier.icon}</div>
              <h3 className="text-xl font-black">{tier.name}</h3>
              <p className="text-3xl font-black mt-2">{tier.price}<span className="text-sm font-normal text-gray-400">/mês</span></p>
              <p className="text-xs text-gray-400 mt-2">{tier.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {tier.features.map(f => (
                <li key={f} className="flex items-start text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <button 
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                tier.active
                ? 'bg-gray-100 text-gray-400 cursor-default'
                : tier.highlight
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                  : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200'
              }`}
            >
              {tier.active ? 'Seu Plano Atual' : 'Fazer Upgrade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
