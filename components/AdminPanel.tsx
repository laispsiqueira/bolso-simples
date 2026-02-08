import React from 'react';
import { User } from '../types';
import { Shield, Trash2, Edit, LogIn } from 'lucide-react';
import { Button } from './Button';

interface AdminPanelProps {
  users: User[];
  onImpersonate: (user: User) => void;
  currentAdmin: User;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, onImpersonate, currentAdmin }) => {
  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-indigo-700 font-medium">
              Painel de Usuário
            </p>
            <p className="text-xs text-indigo-600 mt-1">
              Gerencie acessos e visualize dados de outros usuários.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-900">Lista de Usuários</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Função</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                        user.role === 'paid' ? 'bg-indigo-100 text-indigo-800' : 
                        user.role === 'guest' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {user.name !== currentAdmin.name && (
                       <Button 
                        variant="outline" 
                        className="h-8 px-3 text-xs"
                        onClick={() => onImpersonate(user)}
                        title="Acessar como este usuário"
                       >
                         <LogIn className="w-3.5 h-3.5 mr-1" />
                         Acessar
                       </Button>
                    )}
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"><Edit className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
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