import { Transaction, CategoryRule } from "../types";

/**
 * TRANSFORM SERVICE
 * This service is responsible for the 'T' in ELT.
 * It takes raw data and applies user-defined business rules (Category Parameters).
 */

export const transformData = (
  rawTransactions: Transaction[], 
  rules: CategoryRule[]
): Transaction[] => {
  if (!rawTransactions || rawTransactions.length === 0) return [];

  // Sort by date descending
  const sortedTransactions = [...rawTransactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Apply Parameter Table Rules
  return sortedTransactions.map(transaction => {
    // Logic: If rule keyword exists in description (case insensitive), apply category
    const matchedRule = rules.find(rule => 
      transaction.description.toLowerCase().includes(rule.keyword.toLowerCase().trim())
    );

    if (matchedRule) {
      return {
        ...transaction,
        category: matchedRule.category,
        isAutoCategorized: true
      };
    }

    // Retain original AI category if no rule matches, or manual edit if persisted in raw
    return transaction;
  });
};

export const createDefaultRules = (): CategoryRule[] => [
  { id: '1', keyword: 'Uber', category: 'Transporte' },
  { id: '2', keyword: '99App', category: 'Transporte' },
  { id: '3', keyword: 'Ifood', category: 'Alimentação' },
  { id: '4', keyword: 'Netflix', category: 'Lazer' },
  { id: '5', keyword: 'Spotify', category: 'Lazer' },
  { id: '6', keyword: 'Shell', category: 'Transporte' },
  { id: '7', keyword: 'Amazon', category: 'Compras' },
];