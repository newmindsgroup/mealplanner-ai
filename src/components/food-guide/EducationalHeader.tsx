import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Info, AlertCircle } from 'lucide-react';

export default function EducationalHeader() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="card overflow-hidden bg-gradient-to-r from-blue-50 via-white to-blue-50 dark:from-blue-950/20 dark:via-gray-900 dark:to-blue-950/20 border-2 border-blue-200 dark:border-blue-900/30">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              Learn About Blood Type Diet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Understanding how foods interact with your blood type
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="p-6 pt-0 space-y-6 animate-slideUp">
          {/* The Science */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-gray-900 dark:text-white">
                The Science Behind Blood Type Diet
              </h4>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The Blood Type Diet theory, developed by Dr. Peter J. D'Adamo, suggests that your
              blood type determines which foods are best for your health. According to this theory,
              different blood types evolved at different times in human history and are better
              suited to digest certain types of foods.
            </p>
          </div>

          {/* How It Works */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                Type O - The Hunter
              </h5>
              <p className="text-sm text-green-700 dark:text-green-400">
                High stomach acid, efficient protein digestion. Thrives on meat, fish, and
                vegetables. Should limit grains and dairy.
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Type A - The Cultivator
              </h5>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Lower stomach acid, sensitive digestion. Thrives on plant-based diet with fish,
                tofu, and whole grains. Should avoid red meat.
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h5 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                Type B - The Nomad
              </h5>
              <p className="text-sm text-purple-700 dark:text-purple-400">
                Balanced digestive system. Can enjoy dairy, meat, grains, and vegetables. Should
                avoid corn, wheat, and certain nuts.
              </p>
            </div>

            <div className="p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg border border-pink-200 dark:border-pink-800">
              <h5 className="font-semibold text-pink-800 dark:text-pink-300 mb-2">
                Type AB - The Enigma
              </h5>
              <p className="text-sm text-pink-700 dark:text-pink-400">
                Mix of A and B characteristics. Enjoys seafood, dairy, tofu, and most vegetables.
                Sensitive immune system benefits from varied diet.
              </p>
            </div>
          </div>

          {/* Food Classifications */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Understanding Food Classifications
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Beneficial Foods</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Act as medicine for your blood type, promoting optimal health and preventing disease.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                  ○
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Neutral Foods</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Provide nutrition without significant benefit or harm. Safe to eat regularly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                  ✗
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Foods to Avoid</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    May cause digestive issues, inflammation, or other health problems for your blood type.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
                Important Disclaimer
              </p>
              <p className="text-amber-800 dark:text-amber-400">
                While many people report benefits from following the Blood Type Diet, it's important
                to note that scientific evidence is limited. Always consult with a healthcare
                professional or registered dietitian before making significant dietary changes,
                especially if you have existing health conditions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

