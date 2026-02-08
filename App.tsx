import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FileUpload } from './components/FileUpload';
import { TransactionTable } from './components/TransactionTable';
import { Dashboard } from './components/Dashboard';
import { Forecast } from './components/Forecast';
import { AdminPanel } from './components/AdminPanel';
import { Settings } from './components/Settings';
import { AppState, Transaction, User } from './types';
import { extractDataFromPDF } from './services/geminiService';
import { fileToBase64, downloadCSV } from './utils/fileHelpers';
import { Button } from './components/Button';
import { saveUserData, loadUserData } from './utils/storage';

const MOCK_DATA: Transaction[] = [
  { id: '1', date: '2023-10-01', description: 'Netflix Assinatura', amount: 55.90, category: 'Lazer', type: 'debit' },
  { id: '2', date: '2023-10-02', description: 'Viagem Uber', amount: 24.50, category: 'Transporte', type: 'debit' },
  { id: '3', date: '2023-10-05', description: 'Supermercado Extra', amount: 450.00, category: 'Mercado', type: 'debit' },
  { id: '4', date: '2023-10-10', description: 'Salário Mensal', amount: 3500.00, category: 'Renda', type: 'credit' },
  { id: '5', date: '2023-10-15', description: 'Spotify Premium', amount: 21.90, category: 'Lazer', type: 'debit' },
  { id: '6', date: '2023-10-15', description: 'Internet Claro', amount: 120.00, category: 'Contas', type: 'debit' },
  { id: '7', date: '2023-10-20', description: 'Starbucks Café', amount: 15.00, category: 'Alimentação', type: 'debit' },
  { id: '8', date: '2023-10-25', description: 'Posto Shell', amount: 150.00, category: 'Transporte', type: 'debit' },
];

const TEST_USERS: User[] = [
  { name: 'Lucas', role: 'free', email: 'lucas@free.com' },
  { name: 'Lais', role: 'admin', email: 'lais@admin.com' },
  { name: 'Brenno', role: 'paid', email: 'brenno@premium.com' },
  { name: 'Luisa', role: 'guest', email: 'luisa@guest.com' }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(TEST_USERS[2]); // Default: Brenno
  const [activeTab, setActiveTab] = useState<AppState>(AppState.UPLOAD);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data when user changes
  useEffect(() => {
    // If it's a guest (Luisa), load Brenno's data (simulating viewing the titular account)
    const targetUser = currentUser.role === 'guest' ? 'Brenno' : currentUser.name;
    const loadedData = loadUserData(targetUser);
    setTransactions(loadedData);
  }, [currentUser]);

  // Handle saving data logic is inside handleFileSelect now

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    setActiveTab(AppState.UPLOAD);
    setError(null);
  };

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const base64 = await fileToBase64(file);
      let newData: Transaction[] = [];

      if (file.name === "demo_statement.pdf" && file.size === 4) {
         newData = MOCK_DATA;
      } else {
         newData = await extractDataFromPDF(base64);
      }
      
      setTransactions(newData);
      
      // Save to local persistence
      // If guest, technically shouldn't upload, but if they do, we don't save to Brenno's account to avoid messing it up in this demo
      if (currentUser.role !== 'guest') {
        saveUserData(currentUser.name, newData);
      }

      if (currentUser.role !== 'free') {
        setActiveTab(AppState.DASHBOARD);
      }
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao processar arquivo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar 
        activeTab={activeTab} 
        onNavigate={setActiveTab} 
        currentUser={currentUser}
        availableUsers={TEST_USERS}
        onSwitchUser={handleSwitchUser}
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-700">
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center text-red-800 shadow-sm">
             <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        {/* --- UPLOAD VIEW --- */}
        {activeTab === AppState.UPLOAD && (
          <div className="space-y-10">
            <div className="text-center max-w-2xl mx-auto pt-8">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
                Organize suas finanças com <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Inteligência Artificial</span>
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed">
                Olá, <span className="font-semibold text-slate-900">{currentUser.name}</span>! Faça upload de suas faturas e deixe o Simples Bolso categorizar tudo para você.
              </p>
              
              {currentUser.role === 'free' && (
                 <div className="mt-6 inline-flex items-center px-4 py-1.5 rounded-full border border-blue-100 bg-blue-50 text-blue-700 text-sm font-medium">
                   Plano Gratuito Ativo
                 </div>
              )}
            </div>

            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
            
            <div className="pt-4">
               <TransactionTable transactions={transactions} onDownload={() => downloadCSV(transactions)} />
            </div>
          </div>
        )}

        {/* --- DASHBOARD VIEW --- */}
        {activeTab === AppState.DASHBOARD && currentUser.role !== 'free' && (
          <div className="space-y-8">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Visão Geral</h2>
                  <p className="text-slate-500">Acompanhe métricas em tempo real.</p>
                </div>
                {currentUser.role === 'guest' && (
                   <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold border border-amber-100">
                     Modo Visualização (Convidado)
                   </span>
                )}
             </div>
             <Dashboard transactions={transactions} />
             
             <TransactionTable transactions={transactions} onDownload={() => downloadCSV(transactions)} />
          </div>
        )}

        {/* --- FORECAST VIEW --- */}
        {activeTab === AppState.FORECAST && currentUser.role !== 'free' && (
           <Forecast currentTransactions={transactions} />
        )}

        {/* --- ADMIN VIEW --- */}
        {activeTab === AppState.ADMIN && currentUser.role === 'admin' && (
            <AdminPanel users={TEST_USERS} />
        )}

        {/* --- SETTINGS VIEW --- */}
        {activeTab === AppState.SETTINGS && currentUser.role !== 'free' && (
            <Settings currentUser={currentUser} />
        )}
      </main>

      <footer className="border-t border-slate-200 mt-auto bg-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <p className="text-sm text-slate-400">
            &copy; 2024 Simples Bolso AI. Todos os direitos reservados.
          </p>
          <div className="mt-2 text-xs text-slate-300 font-mono">
            Usuário Logado: {currentUser.name} | Role: {currentUser.role}
          </div>
        </div>
      </footer>
    </div>
  );
}