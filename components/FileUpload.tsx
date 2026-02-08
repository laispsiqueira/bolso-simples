import React, { useRef, useState } from 'react';
import { UploadCloud, FileType, FileText } from 'lucide-react';
import { Button } from './Button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      onFileSelect(files[0]);
    } else {
      alert("Por favor, solte um arquivo PDF válido.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`
          relative overflow-hidden rounded-3xl transition-all duration-300
          ${isDragging 
            ? 'bg-blue-50 border-2 border-blue-500 shadow-xl shadow-blue-500/10' 
            : 'bg-white border-2 border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md'}
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
                 <div className="absolute -bottom-2 -right-2">
                   <span className="relative flex h-4 w-4">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                   </span>
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
              className="relative cursor-pointer font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none transition-colors"
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
                    onFileSelect(e.target.files[0]);
                  }
                }}
                disabled={isLoading}
              />
            </label>
            <p className="mt-1">ou arraste e solte seu PDF aqui</p>
          </div>
          
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">
            Suporta arquivos PDF até 10MB
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
         <Button 
            variant="ghost" 
            onClick={() => {
              const blob = new Blob(["demo"], { type: 'application/pdf' });
              const file = new File([blob], "demo_statement.pdf", { type: "application/pdf" });
              onFileSelect(file);
            }}
            className="text-slate-400 hover:text-slate-600 text-xs font-normal"
         >
           Não tem arquivo? <span className="underline ml-1">Carregar dados de demonstração</span>
         </Button>
      </div>
    </div>
  );
};