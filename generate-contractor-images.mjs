import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const GEMINI_API_KEY = 'process.env.GEMINI_API_KEY || ''';

const contractorTypes = [
  {
    name: '누수전문가',
    prompt: 'Professional Korean plumber in blue work uniform, friendly smile, holding wrench, clean illustration style, soft blue colors, approachable, trustworthy',
    filename: 'plumber'
  },
  {
    name: '배관전문가',
    prompt: 'Korean pipe repair specialist in work clothes, carrying tool bag, professional and friendly, minimal illustration, blue and white colors',
    filename: 'pipe-specialist'
  },
  {
    name: '보일러전문가',
    prompt: 'Korean boiler technician in uniform, checking equipment, warm smile, clean flat design, professional illustration',
    filename: 'boiler-tech'
  },
  {
    name: '전기전문가',
    prompt: 'Korean electrician with safety gear, holding testing equipment, friendly professional, minimal illustration style',
    filename: 'electrician'
  },
  {
    name: '싱크대전문가',
    prompt: 'Korean sink repair expert in work uniform, friendly demeanor, holding tools, clean illustration style, blue colors',
    filename: 'sink-expert'
  }
];

async function generateImage(type, index) {
  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    console.log(`\n🎨 [${index + 1}/${contractorTypes.length}] Generating ${type.name}...`);

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: type.prompt,
    });

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error('No candidates in response');

    const imagePart = candidate.content.parts.find((part) => part.inlineData);
    if (!imagePart) throw new Error('No image in response');

    const imageData = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType;
    const extension = mimeType.split('/')[1];

    const buffer = Buffer.from(imageData, 'base64');
    const filename = `${type.filename}-${index + 1}.${extension}`;

    fs.writeFileSync(`public/contractors/${filename}`, buffer);
    console.log(`   ✅ Saved: public/contractors/${filename} (${Math.round(buffer.length / 1024)}KB)`);

    return filename;
  } catch (error) {
    console.error(`   ❌ Error generating ${type.name}:`, error.message);
    return null;
  }
}

async function main() {
  // Create directory
  if (!fs.existsSync('public/contractors')) {
    fs.mkdirSync('public/contractors', { recursive: true });
  }

  console.log('🚀 Starting contractor image generation...\n');

  const results = [];
  for (let i = 0; i < contractorTypes.length; i++) {
    const filename = await generateImage(contractorTypes[i], i);
    if (filename) {
      results.push({ type: contractorTypes[i].name, filename });
    }
    // Rate limiting
    if (i < contractorTypes.length - 1) {
      console.log('   ⏳ Waiting 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n\n✨ Complete! Generated ${results.length} images:`);
  results.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.type}: /contractors/${r.filename}`);
  });
}

main();
