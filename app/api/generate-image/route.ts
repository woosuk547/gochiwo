import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    console.log('Generating image with prompt:', prompt);

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview', // Nano Banana 2
      contents: prompt,
    });

    console.log('Gemini response:', response);

    // 생성된 이미지 추출
    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error('No candidates in response');
    }

    const imagePart = candidate.content?.parts?.find(
      (part: any) => part.inlineData
    );

    if (!imagePart) {
      throw new Error('No image generated');
    }

    const imageData = (imagePart as any).inlineData?.data; // Base64
    const mimeType = (imagePart as any).inlineData?.mimeType;

    return NextResponse.json({
      success: true,
      imageData,
      mimeType,
      imageUrl: `data:${mimeType};base64,${imageData}`,
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
