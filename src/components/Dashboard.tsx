import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardProps {
  transactions: any[];
}

export default function Dashboard({ transactions }: DashboardProps) {
  const stats = useMemo(() => {
    const totalBalance = transactions.reduce((acc, t) => acc + t.amount, 0);
    const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

    const now = new Date();
    const currentMonthInterval = { start: startOfMonth(now), end: endOfMonth(now) };
    const monthlyTransactions = transactions.filter(t => isWithinInterval(parseISO(t.date), currentMonthInterval));
    const monthlyBalance = monthlyTransactions.reduce((acc, t) => acc + t.amount, 0);

    return { totalBalance, income, expense, monthlyBalance };
  }, [transactions]);

  const chartData = useMemo(() => {
    const months: any = {};
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = format(d, 'MMM/yy', { locale: ptBR });
      months[key] = { name: key, income: 0, expense: 0 };
      return key;
    }).reverse();

    transactions.forEach(t => {
      const key = format(parseISO(t.date), 'MMM/yy', { locale: ptBR });
      if (months[key]) {
        if (t.type === 'INCOME') months[key].income += t.amount;
        else months[key].expense += Math.abs(t.amount);
      }
    });

    return Object.values(months);
  }, [transactions]);

  return (
    <div className="space-y-8">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Saldo Total" 
          value={stats.totalBalance} 
          icon={<Wallet className="w-5 h-5" />} 
          color="blue" 
        />
        <StatCard 
          label="Receitas" 
          value={stats.income} 
          icon={<ArrowUpRight className="w-5 h-5" />} 
          color="green" 
        />
        <StatCard 
          label="Despesas" 
          value={stats.expense} 
          icon={<ArrowDownRight className="w-5 h-5" />} 
          color="red" 
        />
        <StatCard 
          label="Saldo Mensal" 
          value={stats.monthlyBalance} 
          icon={<TrendingUp className="w-5 h-5" />} 
          color="purple" 
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Evolução Gastos vs Receitas</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                <Tooltip 
                  contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                  formatter={(val: number) => [`R$ ${val.toFixed(2)}`, '']}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Receitas" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Transações Recentes</h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[320px] pr-2">
            {transactions.slice(0, 10).map((t, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    t.type === 'INCOME' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {t.type === 'INCOME' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate w-32">{t.description}</p>
                    <p className="text-xs text-gray-400">{format(parseISO(t.date), 'dd/MM/yyyy')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'INCOME' ? '+' : ''}{t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase font-mono">{t.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center">
      <div className={`p-4 rounded-xl mr-4 border ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">
          {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
    </div>
  );
}
