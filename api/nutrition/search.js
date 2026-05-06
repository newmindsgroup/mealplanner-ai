/**
 * Vercel Serverless Function — USDA FoodData Central Proxy
 * 
 * Searches the USDA FoodData Central database (800K+ foods)
 * for nutrition information. 100% free, no cost.
 * 
 * GET  /api/nutrition/search?q=chicken+breast&pageSize=10
 * GET  /api/nutrition/search?fdcId=171705  (direct lookup)
 * 
 * Requires USDA_API_KEY environment variable (free at api.data.gov)
 */

export const config = {
  runtime: 'edge',
};

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

export default async function handler(req) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  const fdcId = url.searchParams.get('fdcId');
  const pageSize = Math.min(parseInt(url.searchParams.get('pageSize') || '10'), 25);
  const dataType = url.searchParams.get('dataType') || 'Foundation,SR Legacy';

  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    return jsonResponse({
      success: false,
      error: 'USDA API key not configured. Get a free key at api.data.gov',
    }, 503);
  }

  try {
    // Direct FDC ID lookup
    if (fdcId) {
      const response = await fetch(
        `${USDA_BASE}/food/${fdcId}?api_key=${apiKey}&format=abridged`,
      );

      if (!response.ok) {
        return jsonResponse({ success: false, error: 'Food not found' }, 404);
      }

      const data = await response.json();
      return jsonResponse({
        success: true,
        data: formatFoodItem(data),
      });
    }

    // Search
    if (!query) {
      return jsonResponse({
        success: false,
        error: 'Query parameter "q" or "fdcId" is required',
      }, 400);
    }

    const response = await fetch(`${USDA_BASE}/foods/search?api_key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        pageSize,
        dataType: dataType.split(','),
        sortBy: 'dataType.keyword',
        sortOrder: 'asc',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return jsonResponse({
        success: false,
        error: errorData.message || `USDA API error: ${response.status}`,
      }, response.status);
    }

    const data = await response.json();

    return jsonResponse({
      success: true,
      totalHits: data.totalHits,
      data: (data.foods || []).map(formatSearchResult),
    });
  } catch (error) {
    console.error('[USDA Proxy Error]', error);
    return jsonResponse({
      success: false,
      error: 'Failed to fetch nutrition data',
    }, 500);
  }
}

// ─── Data Formatters ───────────────────────────────────────────────────────────

function formatSearchResult(food) {
  const nutrients = {};
  (food.foodNutrients || []).forEach(n => {
    const name = n.nutrientName?.toLowerCase() || '';
    if (name.includes('energy') && n.unitName === 'KCAL') nutrients.calories = n.value;
    else if (name.includes('protein')) nutrients.protein = n.value;
    else if (name.includes('carbohydrate')) nutrients.carbs = n.value;
    else if (name.includes('total lipid') || name === 'fat') nutrients.fat = n.value;
    else if (name.includes('fiber')) nutrients.fiber = n.value;
    else if (name.includes('sugars') && !name.includes('added')) nutrients.sugar = n.value;
    else if (name.includes('sodium')) nutrients.sodium = n.value;
    else if (name.includes('cholesterol')) nutrients.cholesterol = n.value;
    // Vitamins & Minerals
    else if (name.includes('vitamin c')) nutrients.vitaminC = n.value;
    else if (name.includes('vitamin d')) nutrients.vitaminD = n.value;
    else if (name.includes('vitamin a')) nutrients.vitaminA = n.value;
    else if (name.includes('vitamin b-12')) nutrients.vitaminB12 = n.value;
    else if (name.includes('vitamin b-6')) nutrients.vitaminB6 = n.value;
    else if (name.includes('iron')) nutrients.iron = n.value;
    else if (name.includes('calcium')) nutrients.calcium = n.value;
    else if (name.includes('potassium')) nutrients.potassium = n.value;
    else if (name.includes('magnesium')) nutrients.magnesium = n.value;
    else if (name.includes('zinc')) nutrients.zinc = n.value;
    else if (name.includes('folate')) nutrients.folate = n.value;
    else if (name === 'selenium, se') nutrients.selenium = n.value;
  });

  return {
    fdcId: food.fdcId,
    name: food.description,
    brand: food.brandOwner || food.brandName || null,
    dataType: food.dataType,
    category: food.foodCategory || null,
    servingSize: food.servingSize || 100,
    servingUnit: food.servingSizeUnit || 'g',
    nutrients,
  };
}

function formatFoodItem(food) {
  const nutrients = {};
  (food.foodNutrients || []).forEach(n => {
    const nutrient = n.nutrient || {};
    const name = nutrient.name?.toLowerCase() || '';
    const value = n.amount;
    const unit = nutrient.unitName;

    if (name.includes('energy') && unit === 'kcal') nutrients.calories = value;
    else if (name.includes('protein')) nutrients.protein = value;
    else if (name.includes('carbohydrate')) nutrients.carbs = value;
    else if (name.includes('total lipid')) nutrients.fat = value;
    else if (name.includes('fiber')) nutrients.fiber = value;
    else if (name.includes('sugars')) nutrients.sugar = value;
    else if (name.includes('sodium')) nutrients.sodium = value;
    else if (name.includes('vitamin c')) nutrients.vitaminC = value;
    else if (name.includes('vitamin d')) nutrients.vitaminD = value;
    else if (name.includes('iron')) nutrients.iron = value;
    else if (name.includes('calcium')) nutrients.calcium = value;
    else if (name.includes('potassium')) nutrients.potassium = value;
  });

  return {
    fdcId: food.fdcId,
    name: food.description,
    dataType: food.dataType,
    category: food.foodCategory?.description || null,
    nutrients,
    portions: (food.foodPortions || []).map(p => ({
      amount: p.amount,
      unit: p.modifier || p.measureUnit?.name,
      gramWeight: p.gramWeight,
    })),
  };
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600', // Cache food data for 1 hour
    },
  });
}
