import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Calculator, Calendar, Trash2, FileText, Download, Upload, RefreshCw } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardProps {
  transactions: any[];
  simulations: any[];
  processedFiles: any[];
  userId?: string;
  onDeleteTransaction?: (id: string) => void;
  onDeleteFile?: (id: string) => void;
  onClearData?: () => Promise<void>;
  userRole?: string;
}

export default function Dashboard({ transactions, simulations, processedFiles, userId, onDeleteTransaction, onDeleteFile, onClearData, userRole }: DashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(getMonth(new Date()));
  const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()));

  const handleReload = () => {
    window.location.reload();
  };

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

    const totalSimulated = simulations.reduce((acc, s) => {
      // Check if current selected month is within the simulation's duration
      const sStartMonth = s.startMonth !== undefined ? parseInt(s.startMonth) : getMonth(parseISO(s.createdAt));
      const sStartYear = s.startYear !== undefined ? parseInt(s.startYear) : getYear(parseISO(s.createdAt));
      const installments = s.installments || 1;

      const currentMonthIndex = selectedYear * 12 + selectedMonth;
      const simulationStartMonthIndex = sStartYear * 12 + sStartMonth;
      const simulationEndMonthIndex = simulationStartMonthIndex + installments;

      if (currentMonthIndex >= simulationStartMonthIndex && currentMonthIndex < simulationEndMonthIndex) {
        const monthlyImpact = (s.totalAmount || 0) / installments;
        return acc + (isNaN(monthlyImpact) ? 0 : monthlyImpact);
      }
      
      return acc;
    }, 0);

    return { totalBalance, income, expense, monthlyBalance, totalSimulated, filteredTransactions };
  }, [transactions, simulations, selectedMonth, selectedYear]);

  const chartData = useMemo(() => {
    const dataMap: Record<string, any> = {};
    
    // Last 6 months up to selected
    for (let i = 5; i >= 0; i--) {
      const date = new Date(selectedYear, selectedMonth - i, 1);
      const key = format(date, 'yyyy-MM');
      const label = format(date, 'MMM/yy', { locale: ptBR });
      dataMap[key] = { sortKey: key, name: label.replace('.', ''), income: 0, expense: 0 };
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
    <div className="space-y-6 pb-12">
      {/* Header with selector and Reload */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0.5">Visão do Período</h3>
            <p className="text-xl font-black text-gray-900 leading-none">
              {monthsList[selectedMonth]} {selectedYear}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center bg-gray-50 rounded-2xl p-1 w-full lg:w-auto">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="flex-1 lg:w-36 bg-transparent border-none rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-gray-600 focus:ring-0 outline-none cursor-pointer"
            >
              {monthsList.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <div className="w-px h-4 bg-gray-200 mx-1 hidden lg:block" />
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="lg:w-28 bg-transparent border-none rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-gray-600 focus:ring-0 outline-none cursor-pointer"
            >
              {yearsList.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 ml-auto lg:ml-0">
            <button 
              onClick={handleReload}
              className="p-3 bg-white border border-gray-100 hover:bg-gray-50 text-gray-600 rounded-2xl transition-all shadow-sm active:scale-95"
              title="Sincronizar Dados"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            {onClearData && userRole === 'ADMIN' && (
              <button 
                onClick={async () => {
                  if (window.confirm('Deseja realmente apagar TODOS os seus dados de teste (transações, regras, arquivos e simulações)? Esta ação não pode ser desfeita.')) {
                    await onClearData();
                    alert('Dados limpos com sucesso!');
                  }
                }}
                className="p-3 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-2xl transition-all shadow-sm active:scale-95"
                title="Limpar todos os meus dados"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Saldo Geral" 
          value={stats.totalBalance} 
          icon={<Wallet className="w-6 h-6" />} 
          color="blue" 
        />
        <StatCard 
          label="Receitas" 
          value={stats.income} 
          icon={<ArrowUpRight className="w-6 h-6" />} 
          color="green" 
        />
        <StatCard 
          label="Despesas" 
          value={stats.expense} 
          icon={<ArrowDownRight className="w-6 h-6" />} 
          color="red" 
        />
        <StatCard 
          label="Proj. Parcelas" 
          value={stats.totalSimulated} 
          icon={<Calculator className="w-6 h-6" />} 
          color="purple" 
          secondary={stats.income > 0 ? `${((stats.totalSimulated / stats.income) * 100).toFixed(1)}% da renda` : undefined}
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white p-6 lg:p-10 rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">Evolução Financeira</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Acompanhamento dos últimos 6 meses</p>
          </div>
          <div className="flex gap-6 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-gray-600">
              <div className="w-3 h-3 bg-emerald-500 rounded-[4px] shadow-sm shadow-emerald-200"/> Receitas
            </span>
            <span className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-gray-600">
              <div className="w-3 h-3 bg-rose-400 rounded-[4px] shadow-sm shadow-rose-200"/> Despesas
            </span>
          </div>
        </div>
        
        <div className="h-80 w-full mb-16 px-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#64748b', fontWeight: 700 }}
                dy={12}
              />
              <YAxis 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                tick={{ fill: '#94a3b8', fontWeight: 600 }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc', radius: 8 }}
                contentStyle={{ 
                  border: 'none', 
                  borderRadius: '20px', 
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                  padding: '16px'
                }} 
                formatter={(val: number) => [`R$ ${val.toLocaleString('pt-BR')}`, '']}
                labelStyle={{ fontWeight: 900, color: '#0f172a', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              />
              <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} name="Receitas" barSize={36} />
              <Bar dataKey="expense" fill="#fb7185" radius={[8, 8, 0, 0]} name="Despesas" barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Improved Transaction Table */}
        <div className="border-t border-gray-50 pt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h4 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">Detalhamento de Transações</h4>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{monthsList[selectedMonth]} {selectedYear}</p>
            </div>
            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-4 py-2 rounded-xl uppercase tracking-tighter ring-1 ring-blue-100">
              {stats.filteredTransactions.length} Lançamentos No Período
            </span>
          </div>

          <div className="overflow-x-auto -mx-6 lg:-mx-10 px-6 lg:px-10">
            <table className="w-full text-left min-w-[900px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-400">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Data</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Descrição</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Categoria</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Valor</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Origem</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {stats.filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100">
                      <div className="flex flex-col items-center gap-3">
                        <Calendar className="w-10 h-10 text-gray-200" />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Sem lançamentos para este período</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stats.filteredTransactions.map((t) => (
                    <tr key={t.id} className="group transition-all hover:translate-x-1">
                      <td className="px-6 py-4 bg-gray-50/50 rounded-l-2xl group-hover:bg-blue-50/30 transition-colors">
                        <p className="text-[11px] font-black text-gray-900 border-l-4 border-gray-200 pl-3 group-hover:border-blue-400 transition-all">{format(parseISO(t.date), 'dd/MM/yy')}</p>
                      </td>
                      <td className="px-6 py-4 bg-gray-50/50 group-hover:bg-blue-50/30 transition-colors">
                        <p className="text-xs font-bold text-gray-800 leading-tight">{t.description}</p>
                      </td>
                      <td className="px-6 py-4 bg-gray-50/50 group-hover:bg-blue-50/30 transition-colors">
                        <span className="px-3 py-1.5 bg-white border border-gray-100 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block group-hover:border-blue-100 group-hover:text-blue-500 transition-all">
                          {t.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 bg-gray-50/50 group-hover:bg-blue-50/30 transition-colors">
                        <p className={`text-sm font-black ${t.amount < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </td>
                      <td className="px-6 py-4 bg-gray-50/50 group-hover:bg-blue-50/30 transition-colors">
                        <div className="flex items-center gap-2 text-gray-400 group-hover:text-blue-400 transition-colors">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold truncate max-w-[140px]" title={t.sourceFile || 'Manual'}>
                            {t.sourceFile || 'Manual'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 bg-gray-50/50 rounded-r-2xl text-center group-hover:bg-blue-50/30 transition-colors">
                        {onDeleteTransaction && (
                          <button 
                            onClick={() => onDeleteTransaction(t.id)}
                            className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Extratos Processados */}
      <div className="bg-white p-8 lg:p-10 rounded-[40px] border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">Arquivos Processados</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Documentos importados via IA</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-[20px]">
            <FileText className="w-7 h-7" />
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
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="mt-6 relative z-10">
                  <h4 className="font-black text-gray-900 truncate pr-4" title={file.fileName}>{file.fileName}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                      {format(parseISO(file.createdAt), 'dd MMM yyyy', { locale: ptBR })}
                    </span>
                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">
                      {file.transactionCount || 0} transações
                    </span>
                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${(file.totalValue || 0) < 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {(file.totalValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
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

  const isPositive = value >= 0;
  const absValue = Math.abs(value);
  const formattedValue = absValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="bg-white p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center transition-all hover:shadow-md hover:translate-y-[-2px] w-full min-w-0">
      <div className={`p-3 lg:p-4 rounded-2xl mr-3 lg:mr-4 border flex-shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] lg:text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5 lg:mb-1 truncate">{label}</p>
        <div className="flex items-center gap-1 min-w-0">
          {!isPositive && <span className="text-sm font-black text-red-500">-</span>}
          <p className={`font-black text-gray-900 leading-none truncate ${
            formattedValue.length > 15 ? 'text-sm lg:text-base' : 
            formattedValue.length > 12 ? 'text-base lg:text-lg' : 'text-lg lg:text-xl'
          }`}>
            {formattedValue}
          </p>
        </div>
        {secondary && <p className="text-[9px] lg:text-[10px] font-bold text-gray-400 mt-1 truncate">{secondary}</p>}
      </div>
    </div>
  );
}


