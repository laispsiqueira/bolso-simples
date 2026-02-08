import React from 'react';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { FileUpload } from './components/FileUpload';
import { TransactionTable } from './components/TransactionTable';
import { Dashboard } from './components/Dashboard';
import { Forecast } from './components/Forecast';
import { AdminPanel } from './components/AdminPanel';
import { Settings } from './components/Settings';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppState, Transaction, User, UploadedFile } from './types';
import { extractDataFromPDF } from './services/geminiService';
import { fileToBase64, downloadCSV, downloadBase64File } from './utils/fileHelpers';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from './store/useAppStore';

// Demo Scenario Data matching the screenshot requirements
const DEMO_SCENARIO = [
  {
    fileId: 'demo-file-1',
    name: 'fatura_nubank_outubro.pdf',
    bankName: 'Nubank',
    transactions: [
      { id: 'd1', date: '2023-10-25', description: 'Posto Shell', amount: 150.00, category: 'Transporte', type: 'debit', bank: 'Nubank' },
      { id: 'd2', date: '2023-10-24', description: 'Uber Trip', amount: 24.50, category: 'Transporte', type: 'debit', bank: 'Nubank' },
      { id: 'd3', date: '2023-10-20', description: 'Spotify Premium', amount: 21.90, category: 'Lazer', type: 'debit', bank: 'Nubank' },
      { id: 'd4', date: '2023-10-18', description: 'Cinema Kinoplex', amount: 55.90, category: 'Lazer', type: 'debit', bank: 'Nubank' },
      { id: 'd5', date: '2023-10-15', description: 'Starbucks Coffee', amount: 15.00, category: 'Alimentação', type: 'debit', bank: 'Nubank' },
    ] as Transaction[]
  },
  {
    fileId: 'demo-file-2',
    name: 'fatura_itau_card.pdf',
    bankName: 'Itaú',
    transactions: [
      { id: 'd6', date: '2023-10-10', description: 'Supermercado Extra', amount: 450.00, category: 'Alimentação', type: 'debit', bank: 'Itaú' },
      { id: 'd7', date: '2023-10-05', description: 'Claro Residencial', amount: 120.00, category: 'Serviços', type: 'debit', bank: 'Itaú' },
    ] as Transaction[]
  },
  {
    fileId: 'demo-file-3',
    name: 'extrato_bradesco.pdf',
    bankName: 'Bradesco',
    transactions: [
      { id: 'd8', date: '2023-10-01', description: 'TED Salário Mensal', amount: 3500.00, category: 'Renda', type: 'credit', bank: 'Bradesco' },
    ] as Transaction[]
  }
];

const TEST_USERS: User[] = [
  { name: 'Lucas', role: 'free', email: 'lucas@free.com' },
  { name: 'Lais', role: 'admin', email: 'lais@admin.com' },
  { name: 'Brenno', role: 'paid', email: 'brenno@premium.com' },
  { name: 'Luisa', role: 'guest', email: 'luisa@guest.com' }
];

export default function App() {
  const store = useAppStore();

  const handleFileSelect = async (file: File) => {
    store.setLoading(true);
    store.setError(null);

    const fileId = `file-${Date.now()}`;

    try {
      const base64 = await fileToBase64(file);
      const newRawData = await extractDataFromPDF(base64, fileId);
      const bankName = newRawData.length > 0 ? newRawData[0].bank : 'Banco Desconhecido';
      
      const newFileObj: UploadedFile = {
        id: fileId,
        name: file.name,
        uploadDate: new Date().toISOString(),
        bankName: bankName,
        originalContent: base64, // Store content for download
        mimeType: file.type
      };
      
      store.addFilesAndData([newFileObj], newRawData);

      if (store.currentUser?.role !== 'free') {
        store.navigate(AppState.DASHBOARD);
      }
    } catch (err: any) {
      store.setError(err.message || "Erro desconhecido ao processar arquivo.");
    } finally {
      store.setLoading(false);
    }
  };

  const handleLoadDemo = () => {
    store.setLoading(true);
    try {
      const newFiles: UploadedFile[] = [];
      let newRawData: Transaction[] = [];

      DEMO_SCENARIO.forEach(demo => {
        newFiles.push({
          id: demo.fileId,
          name: demo.name,
          uploadDate: new Date().toISOString(),
          bankName: demo.bankName
        });
        const fileTrans = demo.transactions.map(t => ({ ...t, fileId: demo.fileId }));
        newRawData = [...newRawData, ...fileTrans];
      });

      store.addFilesAndData(newFiles, newRawData);
      
      if (store.currentUser?.role !== 'free') {
        store.navigate(AppState.DASHBOARD);
      }
    } catch (err) {
      console.error(err);
      store.setError("Erro ao carregar demonstração.");
    } finally {
      store.setLoading(false);
    }
  };

  // Allow downloading processed data for a single file (CSV)
  const handleDownloadCSV = (fileId: string) => {
    const fileTransactions = store.transactions.filter(t => t.fileId === fileId);
    if (fileTransactions.length > 0) {
      downloadCSV(fileTransactions);
    } else {
      alert("Não há transações para este arquivo.");
    }
  };

  // Allow downloading original file (PDF/Content)
  const handleDownloadOriginal = (fileId: string) => {
    const file = store.uploadedFiles.find(f => f.id === fileId);
    if (file && file.originalContent) {
      downloadBase64File(file.originalContent, file.name, file.mimeType || 'application/pdf');
    } else {
      alert("O arquivo original não está disponível para download (pode ser um arquivo de demonstração).");
    }
  };

  if (!store.currentUser) {
    return <LoginScreen availableUsers={TEST_USERS} onLogin={store.login} />;
  }

  const isReadOnly = store.currentUser.role === 'guest';

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 flex flex-col">
        
        {/* Impersonation Banner */}
        {store.originalAdminUser && (
          <div className="bg-indigo-600 text-white px-4 py-2 text-sm flex justify-between items-center shadow-md relative z-[60]">
             <div className="flex items-center gap-2">
               <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold">Modo Admin</span>
               <span>Você está acessando a conta de <strong>{store.currentUser.name}</strong></span>
             </div>
             <button 
               onClick={store.stopImpersonation}
               className="flex items-center gap-1 bg-white text-indigo-600 px-3 py-1 rounded-md text-xs font-bold hover:bg-indigo-50 transition-colors"
             >
               <ArrowLeft className="w-3 h-3" />
               Voltar ao Painel
             </button>
          </div>
        )}

        <Navbar 
          activeTab={store.activeTab} 
          onNavigate={store.navigate} 
          currentUser={store.currentUser}
          onLogout={store.logout}
        />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-700">
          
          {store.error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center text-red-800 shadow-sm">
               <span className="mr-2">⚠️</span> {store.error}
            </div>
          )}

          {/* --- UPLOAD VIEW --- */}
          {store.activeTab === AppState.UPLOAD && (
            <div className="space-y-10">
              <div className="text-center max-w-2xl mx-auto pt-8">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
                  Organize suas finanças com <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Inteligência Artificial</span>
                </h1>
                <p className="text-lg text-slate-500 leading-relaxed">
                  Olá, <span className="font-semibold text-slate-900">{store.currentUser.name}</span>! Gerencie seus arquivos abaixo.
                </p>
              </div>

              <FileUpload 
                onFileSelect={handleFileSelect}
                onLoadDemo={handleLoadDemo}
                isLoading={store.isLoading} 
                uploadedFiles={store.uploadedFiles}
                onDeleteFile={store.deleteFile}
                onDownloadCSV={handleDownloadCSV}
                onDownloadOriginal={handleDownloadOriginal}
                isReadOnly={isReadOnly}
              />
              
              <div className="pt-4 opacity-75">
                 <TransactionTable 
                    transactions={store.transactions.slice(0, 5)} 
                    onDownload={() => downloadCSV(store.transactions)} 
                    onUpdateTransaction={store.updateTransaction}
                    isReadOnly={isReadOnly}
                 />
                 {store.transactions.length > 5 && <p className="text-center text-xs text-slate-400 mt-2">Mostrando as 5 últimas. Veja tudo em Resumo Mensal.</p>}
              </div>
            </div>
          )}

          {/* --- DASHBOARD VIEW --- */}
          {store.activeTab === AppState.DASHBOARD && store.currentUser.role !== 'free' && (
            <div className="space-y-8">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Resumo Mensal</h2>
                    <p className="text-slate-500">Selecione o mês desejado para filtrar os dados consolidados.</p>
                  </div>
                  {store.currentUser.role === 'guest' && (
                     <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold border border-amber-100">
                       Modo Visualização (Convidado)
                     </span>
                  )}
               </div>
               
               <Dashboard 
                 transactions={store.transactions} 
                 onUpdateTransaction={store.updateTransaction}
                 isReadOnly={isReadOnly}
               />
            </div>
          )}

          {/* --- FORECAST VIEW --- */}
          {store.activeTab === AppState.FORECAST && store.currentUser.role !== 'free' && (
             <Forecast currentTransactions={store.transactions} />
          )}

          {/* --- ADMIN VIEW --- */}
          {store.activeTab === AppState.ADMIN && (store.currentUser.role === 'admin' || store.originalAdminUser?.role === 'admin') && (
              <AdminPanel 
                users={TEST_USERS} 
                currentAdmin={store.originalAdminUser || store.currentUser}
                onImpersonate={store.setImpersonation}
              />
          )}

          {/* --- SETTINGS VIEW (With Parameter Table) --- */}
          {store.activeTab === AppState.SETTINGS && store.currentUser.role !== 'free' && (
              <Settings 
                currentUser={store.currentUser} 
                rules={store.categoryRules}
                onSaveRules={store.updateRules}
              />
          )}
        </main>

        <footer className="border-t border-slate-200 mt-auto bg-white">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <p className="text-sm text-slate-400">
              &copy; 2024 Simples Bolso AI. Todos os direitos reservados.
            </p>
            <div className="mt-2 text-xs text-slate-300 font-mono">
              {store.originalAdminUser ? `Admin: ${store.originalAdminUser.name} | ` : ''} Usuário Logado: {store.currentUser.name} ({store.currentUser.role})
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}