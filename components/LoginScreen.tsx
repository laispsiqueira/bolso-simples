import React from 'react';
import { User } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  availableUsers: User[];
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ availableUsers, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
          <div className="mx-auto h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Simples Bolso</h1>
          <p className="text-blue-100 text-sm">Faça login para gerenciar suas finanças</p>
        </div>

        <div className="p-8">
          <p className="text-slate-500 text-sm mb-6 text-center">Selecione uma conta para simular o acesso:</p>
          
          <div className="space-y-3">
            {availableUsers.map((user) => (
              <button
                key={user.email}
                onClick={() => onLogin(user)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                    ${user.role === 'admin' ? 'bg-red-500' : 
                      user.role === 'paid' ? 'bg-indigo-600' : 
                      user.role === 'guest' ? 'bg-amber-500' : 'bg-slate-500'}
                  `}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400">Ambiente de Demonstração Seguro</p>
        </div>
      </div>
    </div>
  );
};