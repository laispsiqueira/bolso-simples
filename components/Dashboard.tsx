import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { TrendingDown, TrendingUp, Wallet, Calendar, Filter, Landmark, ArrowRight } from 'lucide-react';
import { TransactionTable } from './TransactionTable';
import { downloadCSV } from '../utils/fileHelpers';

interface DashboardProps {
  transactions: Transaction[];
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  isReadOnly?: boolean;
}

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-sm">
        <p className="font-semibold text-slate-700 mb-1">{payload[0].name}</p>
        <p className="text-slate-600">
          R$ {payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  transactions,
  onUpdateTransaction,
  isReadOnly = false
}) => {
  
  // Extract unique months (YYYY-MM)
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(t => {
      months.add(t.date.substring(0, 7));
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || '');

  // Filter transactions based on selection
  const filteredTransactions = useMemo(() => {
    if (!selectedMonth) return transactions;
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // --- LOGIC: PER BANK ---
  const bankStats = useMemo(() => {
    const stats: Record<string, { income: 0, expense: 0, balance: 0, name: string }> = {};
    
    filteredTransactions.forEach(t => {
      const bankName = t.bank || 'Outros';
      if (!stats[bankName]) {
        stats[bankName] = { income: 0, expense: 0, balance: 0, name: bankName };
      }

      if (t.type === 'credit') {
        stats[bankName].income += t.amount;
        stats[bankName].balance += t.amount;
      } else {
        stats[bankName].expense += t.amount;
        stats[bankName].balance -= t.amount;
      }
    });

    return Object.values(stats);
  }, [filteredTransactions]);

  // --- LOGIC: BY CATEGORY ---
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    let totalExpenses = 0;

    filteredTransactions.forEach(t => {
      if (t.type === 'debit') {
        if (!stats[t.category]) stats[t.category] = 0;
        stats[t.category] += t.amount;
        totalExpenses += t.amount;
      }
    });

    // Convert to array and sort DESC
    const sorted = Object.entries(stats)
      .map(([name, value]) => ({ 
        name, 
        value, 
        percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0 
      }))
      .sort((a, b) => b.value - a.value);

    return { data: sorted, total: totalExpenses };
  }, [filteredTransactions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', '#64748b'];

  const totalSpent = filteredTransactions.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = filteredTransactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalSpent;

  // Format month label
  const getMonthLabel = (yyyyMm: string) => {
    const [year, month] = yyyyMm.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  };

  if (transactions.length === 0) {
    return (
       <div className="p-12 text-center">
         <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
            <Wallet className="h-8 w-8 text-slate-400" />
         </div>
         <h3 className="text-lg font-medium text-slate-900">Nenhum dado financeiro</h3>
         <p className="text-slate-500 mt-1">Faça upload de um extrato para visualizar as análises.</p>
       </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-2 text-slate-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtrar período:</span>
         </div>
         <div className="relative w-full sm:w-64">
           <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <select 
             className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none capitalize cursor-pointer"
             value={selectedMonth}
             onChange={(e) => setSelectedMonth(e.target.value)}
           >
             {availableMonths.map(m => (
               <option key={m} value={m}>{getMonthLabel(m)}</option>
             ))}
           </select>
         </div>
      </div>

      {/* Global Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
             <p className="text-sm font-medium text-slate-500">Saldo Total ({getMonthLabel(selectedMonth)})</p>
             <div className="p-1.5 bg-blue-50 rounded-lg">
                <Wallet className="w-4 h-4 text-blue-500" />
             </div>
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
            R$ {balance.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
             <p className="text-sm font-medium text-slate-500">Entradas Totais</p>
             <div className="p-1.5 bg-emerald-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
             </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">R$ {totalIncome.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
             <p className="text-sm font-medium text-slate-500">Saídas Totais</p>
             <div className="p-1.5 bg-red-50 rounded-lg">
                <TrendingDown className="w-4 h-4 text-red-500" />
             </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">R$ {totalSpent.toFixed(2)}</p>
        </div>
      </div>

      {/* --- BANK BREAKDOWN SECTION --- */}
      <div className="space-y-4">
         <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-600" />
            Detalhamento por Banco
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bankStats.map((bank) => (
              <div key={bank.name} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                 <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{bank.name}</span>
                    <span className={`text-sm font-bold ${bank.balance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                       {bank.balance >= 0 ? '+' : ''} R$ {bank.balance.toFixed(2)}
                    </span>
                 </div>
                 <div className="p-6 space-y-5">
                    {/* Income Bar */}
                    <div>
                       <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 font-medium">Entrada</span>
                          <span className="text-emerald-600 font-bold">R$ {bank.income.toFixed(2)}</span>
                       </div>
                       <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${bank.income > 0 ? '100' : '0'}%` }}></div>
                       </div>
                    </div>

                    {/* Expense Bar */}
                    <div>
                       <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 font-medium">Saída</span>
                          <span className="text-red-500 font-bold">R$ {bank.expense.toFixed(2)}</span>
                       </div>
                       <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${bank.expense > 0 ? '100' : '0'}%` }}></div>
                       </div>
                    </div>

                    {/* Balance Info */}
                    <div className="pt-2 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                        <span>Saldo Mensal</span>
                        <span className="font-medium">Resultado consolidado</span>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* --- CATEGORY ANALYSIS (DONUT + TABLE) --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Análise de Gastos por Categoria</h3>
          
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Donut Chart */}
            <div className="w-full lg:w-1/2 h-80 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryStats.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend 
                     verticalAlign="bottom" 
                     height={36} 
                     iconType="circle"
                     formatter={(value) => <span className="text-xs text-slate-500 ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                 <span className="text-slate-400 text-xs uppercase tracking-wide font-semibold">Total Gastos</span>
                 <span className="text-2xl font-bold text-slate-800">R$ {categoryStats.total.toFixed(0)}</span>
              </div>
            </div>

            {/* Ordered Table */}
            <div className="w-full lg:w-1/2 overflow-hidden border border-slate-100 rounded-xl">
               <table className="min-w-full divide-y divide-slate-100">
                 <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Categoria</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Valor</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">%</th>
                    </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-slate-50">
                    {categoryStats.data.map((cat, idx) => (
                      <tr key={cat.name} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-700 font-medium flex items-center gap-2">
                           <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                           {cat.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-900 font-semibold">
                           R$ {cat.value.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-500">
                           {cat.percentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          </div>
      </div>

      <TransactionTable 
        transactions={filteredTransactions} 
        onDownload={() => downloadCSV(filteredTransactions)}
        onUpdateTransaction={onUpdateTransaction}
        isReadOnly={isReadOnly}
      />
    </div>
  );
};