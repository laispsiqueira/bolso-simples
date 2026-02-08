import { Transaction, UploadedFile, CategoryRule } from "../types";

const DB_PREFIX = 'simples_bolso_db_';
const RAW_PREFIX = 'simples_bolso_raw_'; // Extraction Table
const FILES_PREFIX = 'simples_bolso_files_';
const RULES_PREFIX = 'simples_bolso_rules_'; // Parameter Table

// --- Transformed Data (View Layer) ---
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

// --- Raw Data (Extraction Table - ELT Load Step) ---
export const saveRawData = (userName: string, transactions: Transaction[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${RAW_PREFIX}${userName.toLowerCase()}`, JSON.stringify(transactions));
  }
};

export const loadRawData = (userName: string): Transaction[] => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(`${RAW_PREFIX}${userName.toLowerCase()}`);
    return data ? JSON.parse(data) : [];
  }
  return [];
};

// --- Files Metadata ---
export const saveUserFiles = (userName: string, files: UploadedFile[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${FILES_PREFIX}${userName.toLowerCase()}`, JSON.stringify(files));
  }
};

export const loadUserFiles = (userName: string): UploadedFile[] => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(`${FILES_PREFIX}${userName.toLowerCase()}`);
    return data ? JSON.parse(data) : [];
  }
  return [];
};

// --- Category Rules (Parameter Table) ---
export const saveUserRules = (userName: string, rules: CategoryRule[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${RULES_PREFIX}${userName.toLowerCase()}`, JSON.stringify(rules));
  }
};

export const loadUserRules = (userName: string): CategoryRule[] => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(`${RULES_PREFIX}${userName.toLowerCase()}`);
    return data ? JSON.parse(data) : [];
  }
  return [];
};

export const clearUserData = (userName: string) => {
  if (typeof window !== 'undefined') {
    const key = userName.toLowerCase();
    localStorage.removeItem(`${DB_PREFIX}${key}`);
    localStorage.removeItem(`${RAW_PREFIX}${key}`);
    localStorage.removeItem(`${FILES_PREFIX}${key}`);
    localStorage.removeItem(`${RULES_PREFIX}${key}`);
  }
};