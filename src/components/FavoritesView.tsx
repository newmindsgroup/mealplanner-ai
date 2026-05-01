import { Heart, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import MealCard from './MealCard';

export default function FavoritesView() {
  const { favoriteMeals, toggleFavorite } = useStore();

  if (favoriteMeals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-400/20 blur-3xl rounded-full"></div>
            <Heart className="w-20 h-20 text-red-500 dark:text-red-400 relative z-10 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            No Favorites Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            Start favoriting meals from your weekly plan to see them here! Your favorite meals will be saved for easy access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-elevated p-6 bg-gradient-to-r from-red-50 via-white to-red-50 dark:from-red-950/20 dark:via-gray-900 dark:to-red-950/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Favorite Meals
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {favoriteMeals.length} favorite meal{favoriteMeals.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {favoriteMeals.map((meal, index) => (
          <div key={meal.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
            <MealCard
              meal={meal}
              mealType={meal.type}
              isFavorite={true}
              onToggleFavorite={() => toggleFavorite(meal)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
