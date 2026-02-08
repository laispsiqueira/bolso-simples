import React, { useState } from 'react';
import { User, CategoryRule, CATEGORIES } from '../types';
import { Button } from './Button';
import { Lock, Save, Plus, Trash2, Search } from 'lucide-react';

interface SettingsProps {
  currentUser: User;
  rules?: CategoryRule[];
  onSaveRules?: (rules: CategoryRule[]) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentUser, rules = [], onSaveRules }) => {
  const isReadOnly = currentUser.role === 'guest';
  const [localRules, setLocalRules] = useState<CategoryRule[]>(rules);
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);

  const handleAddRule = () => {
    if (!newKeyword.trim()) return;
    
    const newRule: CategoryRule = {
      id: `rule-${Date.now()}`,
      keyword: newKeyword.trim(),
      category: newCategory
    };

    const updatedRules = [...localRules, newRule];
    setLocalRules(updatedRules);
    setNewKeyword('');
    
    // Trigger ELT update immediately
    if (onSaveRules) onSaveRules(updatedRules);
  };

  const handleDeleteRule = (id: string) => {
    const updatedRules = localRules.filter(r => r.id !== id);
    setLocalRules(updatedRules);
    if (onSaveRules) onSaveRules(updatedRules);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configurações e Parâmetros</h2>
        <p className="text-slate-500">Gerencie seu perfil e as regras de categorização automática.</p>
      </div>

      {isReadOnly && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <Lock className="h-5 w-5 text-orange-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700 font-medium">Modo Convidado</p>
              <p className="text-sm text-orange-600 mt-1">
                Você não pode alterar regras ou dados do perfil.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white shadow-sm rounded-2xl border border-slate-200 p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Dados do Perfil</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nome</label>
            <input
              disabled
              defaultValue={currentUser.name}
              className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-500 sm:text-sm p-2.5 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input
              disabled
              defaultValue={currentUser.email}
              className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-500 sm:text-sm p-2.5 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Parameter Table Section (ELT Rules) */}
      <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-200">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
               <h3 className="text-lg font-bold text-slate-900">Tabela de Parâmetros (Categorização)</h3>
               <p className="text-sm text-slate-500 mt-1">
                 Defina regras para transformar automaticamente suas transações. O sistema aplicará estas categorias sempre que encontrar a palavra-chave.
               </p>
             </div>
             <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium border border-blue-100">
                {localRules.length} regras ativas
             </div>
           </div>
        </div>

        {/* Add New Rule Form */}
        <div className="bg-slate-50/50 p-6 border-b border-slate-200">
           <div className="flex flex-col sm:flex-row gap-3 items-end">
             <div className="flex-grow w-full">
               <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Se a descrição conter:</label>
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input
                   type="text"
                   disabled={isReadOnly}
                   value={newKeyword}
                   onChange={(e) => setNewKeyword(e.target.value)}
                   placeholder="Ex: Uber, Padaria, Netflix..."
                   className="block w-full rounded-lg border-slate-300 pl-9 focus:border-blue-500 focus:ring-blue-500 text-sm p-2.5"
                 />
               </div>
             </div>
             <div className="w-full sm:w-1/3">
               <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Categorizar como:</label>
               <select
                 disabled={isReadOnly}
                 value={newCategory}
                 onChange={(e) => setNewCategory(e.target.value)}
                 className="block w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm p-2.5"
               >
                 {CATEGORIES.map(cat => (
                   <option key={cat} value={cat}>{cat}</option>
                 ))}
               </select>
             </div>
             <Button 
               onClick={handleAddRule} 
               disabled={isReadOnly || !newKeyword}
               className="w-full sm:w-auto"
             >
               <Plus className="w-4 h-4 mr-1" />
               Adicionar Regra
             </Button>
           </div>
        </div>

        {/* Rules List */}
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-white sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Palavra-Chave</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria Aplicada</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ação</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {localRules.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-sm">
                    Nenhuma regra definida. Adicione uma acima para começar.
                  </td>
                </tr>
              ) : (
                localRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50 group">
                    <td className="px-6 py-3 text-sm font-medium text-slate-900">
                      "{rule.keyword}"
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {rule.category}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {!isReadOnly && (
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-md transition-colors"
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
  );
};