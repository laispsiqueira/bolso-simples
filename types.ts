export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'debit' | 'credit';
  bank: string;
  fileId?: string;
  isAutoCategorized?: boolean; // To indicate if it was matched by a user rule
}

export interface UploadedFile {
  id: string;
  name: string;
  uploadDate: string;
  bankName?: string;
  originalContent?: string; // Base64 string
  mimeType?: string;
}

export interface CategoryRule {
  id: string;
  keyword: string;
  category: string;
}

export interface StatementAnalysis {
  transactions: Transaction[];
  totalSpent: number;
  totalIncome: number;
  period: string; // e.g., "October 2023"
}

export interface RecurringExpense {
  description: string;
  averageAmount: number;
  frequency: string;
  projectedNextMonth: number;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD',
  FORECAST = 'FORECAST',
  ADMIN = 'ADMIN',
  SETTINGS = 'SETTINGS'
}

export type UserRole = 'free' | 'paid' | 'admin' | 'guest';

export interface User {
  name: string;
  role: UserRole;
  email: string;
}

export interface UserSubscription {
  isPremium: boolean;
}

export const CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Saúde',
  'Educação',
  'Compras',
  'Serviços',
  'Investimento',
  'Renda',
  'Outros'
];