import React from 'react';
import { Transaction, RecurringExpense } from '../types';
import { TrendingUp, Sparkles, Calendar } from 'lucide-react';

interface ForecastProps {
  currentTransactions: Transaction[];
}

export const Forecast: React.FC<ForecastProps> = ({ currentTransactions }) => {
  const subscriptionKeywords = ['netflix', 'spotify', 'amazon', 'adobe', 'gym', 'internet', 'claro', 'vivo', 'tim', 'aluguel', 'condominio', 'seguro'];
  
  const recurringItems: RecurringExpense[] = [];
  
  const groupedByDesc = currentTransactions.reduce((acc, t) => {
    if (t.type !== 'debit') return acc;
    const key = t.description.toLowerCase().trim();
    if (!acc[key]) acc[key] = { count: 0, total: 0, originalName: t.description };
    acc[key].count++;
    acc[key].total += t.amount;
    return acc;
  }, {} as Record<string, { count: number; total: number; originalName: string }>);

  Object.keys(groupedByDesc).forEach(key => {
    const item = groupedByDesc[key];
    const isSubscription = subscriptionKeywords.some(k => key.includes(k));
    
    if (isSubscription || item.total > 50) {
      recurringItems.push({
        description: item.originalName,
        averageAmount: item.total / (item.count || 1),
        frequency: 'Mensal',
        projectedNextMonth: item.total
      });
    }
  });

  const totalProjected = recurringItems.reduce((acc, item) => acc + item.projectedNextMonth, 0);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 opacity-90"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
           <div>
             <div className="flex items-center space-x-2 text-indigo-100 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wider uppercase">Simples Bolso AI</span>
             </div>
             <h2 className="text-3xl font-bold text-white mb-2">Projeção Inteligente</h2>
             <p className="text-indigo-100 max-w-lg leading-relaxed">
               Com base nos padrões identificados nas suas faturas, projetamos seus custos fixos para o próximo mês.
             </p>
           </div>
           
           <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 min-w-[200px]">
             <p className="text-sm font-medium text-indigo-100 mb-1">Total Estimado (Recorrente)</p>
             <p className="text-4xl font-bold text-white tracking-tight">R$ {totalProjected.toFixed(2)}</p>
           </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-100 ring-1 ring-slate-900/5">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
           <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
             <Calendar className="w-5 h-5 text-indigo-600" />
           </div>
           <div>
              <h3 className="text-base font-semibold text-slate-900">Gastos Recorrentes Identificados</h3>
              <p className="text-xs text-slate-500">Detectado via análise de padrões de consumo</p>
           </div>
        </div>
        
        {recurringItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Despesa</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Frequência</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Média Histórica</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Projeção Mês Seguinte</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {recurringItems.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                        {item.frequency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">R$ {item.averageAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-slate-900">R$ {item.projectedNextMonth.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-slate-300" />
             </div>
             <p className="font-medium text-slate-900">Nenhum padrão claro identificado</p>
             <p className="text-sm mt-1 max-w-xs mx-auto">Tente fazer upload de faturas com assinaturas (Netflix, Spotify, Internet) para ativar a projeção.</p>
          </div>
        )}
      </div>
    </div>
  );
};