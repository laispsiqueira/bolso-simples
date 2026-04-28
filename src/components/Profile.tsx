import React from 'react';
import { User, Shield, CreditCard, LogOut, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProfileProps {
  user: any;
  onLogout: () => void;
}

export default function Profile({ user, onLogout }: ProfileProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-black mb-4 shadow-lg shadow-blue-100">
            {user?.name?.[0] || user?.email?.[0] || 'U'}
          </div>
          <h2 className="text-2xl font-black text-gray-900">{user?.name || 'Seu Nome'}</h2>
          <span className={`mt-2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            user?.role === 'ADMIN' ? 'bg-yellow-100 text-yellow-700' : 
            user?.role === 'PAID' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
          }`}>
            Plano {user?.role || 'FREE'}
          </span>
        </div>

        <div className="mt-12 space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <Mail className="w-5 h-5 text-gray-400 mr-4" />
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail</p>
              <p className="text-sm font-bold text-gray-900">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <Calendar className="w-5 h-5 text-gray-400 mr-4" />
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Membro desde</p>
              <p className="text-sm font-bold text-gray-900">
                {user?.createdAt ? format(new Date(user.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Recentemente'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 p-4 bg-gray-50 text-gray-600 rounded-2xl font-bold text-sm border border-gray-100 hover:bg-white hover:border-blue-200 transition-all">
            <Shield className="w-4 h-4" /> Alterar Senha
          </button>
          <button className="flex items-center justify-center gap-2 p-4 bg-gray-50 text-gray-600 rounded-2xl font-bold text-sm border border-gray-100 hover:bg-white hover:border-blue-200 transition-all">
            <CreditCard className="w-4 h-4" /> Faturas
          </button>
        </div>

        <button 
          onClick={onLogout}
          className="w-full mt-8 p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm border border-rose-100 hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Sair da Conta
        </button>
      </div>

      <div className="bg-blue-600 p-8 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-100">
        <div className="text-center md:text-left">
          <h3 className="text-xl font-black mb-2">Quer mais recursos?</h3>
          <p className="text-sm text-blue-100">Faça o upgrade para o plano PRO e tenha inteligência ilimitada.</p>
        </div>
        <button className="px-8 py-3 bg-white text-blue-600 rounded-xl font-black text-sm hover:bg-blue-50 transition-all whitespace-nowrap">
          VER PLANOS
        </button>
      </div>
    </div>
  );
}
