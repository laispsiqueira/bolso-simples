import { useState, useEffect, useCallback } from 'react';
import { transactionService, ruleService, simulationService } from '../infrastructure/compositionRoot';
import { Transaction, CategoryRule, Simulation, ProcessedFile } from '../domain/entities';

export function useTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);

  const refreshData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [t, r, s] = await Promise.all([
        transactionService.getTransactions(userId),
        ruleService.getRules(userId),
        simulationService.getSimulations(userId)
      ]);
      setTransactions(t);
      setRules(r);
      setSimulations(s);
      // Processed files would also be fetched here if needed
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addTransactions = async (newItems: any[], filesInfo?: { name: string, hash?: string }[]) => {
    if (!userId) return;
    const hash = filesInfo?.[0]?.hash || crypto.randomUUID(); // Simplified hash
    await transactionService.addTransactions(userId, newItems, hash);
    await refreshData();
  };

  const removeFile = async (id: string) => {
    // In the new schema, transactions aren't linked to fileId directly.
    // This would need adjustment if the feature is critical.
    await refreshData();
  };

  const clearAllUserData = async () => {
    if (!userId) return;
    await transactionService.clearUserData(userId);
    await refreshData();
  };

  const addRule = async (rule: { keyword: string; category: string }) => {
    if (!userId) return;
    await ruleService.addRule(userId, rule.keyword, rule.category);
    await refreshData();
  };

  const removeRule = async (id: string) => {
    await ruleService.deleteRule(id);
    await refreshData();
  };

  const addSimulation = async (sim: any) => {
    if (!userId) return;
    await simulationService.addSimulation(userId, sim);
    await refreshData();
  };

  const removeSimulation = async (id: string) => {
    await simulationService.deleteSimulation(id);
    await refreshData();
  };

  const removeTransaction = async (id: string) => {
    await transactionService.deleteTransaction(id);
    await refreshData();
  };

  return { transactions, rules, simulations, processedFiles, addTransactions, addRule, removeRule, addSimulation, removeSimulation, removeTransaction, removeFile, clearAllUserData };
}
