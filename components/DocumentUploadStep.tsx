
import React, { useState, useCallback, useRef } from 'react';
import type { DocumentType, KycData } from '../types';
import { extractInfoFromDocument } from '../services/geminiService';
import Spinner from './Spinner';

interface DocumentUploadStepProps {
  onNext: () => void;
  onProcessing: () => void;
  updateKycData: (data: Partial<KycData>) => void;
}

const documentTypes: DocumentType[] = ['Government ID', 'Driving License', 'Passport'];

const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({ onNext, onProcessing, updateKycData }) => {
  const [docType, setDocType] = useState<DocumentType>('Government ID');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setImageBase64(result);
      };
      reader.onerror = () => {
        setError("Failed to read the file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProceed = useCallback(async () => {
    if (!imageBase64 || !docType) {
      setError("Please upload an image and select a document type.");
      return;
    }

    setIsLoading(true);
    setError(null);
    onProcessing();

    try {
      const extractedData = await extractInfoFromDocument(imageBase64, docType);
      updateKycData({
        documentType: docType,
        documentImage: imageBase64,
        extractedData: extractedData,
      });
      onNext();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
       // Go back to upload step on error
       // This needs to be handled in App.tsx by changing the step
       // For now, just reset loading state here.
       setIsLoading(false);
       // This is a bit of a hack. The parent component should handle routing back
       // but for simplicity we will reset here and user needs to re-upload.
       // The ideal UX would be to go back to the upload screen with the error.
       // We'll simulate this by just showing the error. In the main app,
       // the step would be changed back to DocumentUpload.
       // For now, let's just make sure the UI is usable.
       // In App.tsx this would be handled with a goToStep(VerificationStep.DocumentUpload) call.
       // For this component we will reset the loading state and display error. User can try again.
        updateKycData({ documentImage: null, extractedData: null });
        setImagePreview(null);
        setImageBase64(null);

    } finally {
        // The App component handles the transition away from processing, so we don't need to setIsLoading(false) here.
    }
  }, [imageBase64, docType, onNext, onProcessing, updateKycData]);

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-center text-slate-800 dark:text-white mb-2">Upload Your Document</h2>
      <p className="text-center text-slate-600 dark:text-slate-300 mb-6">Select the type of document and upload a clear picture.</p>
      
      <div className="mb-6">
        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Document Type</label>
        <div className="grid grid-cols-3 gap-2 rounded-lg p-1 bg-slate-100 dark:bg-slate-700">
          {documentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setDocType(type)}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none ${
                docType === type
                  ? 'bg-white dark:bg-slate-800 text-blue-600 shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div
        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200"
        onClick={triggerFileSelect}
      >
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        {imagePreview ? (
          <img src={imagePreview} alt="Document Preview" className="max-h-48 mx-auto rounded-lg" />
        ) : (
          <div className="flex flex-col items-center text-slate-500 dark:text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p>Click to upload or drag & drop</p>
            <p className="text-xs mt-1">PNG, JPG or WEBP</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      
      <button
        onClick={handleProceed}
        disabled={!imagePreview || isLoading}
        className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 mt-8 flex items-center justify-center"
      >
        {isLoading ? <Spinner size="h-6 w-6"/> : 'Analyze Document'}
      </button>
    </div>
  );
};

export default DocumentUploadStep;
