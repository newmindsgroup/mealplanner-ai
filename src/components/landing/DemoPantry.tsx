import React, { useState } from 'react';
import { Package, AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { useDemo } from '../../contexts/DemoContext';

export default function DemoPantry() {
  const { pantryItems } = useDemo();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Items', icon: Package },
    { id: 'grains', label: 'Grains', icon: Package },
    { id: 'oils', label: 'Oils', icon: Package },
    { id: 'nuts-seeds', label: 'Nuts & Seeds', icon: Package },
    { id: 'dairy', label: 'Dairy', icon: Package },
  ];

  const filteredItems = selectedCategory === 'all' 
    ? pantryItems 
    : pantryItems.filter(item => item.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'border-emerald-200 bg-emerald-50';
      case 'low_stock': return 'border-amber-200 bg-amber-50';
      case 'expiring_soon': return 'border-orange-200 bg-orange-50';
      case 'out_of_stock': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'low_stock': return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'expiring_soon': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'out_of_stock': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock': return 'In Stock';
      case 'low_stock': return 'Low Stock';
      case 'expiring_soon': return 'Expiring Soon';
      case 'out_of_stock': return 'Out of Stock';
      default: return status;
    }
  };

  const getDaysUntilExpiration = (expirationDate?: string) => {
    if (!expirationDate) return null;
    const days = Math.floor((new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in-section">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full mb-4 font-semibold text-sm">
            <Package className="w-4 h-4" />
            Smart Pantry
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Track Your <span className="gradient-text-purple">Pantry Inventory</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Never waste food again with expiration tracking and low stock alerts
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 fade-in-section">
          <div className="glass-card-light rounded-xl p-4 text-center hover-lift">
            <div className="text-3xl font-bold text-emerald-600 mb-1">
              {pantryItems.filter(i => i.status === 'in_stock').length}
            </div>
            <div className="text-sm text-gray-600">In Stock</div>
          </div>
          <div className="glass-card-light rounded-xl p-4 text-center hover-lift">
            <div className="text-3xl font-bold text-amber-600 mb-1">
              {pantryItems.filter(i => i.status === 'low_stock').length}
            </div>
            <div className="text-sm text-gray-600">Low Stock</div>
          </div>
          <div className="glass-card-light rounded-xl p-4 text-center hover-lift">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {pantryItems.filter(i => i.status === 'expiring_soon').length}
            </div>
            <div className="text-sm text-gray-600">Expiring Soon</div>
          </div>
          <div className="glass-card-light rounded-xl p-4 text-center hover-lift">
            <div className="text-3xl font-bold text-purple-600 mb-1">{pantryItems.length}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="glass-card-light rounded-xl p-4 mb-8 fade-in-section">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <category.icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pantry Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-section">
          {filteredItems.map((item, index) => {
            const daysUntilExpiration = getDaysUntilExpiration(item.expirationDate);
            
            return (
              <div
                key={item.id}
                className={`border-2 rounded-xl p-6 transition-all hover:scale-105 hover:shadow-lg ${getStatusColor(item.status)}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                    <div className="text-sm text-gray-600 capitalize">{item.category.replace('-', ' ')}</div>
                  </div>
                  {getStatusIcon(item.status)}
                </div>

                {/* Quantity */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{item.quantity}</span>
                    <span className="text-lg text-gray-600">{item.unit}</span>
                  </div>
                  {item.minimumQuantity && (
                    <div className="text-xs text-gray-500 mt-1">
                      Min: {item.minimumQuantity} {item.unit}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    item.status === 'in_stock' ? 'bg-emerald-200 text-emerald-800' :
                    item.status === 'low_stock' ? 'bg-amber-200 text-amber-800' :
                    item.status === 'expiring_soon' ? 'bg-orange-200 text-orange-800' :
                    'bg-red-200 text-red-800'
                  }`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>

                {/* Location */}
                {item.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{item.location}</span>
                  </div>
                )}

                {/* Expiration Warning */}
                {daysUntilExpiration !== null && daysUntilExpiration <= 7 && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-orange-700 font-semibold">
                        Expires in {daysUntilExpiration} day{daysUntilExpiration !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-white/50 rounded-full text-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {item.notes && (
                  <div className="mt-3 text-xs text-gray-600 italic">
                    "{item.notes}"
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 fade-in-section">
          <div className="glass-card-light rounded-xl p-6 text-center hover-lift">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Smart Tracking</h4>
            <p className="text-sm text-gray-600">Automatic quantity updates as you use ingredients</p>
          </div>
          <div className="glass-card-light rounded-xl p-6 text-center hover-lift">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Low Stock Alerts</h4>
            <p className="text-sm text-gray-600">Get notified when items need restocking</p>
          </div>
          <div className="glass-card-light rounded-xl p-6 text-center hover-lift">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Expiration Tracking</h4>
            <p className="text-sm text-gray-600">Never waste food with timely reminders</p>
          </div>
        </div>
      </div>
    </section>
  );
}

