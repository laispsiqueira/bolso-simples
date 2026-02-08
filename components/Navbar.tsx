import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, FileText, TrendingUp, Lock, Users, LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { AppState, User, UserRole } from '../types';

interface NavbarProps {
  activeTab: AppState;
  onNavigate: (tab: AppState) => void;
  currentUser: User;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  onNavigate, 
  currentUser,
  onLogout
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    { id: AppState.DASHBOARD, label: 'Resumo Mensal', icon: LayoutDashboard },
    { id: AppState.FORECAST, label: 'Previsões', icon: TrendingUp },
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

          {/* User Profile Dropdown */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1 pl-3 pr-1 rounded-full border border-slate-100 bg-white hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <div className="hidden sm:block text-right">
                   <p className="text-xs font-semibold text-slate-700">{currentUser.name}</p>
                   <p className="text-[10px] text-slate-400 capitalize font-medium">{currentUser.role}</p>
                </div>
                
                <div className={`
                  h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white
                  ${currentUser.role === 'admin' ? 'bg-gradient-to-br from-rose-500 to-red-600' : 
                    currentUser.role === 'paid' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 
                    currentUser.role === 'guest' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 
                    'bg-gradient-to-br from-slate-400 to-slate-500'}
                `}>
                  {currentUser.name.charAt(0)}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 mr-1" />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-slate-100 transform opacity-100 scale-100 transition-all duration-200 origin-top-right">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate(AppState.SETTINGS);
                        setIsProfileOpen(false);
                      }}
                      className="group flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      <UserIcon className="mr-3 h-4 w-4 text-slate-400 group-hover:text-blue-500" />
                      Perfil
                    </button>
                    
                    {currentUser.role === 'admin' && (
                       <button
                         onClick={() => {
                           onNavigate(AppState.ADMIN);
                           setIsProfileOpen(false);
                         }}
                         className="group flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                       >
                         <Users className="mr-3 h-4 w-4 text-slate-400 group-hover:text-blue-500" />
                         Painel de Usuário
                       </button>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onLogout();
                        setIsProfileOpen(false);
                      }}
                      className="group flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className="md:hidden flex justify-around border-t border-slate-100 py-3 bg-white/90 backdrop-blur pb-safe">
          {navItems.map((item) => {
             const Icon = item.icon;
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