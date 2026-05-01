import { useState } from 'react';
import { Plus, X, HelpCircle } from 'lucide-react';
import type { CustomField, CustomFieldType, FoodCategory } from '../../types';
import { useStore } from '../../store/useStore';

interface CustomFieldEditorProps {
  category: FoodCategory;
  currentFields: CustomField[];
  onChange: (fields: CustomField[]) => void;
}

export default function CustomFieldEditor({ category, currentFields, onChange }: CustomFieldEditorProps) {
  const { getTemplatesForCategory } = useStore();
  const [showAddField, setShowAddField] = useState(false);
  
  // Get templates for this category
  const templates = getTemplatesForCategory(category);
  
  const handleAddFromTemplate = (template: any) => {
    const newField: CustomField = {
      id: crypto.randomUUID(),
      key: template.fieldKey,
      label: template.fieldName,
      value: template.defaultValue || (template.fieldType === 'boolean' ? false : ''),
      type: template.fieldType,
      options: template.options,
      unit: template.unit,
    };
    
    onChange([...currentFields, newField]);
  };
  
  const handleAddCustomField = () => {
    const newField: CustomField = {
      id: crypto.randomUUID(),
      key: `custom_${Date.now()}`,
      label: 'New Field',
      value: '',
      type: 'text',
    };
    
    onChange([...currentFields, newField]);
    setShowAddField(false);
  };
  
  const handleUpdateField = (id: string, updates: Partial<CustomField>) => {
    onChange(
      currentFields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };
  
  const handleRemoveField = (id: string) => {
    onChange(currentFields.filter((field) => field.id !== id));
  };
  
  const renderFieldInput = (field: CustomField) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={field.value as string}
            onChange={(e) => handleUpdateField(field.id, { value: e.target.value })}
            className="input flex-1"
            placeholder={`Enter ${field.label || field.key}`}
          />
        );
      
      case 'number':
        return (
          <div className="flex gap-2 flex-1">
            <input
              type="number"
              value={field.value as number}
              onChange={(e) => handleUpdateField(field.id, { value: parseFloat(e.target.value) || 0 })}
              className="input flex-1"
              placeholder="0"
            />
            {field.unit && (
              <span className="flex items-center text-sm text-gray-600 dark:text-gray-400 px-2">
                {field.unit}
              </span>
            )}
          </div>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={field.value as string}
            onChange={(e) => handleUpdateField(field.id, { value: e.target.value })}
            className="input flex-1"
          />
        );
      
      case 'boolean':
        return (
          <label className="flex items-center gap-2 flex-1 cursor-pointer">
            <input
              type="checkbox"
              checked={field.value as boolean}
              onChange={(e) => handleUpdateField(field.id, { value: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {field.value ? 'Yes' : 'No'}
            </span>
          </label>
        );
      
      case 'select':
        return (
          <select
            value={field.value as string}
            onChange={(e) => handleUpdateField(field.id, { value: e.target.value })}
            className="input flex-1"
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Template Suggestions */}
      {templates.length > 0 && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Suggested fields for {category.replace('-', ' ')}:
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map((template) => {
              const alreadyAdded = currentFields.some((f) => f.key === template.fieldKey);
              return (
                <button
                  key={template.id}
                  onClick={() => handleAddFromTemplate(template)}
                  disabled={alreadyAdded}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    alreadyAdded
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60'
                  }`}
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  {template.fieldName}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Current Custom Fields */}
      {currentFields.length > 0 ? (
        <div className="space-y-3">
          {currentFields.map((field) => (
            <div
              key={field.id}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.label || field.key}
                    </label>
                    <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700">
                      {field.type}
                    </span>
                  </div>
                  {renderFieldInput(field)}
                </div>
                <button
                  onClick={() => handleRemoveField(field.id)}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Remove field"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          No custom fields added yet. Click "Add Custom Field" to create one.
        </p>
      )}
      
      {/* Add Custom Field Button */}
      <button
        onClick={handleAddCustomField}
        className="btn btn-secondary w-full"
      >
        <Plus className="w-4 h-4" />
        Add Custom Field
      </button>
    </div>
  );
}

