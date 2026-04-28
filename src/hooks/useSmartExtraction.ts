import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { extractTransactions } from '../lib/gemini';

export function useSmartExtraction(userId: string) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    timeMs: 0,
    type: 'AI_FULL'
  });

  const extract = useCallback(async (files: File[], bankName?: string) => {
    setLoading(true);
    const startTime = performance.now();
    let allTransactions: any[] = [];
    
    try {
      for (const file of files) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        const base64 = await base64Promise;
        
        // AI Extraction
        const data = await extractTransactions(base64, file.type, file.name, bankName);
        allTransactions = [...allTransactions, ...data];
        
        // Log to audit_logs
        await supabase.from('audit_logs').insert({
          id: crypto.randomUUID(),
          actor_user_id: userId,
          action: 'FILE_PROCESSING',
          resource_type: 'FILE',
          metadata: {
            fileName: file.name,
            type: 'AI_FULL',
            timeMs: (performance.now() - startTime) / files.length,
            success: true
          },
          created_at: new Date().toISOString()
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      setStats({ timeMs: duration, type: 'AI_FULL' });
      return allTransactions;
    } catch (error) {
      console.error("Smart extraction failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { extract, loading, stats };
}
