import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Person, BloodType, CuisineType } from '../types';
import BloodTypeSelector from './BloodTypeSelector';

interface OnboardingWizardProps {
  onComplete: () => void;
}

interface OnboardingData {
  people: Omit<Person, 'id'>[];
  goals: string[];
  region: string;
  language: string;
  cuisinePreferences: CuisineType[];
  budgetPreference?: string;
  pantryItems: string[];
  timeConstraints: string;
  mealRhythm: string;
  kidsNotes?: string;
  mealRepetitionTolerance: string;
  autoRegenerate: boolean;
}

const steps = [
  { id: 1, title: 'Who are we planning for?' },
  { id: 2, title: 'Goals' },
  { id: 3, title: 'Region & Language' },
  { id: 4, title: 'Cultural Preferences' },
  { id: 5, title: 'Budget & Pantry' },
  { id: 6, title: 'Time & Preferences' },
  { id: 7, title: 'Kids & Automation' },
  { id: 8, title: 'Review & Confirm' },
];

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { addPerson } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    people: [],
    goals: [],
    region: '',
    language: 'en',
    cuisinePreferences: [],
    pantryItems: [],
    timeConstraints: '',
    mealRhythm: 'regular',
    mealRepetitionTolerance: 'moderate',
    autoRegenerate: false,
  });

  const [currentPerson, setCurrentPerson] = useState<Omit<Person, 'id'>>({
    name: '',
    bloodType: 'O+',
    age: 30,
    allergies: [],
    dietaryCodes: [],
    eatingPreferences: [],
    goals: [],
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      if (currentStep === 1 && currentPerson.name) {
        setData((prev) => ({
          ...prev,
          people: [...prev.people, currentPerson],
        }));
        setCurrentPerson({
          name: '',
          bloodType: 'O+',
          age: 30,
          allergies: [],
          dietaryCodes: [],
          eatingPreferences: [],
          goals: [],
        });
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save people to store
    data.people.forEach((person) => {
      addPerson({
        ...person,
        id: crypto.randomUUID(),
      });
    });
    onComplete();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Who are we planning for?</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={currentPerson.name}
                  onChange={(e) =>
                    setCurrentPerson({ ...currentPerson, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Enter name"
                />
              </div>
              <BloodTypeSelector
                value={currentPerson.bloodType}
                onChange={(value) =>
                  setCurrentPerson({
                    ...currentPerson,
                    bloodType: value,
                  })
                }
                showInfo={true}
              />
              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <input
                  type="number"
                  value={currentPerson.age}
                  onChange={(e) =>
                    setCurrentPerson({
                      ...currentPerson,
                      age: parseInt(e.target.value) || 30,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Allergies (comma-separated)
                </label>
                <input
                  type="text"
                  value={currentPerson.allergies.join(', ')}
                  onChange={(e) =>
                    setCurrentPerson({
                      ...currentPerson,
                      allergies: e.target.value.split(',').map((a) => a.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  placeholder="e.g., peanuts, shellfish"
                />
              </div>
            </div>
            {data.people.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Added People:</h3>
                <ul className="space-y-2">
                  {data.people.map((p, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      {p.name} ({p.bloodType})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">What are your goals?</h2>
            <div className="grid grid-cols-2 gap-4">
              {['weight loss', 'weight gain', 'inflammation reduction', 'muscle building', 'brain focus', 'pregnancy support', 'longevity'].map(
                (goal) => (
                  <button
                    key={goal}
                    onClick={() => {
                      const newGoals = data.goals.includes(goal)
                        ? data.goals.filter((g) => g !== goal)
                        : [...data.goals, goal];
                      setData({ ...data, goals: newGoals });
                    }}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      data.goals.includes(goal)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    {goal}
                  </button>
                )
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Region & Language</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Region</label>
                <input
                  type="text"
                  value={data.region}
                  onChange={(e) => setData({ ...data, region: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  placeholder="e.g., United States, Europe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={data.language}
                  onChange={(e) => setData({ ...data, language: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Cultural/Cuisine Preferences</h2>
            <div className="grid grid-cols-2 gap-4">
              {(['latin', 'mediterranean', 'african', 'caribbean', 'asian', 'american', 'european', 'middle-eastern'] as CuisineType[]).map(
                (cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => {
                      const newCuisines = data.cuisinePreferences.includes(cuisine)
                        ? data.cuisinePreferences.filter((c) => c !== cuisine)
                        : [...data.cuisinePreferences, cuisine];
                      setData({ ...data, cuisinePreferences: newCuisines });
                    }}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      data.cuisinePreferences.includes(cuisine)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Budget & Pantry</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Budget Preference</label>
                <select
                  value={data.budgetPreference || ''}
                  onChange={(e) => setData({ ...data, budgetPreference: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="">Not specified</option>
                  <option value="budget">Budget-friendly</option>
                  <option value="moderate">Moderate</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Pantry Items (comma-separated)
                </label>
                <textarea
                  value={data.pantryItems.join(', ')}
                  onChange={(e) =>
                    setData({
                      ...data,
                      pantryItems: e.target.value.split(',').map((i) => i.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  placeholder="e.g., rice, beans, olive oil"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Time & Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Time Constraints</label>
                <select
                  value={data.timeConstraints}
                  onChange={(e) => setData({ ...data, timeConstraints: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="">No constraints</option>
                  <option value="quick">Quick meals (5-10 min)</option>
                  <option value="moderate">Moderate (30-60 min)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meal Rhythm</label>
                <select
                  value={data.mealRhythm}
                  onChange={(e) => setData({ ...data, mealRhythm: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="regular">Regular (3 meals + snack)</option>
                  <option value="intermittent">Intermittent fasting</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Meal Repetition Tolerance
                </label>
                <select
                  value={data.mealRepetitionTolerance}
                  onChange={(e) =>
                    setData({ ...data, mealRepetitionTolerance: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="low">Low (variety preferred)</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High (okay with repeats)</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Kids & Automation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kids-Specific Notes</label>
                <textarea
                  value={data.kidsNotes || ''}
                  onChange={(e) => setData({ ...data, kidsNotes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Any special considerations for kids..."
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoRegenerate"
                  checked={data.autoRegenerate}
                  onChange={(e) => setData({ ...data, autoRegenerate: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="autoRegenerate" className="text-sm font-medium">
                  Automatically regenerate weekly plans
                </label>
              </div>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Review & Confirm</h2>
            <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-semibold mb-2">People:</h3>
                <ul className="list-disc list-inside">
                  {data.people.map((p, idx) => (
                    <li key={idx}>
                      {p.name} - Blood Type {p.bloodType}, Age {p.age}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Goals:</h3>
                <p>{data.goals.join(', ') || 'None specified'}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Region:</h3>
                <p>{data.region || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Cuisine Preferences:</h3>
                <p>{data.cuisinePreferences.join(', ') || 'None'}</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to Meal Plan Assistant
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-8 min-h-[400px]">{renderStep()}</div>

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              disabled={currentStep === 1 && !currentPerson.name}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Check className="w-5 h-5" />
              Complete Setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

