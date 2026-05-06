import React, { useState } from 'react';
import { useAssessmentStore } from '../../store/assessmentStore';
import bravermanData from '../../lib/data/bravermanQuestions.json';
import { Brain, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import NeuroReport from './NeuroReport';

const QUESTIONS_PER_PAGE = 10;

export default function NeuroAssessment() {
  const { 
    answers, 
    setAnswer, 
    completeAssessment, 
    isCompleted,
    isMonetizationEnabled 
  } = useAssessmentStore();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [isLocked, setIsLocked] = useState(isMonetizationEnabled);
  
  const questions = bravermanData.questions;
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE, 
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  if (isCompleted) {
    return <NeuroReport />;
  }

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Unlock the Braverman Assessment
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mb-6">
          Discover your dominant neurotransmitter profile and receive highly personalized dietary recommendations to optimize your brain chemistry.
        </p>
        <button 
          onClick={() => setIsLocked(false)} // In a real app, this would trigger Stripe checkout
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm flex items-center space-x-2"
        >
          <span>Unlock Premium Assessment</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Neuro-Nutritional Assessment</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Discover your brain chemistry profile</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Progress</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
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
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </div>

          {currentPage === totalPages - 1 ? (
            <button
              onClick={() => completeAssessment()}
              disabled={Object.keys(answers).length < questions.length}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Complete Assessment</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="mt-6 flex items-start space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>Educational Disclaimer:</strong> This assessment is for educational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>
        </div>
      </div>
    </div>
  );
}
