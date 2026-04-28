import { supabase } from '../../lib/supabase';
import { ITransactionRepository, ICategoryRuleRepository, ISimulationRepository, IProcessedFileRepository } from '../../domain/repositories';
import { Transaction, CategoryRule, Simulation, ProcessedFile, TransactionType } from '../../domain/entities';

export class SupabaseTransactionRepository implements ITransactionRepository {
  async listByUserId(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      date: item.date,
      amount: Number(item.amount),
      description: item.description,
      bank: item.bank,
      type: item.type as TransactionType,
      category: item.category,
      createdAt: new Date(item.created_at)
    }));
  }

  async save(t: Transaction): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .upsert({
        id: t.id,
        user_id: t.userId,
        date: t.date,
        amount: t.amount,
        description: t.description,
        bank: t.bank,
        type: t.type,
        category: t.category,
        created_at: t.createdAt.toISOString()
      });
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
  }

  async listByFileId(fileId: string): Promise<Transaction[]> {
    // Note: User's schema doesn't have file_id in transactions.
    // If needed, we'd need to add it or manage it differently.
    // For now, returning empty as it's a structural change.
    return [];
  }
}

export class SupabaseCategoryRuleRepository implements ICategoryRuleRepository {
  async listByUserId(userId: string): Promise<CategoryRule[]> {
    const { data, error } = await supabase
      .from('category_rules')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      keyword: item.keyword,
      category: item.category,
      active: item.active,
      createdAt: new Date(item.created_at)
    }));
  }

  async save(r: CategoryRule): Promise<void> {
    const { error } = await supabase
      .from('category_rules')
      .upsert({
        id: r.id,
        user_id: r.userId,
        keyword: r.keyword,
        category: r.category,
        active: r.active,
        created_at: r.createdAt.toISOString()
      });
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('category_rules')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}

export class SupabaseSimulationRepository implements ISimulationRepository {
  async listByUserId(userId: string): Promise<Simulation[]> {
    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      name: item.name,
      totalAmount: Number(item.total_amount),
      installments: item.installments,
      priority: item.priority,
      bank: item.bank,
      createdAt: new Date(item.created_at)
    }));
  }

  async save(s: Simulation): Promise<void> {
    const { error } = await supabase
      .from('simulations')
      .upsert({
        id: s.id,
        user_id: s.userId,
        name: s.name,
        total_amount: s.totalAmount,
        installments: s.installments,
        priority: s.priority,
        bank: s.bank,
        created_at: s.createdAt.toISOString()
      });
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('simulations')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}

export class SupabaseProcessedFileRepository implements IProcessedFileRepository {
  async listByUserId(userId: string): Promise<ProcessedFile[]> {
    const { data, error } = await supabase
      .from('processed_files')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      fileHash: item.file_hash,
      processedAt: new Date(item.processed_at)
    }));
  }

  async save(f: ProcessedFile): Promise<void> {
    const { error } = await supabase
      .from('processed_files')
      .upsert({
        id: f.id,
        user_id: f.userId,
        file_hash: f.fileHash,
        processed_at: f.processedAt.toISOString()
      });
    if (error) throw error;
  }

  async getByHash(hash: string): Promise<ProcessedFile | null> {
    const { data, error } = await supabase
      .from('processed_files')
      .select('*')
      .eq('file_hash', hash)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      fileHash: data.file_hash,
      processedAt: new Date(data.processed_at)
    };
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('processed_files')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
