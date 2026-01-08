'use client';

import { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { Transaction } from '@/types';

// Set worker path for pdf.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PDFImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
}

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  rawLine: string;
}

// Common date patterns in bank statements
const DATE_PATTERNS = [
  /(\d{1,2}\/\d{1,2}\/\d{2,4})/,  // MM/DD/YYYY or MM/DD/YY
  /(\d{1,2}-\d{1,2}-\d{2,4})/,    // MM-DD-YYYY
  /(\w{3}\s+\d{1,2},?\s*\d{4})/i, // Jan 15, 2024 or Jan 15 2024
  /(\d{1,2}\s+\w{3}\s+\d{4})/i,   // 15 Jan 2024
];

// Amount patterns - look for dollar amounts
const AMOUNT_PATTERNS = [
  /\$?\s*([\d,]+\.\d{2})\s*(?:CR|DR)?$/i,           // $1,234.56 or 1234.56 CR/DR at end
  /\$?\s*([\d,]+\.\d{2})\s*$/,                       // Amount at end of line
  /(?:^|\s)\$?\s*([\d,]+\.\d{2})(?:\s|$)/,          // Amount anywhere
  /\(\$?([\d,]+\.\d{2})\)/,                          // (1234.56) negative format
];

interface PDFError extends Error {
  name: string;
}

function extractTextFromPDF(file: File, password?: string): Promise<{ pages: string[]; needsPassword?: boolean }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
        const loadingTask = pdfjsLib.getDocument({
          data: typedArray,
          password: password || undefined,
        });

        const pdf = await loadingTask.promise;
        const pages: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: { str?: string }) => item.str || '')
            .join(' ');
          pages.push(pageText);
        }

        resolve({ pages });
      } catch (error) {
        const pdfError = error as PDFError;
        // Check if password is needed
        if (pdfError.name === 'PasswordException') {
          resolve({ pages: [], needsPassword: true });
        } else {
          console.error('PDF Error:', pdfError);
          reject(error);
        }
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function parseTransactionsFromText(text: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  // Split into lines - try to identify transaction rows
  // Bank statements often have dates at the start of transaction lines
  const lines = text.split(/(?=\d{1,2}[\/\-]\d{1,2}[\/\-]?\d{0,4})|(?=\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b)/i);

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.length < 10) continue;

    // Try to find a date
    let dateMatch: string | null = null;
    for (const pattern of DATE_PATTERNS) {
      const match = trimmedLine.match(pattern);
      if (match) {
        dateMatch = match[1];
        break;
      }
    }

    if (!dateMatch) continue;

    // Try to find an amount
    let amount: number | null = null;
    let isNegative = false;

    for (const pattern of AMOUNT_PATTERNS) {
      const match = trimmedLine.match(pattern);
      if (match) {
        const amountStr = match[1].replace(/,/g, '');
        amount = parseFloat(amountStr);

        // Check for negative indicators
        if (trimmedLine.includes('(') && trimmedLine.includes(')')) {
          isNegative = true;
        }
        if (/CR$/i.test(trimmedLine)) {
          isNegative = false; // Credit = positive (money in)
        }
        if (/DR$/i.test(trimmedLine) || /DEBIT/i.test(trimmedLine)) {
          isNegative = true;
        }

        break;
      }
    }

    if (amount === null || amount === 0) continue;

    // Extract description - everything between date and amount
    let description = trimmedLine;

    // Remove the date from description
    description = description.replace(dateMatch, '').trim();

    // Remove the amount from description
    for (const pattern of AMOUNT_PATTERNS) {
      description = description.replace(pattern, '').trim();
    }

    // Clean up description
    description = description
      .replace(/\s+/g, ' ')
      .replace(/^[\s\-\*]+/, '')
      .replace(/[\s\-\*]+$/, '')
      .trim();

    if (description.length < 2) {
      description = 'Unknown Transaction';
    }

    transactions.push({
      date: dateMatch,
      description: description.slice(0, 100), // Limit length
      amount: isNegative ? -Math.abs(amount) : Math.abs(amount),
      rawLine: trimmedLine.slice(0, 150),
    });
  }

  return transactions;
}

function parseDate(dateStr: string): Date {
  // Try various date formats
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try MM/DD/YY format
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length >= 2) {
    const month = parseInt(parts[0]) - 1;
    const day = parseInt(parts[1]);
    let year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear();

    // Handle 2-digit year
    if (year < 100) {
      year += year > 50 ? 1900 : 2000;
    }

    return new Date(year, month, day);
  }

  return new Date();
}

export function PDFImportModal({ isOpen, onClose, onImport }: PDFImportModalProps) {
  const [step, setStep] = useState<'upload' | 'password' | 'preview'>('upload');
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');

  const processPDF = useCallback(async (file: File, pwd?: string) => {
    setError(null);
    setIsProcessing(true);

    try {
      const result = await extractTextFromPDF(file, pwd);

      if (result.needsPassword) {
        setPdfFile(file);
        setStep('password');
        setIsProcessing(false);
        return;
      }

      const fullText = result.pages.join('\n\n--- Page Break ---\n\n');
      setRawText(fullText);

      console.log('Extracted PDF text:', fullText.slice(0, 2000));

      const transactions = parseTransactionsFromText(fullText);
      console.log('Parsed transactions:', transactions);

      if (transactions.length === 0) {
        setError('Could not find any transactions in this PDF. The format may not be supported. Try CSV export from your bank instead.');
        setIsProcessing(false);
        return;
      }

      setParsedTransactions(transactions);
      setSelectedTransactions(new Set(transactions.map((_, i) => i)));
      setStep('preview');
    } catch (err) {
      console.error('PDF parsing error:', err);
      setError('Failed to read PDF file. It may be encrypted, corrupted, or in an unsupported format.');
    }

    setIsProcessing(false);
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    await processPDF(file);
  }, [processPDF]);

  const handlePasswordSubmit = useCallback(async () => {
    if (!pdfFile || !password) return;
    await processPDF(pdfFile, password);
  }, [pdfFile, password, processPDF]);

  const toggleTransaction = (index: number) => {
    setSelectedTransactions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedTransactions.size === parsedTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(parsedTransactions.map((_, i) => i)));
    }
  };

  const handleImport = useCallback(() => {
    const toImport = parsedTransactions
      .filter((_, i) => selectedTransactions.has(i))
      .map((tx) => ({
        userId: 'demo-user',
        amount: Math.abs(tx.amount),
        description: tx.description,
        merchantName: tx.description.split(' ').slice(0, 3).join(' '),
        date: parseDate(tx.date),
        source: 'MANUAL' as const,
        externalId: null,
        defaultCategory: null,
        plaidConnectionId: null,
        pending: false,
        isRecurring: false,
      }));

    console.log('Importing PDF transactions:', toImport);
    onImport(toImport);
    window.location.reload();
  }, [parsedTransactions, selectedTransactions, onImport]);

  const handleClose = useCallback(() => {
    setStep('upload');
    setParsedTransactions([]);
    setSelectedTransactions(new Set());
    setError(null);
    setRawText('');
    setPdfFile(null);
    setPassword('');
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-3xl mx-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-[var(--card)] to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Import from PDF Statement</h2>
              <p className="text-sm text-[var(--foreground-subtle)] mt-1">
                {step === 'upload' && 'Upload your bank statement PDF'}
                {step === 'password' && 'This PDF is password-protected'}
                {step === 'preview' && 'Review detected transactions'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-[var(--foreground-subtle)] hover:text-[var(--foreground)] hover:bg-[var(--hover)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm">
              {error}
            </div>
          )}

          {step === 'upload' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center hover:border-[#3B82F6]/50 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isProcessing}
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
                    {isProcessing ? (
                      <div className="w-8 h-8 border-2 border-[#EF4444] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-8 h-8 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-[var(--foreground)] font-medium mb-1">
                    {isProcessing ? 'Processing PDF...' : 'Click to upload PDF statement'}
                  </p>
                  <p className="text-sm text-[var(--foreground-subtle)]">
                    Bank statements, credit card statements
                  </p>
                </label>
              </div>

              <div className="p-4 rounded-lg bg-[#EAB308]/10 border border-[#EAB308]/20">
                <h4 className="text-sm font-medium text-[#EAB308] mb-2">Note about PDF parsing</h4>
                <p className="text-sm text-[var(--foreground-muted)]">
                  PDF parsing works best with simple statement formats. If results are poor,
                  try exporting CSV from your bank&apos;s website instead - most banks offer this option
                  under &quot;Download&quot; or &quot;Export&quot; in your transaction history.
                </p>
              </div>
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-[var(--background-subtle)] border border-[var(--border)]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#EAB308]/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#EAB308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--foreground)]">Password Required</h3>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Enter the password for this PDF (often your account number or SSN last 4 digits)
                    </p>
                  </div>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter PDF password"
                  className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:border-[#3B82F6] focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                />
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!password || isProcessing}
                  className="w-full mt-4 px-4 py-3 rounded-lg bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Unlocking...' : 'Unlock PDF'}
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--foreground-muted)]">
                  Found {parsedTransactions.length} transactions. Select which to import.
                </p>
                <button
                  onClick={toggleAll}
                  className="text-sm text-[#3B82F6] hover:underline"
                >
                  {selectedTransactions.size === parsedTransactions.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="rounded-lg border border-[var(--border)] overflow-hidden max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--background-subtle)] sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left w-10"></th>
                      <th className="px-3 py-2 text-left text-[var(--foreground-subtle)]">Date</th>
                      <th className="px-3 py-2 text-left text-[var(--foreground-subtle)]">Description</th>
                      <th className="px-3 py-2 text-right text-[var(--foreground-subtle)]">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {parsedTransactions.map((tx, idx) => (
                      <tr
                        key={idx}
                        className={`bg-[var(--card)] hover:bg-[var(--hover)] cursor-pointer ${
                          selectedTransactions.has(idx) ? '' : 'opacity-50'
                        }`}
                        onClick={() => toggleTransaction(idx)}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.has(idx)}
                            onChange={() => toggleTransaction(idx)}
                            className="rounded border-[var(--border)]"
                          />
                        </td>
                        <td className="px-3 py-2 text-[var(--foreground)] whitespace-nowrap">{tx.date}</td>
                        <td className="px-3 py-2 text-[var(--foreground)] truncate max-w-[300px]">{tx.description}</td>
                        <td className="px-3 py-2 text-right text-[var(--foreground)] font-medium">
                          ${Math.abs(tx.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Debug: show raw text excerpt */}
              <details className="text-xs text-[var(--foreground-subtle)]">
                <summary className="cursor-pointer hover:text-[var(--foreground)]">Debug: View extracted text</summary>
                <pre className="mt-2 p-2 bg-[var(--background-subtle)] rounded max-h-32 overflow-auto whitespace-pre-wrap">
                  {rawText.slice(0, 2000)}...
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center justify-between">
            <div>
              {step !== 'upload' && (
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Cancel
              </button>
              {step === 'preview' && (
                <button
                  onClick={handleImport}
                  disabled={selectedTransactions.size === 0}
                  className="px-6 py-2 text-sm font-semibold text-white bg-[#22C55E] rounded-lg hover:bg-[#16A34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import {selectedTransactions.size} Transactions
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
