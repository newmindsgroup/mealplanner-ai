/**
 * Vercel Serverless Function — Open Food Facts Barcode Proxy
 * 
 * Looks up product data by barcode from Open Food Facts (3M+ products).
 * 100% free, no API key needed, open database.
 * 
 * GET /api/nutrition/barcode/[barcode]
 * Example: /api/nutrition/barcode/3017624010701
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  // Extract barcode from path: /api/nutrition/barcode/3017624010701
  const pathParts = url.pathname.split('/');
  const barcode = pathParts[pathParts.length - 1];

  if (!barcode || barcode === '[barcode]' || barcode.length < 6) {
    return jsonResponse({
      success: false,
      error: 'Valid barcode is required',
    }, 400);
  }

  try {
    const response = await fetch(
      `https://world.openfoodfacts.net/api/v2/product/${barcode}?fields=product_name,brands,categories_tags,generic_name,image_url,nutriments,serving_size,ingredients_text,allergens_tags,labels_tags,nutriscore_grade,ecoscore_grade,nova_group,additives_tags`,
      {
        headers: {
          'User-Agent': 'MealPlanAssistant/1.0 (info@newmindsgroup.com)',
        },
      }
    );

    if (!response.ok) {
      return jsonResponse({
        success: false,
        error: `Open Food Facts error: ${response.status}`,
      }, response.status);
    }

    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return jsonResponse({
        success: false,
        error: 'Product not found in database',
        barcode,
      }, 404);
    }

    const product = data.product;
    const n = product.nutriments || {};

    return jsonResponse({
      success: true,
      data: {
        barcode,
        name: product.product_name || 'Unknown Product',
        brand: product.brands || null,
        category: product.categories_tags?.[0]?.replace('en:', '') || null,
        description: product.generic_name || null,
        imageUrl: product.image_url || null,
        servingSize: product.serving_size || null,
        
        // Nutrition per 100g
        nutrients: {
          calories: n['energy-kcal_100g'] || n['energy-kcal'] || null,
          protein: n.proteins_100g || n.proteins || null,
          carbs: n.carbohydrates_100g || n.carbohydrates || null,
          fat: n.fat_100g || n.fat || null,
          fiber: n.fiber_100g || n.fiber || null,
          sugar: n.sugars_100g || n.sugars || null,
          sodium: n.sodium_100g || n.sodium || null,
          saturatedFat: n['saturated-fat_100g'] || null,
          salt: n.salt_100g || null,
        },

        // Per serving (if available)
        nutrientsPerServing: {
          calories: n['energy-kcal_serving'] || null,
          protein: n.proteins_serving || null,
          carbs: n.carbohydrates_serving || null,
          fat: n.fat_serving || null,
        },

        // Quality scores
        scores: {
          nutriScore: product.nutriscore_grade || null,  // A-E
          ecoScore: product.ecoscore_grade || null,       // A-E
          novaGroup: product.nova_group || null,           // 1-4 (processing level)
        },

        // Safety data
        ingredients: product.ingredients_text || null,
        allergens: (product.allergens_tags || []).map(a => a.replace('en:', '')),
        additives: (product.additives_tags || []).map(a => a.replace('en:', '')),
        labels: (product.labels_tags || []).map(l => l.replace('en:', '')),

        source: 'openfoodfacts',
      },
    });
  } catch (error) {
    console.error('[Barcode Proxy Error]', error);
    return jsonResponse({
      success: false,
      error: 'Failed to fetch product data',
    }, 500);
  }
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400', // Cache barcode data for 24 hours
    },
  });
}
