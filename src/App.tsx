/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  collection, query, where, onSnapshot, addDoc, deleteDoc, doc, 
  setDoc, getDoc, serverTimestamp, orderBy 
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { db, auth, OperationType, handleFirestoreError } from './lib/firebase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Rules from './components/Rules';
import Simulator from './components/Simulator';
import Plans from './components/Plans';
import AdminUsers from './components/AdminUsers';
import UploadModal from './components/UploadModal';
import { LogIn, Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dash');
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  // Data State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Auth Effect
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Get or Create user profile
        const userRef = doc(db, 'users', fbUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUser({ id: fbUser.uid, ...userSnap.data() });
          } else {
            // Default role logic as per manual
            let role = 'FREE';
            if (fbUser.email === 'laispsiqueira@gmail.com') role = 'ADMIN';
            else if (fbUser.email === 'laispsiqueira.3@gmail.com') role = 'PAID';

            const newUser = {
              email: fbUser.email,
              name: fbUser.displayName,
              role: role,
              createdAt: new Date().toISOString()
            };
            await setDoc(userRef, newUser);
            setUser({ id: fbUser.uid, ...newUser });
          }
        } catch (error) {
          console.error("Error setting up user profile:", error);
          // Demo bypass mentioned in manual - using real UID to satisfy Security Rules
          setUser({ 
            id: fbUser.uid, 
            name: fbUser.displayName || 'Demo User', 
            email: fbUser.email, 
            role: fbUser.email === 'laispsiqueira@gmail.com' ? 'ADMIN' : 'FREE' 
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Data Sync Effect
  useEffect(() => {
    if (!user) return;

    const qTransactions = query(
      collection(db, 'transactions'), 
      where('userId', '==', user.id),
      orderBy('date', 'desc')
    );
    const unsubTrans = onSnapshot(qTransactions, 
      (snap) => setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'transactions')
    );

    const qRules = query(collection(db, 'category_rules'), where('userId', '==', user.id));
    const unsubRules = onSnapshot(qRules,
      (snap) => setRules(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'category_rules')
    );

    const qSims = query(collection(db, 'simulations'), where('userId', '==', user.id));
    const unsubSims = onSnapshot(qSims,
      (snap) => setSimulations(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'simulations')
    );

    let unsubUsers = () => {};
    if (user.role === 'ADMIN') {
      unsubUsers = onSnapshot(collection(db, 'users'), 
        (snap) => setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'users')
      );
    }

    return () => {
      unsubTrans();
      unsubRules();
      unsubSims();
      unsubUsers();
    };
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const saveTransactions = async (newTransactions: any[]) => {
    try {
      for (const t of newTransactions) {
        // Apply Rules
        let finalCategory = t.category;
        const matchingRule = [...rules].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).find(r => 
          t.description.toUpperCase().includes(r.keyword.toUpperCase())
        );
        if (matchingRule) finalCategory = matchingRule.category;

        await addDoc(collection(db, 'transactions'), {
          ...t,
          userId: user.id,
          category: finalCategory,
          createdAt: new Date().toISOString()
        });
      }
      setIsImportOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'transactions');
    }
  };

  const addRule = async (rule: any) => {
    try {
      await addDoc(collection(db, 'category_rules'), { ...rule, userId: user.id });
      
      // Auto re-categorize past transactions as per manual
      const affectedTransactions = transactions.filter(t => 
        t.description.toUpperCase().includes(rule.keyword.toUpperCase())
      );
      
      for (const t of affectedTransactions) {
        await setDoc(doc(db, 'transactions', t.id), { ...t, category: rule.category }, { merge: true });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'category_rules');
    }
  };

  const removeRule = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'category_rules', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'category_rules');
    }
  };

  const saveSimulation = async (sim: any) => {
    try {
      await addDoc(collection(db, 'simulations'), { ...sim, userId: user.id });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'simulations');
    }
  };

  const removeSimulation = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'simulations', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'simulations');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-400 font-medium animate-pulse">Bolso Simples carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-blue-600 tracking-tighter">Bolso Simples</h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              O futuro da sua gestão financeira começa aqui. Inteligência artificial para o seu bolso.
            </p>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-4 px-6 rounded-2xl hover:shadow-lg transition-all active:scale-95 group"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              <span className="font-bold text-gray-700">Entrar com Google</span>
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-gray-50 px-2 text-gray-400 font-mono">ou Recupere Acesso</span></div>
            </div>

            <button className="text-sm font-bold text-blue-600 hover:underline">Esqueci minha senha</button>
          </div>
          
          <p className="text-xs text-gray-400 px-8 leading-relaxed">
            Ao entrar, você concorda com nossos termos de uso e política de privacidade. 
            Suas credenciais são protegidas pelo Google Auth.
          </p>
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
        onLogout={handleLogout}
      >
        {activeTab === 'dash' && <Dashboard transactions={transactions} />}
        {activeTab === 'regras' && <Rules rules={rules} onAddRule={addRule} onDeleteRule={removeRule} />}
        {activeTab === 'calc' && <Simulator simulations={simulations} onSaveSimulation={saveSimulation} onDeleteSimulation={removeSimulation} />}
        {activeTab === 'plans' && <Plans />}
        {activeTab === 'admin' && <AdminUsers users={allUsers} />}
      </Layout>

      <UploadModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onConfirm={saveTransactions}
      />
    </>
  );
}
