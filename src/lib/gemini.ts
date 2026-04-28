export const extractTransactions = async (fileBase64: string, mimeType: string, fileName: string, bankName?: string) => {
  const response = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileBase64, mimeType, fileName, bankName })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Erro na extração");
  }

  return response.json();
};
