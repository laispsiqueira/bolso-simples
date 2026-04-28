import React from 'react';
import { LayoutDashboard, Gavel, Calculator, CreditCard, Users, LogOut, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onImportClick: () => void;
  user: any;
  onLogout: () => void;
}

export default function Layout({ children, activeTab, setActiveTab, onImportClick, user, onLogout }: LayoutProps) {
  const menuItems = [
    { id: 'dash', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'regras', label: 'Regras', icon: Gavel },
    { id: 'calc', label: 'Simulador', icon: Calculator },
    { id: 'plans', label: 'Planos', icon: CreditCard },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ id: 'admin', label: 'Usuários', icon: Users });
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight">Bolso Simples</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-mono">Controle Inteligente</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.role || 'FREE'}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-gray-800">
            {menuItems.find(i => i.id === activeTab)?.label || 'Bolso Simples'}
          </h2>
          <button
            onClick={onImportClick}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-200 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Importar Extratos
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
