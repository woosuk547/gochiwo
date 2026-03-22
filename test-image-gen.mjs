import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const GEMINI_API_KEY = 'process.env.GEMINI_API_KEY || ''';

async function generateImage() {
  try {
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY
    });

    const prompt = `
    A friendly Korean home repair professional in blue work uniform, smiling warmly,
    holding tools like wrench and toolbox, standing in front of a modern Korean apartment.
    Clean, minimal illustration style, flat design with soft blue and white colors.
    Warm and approachable atmosphere similar to Karrot Market (당근마켓) design style.
    Simple, professional, trustworthy look.
    한국적인 따뜻하고 친근한 집수리 전문가 일러스트
    `;

    console.log('🎨 Generating image with Gemini...');
    console.log('Prompt:', prompt.trim());

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: prompt,
    });

    console.log('\n✅ Image generated successfully!');

    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error('No candidates in response');
    }

    const imagePart = candidate.content.parts.find(
      (part) => part.inlineData
    );

    if (!imagePart) {
      throw new Error('No image in response');
    }

    const imageData = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType;

    console.log('MIME Type:', mimeType);
    console.log('Image size:', Math.round(imageData.length / 1024), 'KB');

    // Save image
    const buffer = Buffer.from(imageData, 'base64');
    const extension = mimeType.split('/')[1];
    const filename = `hero-image.${extension}`;

    fs.writeFileSync(`public/${filename}`, buffer);
    console.log(`\n💾 Image saved to: public/${filename}`);

    // Also save as data URL for testing
    const dataUrl = `data:${mimeType};base64,${imageData}`;
    fs.writeFileSync('public/hero-image-dataurl.txt', dataUrl);
    console.log('📝 Data URL saved to: public/hero-image-dataurl.txt');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

generateImage();
