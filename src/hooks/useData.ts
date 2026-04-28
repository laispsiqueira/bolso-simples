import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export function useTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const qT = query(collection(db, 'transactions'), where('userId', '==', userId));
    const unsubT = onSnapshot(qT, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a: any, b: any) => (b.date || '').localeCompare(a.date || ''));
      setTransactions(items);
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'transactions'));

    const qS = query(collection(db, 'simulations'), where('userId', '==', userId));
    const unsubS = onSnapshot(qS, (snap) => setSimulations(snap.docs.map(d => ({ id: d.id, ...d.data() }))), (e) => handleFirestoreError(e, OperationType.LIST, 'simulations'));

    const qR = query(collection(db, 'category_rules'), where('userId', '==', userId));
    const unsubR = onSnapshot(qR, (snap) => setRules(snap.docs.map(d => ({ id: d.id, ...d.data() }))), (e) => handleFirestoreError(e, OperationType.LIST, 'category_rules'));

    return () => { unsubT(); unsubS(); unsubR(); };
  }, [userId]);

  const [simulations, setSimulations] = useState<any[]>([]);

  const addTransactions = async (newItems: any[]) => {
    if (!userId) return;
    for (const item of newItems) {
      let category = item.category;
      const rule = rules.find(r => item.description.toUpperCase().includes(r.keyword.toUpperCase()));
      if (rule) category = rule.category;

      await addDoc(collection(db, 'transactions'), {
        ...item,
        userId,
        category,
        createdAt: new Date().toISOString()
      });
    }
  };

  const addRule = async (rule: any) => {
    if (!userId) return;
    await addDoc(collection(db, 'category_rules'), { ...rule, userId });
    
    // Auto re-categorize
    const affected = transactions.filter(t => t.description.toUpperCase().includes(rule.keyword.toUpperCase()));
    for (const t of affected) {
      await setDoc(doc(db, 'transactions', t.id), { ...t, category: rule.category }, { merge: true });
    }
  };

  const removeRule = (id: string) => deleteDoc(doc(db, 'category_rules', id));

  const addSimulation = (sim: any) => addDoc(collection(db, 'simulations'), { ...sim, userId });
  const removeSimulation = (id: string) => deleteDoc(doc(db, 'simulations', id));

  return { transactions, rules, simulations, addTransactions, addRule, removeRule, addSimulation, removeSimulation };
}
