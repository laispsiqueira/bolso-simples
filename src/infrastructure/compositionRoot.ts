import { SupabaseTransactionRepository, SupabaseCategoryRuleRepository, SupabaseSimulationRepository, SupabaseProcessedFileRepository } from './repositories/SupabaseRepositories';
import { TransactionService, RuleService, SimulationService } from '../application/services/AppServices';

const transactionRepo = new SupabaseTransactionRepository();
const ruleRepo = new SupabaseCategoryRuleRepository();
const simulationRepo = new SupabaseSimulationRepository();
const processedFileRepo = new SupabaseProcessedFileRepository();

export const transactionService = new TransactionService(transactionRepo, ruleRepo, processedFileRepo);
export const ruleService = new RuleService(ruleRepo, transactionRepo);
export const simulationService = new SimulationService(simulationRepo);
