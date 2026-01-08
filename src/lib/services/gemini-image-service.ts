// Gemini Image Generation Service
// Uses Google's Imagen model via Gemini API for image generation

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ImageGenerationOptions {
  prompt: string;
  numberOfImages?: number;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  negativePrompt?: string;
}

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

export interface ImageGenerationResult {
  success: boolean;
  images?: GeneratedImage[];
  error?: string;
}

/**
 * Generate images using Google's Imagen model via Gemini API
 */
export async function generateImages(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const { prompt, numberOfImages = 1, aspectRatio = '1:1', negativePrompt } = options;

  if (!process.env.GEMINI_API_KEY) {
    return {
      success: false,
      error: 'GEMINI_API_KEY not configured',
    };
  }

  try {
    // Use Imagen 3 model for image generation
    const model = genAI.getGenerativeModel({
      model: 'imagen-3.0-generate-002',
    });

    const fullPrompt = negativePrompt
      ? `${prompt}. Avoid: ${negativePrompt}`
      : prompt;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        candidateCount: numberOfImages,
      },
    });

    const response = result.response;
    const images: GeneratedImage[] = [];

    // Extract images from response
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if ('inlineData' in part && part.inlineData) {
          images.push({
            base64: part.inlineData.data || '',
            mimeType: part.inlineData.mimeType || 'image/png',
          });
        }
      }
    }

    if (images.length === 0) {
      return {
        success: false,
        error: 'No images generated',
      };
    }

    return {
      success: true,
      images,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Image generation failed: ${message}`,
    };
  }
}

/**
 * Generate a single image with simplified options
 */
export async function generateImage(prompt: string): Promise<ImageGenerationResult> {
  return generateImages({ prompt, numberOfImages: 1 });
}

/**
 * Convert base64 image to data URL for display
 */
export function toDataUrl(image: GeneratedImage): string {
  return `data:${image.mimeType};base64,${image.base64}`;
}
