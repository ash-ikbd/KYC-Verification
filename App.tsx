
import React, { useState, useCallback } from 'react';
import { VerificationStep } from './types';
import type { KycData } from './types';
import WelcomeStep from './components/WelcomeStep';
import DocumentUploadStep from './components/DocumentUploadStep';
import ReviewDocumentStep from './components/ReviewDocumentStep';
import FaceCaptureStep from './components/FaceCaptureStep';
import SummaryStep from './components/SummaryStep';
import StepIndicator from './components/StepIndicator';
import ProcessingStep from './components/ProcessingStep';
import CompletedStep from './components/CompletedStep';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<VerificationStep>(VerificationStep.Welcome);
  const [kycData, setKycData] = useState<KycData>({
    documentType: null,
    documentImage: null,
    extractedData: null,
    faceImage: null,
  });

  const resetState = useCallback(() => {
    setCurrentStep(VerificationStep.Welcome);
    setKycData({
      documentType: null,
      documentImage: null,
      extractedData: null,
      faceImage: null,
    });
  }, []);

  const goToStep = useCallback((step: VerificationStep) => {
    setCurrentStep(step);
  }, []);

  const updateKycData = useCallback((data: Partial<KycData>) => {
    setKycData(prev => ({ ...prev, ...data }));
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case VerificationStep.Welcome:
        return <WelcomeStep onNext={() => goToStep(VerificationStep.DocumentUpload)} />;
      case VerificationStep.DocumentUpload:
        return <DocumentUploadStep onNext={() => goToStep(VerificationStep.ReviewDocument)} onProcessing={() => goToStep(VerificationStep.Processing)} updateKycData={updateKycData} />;
      case VerificationStep.Processing:
        return <ProcessingStep />;
      case VerificationStep.ReviewDocument:
        return <ReviewDocumentStep kycData={kycData} onNext={() => goToStep(VerificationStep.FaceCapture)} onRetry={() => goToStep(VerificationStep.DocumentUpload)} />;
      case VerificationStep.FaceCapture:
        return <FaceCaptureStep onNext={() => goToStep(VerificationStep.Summary)} updateKycData={updateKycData} />;
      case VerificationStep.Summary:
        return <SummaryStep kycData={kycData} onNext={() => goToStep(VerificationStep.Completed)} onRetry={resetState} />;
      case VerificationStep.Completed:
        return <CompletedStep onStartOver={resetState} />;
      default:
        return <WelcomeStep onNext={() => goToStep(VerificationStep.DocumentUpload)} />;
    }
  };
  
  const steps = ["Start", "Document", "Review", "Face Scan", "Summary"];
  const activeStepIndex = [
      VerificationStep.Welcome,
      VerificationStep.DocumentUpload,
      VerificationStep.ReviewDocument,
      VerificationStep.FaceCapture,
      VerificationStep.Summary
  ].indexOf(currentStep);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">KYC Verification</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">A secure and automated identity verification process.</p>
        </header>
        
        {currentStep !== VerificationStep.Welcome && currentStep !== VerificationStep.Completed && currentStep !== VerificationStep.Processing && (
          <StepIndicator steps={steps} currentStepIndex={activeStepIndex} />
        )}
        
        <main className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-10 transition-all duration-300">
          {renderStep()}
        </main>

        <footer className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
          <p>Powered by Gemini API</p>
          <p>This is a micro-service for demonstration purposes.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
