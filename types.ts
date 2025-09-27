
export enum VerificationStep {
  Welcome,
  DocumentUpload,
  Processing,
  ReviewDocument,
  FaceCapture,
  Summary,
  Completed
}

export type DocumentType = 'Government ID' | 'Driving License' | 'Passport';

export interface ExtractedData {
  fullName?: string;
  dateOfBirth?: string;
  documentNumber?: string;
  expiryDate?: string;
  country?: string;
}

export interface KycData {
  documentType: DocumentType | null;
  documentImage: string | null;
  extractedData: ExtractedData | null;
  faceImage: string | null;
}
