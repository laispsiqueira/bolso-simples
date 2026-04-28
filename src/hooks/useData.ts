import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, addDoc, deleteDoc, doc, setDoc, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export function useTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);

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

    const qF = query(collection(db, 'processed_files'), where('userId', '==', userId));
    const unsubF = onSnapshot(qF, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setProcessedFiles(items);
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'processed_files'));

    return () => { unsubT(); unsubS(); unsubR(); unsubF(); };
  }, [userId]);

  const addTransactions = async (newItems: any[], filesInfo?: { name: string, bank?: string }[]) => {
    if (!userId) return;

    let fileId: string | null = null;
    const fileName = filesInfo?.map(f => f.name).join(', ') || 'Manual';

    if (filesInfo && filesInfo.length > 0) {
      const fileRef = await addDoc(collection(db, 'processed_files'), {
        userId,
        fileName,
        transactionCount: newItems.length,
        totalValue: newItems.reduce((acc, curr) => acc + curr.amount, 0),
        createdAt: new Date().toISOString()
      });
      fileId = fileRef.id;
    }

    for (const item of newItems) {
      let category = item.category;
      const rule = rules.find(r => item.description.toUpperCase().includes(r.keyword.toUpperCase()));
      if (rule) category = rule.category;

      await addDoc(collection(db, 'transactions'), {
        ...item,
        userId,
        category,
        fileId,
        sourceFile: fileName,
        createdAt: new Date().toISOString()
      });
    }
  };

  const removeFile = async (id: string) => {
    const q = query(collection(db, 'transactions'), where('fileId', '==', id));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'transactions', d.id))));
    await deleteDoc(doc(db, 'processed_files', id));
  };

  const clearAllUserData = async () => {
    if (!userId) return;
    const collections = ['transactions', 'category_rules', 'processed_files', 'simulations'];
    for (const colName of collections) {
      const q = query(collection(db, colName), where('userId', '==', userId));
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map(d => deleteDoc(doc(db, colName, d.id))));
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
  const removeTransaction = (id: string) => deleteDoc(doc(db, 'transactions', id));

  return { transactions, rules, simulations, processedFiles, addTransactions, addRule, removeRule, addSimulation, removeSimulation, removeTransaction, removeFile, clearAllUserData };
}
