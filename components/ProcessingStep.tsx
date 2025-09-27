
import React from 'react';
import Spinner from './Spinner';

const ProcessingStep: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
       <Spinner size="h-16 w-16" />
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-6 mb-2">Analyzing Document...</h2>
      <p className="text-slate-600 dark:text-slate-300">
        This may take a few moments. Please don't close this window.
      </p>
    </div>
  );
};

export default ProcessingStep;
