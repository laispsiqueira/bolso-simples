import React, { useState } from 'react';
import { UploadCloud, FileType, Trash2, FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from './Button';
import { UploadedFile } from '../types';
import { PrivacyConsentModal } from './PrivacyConsentModal';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onLoadDemo?: () => void;
  isLoading: boolean;
  uploadedFiles: UploadedFile[];
  onDeleteFile: (fileId: string) => void;
  onDownloadCSV?: (fileId: string) => void;
  onDownloadOriginal?: (fileId: string) => void;
  isReadOnly?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  onLoadDemo,
  isLoading, 
  uploadedFiles,
  onDeleteFile,
  onDownloadCSV,
  onDownloadOriginal,
  isReadOnly = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFileSelection = (file: File) => {
    if (file.type !== 'application/pdf') {
       alert("Por favor, selecione um arquivo PDF válido.");
       return;
    }
    setPendingFile(file);
    setIsPrivacyModalOpen(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isReadOnly) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFileSelection(files[0]);
    }
  };

  const handleConfirmUpload = () => {
    if (pendingFile) {
      onFileSelect(pendingFile);
    }
    setPendingFile(null);
    setIsPrivacyModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <PrivacyConsentModal 
        isOpen={isPrivacyModalOpen}
        onClose={() => {
          setIsPrivacyModalOpen(false);
          setPendingFile(null);
        }}
        onConfirm={handleConfirmUpload}
      />

      {/* Upload Zone */}
      <div 
        className={`
          relative overflow-hidden rounded-3xl transition-all duration-300
          ${isDragging 
            ? 'bg-blue-50 border-2 border-blue-500 shadow-xl shadow-blue-500/10' 
            : 'bg-white border-2 border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md'}
          ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="px-6 py-12 sm:px-12 text-center">
          <div className="flex justify-center mb-6">
            {isLoading ? (
               <div className="relative">
                 <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center animate-pulse">
                   <FileType className="h-8 w-8 text-blue-500" />
                 </div>
               </div>
            ) : (
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                <UploadCloud className="h-8 w-8" />
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {isLoading ? 'Analisando seu extrato...' : 'Upload do Extrato'}
          </h3>
          
          <div className="flex flex-col items-center justify-center text-sm text-slate-500 mb-6">
            <label
              htmlFor="file-upload"
              className={`relative cursor-pointer font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none transition-colors ${isReadOnly ? 'pointer-events-none' : ''}`}
            >
              <span>Clique para selecionar</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept="application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    processFileSelection(e.target.files[0]);
                  }
                }}
                disabled={isLoading || isReadOnly}
              />
            </label>
            <p className="mt-1">ou arraste e solte seu PDF aqui</p>
          </div>
        </div>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
           <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
             <h4 className="text-sm font-semibold text-slate-700">Arquivos Processados</h4>
           </div>
           <ul className="divide-y divide-slate-100">
             {uploadedFiles.map(file => (
               <li key={file.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                       <p className="text-sm font-medium text-slate-900">{file.name}</p>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{file.bankName || 'Banco Desconhecido'}</span>
                          <span>•</span>
                          <span>{new Date(file.uploadDate).toLocaleDateString('pt-BR')}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-1">
                    {onDownloadOriginal && (
                      <button 
                        onClick={() => onDownloadOriginal(file.id)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Baixar Arquivo Original (PDF)"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                    )}
                    {onDownloadCSV && (
                      <button 
                        onClick={() => onDownloadCSV(file.id)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Baixar CSV"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>
                    )}
                    {!isReadOnly && (
                      <button 
                        onClick={() => onDeleteFile(file.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir arquivo e transações"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                 </div>
               </li>
             ))}
           </ul>
        </div>
      )}

      {/* Demo Button */}
      {!uploadedFiles.length && !isLoading && !isReadOnly && onLoadDemo && (
        <div className="mt-8 text-center">
           <Button 
              variant="ghost" 
              onClick={onLoadDemo}
              className="text-slate-400 hover:text-blue-600 text-xs font-normal"
           >
             Não tem arquivo? <span className="underline ml-1 font-semibold">Carregar demonstração completa (3 bancos)</span>
           </Button>
        </div>
      )}
    </div>
  );
};

// Helper icon
const FileText = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);