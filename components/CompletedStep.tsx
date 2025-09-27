
import React from 'react';

interface CompletedStepProps {
  onStartOver: () => void;
}

const CompletedStep: React.FC<CompletedStepProps> = ({ onStartOver }) => {
  return (
    <div className="text-center animate-fade-in p-8">
      <div className="flex justify-center mb-6">
        <svg className="w-24 h-24 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Verification Submitted</h2>
      <p className="text-slate-600 dark:text-slate-300 mb-8">
        Thank you. Your information has been submitted for review. You can now close this window or start a new verification process.
      </p>
      <button
        onClick={onStartOver}
        className="w-full max-w-xs bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 transform hover:scale-105"
      >
        Start New Verification
      </button>
    </div>
  );
};

export default CompletedStep;
