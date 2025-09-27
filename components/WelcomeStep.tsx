
import React from 'react';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="text-center animate-fade-in">
      <div className="flex justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Identity Verification Required</h2>
      <p className="text-slate-600 dark:text-slate-300 mb-6">
        To continue, we need to verify your identity. Please have a government-issued ID document ready.
      </p>
      <ul className="text-left list-disc list-inside text-slate-600 dark:text-slate-300 mb-8 mx-auto max-w-md">
        <li>Prepare your ID card, Passport, or Driver's License.</li>
        <li>Ensure you are in a well-lit area.</li>
        <li>The process will take about 2 minutes.</li>
      </ul>
      <button
        onClick={onNext}
        className="w-full max-w-xs bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 transform hover:scale-105"
      >
        Start Verification
      </button>
    </div>
  );
};

export default WelcomeStep;
