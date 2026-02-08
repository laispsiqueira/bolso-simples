import { Transaction } from "../types";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const downloadBase64File = (base64: string, fileName: string, mimeType: string) => {
  const link = document.createElement('a');
  link.href = `data:${mimeType};base64,${base64}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadCSV = (transactions: Transaction[]) => {
  const headers = ['Data', 'Descrição', 'Categoria', 'Valor', 'Tipo'];
  const csvContent = [
    headers.join(','),
    ...transactions.map(t => {
      const row = [
        t.date,
        `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
        t.category,
        t.amount.toFixed(2),
        t.type === 'debit' ? 'Despesa' : 'Receita'
      ];
      return row.join(',');
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `extrato_exportado_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};