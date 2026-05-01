import { useState } from 'react';
import { Search, Book, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { labEducationDatabase, searchLabEducation, getLabsByCategory } from '../../data/labEducation';
import type { LabEducationContent, LabCategory } from '../../types/labs';
import { LAB_PANELS } from '../../types/labs';

export default function LabEducation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LabCategory | 'all'>('all');
  const [selectedTest, setSelectedTest] = useState<LabEducationContent | null>(null);

  // Get labs to display
  const labs = searchTerm
    ? searchLabEducation(searchTerm)
    : selectedCategory === 'all'
    ? Object.values(labEducationDatabase)
    : getLabsByCategory(selectedCategory);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Lab Test Education</h1>
        <p className="text-gray-600 mt-1">Learn what each lab test measures and what results mean</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search lab tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as LabCategory | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {LAB_PANELS.map((panel) => (
              <option key={panel.id} value={panel.category}>
                {panel.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {labs.map((lab) => (
          <button
            key={lab.testName}
            onClick={() => setSelectedTest(lab)}
            className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-800 text-lg">{lab.testName}</h3>
              <Book className="w-5 h-5 text-blue-600 flex-shrink-0" />
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{lab.description}</p>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
              {LAB_PANELS.find(p => p.category === lab.category)?.name || lab.category}
            </span>
          </button>
        ))}
      </div>

      {labs.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Results Found</h2>
          <p className="text-gray-600">
            Try adjusting your search or filter to find lab tests
          </p>
        </div>
      )}

      {/* Test Details Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white rounded-t-lg">
              <h2 className="text-2xl font-bold text-gray-800">{selectedTest.testName}</h2>
              <button
                onClick={() => setSelectedTest(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">What It Is</h3>
                <p className="text-gray-700">{selectedTest.description}</p>
              </div>

              {/* Purpose */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Purpose</h3>
                <p className="text-gray-700">{selectedTest.purpose}</p>
              </div>

              {/* Normal Range */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Normal Range</h3>
                {selectedTest.normalRange.male && selectedTest.normalRange.female ? (
                  <div className="space-y-1">
                    <p className="text-gray-700"><strong>Male:</strong> {selectedTest.normalRange.male}</p>
                    <p className="text-gray-700"><strong>Female:</strong> {selectedTest.normalRange.female}</p>
                  </div>
                ) : (
                  <p className="text-gray-700">{selectedTest.normalRange.general}</p>
                )}
              </div>

              {/* High Levels */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  High Levels
                </h3>
                <p className="text-gray-700 mb-3">{selectedTest.highMeans.description}</p>
                
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-800 mb-2">Common Causes:</h4>
                  <ul className="list-disc ml-5 text-gray-700 space-y-1">
                    {selectedTest.highMeans.causes.map((cause, i) => (
                      <li key={i}>{cause}</li>
                    ))}
                  </ul>
                </div>

                {selectedTest.highMeans.symptoms && selectedTest.highMeans.symptoms.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Possible Symptoms:</h4>
                    <ul className="list-disc ml-5 text-gray-700 space-y-1">
                      {selectedTest.highMeans.symptoms.map((symptom, i) => (
                        <li key={i}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Low Levels */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                  Low Levels
                </h3>
                <p className="text-gray-700 mb-3">{selectedTest.lowMeans.description}</p>
                
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-800 mb-2">Common Causes:</h4>
                  <ul className="list-disc ml-5 text-gray-700 space-y-1">
                    {selectedTest.lowMeans.causes.map((cause, i) => (
                      <li key={i}>{cause}</li>
                    ))}
                  </ul>
                </div>

                {selectedTest.lowMeans.symptoms && selectedTest.lowMeans.symptoms.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Possible Symptoms:</h4>
                    <ul className="list-disc ml-5 text-gray-700 space-y-1">
                      {selectedTest.lowMeans.symptoms.map((symptom, i) => (
                        <li key={i}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Lifestyle Factors */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Lifestyle Factors</h3>
                <ul className="list-disc ml-5 text-gray-700 space-y-1">
                  {selectedTest.lifestyleFactors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </div>

              {/* Blood Type Concerns */}
              {selectedTest.bloodTypeConcerns && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Blood Type Considerations</h3>
                  <p className="text-gray-700">{selectedTest.bloodTypeConcerns}</p>
                </div>
              )}

              {/* Related Tests */}
              {selectedTest.relatedTests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Related Tests</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTest.relatedTests.map((test, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {test}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 rounded-b-lg">
              <p className="text-sm text-gray-600 italic">
                This information is for educational purposes only. Always consult with your healthcare provider for medical advice.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

