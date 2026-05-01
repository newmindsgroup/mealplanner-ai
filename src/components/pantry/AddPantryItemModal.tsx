import { useState } from 'react';
import { 
  X, Type, Scan, Camera, Upload, Sparkles, Plus, Check, AlertCircle, Info
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { createPantryItem, createPantryItemFromProduct, detectCategory, predictExpirationDate } from '../../services/pantryService';
import { enrichFromPhoto } from '../../services/productEnrichment';
import BarcodeScanner from './BarcodeScanner';
import BulkImportModal from './BulkImportModal';
import CustomFieldEditor from './CustomFieldEditor';
import type { FoodCategory, QuantityUnit, StorageLocation, BarcodeScanResult, PantryItem, CustomField } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import { validatePantryItem } from '../../utils/pantryValidation';

interface AddPantryItemModalProps {
  onClose: () => void;
}

type AddMode = 'manual' | 'barcode' | 'photo' | 'bulk';
type TabType = 'basic' | 'details' | 'nutritional' | 'custom';

export default function AddPantryItemModal({ onClose }: AddPantryItemModalProps) {
  const { addPantryItem, pantrySettings } = useStore();
  
  const [mode, setMode] = useState<AddMode>('manual');
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<Partial<PantryItem> | null>(null);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);

  // Form state - Basic Info
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('proteins');
  const [brand, setBrand] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<QuantityUnit>('count');
  const [location, setLocation] = useState<StorageLocation>(pantrySettings.defaultLocation);

  // Form state - Details
  const [purchaseDate, setPurchaseDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [openedDate, setOpenedDate] = useState('');
  const [supplier, setSupplier] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(pantrySettings.defaultLowStockThreshold);

  // Form state - Nutritional
  const [servingSize, setServingSize] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [fiber, setFiber] = useState('');
  const [sodium, setSodium] = useState('');
  const [sugar, setSugar] = useState('');

  // Form state - Other
  const [allergens, setAllergens] = useState<string[]>([]);
  const [allergenInput, setAllergenInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [notes, setNotes] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

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

  const tabs = [
    { id: 'basic' as TabType, label: 'Basic Info', icon: Type },
    { id: 'details' as TabType, label: 'Details', icon: Info },
    { id: 'nutritional' as TabType, label: 'Nutritional', icon: Sparkles },
    { id: 'custom' as TabType, label: 'Custom Fields', icon: Plus },
  ];

  const validateForm = () => {
    const itemData: Partial<PantryItem> = {
      name,
      category,
      quantity,
      unit,
      location,
      brand: brand || undefined,
      purchaseDate: purchaseDate || undefined,
      expirationDate: expirationDate || undefined,
      openedDate: openedDate || undefined,
      supplier: supplier || undefined,
      allergens: allergens.length > 0 ? allergens : undefined,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      lowStockThreshold,
    };

    const result = validatePantryItem(itemData);
    const errors: Record<string, string> = {};
    
    result.errors.forEach(err => {
      errors[err.field] = err.message;
    });

    setValidationErrors(errors);
    return result.valid;
  };

  const handleManualAdd = async () => {
    if (!validateForm()) {
      setError('Please fix the validation errors before saving');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nutritionalInfo = servingSize || calories || protein || carbs || fats || fiber || sodium || sugar
        ? {
            servingSize: servingSize || undefined,
            calories: calories ? parseFloat(calories) : undefined,
            protein: protein ? parseFloat(protein) : undefined,
            carbs: carbs ? parseFloat(carbs) : undefined,
            fats: fats ? parseFloat(fats) : undefined,
            fiber: fiber ? parseFloat(fiber) : undefined,
            sodium: sodium ? parseFloat(sodium) : undefined,
            sugar: sugar ? parseFloat(sugar) : undefined,
          }
        : undefined;

      const item = createPantryItem(name, category, quantity, unit, {
        location,
        expirationDate: expirationDate || undefined,
        purchaseDate: purchaseDate || undefined,
        openedDate: openedDate || undefined,
        supplier: supplier || undefined,
        barcode: barcode || undefined,
        lowStockThreshold,
        brand: brand || undefined,
        price: price ? parseFloat(price) : undefined,
        allergens: allergens.length > 0 ? allergens : undefined,
        ingredients: ingredients.length > 0 ? ingredients : undefined,
        notes: notes || undefined,
        customFields: customFields.length > 0 ? customFields : undefined,
        nutritionalInfo,
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
          const enrichedData = await enrichFromPhoto(imageDataUrl);

          if (!enrichedData || !enrichedData.name) {
            setError('Could not extract product information from photo. Please try manual entry.');
            setMode('manual');
            setLoading(false);
            return;
          }

          // Show preview for user to review/edit
          setPhotoPreview(enrichedData);
          setShowPhotoPreview(true);
          setLoading(false);
        } catch (err) {
          setError('Failed to analyze photo. Please try again.');
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read photo file.');
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process image.');
      setLoading(false);
    }
  };

  const handleAcceptPhotoData = () => {
    if (!photoPreview) return;

    // Pre-populate form with detected data
    if (photoPreview.name) setName(photoPreview.name);
    if (photoPreview.category) setCategory(photoPreview.category);
    if (photoPreview.brand) setBrand(photoPreview.brand);
    if (photoPreview.quantity) setQuantity(photoPreview.quantity);
    if (photoPreview.unit) setUnit(photoPreview.unit);
    if (photoPreview.location) setLocation(photoPreview.location);
    if (photoPreview.purchaseDate) setPurchaseDate(photoPreview.purchaseDate);
    if (photoPreview.expirationDate) setExpirationDate(photoPreview.expirationDate);
    if (photoPreview.supplier) setSupplier(photoPreview.supplier);
    if (photoPreview.barcode) setBarcode(photoPreview.barcode);
    if (photoPreview.price) setPrice(photoPreview.price.toString());
    if (photoPreview.allergens) setAllergens(photoPreview.allergens);
    if (photoPreview.ingredients) setIngredients(photoPreview.ingredients);
    
    if (photoPreview.nutritionalInfo) {
      if (photoPreview.nutritionalInfo.servingSize) setServingSize(photoPreview.nutritionalInfo.servingSize);
      if (photoPreview.nutritionalInfo.calories) setCalories(photoPreview.nutritionalInfo.calories.toString());
      if (photoPreview.nutritionalInfo.protein) setProtein(photoPreview.nutritionalInfo.protein.toString());
      if (photoPreview.nutritionalInfo.carbs) setCarbs(photoPreview.nutritionalInfo.carbs.toString());
      if (photoPreview.nutritionalInfo.fats) setFats(photoPreview.nutritionalInfo.fats.toString());
      if (photoPreview.nutritionalInfo.fiber) setFiber(photoPreview.nutritionalInfo.fiber.toString());
      if (photoPreview.nutritionalInfo.sodium) setSodium(photoPreview.nutritionalInfo.sodium.toString());
      if (photoPreview.nutritionalInfo.sugar) setSugar(photoPreview.nutritionalInfo.sugar.toString());
    }

    setShowPhotoPreview(false);
    setMode('manual');
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

  const handleAddAllergen = () => {
    if (allergenInput.trim() && !allergens.includes(allergenInput.trim())) {
      setAllergens([...allergens, allergenInput.trim()]);
      setAllergenInput('');
    }
  };

  const handleAddIngredient = () => {
    if (ingredientInput.trim() && !ingredients.includes(ingredientInput.trim())) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="card p-6 max-w-4xl w-full my-8 space-y-6 animate-fade-in">
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
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Photo Preview Modal */}
          {showPhotoPreview && photoPreview && (
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-2 border-primary-200 dark:border-primary-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Product Detected!</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Review and edit the detected information</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {photoPreview.name && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{photoPreview.name}</p>
                  </div>
                )}
                {photoPreview.brand && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Brand</p>
                    <p className="font-medium text-gray-900 dark:text-white">{photoPreview.brand}</p>
                  </div>
                )}
                {photoPreview.category && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Category</p>
                    <p className="font-medium text-gray-900 dark:text-white">{photoPreview.category}</p>
                  </div>
                )}
                {photoPreview.quantity && photoPreview.unit && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Quantity</p>
                    <p className="font-medium text-gray-900 dark:text-white">{photoPreview.quantity} {photoPreview.unit}</p>
                  </div>
                )}
                {photoPreview.expirationDate && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Expires</p>
                    <p className="font-medium text-gray-900 dark:text-white">{photoPreview.expirationDate}</p>
                  </div>
                )}
                {photoPreview.allergens && photoPreview.allergens.length > 0 && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Allergens</p>
                    <p className="font-medium text-gray-900 dark:text-white">{photoPreview.allergens.join(', ')}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPhotoPreview(false);
                    setPhotoPreview(null);
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Discard
                </button>
                <button
                  onClick={handleAcceptPhotoData}
                  className="btn btn-primary flex-1"
                >
                  <Check className="w-5 h-5" />
                  Use This Data
                </button>
              </div>
            </div>
          )}

          {/* Manual Entry Form with Tabs */}
          {mode === 'manual' && !showPhotoPreview && (
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <div className="space-y-4 animate-fade-in">
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
                          className={`input flex-1 ${validationErrors.name ? 'border-red-500' : ''}`}
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
                      {validationErrors.name && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{validationErrors.name}</p>
                      )}
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
                          placeholder="e.g., Perdue"
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
                          className={`input ${validationErrors.quantity ? 'border-red-500' : ''}`}
                          min="0"
                          step="0.1"
                          required
                        />
                        {validationErrors.quantity && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{validationErrors.quantity}</p>
                        )}
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

                    {/* Storage Location */}
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
                  </div>
                )}

                {/* Details Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Dates */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Purchase Date
                        </label>
                        <input
                          type="date"
                          value={purchaseDate}
                          onChange={(e) => setPurchaseDate(e.target.value)}
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Opened Date
                        </label>
                        <input
                          type="date"
                          value={openedDate}
                          onChange={(e) => setOpenedDate(e.target.value)}
                          className="input"
                        />
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

                    {/* Supplier & Barcode */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Supplier/Store
                        </label>
                        <input
                          type="text"
                          value={supplier}
                          onChange={(e) => setSupplier(e.target.value)}
                          className="input"
                          placeholder="e.g., Whole Foods"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Barcode/UPC
                        </label>
                        <input
                          type="text"
                          value={barcode}
                          onChange={(e) => setBarcode(e.target.value)}
                          className="input"
                          placeholder="e.g., 1234567890123"
                        />
                      </div>
                    </div>

                    {/* Price & Low Stock Threshold */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Price
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
                    </div>

                    {/* Allergens */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Allergens
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={allergenInput}
                          onChange={(e) => setAllergenInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergen())}
                          className="input flex-1"
                          placeholder="Add allergen and press Enter"
                        />
                        <button onClick={handleAddAllergen} className="btn btn-secondary">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {allergens.map((allergen, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center gap-2"
                          >
                            {allergen}
                            <button
                              onClick={() => setAllergens(allergens.filter((_, i) => i !== idx))}
                              className="hover:text-red-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ingredients
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={ingredientInput}
                          onChange={(e) => setIngredientInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                          className="input flex-1"
                          placeholder="Add ingredient and press Enter"
                        />
                        <button onClick={handleAddIngredient} className="btn btn-secondary">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ingredients.map((ingredient, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm flex items-center gap-2"
                          >
                            {ingredient}
                            <button
                              onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                              className="hover:text-gray-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
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
                        rows={3}
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                )}

                {/* Nutritional Tab */}
                {activeTab === 'nutritional' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Serving Size
                      </label>
                      <input
                        type="text"
                        value={servingSize}
                        onChange={(e) => setServingSize(e.target.value)}
                        className="input"
                        placeholder="e.g., 1 cup, 100g"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Calories
                        </label>
                        <input
                          type="number"
                          value={calories}
                          onChange={(e) => setCalories(e.target.value)}
                          className="input"
                          placeholder="kcal"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Protein (g)
                        </label>
                        <input
                          type="number"
                          value={protein}
                          onChange={(e) => setProtein(e.target.value)}
                          className="input"
                          placeholder="g"
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Carbohydrates (g)
                        </label>
                        <input
                          type="number"
                          value={carbs}
                          onChange={(e) => setCarbs(e.target.value)}
                          className="input"
                          placeholder="g"
                          min="0"
                          step="0.1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Fats (g)
                        </label>
                        <input
                          type="number"
                          value={fats}
                          onChange={(e) => setFats(e.target.value)}
                          className="input"
                          placeholder="g"
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Fiber (g)
                        </label>
                        <input
                          type="number"
                          value={fiber}
                          onChange={(e) => setFiber(e.target.value)}
                          className="input"
                          placeholder="g"
                          min="0"
                          step="0.1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Sodium (mg)
                        </label>
                        <input
                          type="number"
                          value={sodium}
                          onChange={(e) => setSodium(e.target.value)}
                          className="input"
                          placeholder="mg"
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sugar (g)
                      </label>
                      <input
                        type="number"
                        value={sugar}
                        onChange={(e) => setSugar(e.target.value)}
                        className="input"
                        placeholder="g"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                )}

                {/* Custom Fields Tab */}
                {activeTab === 'custom' && (
                  <div className="animate-fade-in">
                    <CustomFieldEditor
                      category={category}
                      currentFields={customFields}
                      onChange={setCustomFields}
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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
          {mode === 'photo' && !showPhotoPreview && (
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

