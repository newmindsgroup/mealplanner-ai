import { useState } from 'react';
import { 
  Package, Edit2, Trash2, Plus, Minus, AlertCircle, 
  Clock, MapPin, Tag, MoreVertical, Check
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { PantryItem } from '../../types';
import { format } from 'date-fns';

interface PantryItemCardProps {
  item: PantryItem;
  viewMode: 'grid' | 'list';
  style?: React.CSSProperties;
}

export default function PantryItemCard({ item, viewMode, style }: PantryItemCardProps) {
  const { updatePantryItem, removePantryItem, adjustPantryQuantity } = useStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isLowStock = item.quantity <= item.lowStockThreshold;
  const isExpiringSoon = item.expirationDate && 
    new Date(item.expirationDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 &&
    new Date(item.expirationDate).getTime() > Date.now();
  const isExpired = item.expirationDate && 
    new Date(item.expirationDate).getTime() < Date.now();

  const daysUntilExpiration = item.expirationDate
    ? Math.ceil((new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const handleQuickAdjust = (amount: number) => {
    adjustPantryQuantity(item.id, amount);
  };

  const handleDelete = () => {
    if (confirm(`Remove "${item.name}" from pantry?`)) {
      removePantryItem(item.id);
    }
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="card p-4 hover:shadow-md transition-all animate-fade-in"
        style={style}
      >
        <div className="flex items-center gap-4">
          {/* Image/Icon */}
          <div className="flex-shrink-0">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Package className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {item.name}
                </h3>
                {item.brand && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.brand}</p>
                )}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickAdjust(-1)}
                  disabled={item.quantity === 0}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold text-lg px-2">
                  {item.quantity} {item.unit}
                </span>
                <button
                  onClick={() => handleQuickAdjust(1)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="badge badge-secondary text-xs">
                {item.category}
              </span>
              <span className="badge badge-secondary text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {item.location}
              </span>
              
              {isExpired && (
                <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs">
                  Expired
                </span>
              )}
              
              {isExpiringSoon && !isExpired && (
                <span className="badge bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs">
                  {daysUntilExpiration}d left
                </span>
              )}
              
              {isLowStock && (
                <span className="badge bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-xs">
                  Low Stock
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div 
      className="card p-4 hover:shadow-md transition-all animate-fade-in group"
      style={style}
    >
      {/* Image/Icon */}
      <div className="relative mb-3">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className="w-full h-32 rounded-lg object-cover"
          />
        ) : (
          <div className="w-full h-32 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
            <Package className="w-12 h-12 text-primary-600 dark:text-primary-400" />
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {isExpired && (
            <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs font-medium">
              Expired
            </span>
          )}
          {isExpiringSoon && !isExpired && (
            <span className="px-2 py-1 rounded-full bg-yellow-500 text-white text-xs font-medium">
              {daysUntilExpiration}d
            </span>
          )}
          {isLowStock && (
            <span className="px-2 py-1 rounded-full bg-orange-500 text-white text-xs font-medium">
              Low
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
            {item.name}
          </h3>
          {item.brand && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.brand}</p>
          )}
        </div>

        {/* Quantity */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <button
            onClick={() => handleQuickAdjust(-1)}
            disabled={item.quantity === 0}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-semibold">
            {item.quantity} {item.unit}
          </span>
          <button
            onClick={() => handleQuickAdjust(1)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {item.location}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {item.category}
          </span>
        </div>

        {item.expirationDate && !isExpired && (
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>Exp: {format(new Date(item.expirationDate), 'MMM d, yyyy')}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 btn btn-secondary text-sm py-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-secondary text-sm py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

