import React, { useState } from 'react';
import { Plus, Brain, Trash2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface RulesProps {
  rules: any[];
  onAddRule: (rule: any) => void;
  onDeleteRule: (id: string) => void;
}

export default function Rules({ rules, onAddRule, onDeleteRule }: RulesProps) {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !category) return;
    onAddRule({ keyword, category, active: true, createdAt: new Date().toISOString() });
    setKeyword('');
    setCategory('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Brain className="w-32 h-32" />
        </div>
        
        <h3 className="text-xl font-bold flex items-center mb-2">
          <Brain className="w-6 h-6 mr-2 text-blue-600" />
          Central de Inteligência
        </h3>
        <p className="text-gray-500 mb-8 max-w-lg">
          Ensine a IA como categorizar suas transações automaticamente. 
          Regras manuais têm prioridade sobre as automáticas.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Ex: IFOOD, NETFLIX, UBER" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Ex: Alimentação, Lazer" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            disabled={!keyword || !category}
          >
            Ensinar
          </button>
        </form>

        <div className="space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-gray-400">Instruções Ativas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">Nenhuma regra cadastrada ainda.</p>
              </div>
            )}
            {rules.map((rule) => (
              <motion.div 
                layout
                key={rule.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all group"
              >
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    "{rule.keyword}" <span className="text-gray-400 font-normal">sempre será</span> {rule.category}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono">Prioridade: Alta</p>
                </div>
                <button 
                  onClick={() => onDeleteRule(rule.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-2xl flex items-start">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
        <p className="text-sm text-yellow-800">
          <strong>Aviso de Conflito:</strong> Se houver mais de uma regra para o mesmo termo, 
          o sistema usará a regra mais recente. O histórico passado é reprocessado automaticamente 
          ao salvar uma nova regra.
        </p>
      </div>
    </div>
  );
}
