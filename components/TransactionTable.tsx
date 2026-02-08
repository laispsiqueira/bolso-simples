import React, { useState, useMemo, memo } from 'react';
import { Transaction, CATEGORIES } from '../types';
import { Download, ArrowUpRight, ArrowDownLeft, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './Button';

interface TransactionTableProps {
  transactions: Transaction[];
  onDownload: () => void;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  isReadOnly?: boolean;
}

type SortKey = keyof Transaction;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const TransactionTableComponent: React.FC<TransactionTableProps> = ({ 
  transactions, 
  onDownload, 
  onUpdateTransaction,
  isReadOnly = false
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Sorting Logic
  const sortedTransactions = useMemo(() => {
    if (!sortConfig) return transactions;

    return [...transactions].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined || bValue === undefined) return 0;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [transactions, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 text-slate-300" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3 h-3 ml-1 text-blue-600" />
      : <ArrowDown className="w-3 h-3 ml-1 text-blue-600" />;
  };

  if (transactions.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-lg font-semibold text-slate-900">Transações Recentes</h3>
        <div className="flex items-center gap-2">
           <span className="text-xs text-slate-400 hidden sm:inline">
             {transactions.length} registros
           </span>
           <Button onClick={onDownload} variant="outline" className="flex items-center gap-2 text-xs h-9">
             <Download className="w-3.5 h-3.5" />
             Exportar CSV
           </Button>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-100 ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th 
                  scope="col" 
                  onClick={() => handleSort('date')}
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                >
                  <div className="flex items-center">
                    Data
                    <SortIcon columnKey="date" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  onClick={() => handleSort('bank')}
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                >
                  <div className="flex items-center">
                    Banco
                    <SortIcon columnKey="bank" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  onClick={() => handleSort('description')}
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                >
                   <div className="flex items-center">
                    Descrição
                    <SortIcon columnKey="description" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th 
                  scope="col" 
                  onClick={() => handleSort('amount')}
                  className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                >
                   <div className="flex items-center justify-end">
                    Valor
                    <SortIcon columnKey="amount" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tipo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {sortedTransactions.map((t) => (
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

// Optimization: Memoize the component to prevent re-renders when parent state changes 
// but props remain identical.
export const TransactionTable = memo(TransactionTableComponent);