import React, { useState } from 'react';
import { LayoutDashboard, Gavel, Calculator, CreditCard, Users, LogOut, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative`}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 transition-colors z-20"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={`p-6 ${isCollapsed ? 'flex justify-center px-0' : ''}`}>
          {!isCollapsed ? (
            <>
              <h1 className="text-2xl font-bold text-blue-600 tracking-tight">Bolso Simples</h1>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-mono">Controle Inteligente</p>
            </>
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
              B
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : ''}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t border-gray-100 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <div className={`flex items-center ${isCollapsed ? 'px-0 justify-center' : 'px-4'} py-3 mb-2`}>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            {!isCollapsed && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.role || 'FREE'}</p>
              </div>
            )}
          </div>
          <button 
            onClick={onLogout}
            title={isCollapsed ? 'Sair' : ''}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors`}
          >
            <LogOut className={`w-4 h-4 ${isCollapsed ? '' : 'mr-2'}`} />
            {!isCollapsed && <span>Sair</span>}
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
