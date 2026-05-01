import { useState, useRef } from 'react';
import { 
  Camera, Upload, X, AlertTriangle, CheckCircle, AlertCircle, 
  ScanLine, Sparkles, Package, ShoppingCart, Pill, Plus, Check 
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { analyzeLabel } from '../services/labelAnalysis';
import { scanPantry } from '../services/pantryScanning';
import { scanGroceryLabel } from '../services/groceryScanning';
import type { LabelAnalysis, PantryScanResult, GroceryScanResult, ScanMode, IdentifiedFood } from '../types';
import type { FoodItem } from '../data/bloodTypeFoods';
import LoadingSpinner from './LoadingSpinner';

export default function LabelAnalyzer() {
  const { 
    labelAnalyses, addLabelAnalysis,
    pantryScans, addPantryScan,
    groceryScans, addGroceryScan,
    people, addCustomFood, userFoodGuides
  } = useStore();
  
  const [scanMode, setScanMode] = useState<ScanMode>('supplement');
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<LabelAnalysis | PantryScanResult | GroceryScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setAnalyzing(true);
    try {
      let analysisResult;
      
      if (scanMode === 'supplement') {
        analysisResult = await analyzeLabel(image);
        setResult(analysisResult);
        addLabelAnalysis(analysisResult);
      } else if (scanMode === 'pantry') {
        analysisResult = await scanPantry(image);
        setResult(analysisResult);
        addPantryScan(analysisResult);
      } else if (scanMode === 'grocery') {
        analysisResult = await scanGroceryLabel(image);
        setResult(analysisResult);
        addGroceryScan(analysisResult);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert(error instanceof Error ? error.message : 'Error analyzing image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSafetyIcon = (level: 'safe' | 'caution' | 'warning' | 'danger') => {
    switch (level) {
      case 'safe':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'caution':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  const handleAddFoodToGuide = async (food: IdentifiedFood) => {
    if (people.length === 0) {
      alert('Please create a profile first to add foods to your Food Guide.');
      return;
    }

    const primaryPerson = people[0]; // Use first person or allow selection
    
    // Create a FoodItem from the IdentifiedFood
    const foodItem: FoodItem = {
      id: crypto.randomUUID(),
      name: food.name,
      category: food.category,
      classification: {
        'O+': 'neutral',
        'O-': 'neutral',
        'A+': 'neutral',
        'A-': 'neutral',
        'B+': 'neutral',
        'B-': 'neutral',
        'AB+': 'neutral',
        'AB-': 'neutral',
      },
      nutritionalInfo: {},
      benefits: `Added from pantry scan${food.estimatedQuantity ? ` (${food.estimatedQuantity})` : ''}`,
    };

    addCustomFood(primaryPerson.id, foodItem);
    
    // Update the identified food to show it's been added
    if (result && 'identifiedFoods' in result) {
      setResult({
        ...result,
        identifiedFoods: result.identifiedFoods.map(f =>
          f.id === food.id ? { ...f, addedToFoodGuide: true } : f
        ),
      });
    }
  };

  const getModeIcon = (mode: ScanMode) => {
    switch (mode) {
      case 'supplement':
        return <Pill className="w-5 h-5" />;
      case 'pantry':
        return <Package className="w-5 h-5" />;
      case 'grocery':
        return <ShoppingCart className="w-5 h-5" />;
    }
  };

  const getModeDescription = (mode: ScanMode) => {
    switch (mode) {
      case 'supplement':
        return 'Scan supplement or medication labels for blood type compatibility';
      case 'pantry':
        return 'Take a picture of your pantry to identify and catalog foods';
      case 'grocery':
        return 'Scan grocery store labels to identify harmful ingredients';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-elevated p-6 bg-gradient-to-r from-primary-50 via-white to-primary-50 dark:from-primary-950/20 dark:via-gray-900 dark:to-primary-950/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <ScanLine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Label Analyzer
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {getModeDescription(scanMode)}
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Select Scan Mode</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setScanMode('supplement');
              setImage(null);
              setResult(null);
            }}
            className={`p-4 rounded-xl border-2 transition-all ${
              scanMode === 'supplement'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Pill className={`w-8 h-8 ${scanMode === 'supplement' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'}`} />
              <span className={`font-semibold ${scanMode === 'supplement' ? 'text-primary-900 dark:text-primary-100' : 'text-gray-700 dark:text-gray-300'}`}>
                Supplement Label
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Blood type compatibility
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              setScanMode('pantry');
              setImage(null);
              setResult(null);
            }}
            className={`p-4 rounded-xl border-2 transition-all ${
              scanMode === 'pantry'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Package className={`w-8 h-8 ${scanMode === 'pantry' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'}`} />
              <span className={`font-semibold ${scanMode === 'pantry' ? 'text-primary-900 dark:text-primary-100' : 'text-gray-700 dark:text-gray-300'}`}>
                Pantry Scan
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Identify foods in pantry
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              setScanMode('grocery');
              setImage(null);
              setResult(null);
            }}
            className={`p-4 rounded-xl border-2 transition-all ${
              scanMode === 'grocery'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <ShoppingCart className={`w-8 h-8 ${scanMode === 'grocery' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'}`} />
              <span className={`font-semibold ${scanMode === 'grocery' ? 'text-primary-900 dark:text-primary-100' : 'text-gray-700 dark:text-gray-300'}`}>
                Grocery Label
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Harmful ingredient check
              </span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Upload or Capture Image
            </h2>

            {!showCamera && !image && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary flex flex-col items-center gap-2 py-6"
                  >
                    <Upload className="w-6 h-6" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    onClick={startCamera}
                    className="btn btn-primary flex flex-col items-center gap-2 py-6"
                  >
                    <Camera className="w-6 h-6" />
                    <span>Take Photo</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {showCamera && (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full"
                  />
                  <div className="absolute inset-0 border-4 border-primary-500 rounded-xl pointer-events-none" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={capturePhoto}
                    className="btn btn-primary flex-1"
                  >
                    Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {image && !showCamera && (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <img src={image} alt="Scan target" className="w-full" />
                  <button
                    onClick={() => {
                      setImage(null);
                      setResult(null);
                    }}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze {scanMode === 'supplement' ? 'Label' : scanMode === 'pantry' ? 'Pantry' : 'Product'}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        <div className="space-y-4">
          {result && scanMode === 'supplement' && 'bloodTypeConflicts' in result && (
            <div className="card p-6 space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                Supplement Analysis
              </h2>

              {result.safetyFlags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Safety Flags</h3>
                  {result.safetyFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl flex items-start gap-3 ${
                        flag.level === 'danger'
                          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                          : flag.level === 'warning'
                          ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                          : flag.level === 'caution'
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                          : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      }`}
                    >
                      {getSafetyIcon(flag.level)}
                      <p className="text-sm flex-1 text-gray-700 dark:text-gray-300">{flag.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.bloodTypeConflicts.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <h3 className="font-semibold mb-3 text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Blood Type Conflicts
                  </h3>
                  <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 space-y-1">
                    {result.bloodTypeConflicts.map((conflict, idx) => (
                      <li key={idx}>{conflict}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.additives.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Detected Additives</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.additives.map((additive, idx) => (
                      <span
                        key={idx}
                        className="badge badge-primary text-xs px-3 py-1.5"
                      >
                        {additive}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Recommendations</h3>
                  <ul className="list-disc list-inside text-sm space-y-2 text-gray-700 dark:text-gray-300">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  ⚠️ This analysis is for informational purposes only. Always consult with your healthcare provider before taking supplements or medications.
                </p>
              </div>
            </div>
          )}

          {result && scanMode === 'pantry' && 'identifiedFoods' in result && (
            <div className="card p-6 space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                Identified Foods ({result.totalItemsFound})
              </h2>

              <div className="space-y-3">
                {result.identifiedFoods.map((food) => (
                  <div
                    key={food.id}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{food.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                            {food.category}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {food.confidence}% confidence
                          </span>
                        </div>
                        {food.estimatedQuantity && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Qty: {food.estimatedQuantity}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddFoodToGuide(food)}
                        disabled={food.addedToFoodGuide}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          food.addedToFoodGuide
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-primary-500 hover:bg-primary-600 text-white'
                        }`}
                      >
                        {food.addedToFoodGuide ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            Added
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Plus className="w-4 h-4" />
                            Add
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {result.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Recommendations</h3>
                  <ul className="list-disc list-inside text-sm space-y-2 text-gray-700 dark:text-gray-300">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {result && scanMode === 'grocery' && 'harmfulIngredients' in result && (
            <div className="card p-6 space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  Grocery Product Analysis
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{result.productName}</p>
              </div>

              {/* Health Score */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">Health Score</span>
                  <span className={`text-2xl font-bold ${
                    result.healthScore >= 80 ? 'text-green-500' :
                    result.healthScore >= 60 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {result.healthScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      result.healthScore >= 80 ? 'bg-green-500' :
                      result.healthScore >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${result.healthScore}%` }}
                  />
                </div>
              </div>

              {result.safetyFlags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Safety Flags</h3>
                  {result.safetyFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl flex items-start gap-3 ${
                        flag.level === 'danger'
                          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                          : flag.level === 'warning'
                          ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                          : flag.level === 'caution'
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                          : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      }`}
                    >
                      {getSafetyIcon(flag.level)}
                      <p className="text-sm flex-1 text-gray-700 dark:text-gray-300">{flag.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.harmfulIngredients.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                    Concerning Ingredients ({result.harmfulIngredients.length})
                  </h3>
                  <div className="space-y-2">
                    {result.harmfulIngredients.map((ingredient, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${
                          ingredient.severity === 'high'
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : ingredient.severity === 'moderate'
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-white">{ingredient.name}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{ingredient.reason}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            ingredient.severity === 'high'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              : ingredient.severity === 'moderate'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {ingredient.severity}
                          </span>
                        </div>
                        {ingredient.bloodTypeConflicts && ingredient.bloodTypeConflicts.length > 0 && (
                          <div className="mt-2 flex items-center gap-1 flex-wrap">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Blood type conflicts:</span>
                            {ingredient.bloodTypeConflicts.map((bt, btIdx) => (
                              <span key={btIdx} className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                {bt}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Recommendations</h3>
                  <ul className="list-disc list-inside text-sm space-y-2 text-gray-700 dark:text-gray-300">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Previous Scans */}
          {scanMode === 'supplement' && labelAnalyses.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Previous Analyses</h2>
              <div className="space-y-2">
                {labelAnalyses.slice(-5).reverse().map((analysis, idx) => (
                  <button
                    key={analysis.id}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left animate-fade-in"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    onClick={() => setResult(analysis)}
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {analysis.safetyFlags.length} flag{analysis.safetyFlags.length !== 1 ? 's' : ''}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {scanMode === 'pantry' && pantryScans.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Previous Pantry Scans</h2>
              <div className="space-y-2">
                {pantryScans.slice(-5).reverse().map((scan, idx) => (
                  <button
                    key={scan.id}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left animate-fade-in"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    onClick={() => setResult(scan)}
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {new Date(scan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {scan.totalItemsFound} item{scan.totalItemsFound !== 1 ? 's' : ''} found
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {scanMode === 'grocery' && groceryScans.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Previous Grocery Scans</h2>
              <div className="space-y-2">
                {groceryScans.slice(-5).reverse().map((scan, idx) => (
                  <button
                    key={scan.id}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left animate-fade-in"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    onClick={() => setResult(scan)}
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {scan.productName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Health Score: {scan.healthScore}/100
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
