import { useState } from 'react';
import { 
  X, Type, Scan, Camera, Upload, Sparkles, Plus, Check
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { createPantryItem, createPantryItemFromProduct, detectCategory, predictExpirationDate } from '../../services/pantryService';
import { scanPantry } from '../../services/pantryScanning';
import BarcodeScanner from './BarcodeScanner';
import BulkImportModal from './BulkImportModal';
import type { FoodCategory, QuantityUnit, StorageLocation, BarcodeScanResult } from '../../types';
import LoadingSpinner from '../LoadingSpinner';

interface AddPantryItemModalProps {
  onClose: () => void;
}

type AddMode = 'manual' | 'barcode' | 'photo' | 'bulk';

export default function AddPantryItemModal({ onClose }: AddPantryItemModalProps) {
  const { addPantryItem, pantrySettings } = useStore();
  
  const [mode, setMode] = useState<AddMode>('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('proteins');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<QuantityUnit>('count');
  const [location, setLocation] = useState<StorageLocation>(pantrySettings.defaultLocation);
  const [expirationDate, setExpirationDate] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(pantrySettings.defaultLowStockThreshold);

  const units: QuantityUnit[] = [
    'count', 'g', 'kg', 'oz', 'lb', 'ml', 'l', 'cup', 'tbsp', 'tsp',
    'can', 'box', 'bag', 'bottle', 'jar', 'package'
  ];

  const categories: FoodCategory[] = [
    'proteins', 'vegetables', 'fruits', 'grains', 'dairy',
    'oils', 'nuts-seeds', 'beverages', 'spices', 'sweeteners'
  ];

  const locations: StorageLocation[] = [
    'pantry', 'refrigerator', 'freezer', 'cabinet', 'counter', 'other'
  ];

  const handleManualAdd = async () => {
    if (!name || quantity <= 0) {
      setError('Please provide item name and valid quantity');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const item = createPantryItem(name, category, quantity, unit, {
        location,
        expirationDate: expirationDate || undefined,
        lowStockThreshold,
        brand: brand || undefined,
        price: price ? parseFloat(price) : undefined,
        notes: notes || undefined,
      });

      addPantryItem(item);
      onClose();
    } catch (err) {
      setError('Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = async (result: BarcodeScanResult) => {
    setShowBarcodeScanner(false);
    
    if (!result.productInfo) {
      setError('Product information not found for this barcode. Please add manually.');
      setMode('manual');
      return;
    }

    setLoading(true);
    try {
      const item = createPantryItemFromProduct(result.productInfo, 1, 'count');
      addPantryItem(item);
      onClose();
    } catch (err) {
      setError('Failed to add item from barcode. Please try manually.');
      setMode('manual');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const imageDataUrl = event.target?.result as string;
          const scanResult = await scanPantry(imageDataUrl);

          if (scanResult.identifiedFoods.length === 0) {
            setError('No items identified in photo. Please try manual entry.');
            setMode('manual');
            return;
          }

          // Add all identified items
          for (const food of scanResult.identifiedFoods) {
            const detectedCat = await detectCategory(food.name);
            const item = createPantryItem(food.name, detectedCat, 1, 'count', {
              location: pantrySettings.defaultLocation,
            });
            addPantryItem(item);
          }

          onClose();
        } catch (err) {
          setError('Failed to analyze photo. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to read photo file.');
      setLoading(false);
    }
  };

  const handleAISuggest = async () => {
    if (!name) return;

    setLoading(true);
    try {
      const detectedCat = await detectCategory(name);
      setCategory(detectedCat);

      const predictedExp = await predictExpirationDate(name, detectedCat, location);
      if (predictedExp) {
        setExpirationDate(predictedExp);
      }
    } catch (err) {
      console.error('AI suggestion error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Add to Pantry
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add items via multiple methods
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Mode Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setMode('manual')}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === 'manual'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}
            >
              <Type className={`w-6 h-6 mx-auto mb-2 ${mode === 'manual' ? 'text-primary-600' : 'text-gray-500'}`} />
              <p className="text-sm font-medium">Manual Entry</p>
            </button>

            <button
              onClick={() => {
                setMode('barcode');
                setShowBarcodeScanner(true);
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === 'barcode'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}
            >
              <Scan className={`w-6 h-6 mx-auto mb-2 ${mode === 'barcode' ? 'text-primary-600' : 'text-gray-500'}`} />
              <p className="text-sm font-medium">Scan Barcode</p>
            </button>

            <button
              onClick={() => {
                setMode('photo');
                document.getElementById('photo-upload')?.click();
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === 'photo'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}
            >
              <Camera className={`w-6 h-6 mx-auto mb-2 ${mode === 'photo' ? 'text-primary-600' : 'text-gray-500'}`} />
              <p className="text-sm font-medium">Take Photo</p>
            </button>

            <button
              onClick={() => {
                setMode('bulk');
                setShowBulkImportModal(true);
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                mode === 'bulk'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}
            >
              <Upload className={`w-6 h-6 mx-auto mb-2 ${mode === 'bulk' ? 'text-primary-600' : 'text-gray-500'}`} />
              <p className="text-sm font-medium">Bulk Import</p>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Manual Entry Form */}
          {mode === 'manual' && (
            <div className="space-y-4">
              {/* Name with AI Suggest */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Item Name *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input flex-1"
                    placeholder="e.g., Chicken Breast"
                    required
                  />
                  <button
                    onClick={handleAISuggest}
                    disabled={!name || loading}
                    className="btn btn-secondary"
                    title="AI Suggestions"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FoodCategory)}
                    className="input w-full"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="input"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value))}
                    className="input"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as QuantityUnit)}
                    className="input w-full"
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location & Expiration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Storage Location *
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value as StorageLocation)}
                    className="input w-full"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {/* Low Stock Threshold & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Low Stock Alert At
                  </label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(parseFloat(e.target.value))}
                    className="input"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (Optional)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input resize-none"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualAdd}
                  disabled={loading || !name || quantity <= 0}
                  className="btn btn-primary flex-1"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Add Item
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Photo Upload Mode */}
          {mode === 'photo' && (
            <div className="text-center py-12">
              {loading ? (
                <div className="space-y-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Analyzing photo...
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Select a photo to scan your pantry items
                </p>
              )}
            </div>
          )}

          {/* Bulk Import Mode - handled by modal */}
          {mode === 'bulk' && !showBulkImportModal && (
            <div className="text-center py-12">
              <Upload className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Opening bulk import...
              </p>
            </div>
          )}

          {/* Hidden file input */}
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onScanComplete={handleBarcodeScanned}
          onClose={() => {
            setShowBarcodeScanner(false);
            setMode('manual');
          }}
        />
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <BulkImportModal
          onClose={() => {
            setShowBulkImportModal(false);
            setMode('manual');
            onClose(); // Close parent modal after successful import
          }}
        />
      )}
    </>
  );
}

