import { Transaction, CategoryRule, Simulation, ProcessedFile, User } from './entities';

export interface ITransactionRepository {
  listByUserId(userId: string): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
  deleteAllByUserId(userId: string): Promise<void>;
  listByFileId(fileId: string): Promise<Transaction[]>; // If fileId is needed, we should add it to entity
}

export interface ICategoryRuleRepository {
  listByUserId(userId: string): Promise<CategoryRule[]>;
  save(rule: CategoryRule): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ISimulationRepository {
  listByUserId(userId: string): Promise<Simulation[]>;
  save(simulation: Simulation): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IUserRepository {
  getById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export interface IProcessedFileRepository {
  listByUserId(userId: string): Promise<ProcessedFile[]>;
  save(file: ProcessedFile): Promise<void>;
  getByHash(hash: string): Promise<ProcessedFile | null>;
  delete(id: string): Promise<void>;
}
