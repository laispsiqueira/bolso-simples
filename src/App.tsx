/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useData';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Rules from './components/Rules';
import Simulator from './components/Simulator';
import Plans from './components/Plans';
import AdminUsers from './components/AdminUsers';
import Profile from './components/Profile';
import Auth from './components/Auth';
import UploadModal from './components/UploadModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, loading, logout, signIn, signUp, loginWithGoogle } = useAuth();
  const { 
    transactions, rules, simulations, processedFiles,
    addTransactions, addRule, removeRule, addSimulation, removeSimulation, 
    removeTransaction, removeFile, clearAllUserData 
  } = useTransactions(user?.id);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      supabase.from('users').select('*').then(({ data }) => {
        if (data) setAllUsers(data);
      });
    }
  }, [user]);
  
  const [activeTab, setActiveTab] = useState('dash');
  const [isImportOpen, setIsImportOpen] = useState(false);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 font-sans">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-medium tracking-widest text-xs uppercase font-black">Bolso Simples Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Auth 
        onSignIn={signIn}
        onSignUp={signUp}
        onGoogleLogin={loginWithGoogle}
      />
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
            onClearData={clearAllUserData}
            userRole={user.role}
          />
        )}
        {activeTab === 'regras' && <Rules rules={rules} onAddRule={addRule} onDeleteRule={removeRule} />}
        {activeTab === 'calc' && <Simulator simulations={simulations} onSaveSimulation={addSimulation} onDeleteSimulation={removeSimulation} />}
        {activeTab === 'plans' && <Plans />}
        {activeTab === 'admin' && <AdminUsers users={allUsers} />}
        {activeTab === 'profile' && <Profile user={user} onLogout={logout} />}
      </Layout>

      <UploadModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onConfirm={async (data, filesInfo) => {
          await addTransactions(data, filesInfo);
          setIsImportOpen(false);
        }}
        userId={user.id}
        processedFiles={processedFiles}
      />
    </>
  );
}
