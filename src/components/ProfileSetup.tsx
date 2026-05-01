import { useState } from 'react';
import { Plus, Trash2, Edit2, UserPlus, Users, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Person, BloodType } from '../types';
import BloodTypeSelector from './BloodTypeSelector';

export default function ProfileSetup() {
  const { people, addPerson, updatePerson, removePerson } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Person>>({
    name: '',
    bloodType: 'O+',
    age: 30,
    allergies: [],
    dietaryCodes: [],
    eatingPreferences: [],
    goals: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      updatePerson(editingId, formData);
      setEditingId(null);
    } else {
      addPerson({
        ...formData,
        id: crypto.randomUUID(),
        name: formData.name!,
        bloodType: formData.bloodType!,
        age: formData.age!,
        allergies: formData.allergies || [],
        dietaryCodes: formData.dietaryCodes || [],
        eatingPreferences: formData.eatingPreferences || [],
        goals: formData.goals || [],
      });
    }

    setFormData({
      name: '',
      bloodType: 'O+',
      age: 30,
      allergies: [],
      dietaryCodes: [],
      eatingPreferences: [],
      goals: [],
    });
  };

  const handleEdit = (person: Person) => {
    setFormData(person);
    setEditingId(person.id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Modern Header */}
      <div className="card-elevated p-6 bg-gradient-to-r from-primary-50 via-white to-primary-50 dark:from-primary-950/20 dark:via-gray-900 dark:to-primary-950/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Profile Setup
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage family members and their dietary profiles
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span className="font-bold text-primary-700 dark:text-primary-300">{people.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Card */}
        <div className="card p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingId ? 'Edit Person' : 'Add New Person'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Enter full name"
                required
              />
            </div>

            <BloodTypeSelector
              value={formData.bloodType || 'O+'}
              onChange={(value) => setFormData({ ...formData, bloodType: value })}
              showInfo={true}
            />

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.age || 30}
                onChange={(e) =>
                  setFormData({ ...formData, age: parseInt(e.target.value) || 30 })
                }
                className="input"
                min="1"
                max="120"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Allergies
              </label>
              <input
                type="text"
                value={formData.allergies?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    allergies: e.target.value.split(',').map((a) => a.trim()).filter(Boolean),
                  })
                }
                className="input"
                placeholder="e.g., peanuts, shellfish, dairy"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                Separate multiple allergies with commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Dietary Codes
              </label>
              <input
                type="text"
                value={formData.dietaryCodes?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dietaryCodes: e.target.value.split(',').map((c) => c.trim()).filter(Boolean),
                  })
                }
                className="input"
                placeholder="e.g., vegetarian, gluten-free, keto, paleo"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Health Goals
              </label>
              <input
                type="text"
                value={formData.goals?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    goals: e.target.value.split(',').map((g) => g.trim()).filter(Boolean),
                  })
                }
                className="input"
                placeholder="e.g., weight loss, muscle gain, inflammation reduction"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Eating Preferences
              </label>
              <input
                type="text"
                value={formData.eatingPreferences?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    eatingPreferences: e.target.value.split(',').map((p) => p.trim()).filter(Boolean),
                  })
                }
                className="input"
                placeholder="e.g., prefers spicy food, no raw fish, loves pasta"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  value={formData.bodyComposition?.weight || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bodyComposition: {
                        ...formData.bodyComposition,
                        weight: e.target.value ? parseFloat(e.target.value) : undefined,
                      },
                    })
                  }
                  className="input"
                  placeholder="Optional"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Height (inches)
                </label>
                <input
                  type="number"
                  value={formData.bodyComposition?.height || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bodyComposition: {
                        ...formData.bodyComposition,
                        height: e.target.value ? parseFloat(e.target.value) : undefined,
                      },
                    })
                  }
                  className="input"
                  placeholder="Optional"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {editingId ? 'Update Person' : 'Add Person'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      name: '',
                      bloodType: 'O+',
                      age: 30,
                      allergies: [],
                      dietaryCodes: [],
                      eatingPreferences: [],
                      goals: [],
                    });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Family Members List */}
        <div className="card p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Family Members
            </h2>
            {people.length > 0 && (
              <span className="badge badge-primary ml-auto">
                {people.length} {people.length === 1 ? 'person' : 'people'}
              </span>
            )}
          </div>

          {people.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">No family members yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Add your first family member to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {people.map((person, index) => (
                <div
                  key={person.id}
                  className="card p-4 hover-lift animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {person.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="badge badge-primary">
                              {person.bloodType}
                            </span>
                            <span>•</span>
                            <span>Age {person.age}</span>
                            {person.bodyComposition?.weight && (
                              <>
                                <span>•</span>
                                <span>{person.bodyComposition.weight} lbs</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {person.allergies.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-red-600 dark:text-red-400">⚠️ Allergies:</span>
                          {person.allergies.map((allergy, idx) => (
                            <span key={idx} className="badge text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {person.goals.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">🎯 Goals:</span>
                          {person.goals.map((goal, idx) => (
                            <span key={idx} className="badge badge-primary text-xs">
                              {goal}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {person.dietaryCodes.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">🥗 Diet:</span>
                          {person.dietaryCodes.map((code, idx) => (
                            <span key={idx} className="badge text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {code}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(person)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        aria-label="Edit person"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removePerson(person.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        aria-label="Delete person"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
