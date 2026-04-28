import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, Loader2, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSmartExtraction } from '../hooks/useSmartExtraction';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (transactions: any[], filesInfo: { name: string, bank?: string }[]) => void;
  userId: string;
}

export default function UploadModal({ isOpen, onClose, onConfirm, userId }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [reviewData, setReviewData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { extract, loading } = useSmartExtraction(userId);

  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setReviewData(null);
      setError(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setError(null);
    }
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    try {
      const transactions = await extract(files);
      setReviewData(transactions);
    } catch (err: any) {
      setError(err.message || "Erro ao processar arquivos.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center">
            <Upload className="w-5 h-5 mr-3 text-blue-600" />
            Importar Extratos
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-8">
          {!reviewData ? (
            <div className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  files.length > 0 ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-200 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx" 
                />
                <div className={`p-4 rounded-full mb-4 ${files.length > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  {files.length > 0 ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>
                {files.length > 0 ? (
                  <div className="text-center space-y-1">
                    <p className="font-bold text-blue-600">
                      {files.length === 1 ? files[0].name : `${files.length} arquivos selecionados`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB total
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-bold text-gray-600">Arraste ou clique para selecionar</p>
                    <p className="text-xs text-gray-400 mt-1">PDFs, Imagens, CSV ou Planilhas (Múltiplos permitidos)</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start text-red-600">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                disabled={files.length === 0 || loading}
                onClick={processFiles}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Processando {files.length} arquivo(s)...
                  </>
                ) : (
                  'Processar Arquivos'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start text-green-700 mb-4">
                <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold">Extração Concluída!</p>
                  <p className="text-xs">Identificamos {reviewData.length} transações. Revise os dados abaixo antes de salvar.</p>
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto border rounded-2xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 font-bold text-gray-500 uppercase text-[10px]">Data</th>
                      <th className="px-4 py-3 font-bold text-gray-500 uppercase text-[10px]">Descrição</th>
                      <th className="px-4 py-3 font-bold text-gray-500 uppercase text-[10px]">Valor</th>
                      <th className="px-4 py-3 font-bold text-gray-500 uppercase text-[10px]">Cat.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reviewData.map((t, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-medium truncate max-w-[150px]">{t.description}</td>
                        <td className={`px-4 py-3 font-bold ${t.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                          R$ {Math.abs(t.amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gray-100 rounded-md text-[10px] font-mono">{t.category}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setReviewData(null)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={() => onConfirm(reviewData, files.map(f => ({ name: f.name })))}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Confirmar e Salvar
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
