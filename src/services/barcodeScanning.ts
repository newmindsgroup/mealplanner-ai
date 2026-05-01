import type { BarcodeScanResult, ProductInfo, FoodCategory } from '../types';
import { getAIService } from './aiService';

// Lazy-load barcode reader to avoid import errors if package not installed
let codeReaderInstance: any = null;
let zxingLibrary: any = null;

async function getCodeReader() {
  if (codeReaderInstance) {
    return codeReaderInstance;
  }

  try {
    // Dynamically import @zxing/library using a constructed path to avoid Vite static analysis
    const moduleName = '@zxing/library';
    // Use Function constructor to create truly dynamic import that Vite won't analyze
    const dynamicImport = new Function('moduleName', 'return import(moduleName)');
    zxingLibrary = await dynamicImport(moduleName);
    
    // Initialize barcode reader with multiple format support
    const hints = new Map();
    hints.set(zxingLibrary.DecodeHintType.POSSIBLE_FORMATS, [
      zxingLibrary.BarcodeFormat.QR_CODE,
      zxingLibrary.BarcodeFormat.EAN_13,
      zxingLibrary.BarcodeFormat.EAN_8,
      zxingLibrary.BarcodeFormat.UPC_A,
      zxingLibrary.BarcodeFormat.UPC_E,
      zxingLibrary.BarcodeFormat.CODE_128,
      zxingLibrary.BarcodeFormat.CODE_39,
    ]);

    codeReaderInstance = new zxingLibrary.BrowserMultiFormatReader(hints);
    return codeReaderInstance;
  } catch (error) {
    console.warn('⚠️ @zxing/library not installed. Barcode scanning features will be unavailable.');
    console.warn('To enable barcode scanning, run: npm install @zxing/library @zxing/browser');
    throw new Error('Barcode scanning library not installed. Please install @zxing/library and @zxing/browser packages.');
  }
}

/**
 * Scan barcode from video stream
 */
export async function scanBarcodeFromVideo(videoElement: HTMLVideoElement): Promise<BarcodeScanResult> {
  const codeReader = await getCodeReader();
  
  try {
    const result = await codeReader.decodeFromVideoElement(videoElement);
    
    const barcodeScanResult: BarcodeScanResult = {
      barcode: result.getText(),
      format: result.getBarcodeFormat().toString(),
      scanDate: new Date().toISOString(),
    };

    // Attempt to fetch product information
    const productInfo = await fetchProductInfo(barcodeScanResult.barcode);
    if (productInfo) {
      barcodeScanResult.productInfo = productInfo;
    }

    return barcodeScanResult;
  } catch (error) {
    console.error('Barcode scanning error:', error);
    throw new Error('Failed to scan barcode. Please try again or use image upload.');
  }
}

/**
 * Scan barcode from image file
 */
export async function scanBarcodeFromImage(imageDataUrl: string): Promise<BarcodeScanResult> {
  const codeReader = await getCodeReader();
  
  try {
    const img = new Image();
    img.src = imageDataUrl;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const result = await codeReader.decodeFromImageElement(img);
    
    const barcodeScanResult: BarcodeScanResult = {
      barcode: result.getText(),
      format: result.getBarcodeFormat().toString(),
      scanDate: new Date().toISOString(),
    };

    // Attempt to fetch product information
    const productInfo = await fetchProductInfo(barcodeScanResult.barcode);
    if (productInfo) {
      barcodeScanResult.productInfo = productInfo;
    }

    return barcodeScanResult;
  } catch (error) {
    console.error('Barcode image scanning error:', error);
    throw new Error('No barcode detected in image. Please try a clearer photo.');
  }
}

/**
 * Reset barcode reader
 */
export function stopBarcodeScanning() {
  if (codeReaderInstance) {
    codeReaderInstance.reset();
  }
}

/**
 * Fetch product information from Open Food Facts API
 */
async function fetchProductInfo(barcode: string): Promise<ProductInfo | null> {
  try {
    // Try Open Food Facts first
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    
    if (!response.ok) {
      console.warn('Product not found in Open Food Facts, trying AI fallback');
      return await fetchProductInfoWithAI(barcode);
    }

    const data = await response.json();
    
    if (data.status === 1 && data.product) {
      const product = data.product;
      
      return {
        name: product.product_name || 'Unknown Product',
        brand: product.brands || undefined,
        category: mapCategoryToFoodCategory(product.categories_tags),
        description: product.generic_name || product.product_name || undefined,
        imageUrl: product.image_url || undefined,
        nutritionalInfo: {
          servingSize: product.serving_size || undefined,
          calories: product.nutriments?.['energy-kcal'] || undefined,
          protein: product.nutriments?.proteins || undefined,
          carbs: product.nutriments?.carbohydrates || undefined,
          fats: product.nutriments?.fat || undefined,
          fiber: product.nutriments?.fiber || undefined,
          sodium: product.nutriments?.sodium || undefined,
          sugar: product.nutriments?.sugars || undefined,
        },
        ingredients: product.ingredients_text ? [product.ingredients_text] : undefined,
        allergens: product.allergens_tags || undefined,
        certifications: [
          ...(product.labels_tags || []),
          ...(product.quality_tags || []),
        ].filter(Boolean),
        shelfLife: estimateShelfLife(product.categories_tags),
        storageLocation: estimateStorageLocation(product.categories_tags),
        source: 'openfoodfacts',
        confidence: 95,
      };
    }

    // If not found in Open Food Facts, try AI
    return await fetchProductInfoWithAI(barcode);
  } catch (error) {
    console.error('Error fetching product info:', error);
    // Fallback to AI
    return await fetchProductInfoWithAI(barcode);
  }
}

/**
 * Use AI to generate product information when database lookup fails
 */
async function fetchProductInfoWithAI(barcode: string): Promise<ProductInfo | null> {
  const aiService = getAIService();
  
  if (!aiService) {
    return null;
  }

  try {
    const prompt = `A barcode scanner detected this code: ${barcode}
    
Based on the barcode format and typical product patterns, what product might this be?
Provide your best educated guess about:
1. Product name
2. Brand (if identifiable)
3. Category (proteins, vegetables, fruits, grains, dairy, oils, nuts-seeds, beverages, spices, sweeteners)
4. Typical nutritional information per serving
5. Common storage location (pantry, refrigerator, freezer)
6. Estimated shelf life in days

Return a JSON object with this structure:
{
  "name": "Product name",
  "brand": "Brand name or null",
  "category": "category",
  "description": "Brief description",
  "nutritionalInfo": {
    "servingSize": "1 serving",
    "calories": 100,
    "protein": 5,
    "carbs": 20,
    "fats": 3,
    "fiber": 2
  },
  "storageLocation": "pantry",
  "shelfLife": 365,
  "confidence": 50
}

Note: Set confidence between 0-100 (low confidence since we're guessing). Return null values for unknown fields.`;

    const response = await aiService.chat([
      {
        role: 'system',
        content: 'You are a product identification assistant. Make educated guesses about products based on barcode patterns, but be honest about confidence levels.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.5,
      maxTokens: 500,
    });

    // Parse AI response
    let jsonString = response.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const productData = JSON.parse(jsonString);
    
    return {
      name: productData.name || 'Unknown Product',
      brand: productData.brand || undefined,
      category: productData.category as FoodCategory,
      description: productData.description || undefined,
      nutritionalInfo: productData.nutritionalInfo || undefined,
      storageLocation: productData.storageLocation || 'pantry',
      shelfLife: productData.shelfLife || undefined,
      source: 'ai-generated',
      confidence: productData.confidence || 30,
    };
  } catch (error) {
    console.error('AI product info error:', error);
    return null;
  }
}

/**
 * Map Open Food Facts category to our food categories
 */
function mapCategoryToFoodCategory(categoriesTags: string[] | undefined): FoodCategory {
  if (!categoriesTags || categoriesTags.length === 0) {
    return 'proteins'; // default
  }

  const tags = categoriesTags.join(' ').toLowerCase();

  if (tags.includes('meat') || tags.includes('fish') || tags.includes('seafood') || 
      tags.includes('poultry') || tags.includes('eggs') || tags.includes('protein')) {
    return 'proteins';
  }
  
  if (tags.includes('vegetable') || tags.includes('salad') || tags.includes('legume')) {
    return 'vegetables';
  }
  
  if (tags.includes('fruit') || tags.includes('berries')) {
    return 'fruits';
  }
  
  if (tags.includes('grain') || tags.includes('bread') || tags.includes('pasta') || 
      tags.includes('rice') || tags.includes('cereal') || tags.includes('flour')) {
    return 'grains';
  }
  
  if (tags.includes('dairy') || tags.includes('milk') || tags.includes('cheese') || 
      tags.includes('yogurt') || tags.includes('cream')) {
    return 'dairy';
  }
  
  if (tags.includes('oil') || tags.includes('fat') || tags.includes('butter')) {
    return 'oils';
  }
  
  if (tags.includes('nut') || tags.includes('seed') || tags.includes('almond') || 
      tags.includes('walnut')) {
    return 'nuts-seeds';
  }
  
  if (tags.includes('beverage') || tags.includes('drink') || tags.includes('juice') || 
      tags.includes('water') || tags.includes('tea') || tags.includes('coffee')) {
    return 'beverages';
  }
  
  if (tags.includes('spice') || tags.includes('herb') || tags.includes('seasoning') || 
      tags.includes('condiment')) {
    return 'spices';
  }
  
  if (tags.includes('sugar') || tags.includes('honey') || tags.includes('sweetener') || 
      tags.includes('syrup')) {
    return 'sweeteners';
  }

  return 'proteins'; // default fallback
}

/**
 * Estimate shelf life based on category
 */
function estimateShelfLife(categoriesTags: string[] | undefined): number {
  if (!categoriesTags) return 365;

  const tags = categoriesTags.join(' ').toLowerCase();

  if (tags.includes('fresh') || tags.includes('produce')) return 7;
  if (tags.includes('dairy') || tags.includes('milk')) return 14;
  if (tags.includes('meat') || tags.includes('fish')) return 3;
  if (tags.includes('bread')) return 7;
  if (tags.includes('frozen')) return 180;
  if (tags.includes('canned')) return 730;
  if (tags.includes('dried')) return 365;

  return 180; // default: 6 months
}

/**
 * Estimate storage location based on category
 */
function estimateStorageLocation(categoriesTags: string[] | undefined): import('../types').StorageLocation {
  if (!categoriesTags) return 'pantry';

  const tags = categoriesTags.join(' ').toLowerCase();

  if (tags.includes('frozen')) return 'freezer';
  if (tags.includes('fresh') || tags.includes('produce') || tags.includes('dairy') || 
      tags.includes('meat') || tags.includes('fish')) return 'refrigerator';
  
  return 'pantry';
}

/**
 * Batch scan multiple barcodes from a single image
 */
export async function batchScanBarcodes(imageDataUrl: string): Promise<BarcodeScanResult[]> {
  try {
    const codeReader = await getCodeReader();
    
    const img = new Image();
    img.src = imageDataUrl;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // For now, ZXing doesn't support multi-barcode detection easily
    // We'll scan for one barcode and return it in an array
    // Future enhancement: Use a library that supports multiple barcode detection
    const result = await codeReader.decodeFromImageElement(img);
    
    const barcodeScanResult: BarcodeScanResult = {
      barcode: result.getText(),
      format: result.getBarcodeFormat().toString(),
      scanDate: new Date().toISOString(),
    };

    const productInfo = await fetchProductInfo(barcodeScanResult.barcode);
    if (productInfo) {
      barcodeScanResult.productInfo = productInfo;
    }

    return [barcodeScanResult];
  } catch (error) {
    console.error('Batch barcode scanning error:', error);
    return [];
  }
}

