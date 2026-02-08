import { Transaction, User } from "../types";

const DB_PREFIX = 'simples_bolso_db_';

export const saveUserData = (userName: string, transactions: Transaction[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${DB_PREFIX}${userName.toLowerCase()}`, JSON.stringify(transactions));
  }
};

export const loadUserData = (userName: string): Transaction[] => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(`${DB_PREFIX}${userName.toLowerCase()}`);
    return data ? JSON.parse(data) : [];
  }
  return [];
};

export const clearUserData = (userName: string) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${DB_PREFIX}${userName.toLowerCase()}`);
  }
};