// Image Generation API
// Uses Gemini Imagen to generate images

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { generateImages, toDataUrl } from '@/lib/services/gemini-image-service';
import { z } from 'zod';

const requestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  numberOfImages: z.number().min(1).max(4).optional(),
  aspectRatio: z.enum(['1:1', '3:4', '4:3', '9:16', '16:9']).optional(),
  negativePrompt: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Image generation not configured' },
        { status: 503 }
      );
    }

    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { prompt, numberOfImages, aspectRatio, negativePrompt } = validation.data;

    // Generate images
    const result = await generateImages({
      prompt,
      numberOfImages,
      aspectRatio,
      negativePrompt,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Convert to data URLs for easy frontend display
    const imageUrls = result.images?.map(toDataUrl) || [];

    return NextResponse.json({
      success: true,
      images: imageUrls,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
