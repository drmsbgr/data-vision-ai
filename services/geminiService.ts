import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeChartImage = async (base64Image: string): Promise<string> => {
  const model = 'gemini-3-pro-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg', 
          },
        },
        {
          text: "Bu grafik resmini analiz et. 1. Grafik türünü belirle. 2. Temel trendleri ve veri noktalarını yorumla. 3. İçgörüyü kısa bir özet olarak sun. Lütfen yanıtını tamamen Türkçe olarak ver.",
        },
      ],
    },
  });

  return response.text || "Resim analiz edilemedi.";
};

export const generateSpeech = async (text: string): Promise<string> => {
  const model = 'gemini-2.5-flash-preview-tts';
  
  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore voice usually works well for multi-lingual input
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Ses oluşturulamadı.");
  }
  return base64Audio;
};

export const parseCSVWithAI = async (csvText: string): Promise<string> => {
  return csvText;
};

export const generateImage = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string> => {
  const model = 'gemini-3-pro-image-preview';

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64EncodeString: string = part.inlineData.data;
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
    }
  }

  throw new Error("Görüntü oluşturulamadı.");
};