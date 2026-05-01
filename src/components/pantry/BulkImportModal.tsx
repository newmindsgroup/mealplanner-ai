import { useState, useRef } from 'react';
import { X, Upload, Download, FileText, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  generateCSVTemplate,
  parseCSVFile,
  parseCSVText,
  importPantryItems,
  downloadCSV,
} from '../../services/csvImport';
import type { CSVImportResult, CSVValidationError } from '../../types';
import LoadingSpinner from '../LoadingSpinner';

interface BulkImportModalProps {
  onClose: () => void;
}

export default function BulkImportModal({ onClose }: BulkImportModalProps) {
  const { addPantryItem } = useStore();
  
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (uploadedFile: File) => {
    setError(null);
    
    // Validate file type
    if (!uploadedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(uploadedFile);
    setStep('preview');

    try {
      // Parse and validate the CSV
      const parsedRows = await parseCSVFile(uploadedFile);
      const result = await importPantryItems(parsedRows);
      setImportResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
      setStep('upload');
    }
  };

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    downloadCSV(template, 'pantry_import_template.csv');
  };

  const handleConfirmImport = async () => {
    if (!importResult) return;

    setStep('importing');

    try {
      // Add all successfully imported items to the store
      importResult.importedItems.forEach((item) => {
        addPantryItem(item);
      });

      setStep('complete');
    } catch (err) {
      setError('Failed to import items. Please try again.');
      setStep('preview');
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Group errors by row
  const errorsByRow = (importResult?.errors || []).reduce((acc, error) => {
    if (!acc[error.row]) {
      acc[error.row] = [];
    }
    acc[error.row].push(error);
    return acc;
  }, {} as Record<number, CSVValidationError[]>);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bulk Import from CSV
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Import multiple pantry items at once
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">Error</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-6">
            {/* Download Template */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    First time importing?
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Download our CSV template with example data and field descriptions to get started.
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                </div>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
              }`}
            >
              <Upload
                className={`w-16 h-16 mx-auto mb-4 ${
                  dragActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {dragActive ? 'Drop your CSV file here' : 'Drag and drop your CSV file'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary"
              >
                <Upload className="w-5 h-5" />
                Select CSV File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Instructions */}
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p className="font-medium text-gray-900 dark:text-white">CSV Requirements:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>File must be in CSV format (.csv)</li>
                <li>First row must contain column headers</li>
                <li>Required fields: name, category, quantity, unit, location</li>
                <li>Dates should be in YYYY-MM-DD format</li>
                <li>Custom fields should be in JSON format</li>
              </ul>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && importResult && (
          <div className="space-y-6">
            {/* Summary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Rows</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {importResult.totalRows}
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 mb-1">Success</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {importResult.successCount}
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300 mb-1">Errors</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {importResult.errorCount}
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">Warnings</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {importResult.warningCount}
                </p>
              </div>
            </div>

            {/* Validation Results */}
            {importResult.errors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Validation Results
                </h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {Object.entries(errorsByRow).map(([row, errors]) => (
                    <div
                      key={row}
                      className={`p-4 rounded-lg border ${
                        errors.some((e) => e.severity === 'error')
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {errors.some((e) => e.severity === 'error') ? (
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Row {row}
                          </p>
                          <ul className="space-y-1">
                            {errors.map((error, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-gray-700 dark:text-gray-300"
                              >
                                <span className="font-medium">{error.field}:</span> {error.error}
                                {error.value && (
                                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                                    ({error.value})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Preview */}
            {importResult.successCount > 0 && (
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    {importResult.successCount} item{importResult.successCount !== 1 ? 's' : ''} ready to import
                  </p>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {importResult.errorCount > 0
                    ? `${importResult.skippedRows.length} row${importResult.skippedRows.length !== 1 ? 's' : ''} will be skipped due to errors.`
                    : 'All rows validated successfully!'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setStep('upload');
                  setFile(null);
                  setImportResult(null);
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importResult.successCount === 0}
                className="btn btn-primary flex-1"
              >
                <Upload className="w-5 h-5" />
                Import {importResult.successCount} Item{importResult.successCount !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

        {/* Importing Step */}
        {step === 'importing' && (
          <div className="py-12 text-center space-y-4">
            <LoadingSpinner size="lg" />
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Importing items...
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Please wait while we add items to your pantry
              </p>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && importResult && (
          <div className="py-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Import Complete!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Successfully imported {importResult.successCount} item{importResult.successCount !== 1 ? 's' : ''} to your pantry
              </p>
            </div>
            <button onClick={handleClose} className="btn btn-primary">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

