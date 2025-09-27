
import React from 'react';
import type { KycData } from '../types';

interface SummaryStepProps {
  kycData: KycData;
  onNext: () => void;
  onRetry: () => void;
}

const SummaryRow: React.FC<{ label: string; value: string | undefined | null }> = ({ label, value }) => (
    <div className="py-2">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-lg text-slate-800 dark:text-slate-200">{value || 'N/A'}</p>
    </div>
);

const SummaryStep: React.FC<SummaryStepProps> = ({ kycData, onNext, onRetry }) => {
  const { documentImage, faceImage, extractedData, documentType } = kycData;
  
  const handleSubmit = () => {
    // In a real application, this is where you would send the `kycData`
    // to your backend (e.g., a Laravel webhook).
    console.log("Submitting KYC Data:", kycData);
    onNext(); // Move to completed step
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-center text-slate-800 dark:text-white mb-2">Final Review</h2>
      <p className="text-center text-slate-600 dark:text-slate-300 mb-8">Please review all your details before submitting.</p>

      <div className="space-y-8">
        <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-lg">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Identity Document</h3>
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <img src={documentImage || ''} alt="ID Document" className="rounded-lg shadow-md w-full" />
            <div>
                <SummaryRow label="Document Type" value={documentType} />
                <SummaryRow label="Full Name" value={extractedData?.fullName} />
                <SummaryRow label="Date of Birth" value={extractedData?.dateOfBirth} />
                <SummaryRow label="Document Number" value={extractedData?.documentNumber} />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-lg">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Face Verification</h3>
          <div className="flex justify-center">
            <img src={faceImage || ''} alt="User selfie" className="rounded-lg shadow-md h-48 w-auto" />
          </div>
        </div>
      </div>
      
      <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-4">
          By clicking "Submit Verification", you confirm that the information provided is accurate and consent to our identity verification process.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRetry}
            className="w-full sm:w-auto order-2 sm:order-1 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200"
          >
            Start Over
          </button>
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto order-1 sm:order-2 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 transition-colors duration-200"
          >
            Submit Verification
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryStep;
