import { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronUp, Download, Upload } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { CustomFieldTemplate, FoodCategory, CustomFieldType } from '../../types';

const FOOD_CATEGORIES: { value: FoodCategory; label: string }[] = [
  { value: 'proteins', label: 'Proteins' },
  { value: 'grains', label: 'Grains' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'condiments', label: 'Condiments' },
  { value: 'oils', label: 'Oils & Fats' },
  { value: 'spices', label: 'Spices & Herbs' },
  { value: 'frozen', label: 'Frozen Foods' },
  { value: 'canned', label: 'Canned Goods' },
  { value: 'baking', label: 'Baking Supplies' },
  { value: 'supplements', label: 'Supplements' },
  { value: 'other', label: 'Other' },
];

const FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'select', label: 'Dropdown' },
];

interface CustomFieldTemplateManagerProps {
  onClose: () => void;
}

export default function CustomFieldTemplateManager({ onClose }: CustomFieldTemplateManagerProps) {
  const { customFieldTemplates, addCustomFieldTemplate, updateCustomFieldTemplate, deleteCustomFieldTemplate } = useStore();
  
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('proteins');
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<FoodCategory>>(new Set(['proteins']));
  
  const [formData, setFormData] = useState<Partial<CustomFieldTemplate>>({
    category: 'proteins',
    fieldName: '',
    fieldKey: '',
    fieldType: 'text',
    required: false,
    order: 0,
  });

  const categoryTemplates = customFieldTemplates.filter(t => t.category === selectedCategory);

  const handleToggleCategory = (category: FoodCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddTemplate = () => {
    if (!formData.fieldName || !formData.fieldKey) {
      alert('Please fill in Field Name and Field Key');
      return;
    }

    const newTemplate: CustomFieldTemplate = {
      id: crypto.randomUUID(),
      category: formData.category || 'proteins',
      fieldName: formData.fieldName,
      fieldKey: formData.fieldKey,
      fieldType: formData.fieldType || 'text',
      defaultValue: formData.defaultValue,
      options: formData.options,
      required: formData.required || false,
      placeholder: formData.placeholder,
      helpText: formData.helpText,
      unit: formData.unit,
      order: categoryTemplates.length,
    };

    addCustomFieldTemplate(newTemplate);
    setShowAddForm(false);
    setFormData({
      category: selectedCategory,
      fieldName: '',
      fieldKey: '',
      fieldType: 'text',
      required: false,
      order: 0,
    });
  };

  const handleUpdateTemplate = (id: string) => {
    if (!formData.fieldName || !formData.fieldKey) {
      alert('Please fill in Field Name and Field Key');
      return;
    }

    updateCustomFieldTemplate(id, {
      fieldName: formData.fieldName,
      fieldKey: formData.fieldKey,
      fieldType: formData.fieldType,
      defaultValue: formData.defaultValue,
      options: formData.options,
      required: formData.required,
      placeholder: formData.placeholder,
      helpText: formData.helpText,
      unit: formData.unit,
    });

    setEditingTemplate(null);
    setFormData({
      category: selectedCategory,
      fieldName: '',
      fieldKey: '',
      fieldType: 'text',
      required: false,
      order: 0,
    });
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteCustomFieldTemplate(id);
    }
  };

  const handleEditTemplate = (template: CustomFieldTemplate) => {
    setEditingTemplate(template.id);
    setFormData(template);
    setShowAddForm(false);
  };

  const handleExportTemplates = () => {
    const data = JSON.stringify(customFieldTemplates, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-field-templates-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const templates = JSON.parse(e.target?.result as string) as CustomFieldTemplate[];
        templates.forEach(template => {
          addCustomFieldTemplate({ ...template, id: crypto.randomUUID() });
        });
        alert(`Successfully imported ${templates.length} templates`);
      } catch (error) {
        alert('Error importing templates. Please check the file format.');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const renderTemplateForm = () => (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Field Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fieldName || ''}
            onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
            placeholder="e.g., Dosage"
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Field Key <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fieldKey || ''}
            onChange={(e) => setFormData({ ...formData, fieldKey: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
            placeholder="e.g., dosage"
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Field Type
          </label>
          <select
            value={formData.fieldType || 'text'}
            onChange={(e) => setFormData({ ...formData, fieldType: e.target.value as CustomFieldType })}
            className="input w-full"
          >
            {FIELD_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={formData.category || 'proteins'}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as FoodCategory })}
            className="input w-full"
            disabled={editingTemplate !== null}
          >
            {FOOD_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {formData.fieldType === 'number' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unit
            </label>
            <input
              type="text"
              value={formData.unit || ''}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g., mg, servings"
              className="input w-full"
            />
          </div>
        )}

        {formData.fieldType === 'select' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Options (comma-separated)
            </label>
            <input
              type="text"
              value={formData.options?.join(', ') || ''}
              onChange={(e) => setFormData({ ...formData, options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })}
              placeholder="e.g., Small, Medium, Large"
              className="input w-full"
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Placeholder
          </label>
          <input
            type="text"
            value={formData.placeholder || ''}
            onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
            placeholder="e.g., Enter dosage amount"
            className="input w-full"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Help Text
          </label>
          <input
            type="text"
            value={formData.helpText || ''}
            onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
            placeholder="e.g., Recommended daily dosage"
            className="input w-full"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.required || false}
              onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Required field</span>
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        {editingTemplate ? (
          <>
            <button
              onClick={() => handleUpdateTemplate(editingTemplate)}
              className="btn btn-primary flex-1"
            >
              <Save className="w-4 h-4" />
              Update Template
            </button>
            <button
              onClick={() => {
                setEditingTemplate(null);
                setFormData({ category: selectedCategory, fieldName: '', fieldKey: '', fieldType: 'text', required: false, order: 0 });
              }}
              className="btn btn-secondary"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleAddTemplate}
              className="btn btn-primary flex-1"
            >
              <Plus className="w-4 h-4" />
              Add Template
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormData({ category: selectedCategory, fieldName: '', fieldKey: '', fieldType: 'text', required: false, order: 0 });
              }}
              className="btn btn-secondary"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Custom Field Templates
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Create reusable field templates for different food categories
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Import/Export Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleExportTemplates}
            className="btn btn-secondary gap-2"
            disabled={customFieldTemplates.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Templates
          </button>
          <label className="btn btn-secondary gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import Templates
            <input
              type="file"
              accept=".json"
              onChange={handleImportTemplates}
              className="hidden"
            />
          </label>
        </div>

        {/* Add Template Button */}
        {!showAddForm && !editingTemplate && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary w-full gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Template
          </button>
        )}

        {/* Template Form */}
        {(showAddForm || editingTemplate) && renderTemplateForm()}

        {/* Templates by Category */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Templates by Category
          </h3>
          
          {FOOD_CATEGORIES.map(category => {
            const templates = customFieldTemplates.filter(t => t.category === category.value);
            const isExpanded = expandedCategories.has(category.value);

            return (
              <div key={category.value} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => {
                    handleToggleCategory(category.value);
                    setSelectedCategory(category.value);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {category.label}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                      {templates.length} {templates.length === 1 ? 'template' : 'templates'}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {isExpanded && templates.length > 0 && (
                  <div className="p-4 space-y-2">
                    {templates.map(template => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {template.fieldName}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                              {template.fieldKey}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              {template.fieldType}
                            </span>
                            {template.required && (
                              <span className="text-xs px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                Required
                              </span>
                            )}
                          </div>
                          {template.helpText && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {template.helpText}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="btn btn-secondary btn-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="btn btn-secondary btn-sm text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isExpanded && templates.length === 0 && (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No templates for this category yet
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

