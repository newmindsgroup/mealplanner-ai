import { useState } from 'react';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useStore } from '../../store/useStore';
import bravermanData from '../../lib/data/bravermanQuestions.json';
import {
  Brain, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle,
  MessageCircle, ClipboardList, Sparkles, ChevronLeft,
} from 'lucide-react';
import NeuroReport from './NeuroReport';
import ConversationalAssessment from './ConversationalAssessment';
import HouseholdAssessmentDashboard from './HouseholdAssessmentDashboard';

const QUESTIONS_PER_PAGE = 10;

export default function NeuroAssessment() {
  const {
    answers, setAnswer, completeAssessment, isCompleted,
    isMonetizationEnabled, assessmentMode, setAssessmentMode,
    activePersonId, setActivePersonId, resetAssessment,
  } = useAssessmentStore();
  const { people } = useStore();

  const [currentPage, setCurrentPage] = useState(0);
  const [isLocked, setIsLocked] = useState(isMonetizationEnabled);

  const questions = bravermanData.questions;
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );
  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  const activePerson = activePersonId ? people.find((p) => p.id === activePersonId) : null;

  // ─── Back to Dashboard ─────────────────────────────────────────────────────
  const backToDashboard = () => {
    setActivePersonId(null);
    setCurrentPage(0);
  };

  // ─── Monetization Lock ─────────────────────────────────────────────────────
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unlock the Braverman Assessment</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mb-6">
          Discover your dominant neurotransmitter profile and receive highly personalized
          dietary recommendations to optimize your brain chemistry.
        </p>
        <button onClick={() => setIsLocked(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm">
          Unlock Premium Assessment
        </button>
      </div>
    );
  }

  // ─── No active person → Show household dashboard ───────────────────────────
  if (!activePersonId) {
    return (
      <HouseholdAssessmentDashboard
        onSelectPerson={(id) => {
          setActivePersonId(id);
          setCurrentPage(0);
        }}
        onViewReport={(id) => {
          setActivePersonId(id);
        }}
      />
    );
  }

  // ─── Active person completed → Show report ────────────────────────────────
  if (isCompleted) {
    return (
      <div className="space-y-4">
        <button onClick={backToDashboard} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Family Dashboard
        </button>
        <NeuroReport />
      </div>
    );
  }

  // ─── Mode Selection (fresh start) ──────────────────────────────────────────
  const hasStarted = Object.keys(answers).length > 0;

  if (!hasStarted) {
    return (
      <div id="tour-neuro-assessment" className="space-y-4 animate-fade-in">
        <button onClick={backToDashboard} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Family Dashboard
        </button>

        <div id="tour-neuro-questionnaire" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Assessment for {activePerson?.name || 'Member'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred assessment method</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setAssessmentMode('standard')}
              className="p-6 text-left rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Standard Questionnaire</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">120 True/False questions organized by neurotransmitter category. Systematic and thorough.</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>~15-20 minutes</span><span>•</span><span>No AI required</span>
              </div>
            </button>

            <button
              onClick={() => setAssessmentMode('conversational')}
              className="p-6 text-left rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-full uppercase">AI-Powered</div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                Chat with Dr. Neura <Sparkles className="w-4 h-4 text-purple-500" />
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Have a natural conversation with our AI specialist. She'll assess your profile through dialogue until 90% confidence.</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>10-30 minutes</span><span>•</span><span>Requires API key</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Conversational Mode ───────────────────────────────────────────────────
  if (assessmentMode === 'conversational') {
    return (
      <div className="space-y-4">
        <button onClick={backToDashboard} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Family Dashboard
        </button>
        <ConversationalAssessment />
      </div>
    );
  }

  // ─── Standard Questionnaire ────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <button onClick={backToDashboard} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to Family Dashboard
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {activePerson?.name ? `${activePerson.name}'s Assessment` : 'Neuro-Nutritional Assessment'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Discover your brain chemistry profile</p>
              </div>
            </div>
            <button
              onClick={() => setAssessmentMode('conversational')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Switch to AI Chat
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Progress</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {currentQuestions.map((q) => (
              <div key={q.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 transition-colors">
                <p className="text-gray-800 dark:text-gray-200 mb-4 font-medium">{q.text}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setAnswer(q.id, true)}
                    className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 border transition-all ${
                      answers[q.id] === true
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${answers[q.id] === true ? 'opacity-100' : 'opacity-0'}`} />
                    <span>True</span>
                  </button>
                  <button
                    onClick={() => setAnswer(q.id, false)}
                    className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 border transition-all ${
                      answers[q.id] === false
                        ? 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>False</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /><span>Previous</span>
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">Page {currentPage + 1} of {totalPages}</div>
            {currentPage === totalPages - 1 ? (
              <button
                onClick={() => completeAssessment()}
                disabled={Object.keys(answers).length < questions.length}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Complete Assessment</span><CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                <span>Next</span><ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-6 flex items-start space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              <strong>Educational Disclaimer:</strong> This assessment is for educational purposes
              only. It is not intended to be a substitute for professional medical advice, diagnosis,
              or treatment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
