/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useData';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Rules from './components/Rules';
import Simulator from './components/Simulator';
import Plans from './components/Plans';
import AdminUsers from './components/AdminUsers';
import UploadModal from './components/UploadModal';
import { Loader2 } from 'lucide-react';
import { auth } from './lib/firebase';
import { GoogleAuthProvider as FbGoogleProvider, signInWithPopup } from 'firebase/auth';

export default function App() {
  const { user, loading, logout } = useAuth();
  const { 
    transactions, rules, simulations, processedFiles,
    addTransactions, addRule, removeRule, addSimulation, removeSimulation, 
    removeTransaction, removeFile 
  } = useTransactions(user?.id);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      const q = collection(db, 'users');
      return onSnapshot(q, (snap) => setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    }
  }, [user]);
  
  const [activeTab, setActiveTab] = useState('dash');
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleLogin = () => {
    const provider = new FbGoogleProvider();
    signInWithPopup(auth, provider);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 font-sans">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Bolso Simples carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white p-4 font-sans">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-blue-600 tracking-tighter">Bolso Simples</h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              O futuro da sua gestão financeira começa aqui. Inteligência artificial para o seu bolso.
            </p>
          </div>
          
          <div className="bg-gray-100 p-8 rounded-3xl space-y-6">
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-4 px-6 rounded-2xl hover:shadow-lg transition-all active:scale-95"
            >
              <span className="font-bold text-gray-700">Entrar com Google</span>
            </button>
            <button className="text-sm font-bold text-blue-600 hover:underline">Esqueci minha senha</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onImportClick={() => setIsImportOpen(true)}
        user={user}
        onLogout={logout}
      >
        {activeTab === 'dash' && (
          <Dashboard 
            transactions={transactions} 
            simulations={simulations} 
            processedFiles={processedFiles}
            userId={user.id} 
            onDeleteTransaction={removeTransaction} 
            onDeleteFile={removeFile}
          />
        )}
        {activeTab === 'regras' && <Rules rules={rules} onAddRule={addRule} onDeleteRule={removeRule} />}
        {activeTab === 'calc' && <Simulator simulations={simulations} onSaveSimulation={addSimulation} onDeleteSimulation={removeSimulation} />}
        {activeTab === 'plans' && <Plans />}
        {activeTab === 'admin' && <AdminUsers users={allUsers} />}
      </Layout>

      <UploadModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onConfirm={async (data, filesInfo) => {
          await addTransactions(data, filesInfo);
          setIsImportOpen(false);
        }}
        userId={user.id}
      />
    </>
  );
}
