import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Scan, Check, AlertCircle, Edit2, Package } from 'lucide-react';
import { scanBarcodeFromVideo, scanBarcodeFromImage, stopBarcodeScanning } from '../../services/barcodeScanning';
import { enrichItemFromBarcode } from '../../services/pantryService';
import type { BarcodeScanResult, PantryItem } from '../../types';
import LoadingSpinner from '../LoadingSpinner';

interface BarcodeScannerProps {
  onScanComplete: (result: BarcodeScanResult) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScanComplete, onClose }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [enrichedData, setEnrichedData] = useState<Partial<PantryItem> | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [loadingEnrichment, setLoadingEnrichment] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanningRef = useRef(false);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopCamera();
      stopBarcodeScanning();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setShowCamera(true);
        
        // Start continuous scanning
        startContinuousScanning();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions or try uploading an image.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    scanningRef.current = false;
    stopBarcodeScanning();
  };

  const handleBarcodeScanned = async (result: BarcodeScanResult) => {
    setSuccess(true);
    setScanning(false);
    scanningRef.current = false;
    setScannedBarcode(result.barcode);
    
    // Stop camera
    stopCamera();
    
    // Fetch enriched product data
    setLoadingEnrichment(true);
    try {
      const productData = await enrichItemFromBarcode(result.barcode);
      setEnrichedData(productData);
      setShowPreview(true);
    } catch (error) {
      console.error('Error enriching product data:', error);
      // If enrichment fails, just pass the barcode result
      onScanComplete(result);
    } finally {
      setLoadingEnrichment(false);
    }
  };

  const startContinuousScanning = async () => {
    if (!videoRef.current || scanningRef.current) return;
    
    scanningRef.current = true;
    setScanning(true);

    const attemptScan = async () => {
      if (!scanningRef.current || !videoRef.current) return;

      try {
        const result = await scanBarcodeFromVideo(videoRef.current);
        await handleBarcodeScanned(result);
      } catch (err) {
        // Continue scanning if no barcode found
        if (scanningRef.current) {
          setTimeout(attemptScan, 300); // Try again in 300ms
        }
      }
    };

    attemptScan();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setScanning(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const imageDataUrl = event.target?.result as string;
          const result = await scanBarcodeFromImage(imageDataUrl);
          await handleBarcodeScanned(result);
        } catch (err) {
          setScanning(false);
          setError(err instanceof Error ? err.message : 'Failed to scan barcode from image');
        }
      };
      reader.onerror = () => {
        setScanning(false);
        setError('Failed to read image file');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setScanning(false);
      setError('Failed to process image');
    }
  };

  const handleUseProductData = () => {
    // Pass the barcode result with enriched data
    onScanComplete({
      barcode: scannedBarcode,
      productInfo: enrichedData ? {
        name: enrichedData.name || '',
        brand: enrichedData.brand,
        category: enrichedData.category,
        nutritionalInfo: enrichedData.nutritionalInfo,
        storageLocation: enrichedData.location,
        imageUrl: enrichedData.imageUrl,
        allergens: enrichedData.allergens,
        ingredients: enrichedData.ingredients,
      } : undefined,
    });
  };

  const handleSkipPreview = () => {
    // Just pass the barcode without enriched data
    onScanComplete({
      barcode: scannedBarcode,
    });
  };

  // Show preview if we have enriched data
  if (showPreview && enrichedData) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="card p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product Found</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Review product information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Product Image */}
          {enrichedData.imageUrl && (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <img 
                src={enrichedData.imageUrl} 
                alt={enrichedData.name || 'Product'} 
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Product Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {enrichedData.name && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{enrichedData.name}</p>
                </div>
              )}

              {enrichedData.brand && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
                  <p className="text-gray-900 dark:text-white mt-1">{enrichedData.brand}</p>
                </div>
              )}

              {enrichedData.category && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <p className="text-gray-900 dark:text-white mt-1 capitalize">{enrichedData.category}</p>
                </div>
              )}

              {scannedBarcode && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Barcode</label>
                  <p className="font-mono text-gray-900 dark:text-white mt-1">{scannedBarcode}</p>
                </div>
              )}
            </div>

            {/* Allergens */}
            {enrichedData.allergens && enrichedData.allergens.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allergens</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {enrichedData.allergens.map((allergen, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            {enrichedData.ingredients && enrichedData.ingredients.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ingredients</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {enrichedData.ingredients.join(', ')}
                </p>
              </div>
            )}

            {/* Nutritional Info */}
            {enrichedData.nutritionalInfo && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Nutritional Information
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {enrichedData.nutritionalInfo.calories && (
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Calories</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {enrichedData.nutritionalInfo.calories}
                      </p>
                    </div>
                  )}
                  {enrichedData.nutritionalInfo.protein && (
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Protein</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {enrichedData.nutritionalInfo.protein}g
                      </p>
                    </div>
                  )}
                  {enrichedData.nutritionalInfo.carbs && (
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Carbs</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {enrichedData.nutritionalInfo.carbs}g
                      </p>
                    </div>
                  )}
                  {enrichedData.nutritionalInfo.fats && (
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Fats</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {enrichedData.nutritionalInfo.fats}g
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleUseProductData}
              className="btn btn-primary flex-1 gap-2"
            >
              <Check className="w-5 h-5" />
              Use This Info
            </button>
            <button
              onClick={handleSkipPreview}
              className="btn btn-secondary gap-2"
            >
              <Edit2 className="w-5 h-5" />
              Edit Manually
            </button>
          </div>

          {/* Info note */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 You can edit all fields after adding this item to your pantry.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card p-6 max-w-2xl w-full space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Scan className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Scan Barcode</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scan product barcode or QR code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Loading Enrichment State */}
        {loadingEnrichment && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Fetching product information...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">Scanning Error</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              Barcode scanned successfully!
            </p>
          </div>
        )}

        {/* Camera View */}
        {showCamera && (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-64 h-48">
                  {/* Scanning frame */}
                  <div className="absolute inset-0 border-2 border-primary-500 rounded-lg"></div>
                  
                  {/* Corner indicators */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-400 rounded-br-lg"></div>
                  
                  {/* Scanning line animation */}
                  {scanning && !success && (
                    <div className="absolute inset-x-0 h-0.5 bg-primary-400 animate-scan"></div>
                  )}
                </div>
              </div>

              {/* Status overlay */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                <div className="px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm">
                  <p className="text-sm text-white font-medium">
                    {scanning && !success ? 'Scanning...' : 'Position barcode in frame'}
                  </p>
                </div>
                {scanning && !success && (
                  <div className="px-3 py-2 rounded-lg bg-primary-500">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={stopCamera}
              className="btn btn-secondary w-full"
            >
              Cancel Camera
            </button>
          </div>
        )}

        {/* Action Buttons */}
        {!showCamera && !success && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={scanning}
              className="btn btn-secondary flex flex-col items-center gap-3 py-8"
            >
              <Upload className="w-8 h-8" />
              <div>
                <div className="font-semibold">Upload Image</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Select barcode photo
                </div>
              </div>
            </button>
            
            <button
              onClick={startCamera}
              disabled={scanning}
              className="btn btn-primary flex flex-col items-center gap-3 py-8"
            >
              <Camera className="w-8 h-8" />
              <div>
                <div className="font-semibold">Scan with Camera</div>
                <div className="text-xs text-primary-100 mt-1">
                  Real-time scanning
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Loading State */}
        {scanning && !showCamera && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Processing barcode...
              </p>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Instructions */}
        {!showCamera && !scanning && !success && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Tips for best results:
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>Ensure good lighting</li>
              <li>Hold camera steady and close to barcode</li>
              <li>Make sure barcode is fully visible and in focus</li>
              <li>Works with UPC, EAN, QR codes, and more</li>
            </ul>
          </div>
        )}
      </div>

      {/* Custom animation for scanning line */}
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

