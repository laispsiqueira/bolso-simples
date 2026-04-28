import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Calculator, Calendar, Trash2, FileText, Download, Upload } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface DashboardProps {
  transactions: any[];
  simulations: any[];
  processedFiles: any[];
  userId?: string;
  onDeleteTransaction?: (id: string) => void;
  onDeleteFile?: (id: string) => void;
}

export default function Dashboard({ transactions, simulations, processedFiles, userId, onDeleteTransaction, onDeleteFile }: DashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(getMonth(new Date()));
  const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()));

  const monthsList = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const yearsList = useMemo(() => {
    const years = new Set<number>([getYear(new Date())]);
    transactions.forEach(t => {
      years.add(getYear(parseISO(t.date)));
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const stats = useMemo(() => {
    const periodStart = new Date(selectedYear, selectedMonth, 1);
    const periodEnd = endOfMonth(periodStart);
    const interval = { start: periodStart, end: periodEnd };

    const filteredTransactions = transactions.filter(t => 
      isWithinInterval(parseISO(t.date), interval)
    );

    const totalBalance = transactions.reduce((acc, t) => acc + t.amount, 0);
    const income = filteredTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    const monthlyBalance = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);

    const totalSimulated = simulations.reduce((acc, s) => acc + s.amount, 0);

    return { totalBalance, income, expense, monthlyBalance, totalSimulated, filteredTransactions };
  }, [transactions, simulations, selectedMonth, selectedYear]);

  const chartData = useMemo(() => {
    const dataMap: Record<string, any> = {};
    const lastMonths: Date[] = [];
    
    // Preparar últimos 6 meses até o selecionado para contexto, ou apenas os 6 meses correntes
    for (let i = 5; i >= 0; i--) {
      const date = new Date(selectedYear, selectedMonth - i, 1);
      const key = format(date, 'yyyy-MM');
      const label = format(date, 'MMM/yy', { locale: ptBR });
      dataMap[key] = { sortKey: key, name: label.replace('.', ''), income: 0, expense: 0 };
      lastMonths.push(date);
    }

    transactions.forEach(t => {
      const tDate = parseISO(t.date);
      const key = format(tDate, 'yyyy-MM');
      if (dataMap[key]) {
        if (t.type === 'INCOME') dataMap[key].income += t.amount;
        else dataMap[key].expense += Math.abs(t.amount);
      }
    });

    return Object.values(dataMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [transactions, selectedMonth, selectedYear]);

  return (
    <div className="space-y-8">
      {/* Header with selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Período de Análise</h3>
            <p className="text-lg font-black text-blue-600 leading-none">
              {monthsList[selectedMonth]} {selectedYear}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="flex-1 md:w-40 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-100 outline-none"
          >
            {monthsList.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="md:w-32 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-100 outline-none"
          >
            {yearsList.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Saldo Geral" 
          value={stats.totalBalance} 
          icon={<Wallet className="w-5 h-5" />} 
          color="blue" 
        />
        <StatCard 
          label="Receitas Período" 
          value={stats.income} 
          icon={<ArrowUpRight className="w-5 h-5" />} 
          color="green" 
        />
        <StatCard 
          label="Despesas Período" 
          value={stats.expense} 
          icon={<ArrowDownRight className="w-5 h-5" />} 
          color="red" 
        />
        <StatCard 
          label="Meta Simulada" 
          value={stats.totalSimulated} 
          icon={<Calculator className="w-5 h-5" />} 
          color="purple" 
          secondary={`Impacto: ${((stats.totalSimulated / (stats.income || 1)) * 100).toFixed(1)}%`}
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Evolução Gastos vs Receitas</h3>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-gray-400">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-green-500 rounded-full"/> Receitas</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-red-400 rounded-full"/> Despesas</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#94a3b8', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                  tick={{ fill: '#94a3b8', fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }} 
                  formatter={(val: number) => [`R$ ${val.toLocaleString('pt-BR')}`, '']}
                  labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase' }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Receitas" barSize={32} />
                <Bar dataKey="expense" fill="#f87171" radius={[6, 6, 0, 0]} name="Despesas" barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Transações Recentes</h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
            {stats.filteredTransactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Calendar className="w-12 h-12 text-gray-200 mb-2" />
                <p className="text-sm font-medium text-gray-400">Nenhuma transação neste período</p>
              </div>
            ) : (
              stats.filteredTransactions.slice(0, 15).map((t, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      t.type === 'INCOME' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {t.type === 'INCOME' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 truncate w-24 sm:w-32">{t.description}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{format(parseISO(t.date), 'dd MMM', { locale: ptBR })}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className={`text-sm font-black ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                        {t.type === 'INCOME' ? '+' : ''}{t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {t.category}
                      </span>
                    </div>
                    {onDeleteTransaction && (
                      <button 
                        onClick={() => onDeleteTransaction(t.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Processed Files Section */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 leading-none">Extratos Importados</h3>
              <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Gestão de Documentos</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedFiles.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
              <Upload className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold">Nenhum arquivo importado ainda</p>
            </div>
          ) : (
            processedFiles.slice().reverse().map((file) => (
              <div key={file.id} className="group bg-white border border-gray-100 p-6 rounded-3xl hover:shadow-xl hover:shadow-gray-100 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 text-purple-100 -mr-12 -mt-12 rounded-full opacity-50 group-hover:scale-150 transition-transform" />
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  {onDeleteFile && (
                    <button 
                      onClick={() => onDeleteFile(file.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                      title="Excluir arquivo e transações"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="mt-6 relative z-10">
                  <h4 className="font-black text-gray-900 truncate pr-4" title={file.fileName}>
                    {file.fileName}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                      {format(parseISO(file.createdAt), 'dd MMM yyyy', { locale: ptBR })}
                    </span>
                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">
                      {file.transactionCount || 0} transações
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-xs font-bold text-gray-400">Processado</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, secondary }: { label: string, value: number, icon: React.ReactNode, color: string, secondary?: string }) {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center transition-all hover:shadow-md hover:translate-y-[-2px]">
      <div className={`p-4 rounded-2xl mr-4 border ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-gray-900 leading-none mb-1">
          {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
        {secondary && <p className="text-[10px] font-bold text-gray-400">{secondary}</p>}
      </div>
    </div>
  );
}

