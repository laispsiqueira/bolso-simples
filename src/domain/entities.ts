export enum UserRole {
  FREE = 'FREE',
  PAID = 'PAID',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  amount: number;
  description: string;
  bank?: string;
  type: TransactionType;
  category?: string;
  createdAt: Date;
}

export interface CategoryRule {
  id: string;
  userId: string;
  keyword: string;
  category: string;
  active: boolean;
  createdAt: Date;
}

export interface Simulation {
  id: string;
  userId: string;
  name: string;
  totalAmount: number;
  installments: number;
  priority?: number;
  bank?: string;
  createdAt: Date;
}

export interface ProcessedFile {
  id: string;
  userId: string;
  fileHash: string;
  processedAt: Date;
}

export interface AuditLog {
  id: string;
  actorUserId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: any;
  createdAt: Date;
}
