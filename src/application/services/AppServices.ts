import { ITransactionRepository, ICategoryRuleRepository, ISimulationRepository, IProcessedFileRepository } from '../../domain/repositories';
import { Transaction, CategoryRule, Simulation, ProcessedFile, TransactionType } from '../../domain/entities';

export class TransactionService {
  constructor(
    private transactionRepo: ITransactionRepository,
    private ruleRepo: ICategoryRuleRepository,
    private fileRepo: IProcessedFileRepository
  ) {}

  async getTransactions(userId: string) {
    return this.transactionRepo.listByUserId(userId);
  }

  async addTransactions(userId: string, newItems: Partial<Transaction>[], fileHash?: string) {
    if (fileHash) {
      const existing = await this.fileRepo.getByHash(fileHash);
      if (existing) return; // Already processed

      await this.fileRepo.save({
        id: crypto.randomUUID(),
        userId,
        fileHash,
        processedAt: new Date()
      });
    }

    const rules = await this.ruleRepo.listByUserId(userId);

    for (const item of newItems) {
      let category = item.category;
      const rule = rules.find(r => item.description?.toUpperCase().includes(r.keyword.toUpperCase()));
      if (rule) category = rule.category;

      await this.transactionRepo.save({
        id: crypto.randomUUID(),
        userId,
        date: item.date || new Date().toISOString().split('T')[0],
        amount: item.amount || 0,
        description: item.description || '',
        bank: item.bank,
        type: item.type || TransactionType.EXPENSE,
        category: category || 'Outros',
        createdAt: new Date()
      });
    }
  }

  async deleteTransaction(id: string) {
    await this.transactionRepo.delete(id);
  }

  async clearUserData(userId: string) {
    await this.transactionRepo.deleteAllByUserId(userId);
    // Add other deletions as needed
  }
}

export class RuleService {
  constructor(
    private ruleRepo: ICategoryRuleRepository,
    private transactionRepo: ITransactionRepository
  ) {}

  async getRules(userId: string) {
    return this.ruleRepo.listByUserId(userId);
  }

  async addRule(userId: string, keyword: string, category: string) {
    const rule: CategoryRule = {
      id: crypto.randomUUID(),
      userId,
      keyword,
      category,
      active: true,
      createdAt: new Date()
    };
    await this.ruleRepo.save(rule);

    // Auto re-categorize existing transactions
    const transactions = await this.transactionRepo.listByUserId(userId);
    const affected = transactions.filter(t => t.description.toUpperCase().includes(keyword.toUpperCase()));
    for (const t of affected) {
      t.category = category;
      await this.transactionRepo.save(t);
    }
  }

  async deleteRule(id: string) {
    await this.ruleRepo.delete(id);
  }
}

export class SimulationService {
  constructor(private simulationRepo: ISimulationRepository) {}

  async getSimulations(userId: string) {
    return this.simulationRepo.listByUserId(userId);
  }

  async addSimulation(userId: string, simulation: Partial<Simulation>) {
    await this.simulationRepo.save({
      id: crypto.randomUUID(),
      userId,
      name: simulation.name || 'Nova Simulação',
      totalAmount: simulation.totalAmount || 0,
      installments: simulation.installments || 1,
      priority: simulation.priority,
      bank: simulation.bank,
      createdAt: new Date()
    });
  }

  async deleteSimulation(id: string) {
    await this.simulationRepo.delete(id);
  }
}
