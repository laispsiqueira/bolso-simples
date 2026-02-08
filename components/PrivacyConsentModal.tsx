import React from 'react';
import { ShieldAlert, FileCheck, X } from 'lucide-react';
import { Button } from './Button';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-50 rounded-xl flex-shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Atenção à Privacidade</h3>
              <div className="text-sm text-slate-600 space-y-3">
                <p>
                  Para processar seu extrato, o arquivo PDF será enviado para a <strong>Inteligência Artificial do Google (Gemini)</strong>.
                </p>
                <ul className="list-disc pl-5 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <li>Certifique-se de que o arquivo <strong>não contém senhas</strong>.</li>
                  <li>Recomendamos ocultar dados sensíveis como número completo da conta se preferir.</li>
                  <li>Os dados processados são salvos apenas no seu navegador (LocalStorage).</li>
                </ul>
                <p className="font-medium text-slate-800">
                  Você consente com o envio do arquivo para processamento?
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirm} className="bg-amber-600 hover:bg-amber-700 text-white">
            <FileCheck className="w-4 h-4 mr-2" />
            Concordo, enviar arquivo
          </Button>
        </div>
      </div>
    </div>
  );
};