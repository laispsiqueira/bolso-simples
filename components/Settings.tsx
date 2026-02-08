import React from 'react';
import { User } from '../types';
import { Button } from './Button';
import { Lock, Save } from 'lucide-react';

interface SettingsProps {
  currentUser: User;
}

export const Settings: React.FC<SettingsProps> = ({ currentUser }) => {
  const isReadOnly = currentUser.role === 'guest';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações da Conta</h2>
        <p className="text-gray-500">Gerencie suas preferências e dados de perfil.</p>
      </div>

      {isReadOnly && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Lock className="h-5 w-5 text-orange-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700 font-medium">
                Modo Convidado (Luisa)
              </p>
              <p className="text-sm text-orange-600 mt-1">
                Você tem permissão para visualizar os dados, mas não pode alterar configurações desta conta.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
              Nome de Exibição
            </label>
            <input
              type="text"
              name="first-name"
              id="first-name"
              disabled={isReadOnly}
              defaultValue={currentUser.role === 'guest' ? "Brenno (Titular)" : currentUser.name}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              disabled={isReadOnly}
              defaultValue={currentUser.role === 'guest' ? "brenno@example.com" : currentUser.email}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          <div className="sm:col-span-6">
             <label className="flex items-center space-x-3">
               <input 
                 type="checkbox" 
                 disabled={isReadOnly}
                 defaultChecked
                 className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
               />
               <span className="text-sm text-gray-700">Receber relatórios semanais por email</span>
             </label>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-end">
           <Button disabled={isReadOnly} className="flex items-center gap-2">
             <Save className="w-4 h-4" />
             Salvar Alterações
           </Button>
        </div>
      </div>
    </div>
  );
};