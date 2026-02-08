import React from 'react';
import { Transaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, TooltipProps } from 'recharts';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
}

interface TimelineItem {
  date: string;
  income: number;
  expense: number;
}

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-sm">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: R$ {entry.value?.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  // Aggregate by Category
  const categoryData = Object.values(transactions.reduce((acc, curr) => {
    if (curr.type === 'debit') {
      if (!acc[curr.category]) {
        acc[curr.category] = { name: curr.category, value: 0 };
      }
      acc[curr.category].value += curr.amount;
    }
    return acc;
  }, {} as Record<string, { name: string; value: number }>));

  // Aggregate by Date
  const timelineData = Object.values(transactions.reduce((acc, curr) => {
    if (!acc[curr.date]) {
      acc[curr.date] = { date: curr.date, income: 0, expense: 0 };
    }
    if (curr.type === 'credit') acc[curr.date].income += curr.amount;
    else acc[curr.date].expense += curr.amount;
    return acc;
  }, {} as Record<string, TimelineItem>))
  .sort((a: TimelineItem, b: TimelineItem) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

  const totalSpent = transactions.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalSpent;

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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Saídas Totais</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">R$ {totalSpent.toFixed(2)}</p>
          </div>
          <div className="p-2 bg-red-50 rounded-lg">
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Entradas Totais</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">R$ {totalIncome.toFixed(2)}</p>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Saldo do Período</p>
            <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
              R$ {balance.toFixed(2)}
            </p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <Wallet className="w-5 h-5 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Gastos por Categoria</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
             {categoryData.map((entry, index) => (
               <div key={index} className="flex items-center text-xs text-slate-500">
                 <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                 {entry.name}
               </div>
             ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Fluxo de Caixa</h3>
          <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={timelineData} barSize={20}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 11, fill: '#94a3b8'}} 
                    tickFormatter={(val) => val.split('-').slice(1).join('/')} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                 />
                 <YAxis 
                    tick={{fontSize: 11, fill: '#94a3b8'}} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `R$${value/1000}k`}
                 />
                 <RechartsTooltip content={<CustomTooltip />} />
                 <Bar dataKey="income" name="Entrada" fill="#10B981" radius={[4, 4, 0, 0]} />
                 <Bar dataKey="expense" name="Saída" fill="#EF4444" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};