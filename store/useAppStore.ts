import { create } from 'zustand';
import { AppState, User, Transaction, UploadedFile, CategoryRule } from '../types';
import { transformData, createDefaultRules } from '../services/eltService';
import { 
  loadUserData, saveUserData, 
  loadRawData, saveRawData, 
  loadUserFiles, saveUserFiles, 
  loadUserRules, saveUserRules,
  clearUserData
} from '../utils/storage';

interface AppStore {
  // State
  currentUser: User | null;
  originalAdminUser: User | null; // For impersonation
  activeTab: AppState;
  
  transactions: Transaction[]; // View layer
  rawTransactions: Transaction[]; // Data layer
  uploadedFiles: UploadedFile[];
  categoryRules: CategoryRule[];
  
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (user: User) => void;
  logout: () => void;
  setImpersonation: (targetUser: User) => void;
  stopImpersonation: () => void;
  navigate: (tab: AppState) => void;
  
  // Data Operations
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Pipeline Actions
  addFilesAndData: (newFiles: UploadedFile[], newRawData: Transaction[]) => void;
  deleteFile: (fileId: string) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void; // Added back for completeness if needed internally
  updateRules: (newRules: CategoryRule[]) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentUser: null,
  originalAdminUser: null,
  activeTab: AppState.UPLOAD,
  
  transactions: [],
  rawTransactions: [],
  uploadedFiles: [],
  categoryRules: [],
  
  isLoading: false,
  error: null,

  login: (user) => {
    // Load user data
    const targetUser = user.role === 'guest' ? 'Brenno' : user.name;
    const loadedRaw = loadRawData(targetUser);
    const loadedFiles = loadUserFiles(targetUser);
    let loadedRules = loadUserRules(targetUser);

    if (loadedRules.length === 0) {
      loadedRules = createDefaultRules();
      if (user.role !== 'guest') saveUserRules(targetUser, loadedRules);
    }

    const transformed = transformData(loadedRaw, loadedRules);

    set({
      currentUser: user,
      originalAdminUser: null,
      activeTab: AppState.UPLOAD,
      error: null,
      rawTransactions: loadedRaw,
      uploadedFiles: loadedFiles,
      categoryRules: loadedRules,
      transactions: transformed
    });
  },

  logout: () => {
    set({
      currentUser: null,
      originalAdminUser: null,
      transactions: [],
      rawTransactions: [],
      uploadedFiles: [],
      categoryRules: []
    });
  },

  setImpersonation: (targetUser) => {
    const { currentUser } = get();
    if (currentUser?.role === 'admin') {
      // Load target user data
      const targetName = targetUser.name;
      const loadedRaw = loadRawData(targetName);
      const loadedFiles = loadUserFiles(targetName);
      const loadedRules = loadUserRules(targetName);
      const transformed = transformData(loadedRaw, loadedRules);

      set({
        originalAdminUser: currentUser,
        currentUser: targetUser,
        activeTab: AppState.UPLOAD,
        rawTransactions: loadedRaw,
        uploadedFiles: loadedFiles,
        categoryRules: loadedRules,
        transactions: transformed
      });
    }
  },

  stopImpersonation: () => {
    const { originalAdminUser } = get();
    if (originalAdminUser) {
      // Reload admin data
      const targetUser = originalAdminUser.name;
      const loadedRaw = loadRawData(targetUser);
      const loadedFiles = loadUserFiles(targetUser);
      const loadedRules = loadUserRules(targetUser);
      const transformed = transformData(loadedRaw, loadedRules);

      set({
        currentUser: originalAdminUser,
        originalAdminUser: null,
        activeTab: AppState.ADMIN,
        rawTransactions: loadedRaw,
        uploadedFiles: loadedFiles,
        categoryRules: loadedRules,
        transactions: transformed
      });
    }
  },

  navigate: (tab) => set({ activeTab: tab }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // --- ELT PIPELINE ---
  addFilesAndData: (newFiles, newRawData) => {
    const { currentUser, uploadedFiles, rawTransactions, categoryRules } = get();
    if (!currentUser) return;

    const updatedFiles = [...uploadedFiles, ...newFiles];
    const updatedRaw = [...rawTransactions, ...newRawData];
    const transformed = transformData(updatedRaw, categoryRules);

    set({
      uploadedFiles: updatedFiles,
      rawTransactions: updatedRaw,
      transactions: transformed
    });

    if (currentUser.role !== 'guest') {
      saveRawData(currentUser.name, updatedRaw);
      saveUserFiles(currentUser.name, updatedFiles);
      saveUserData(currentUser.name, transformed);
    }
  },

  deleteFile: (fileId) => {
    const { currentUser, uploadedFiles, rawTransactions, categoryRules } = get();
    if (!currentUser) return;

    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    const updatedRaw = rawTransactions.filter(t => t.fileId !== fileId);
    const transformed = transformData(updatedRaw, categoryRules);

    set({
      uploadedFiles: updatedFiles,
      rawTransactions: updatedRaw,
      transactions: transformed
    });

    if (currentUser.role !== 'guest') {
      saveRawData(currentUser.name, updatedRaw);
      saveUserFiles(currentUser.name, updatedFiles);
      saveUserData(currentUser.name, transformed);
    }
  },

  updateTransaction: (id, updates) => {
    const { currentUser, rawTransactions, categoryRules, uploadedFiles } = get();
    if (!currentUser) return;

    const updatedRaw = rawTransactions.map(t => t.id === id ? { ...t, ...updates } : t);
    const transformed = transformData(updatedRaw, categoryRules);

    set({
      rawTransactions: updatedRaw,
      transactions: transformed
    });

    if (currentUser.role !== 'guest') {
      saveRawData(currentUser.name, updatedRaw);
      saveUserData(currentUser.name, transformed);
    }
  },

  deleteTransaction: (id) => {
    const { currentUser, rawTransactions, categoryRules } = get();
    if (!currentUser) return;

    const updatedRaw = rawTransactions.filter(t => t.id !== id);
    const transformed = transformData(updatedRaw, categoryRules);

    set({
      rawTransactions: updatedRaw,
      transactions: transformed
    });

    if (currentUser.role !== 'guest') {
      saveRawData(currentUser.name, updatedRaw);
      saveUserData(currentUser.name, transformed);
    }
  },

  updateRules: (newRules) => {
    const { currentUser, rawTransactions, uploadedFiles } = get();
    if (!currentUser) return;

    const transformed = transformData(rawTransactions, newRules);

    set({
      categoryRules: newRules,
      transactions: transformed
    });

    if (currentUser.role !== 'guest') {
      saveUserRules(currentUser.name, newRules);
      saveUserData(currentUser.name, transformed);
    }
  }
}));