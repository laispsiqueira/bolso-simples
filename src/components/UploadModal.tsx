import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { extractTransactions } from '../lib/gemini';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (transactions: any[]) => void;
}

export default function UploadModal({ isOpen, onClose, onConfirm }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const processFile = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        try {
          const transactions = await extractTransactions(base64, file.type);
          setReviewData(transactions);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Erro ao processar arquivo.");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Falha ao ler o arquivo localmente.");
      setLoading(false);
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
            Importar Extrato
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
                  file ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-200 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx" 
                />
                <div className={`p-4 rounded-full mb-4 ${file ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  {file ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>
                {file ? (
                  <div className="text-center">
                    <p className="font-bold text-blue-600">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-bold text-gray-600">Arraste ou clique para selecionar</p>
                    <p className="text-xs text-gray-400 mt-1">PDFs, Imagens, CSV ou Planilhas</p>
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
                disabled={!file || loading}
                onClick={processFile}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    A IA está processando o arquivo...
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
                  onClick={() => onConfirm(reviewData)}
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
