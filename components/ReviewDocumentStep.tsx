
import React from 'react';
import type { KycData } from '../types';

interface ReviewDocumentStepProps {
  kycData: KycData;
  onNext: () => void;
  onRetry: () => void;
}

const DataRow: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
  <div className="flex justify-between py-3 border-b border-slate-200 dark:border-slate-700">
    <dt className="font-medium text-slate-500 dark:text-slate-400">{label}</dt>
    <dd className="text-slate-800 dark:text-slate-200 text-right">{value || 'N/A'}</dd>
  </div>
);

const ReviewDocumentStep: React.FC<ReviewDocumentStepProps> = ({ kycData, onNext, onRetry }) => {
  const { documentImage, extractedData } = kycData;

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-center text-slate-800 dark:text-white mb-2">Review Your Information</h2>
      <p className="text-center text-slate-600 dark:text-slate-300 mb-8">Please confirm the extracted information is correct.</p>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col items-center">
            <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-300 mb-4">Uploaded Document</h3>
            {documentImage && (
              <img src={documentImage} alt="Uploaded document" className="rounded-lg shadow-md w-full max-w-sm" />
            )}
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-300 mb-4">Extracted Details</h3>
          {extractedData ? (
            <dl>
              <DataRow label="Full Name" value={extractedData.fullName} />
              <DataRow label="Date of Birth" value={extractedData.dateOfBirth} />
              <DataRow label="Document Number" value={extractedData.documentNumber} />
              <DataRow label="Expiry Date" value={extractedData.expiryDate} />
              <DataRow label="Country" value={extractedData.country} />
            </dl>
          ) : (
            <p className="text-red-500">Could not extract data. Please try again.</p>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRetry}
          className="w-full sm:w-auto order-2 sm:order-1 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-300 dark:focus:ring-slate-600 transition-colors duration-200"
        >
          Re-upload Document
        </button>
        <button
          onClick={onNext}
          disabled={!extractedData}
          className="w-full sm:w-auto order-1 sm:order-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors duration-200"
        >
          Confirm & Continue
        </button>
      </div>
    </div>
  );
};

export default ReviewDocumentStep;
