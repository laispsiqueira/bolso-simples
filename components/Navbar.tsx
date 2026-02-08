import React from 'react';
import { LayoutDashboard, FileText, TrendingUp, Lock, Users, Settings, LogOut } from 'lucide-react';
import { AppState, User, UserRole } from '../types';

interface NavbarProps {
  activeTab: AppState;
  onNavigate: (tab: AppState) => void;
  currentUser: User;
  availableUsers: User[];
  onSwitchUser: (user: User) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  onNavigate, 
  currentUser,
  availableUsers,
  onSwitchUser
}) => {
  
  const canAccess = (role: UserRole, tab: AppState): boolean => {
    if (role === 'admin') return true;
    if (tab === AppState.UPLOAD) return true;
    if (role === 'free') return false;
    if (role === 'paid' || role === 'guest') {
      return [AppState.DASHBOARD, AppState.FORECAST, AppState.SETTINGS].includes(tab);
    }
    return false;
  };

  const navItems = [
    { id: AppState.UPLOAD, label: 'Arquivos', icon: FileText },
    { id: AppState.DASHBOARD, label: 'Visão Geral', icon: LayoutDashboard },
    { id: AppState.FORECAST, label: 'Previsões', icon: TrendingUp },
    { id: AppState.ADMIN, label: 'Admin', icon: Users, adminOnly: true },
    { id: AppState.SETTINGS, label: 'Ajustes', icon: Settings }
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Nav Links */}
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => onNavigate(AppState.UPLOAD)}>
              <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 hidden md:block">
                Simples Bolso
              </span>
            </div>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const hasAccess = canAccess(currentUser.role, item.id);
                const isAdminItem = item.adminOnly && currentUser.role !== 'admin';
                
                if (isAdminItem) return null;

                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => hasAccess && onNavigate(item.id)}
                    className={`
                      relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
                      ${!hasAccess ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={!hasAccess}
                  >
                    <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    {item.label}
                    {!hasAccess && <Lock className="w-3 h-3 ml-1.5 text-slate-300" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Switcher */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
               <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mb-0.5">Simular Usuário</span>
               <div className="relative group">
                 <select 
                   className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-8 py-1.5 cursor-pointer hover:border-slate-300 transition-colors outline-none"
                   value={currentUser.name.toLowerCase()}
                   onChange={(e) => {
                     const selected = availableUsers.find(u => u.name.toLowerCase() === e.target.value);
                     if (selected) onSwitchUser(selected);
                   }}
                 >
                   {availableUsers.map(user => (
                     <option key={user.name} value={user.name.toLowerCase()}>
                       {user.name}
                     </option>
                   ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
               </div>
            </div>
            
            <div className={`
              h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white
              ${currentUser.role === 'admin' ? 'bg-gradient-to-br from-rose-500 to-red-600' : 
                currentUser.role === 'paid' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 
                currentUser.role === 'guest' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 
                'bg-gradient-to-br from-slate-400 to-slate-500'}
            `} title={`Perfil: ${currentUser.role}`}>
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className="md:hidden flex justify-around border-t border-slate-100 py-3 bg-white/90 backdrop-blur pb-safe">
          {navItems.map((item) => {
             const Icon = item.icon;
             if (item.adminOnly && currentUser.role !== 'admin') return null;
             const hasAccess = canAccess(currentUser.role, item.id);
             return (
               <button 
                 key={item.id}
                 disabled={!hasAccess}
                 onClick={() => hasAccess && onNavigate(item.id)}
                 className={`p-2.5 rounded-xl transition-all ${activeTab === item.id ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400'} ${!hasAccess ? 'opacity-30' : ''}`}
               >
                 <Icon className="w-5 h-5" />
               </button>
             )
          })}
      </div>
    </nav>
  );
};