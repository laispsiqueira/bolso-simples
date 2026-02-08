import React from 'react';
import { Transaction, CATEGORIES } from '../types';
import { Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from './Button';

interface TransactionTableProps {
  transactions: Transaction[];
  onDownload: () => void;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  isReadOnly?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  onDownload, 
  onUpdateTransaction,
  isReadOnly = false
}) => {
  if (transactions.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-lg font-semibold text-slate-900">Transações Recentes</h3>
        <Button onClick={onDownload} variant="outline" className="flex items-center gap-2 text-xs h-9">
          <Download className="w-3.5 h-3.5" />
          Exportar CSV
        </Button>
      </div>
      
      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-100 ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Banco</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                    {new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                    {t.bank || 'Desconhecido'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{t.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      disabled={isReadOnly}
                      value={t.category}
                      onChange={(e) => onUpdateTransaction(t.id, { category: e.target.value })}
                      className="block w-full pl-2 pr-8 py-1 text-xs border-slate-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-slate-50 disabled:bg-transparent disabled:appearance-none cursor-pointer"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-900">
                    R$ {t.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {t.type === 'debit' ? (
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500" title="Saída">
                        <ArrowDownLeft className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-500" title="Entrada">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};