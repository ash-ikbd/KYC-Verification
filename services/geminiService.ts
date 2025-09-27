import { GoogleGenAI, Type } from "@google/genai";
import type { DocumentType, ExtractedData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    fullName: {
      type: Type.STRING,
      description: "The full name of the person as written on the document.",
    },
    dateOfBirth: {
      type: Type.STRING,
      description: "The date of birth in YYYY-MM-DD format.",
    },
    documentNumber: {
      type: Type.STRING,
      description: "The unique identification number of the document.",
    },
    expiryDate: {
      type: Type.STRING,
      description: "The expiration date of the document in YYYY-MM-DD format. Null if not applicable.",
    },
    country: {
        type: Type.STRING,
        description: "The country that issued the document."
    }
  },
  required: ["fullName", "dateOfBirth", "documentNumber", "country"],
};


export const extractInfoFromDocument = async (
  imageBase64: string,
  documentType: DocumentType
): Promise<ExtractedData> => {
  const mimeType = imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";"));
  const pureBase64 = imageBase64.split(",")[1];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: pureBase64,
          },
        },
        {
          text: `Extract the key information from this ${documentType}. I need the full name, date of birth, document number, issuing country and expiry date.`,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsedData: ExtractedData = JSON.parse(jsonString);
    return parsedData;

  } catch (error) {
    console.error("Error extracting document info with Gemini:", error);
    throw new Error("Failed to analyze the document. Please ensure the image is clear and try again.");
  }
};

export const checkLiveness = async (
  imageBase64: string,
  challenge: string
): Promise<{ actionPerformed: boolean; reason: string }> => {
  const mimeType = imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";"));
  const pureBase64 = imageBase64.split(",")[1];

  const livenessSchema = {
    type: Type.OBJECT,
    properties: {
      actionPerformed: {
        type: Type.BOOLEAN,
        description: "Whether the user successfully performed the requested action.",
      },
      reason: {
        type: Type.STRING,
        description: "A brief explanation of why the action was or was not detected. For example, 'User is smiling clearly' or 'Smile not detected.'",
      },
    },
    required: ["actionPerformed", "reason"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: pureBase64,
          },
        },
        {
          text: `Analyze this image of a person. The user was asked to perform a specific action for a liveness check. Please determine if they are performing the action. The action is: "${challenge}". Is the person in the image performing this action?`,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: livenessSchema,
      },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error during liveness check with Gemini:", error);
    return {
        actionPerformed: false,
        reason: "Could not verify liveness due to a technical issue. Please try again."
    }
  }
};