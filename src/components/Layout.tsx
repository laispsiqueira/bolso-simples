import React, { useState } from 'react';
import { 
  LayoutDashboard, Gavel, Calculator, CreditCard, Users, LogOut, 
  Plus, ChevronLeft, ChevronRight, User, Menu, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dash', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'regras', label: 'Regras', icon: Gavel },
    { id: 'calc', label: 'Simular', icon: Calculator },
    { id: 'plans', label: 'Planos', icon: CreditCard },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ id: 'admin', label: 'Usuários', icon: Users });
  }

  const bottomItems = [
    { id: 'dash', icon: LayoutDashboard, label: 'Início' },
    { id: 'regras', icon: Gavel, label: 'Regras' },
    { id: 'calc', icon: Calculator, label: 'Simular' },
    { id: 'profile', icon: User, label: 'Conta' },
  ];

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar - Hidden on Mobile */}
      <aside className={`hidden lg:flex ${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 flex-col transition-all duration-300 relative`}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50 transition-colors z-20"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={`p-6 ${isCollapsed ? 'flex justify-center px-0' : ''}`}>
          {!isCollapsed ? (
            <>
              <h1 className="text-2xl font-black text-blue-600 tracking-tight">Bolso Simples</h1>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">Controle Inteligente</p>
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
              onClick={() => handleTabChange(item.id)}
              title={isCollapsed ? item.label : ''}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t border-slate-100 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <button 
            onClick={() => handleTabChange('profile')}
            className={`flex items-center w-full ${isCollapsed ? 'px-0 justify-center' : 'px-4'} py-3 mb-2 rounded-xl hover:bg-slate-50 transition-all ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : ''}`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
              {user?.name?.[0] || 'U'}
            </div>
            {!isCollapsed && (
              <div className="ml-3 overflow-hidden text-left">
                <p className="text-sm font-semibold truncate">{user?.name || 'Usuário'}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase">{user?.role || 'FREE'}</p>
              </div>
            )}
          </button>
          <button 
            onClick={onLogout}
            title={isCollapsed ? 'Sair' : ''}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-2 text-xs font-bold uppercase tracking-widest text-rose-600 hover:bg-rose-50 rounded-lg transition-colors`}
          >
            <LogOut className={`w-4 h-4 ${isCollapsed ? '' : 'mr-2'}`} />
            {!isCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
             <div className="lg:hidden w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">B</div>
             <h2 className="text-base lg:text-lg font-black text-slate-900 tracking-tight uppercase">
              {menuItems.find(i => i.id === activeTab)?.label || 
               (activeTab === 'profile' ? 'Sua Conta' : 'Bolso Simples')}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <button
              onClick={onImportClick}
              className="flex items-center px-3 lg:px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-xs lg:text-sm font-bold"
            >
              <Plus className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Importar Extratos</span>
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 pb-24 lg:pb-10">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 border-t border-slate-100 px-6 flex items-center justify-between z-40 backdrop-blur-md">
          {bottomItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === item.id ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute -top-[1px] w-12 h-[2px] bg-blue-600 rounded-full"
                />
              )}
            </button>
          ))}
        </nav>

        {/* Mobile Full Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 bg-white z-50 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-10">
                <h1 className="text-2xl font-black text-blue-600">Bolso Simples</h1>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center px-6 py-4 rounded-2xl text-lg font-bold transition-all ${
                      activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon className="w-6 h-6 mr-4" />
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => handleTabChange('profile')}
                  className={`w-full flex items-center px-6 py-4 rounded-2xl text-lg font-bold transition-all ${
                    activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-6 h-6 mr-4" />
                  Sua Conta
                </button>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center px-6 py-4 rounded-2xl text-lg font-bold text-rose-600 bg-rose-50"
                >
                  <LogOut className="w-6 h-6 mr-4" />
                  Sair do Aplicativo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
