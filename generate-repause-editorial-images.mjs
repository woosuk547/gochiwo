#!/usr/bin/env node

import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import path from "path";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

async function generateImage(prompt, filepath) {
  console.log(`\n🎨 "${path.basename(filepath)}" 생성 중...`);

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-fast-generate-001',
      prompt: prompt,
      config: { numberOfImages: 1 },
    });

    const generatedImage = response.generatedImages[0];
    const buffer = Buffer.from(generatedImage.image.imageBytes, "base64");

    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(filepath, buffer);
    console.log(`✅ ${filepath} (${(buffer.length / 1024).toFixed(1)}KB)`);
    return true;
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🏡 Repause 에디토리얼 이미지 생성 시작...\n');

  const images = [
    // full-bleed 가로형 — 거실 (16:9)
    {
      prompt: 'A luxurious Korean forest cabin living room interior. Floor-to-ceiling glass windows facing a dense green pine forest. Low cream sofa, warm wooden floor, minimal Japanese-inspired decor. Late afternoon golden light streaming through the windows. Cinematic, editorial photography, ultra wide 16:9 horizontal composition, no people, high-end hospitality photography style.',
      filename: './public/repause/editorial-living.jpg'
    },
    // full-bleed 가로형 — 외부 데크 (16:9)
    {
      prompt: 'A private wooden deck of a luxury forest cabin in Korean mountains. Two wooden lounge chairs facing a misty forested valley. Morning light, soft fog between pine trees. Breakfast basket with coffee on the deck. Ultra wide 16:9 horizontal composition, cinematic editorial photography, no people, premium stay photography.',
      filename: './public/repause/editorial-deck.jpg'
    },
    // 세로형 — 욕조 클로즈업 (3:4)
    {
      prompt: 'A Japanese hinoki wooden bathtub in a luxury Korean forest stay bathroom. Steam rising from the bath. Natural stone floor, bamboo accessories, small candle. Warm amber lighting. Vertical portrait 3:4 composition, close-up editorial shot, ultra premium spa photography, no people.',
      filename: './public/repause/editorial-bath.jpg'
    },
    // 세로형 — 침실 (3:4)
    {
      prompt: 'A serene bedroom in a Korean forest cabin. White linen bedding, minimal wooden furniture, large window showing pine forest at dusk. Single warm bedside lamp. Vertical portrait 3:4 composition, editorial luxury hotel photography, minimal Japanese-Korean aesthetic, no people.',
      filename: './public/repause/editorial-bedroom.jpg'
    },
    // 와이드 — 외관 낮 (16:7)
    {
      prompt: 'Exterior of a modern luxury Korean forest cabin with large glass facade. Surrounded by tall pine trees, natural stone pathway leading to entrance. Daytime, bright sky, dramatic architecture blending with nature. Ultra wide panoramic horizontal composition, architectural photography, no people, premium boutique stay.',
      filename: './public/repause/editorial-exterior.jpg'
    },
    // 와이드 — 주방 (4:3)
    {
      prompt: 'A minimal Japanese-Korean style kitchen inside a luxury forest cabin. White marble countertop, wooden cabinet, single window showing green forest outside. Coffee maker, wine glasses arranged neatly. Natural morning light. Horizontal 4:3 editorial photography, interior design magazine style, no people.',
      filename: './public/repause/editorial-kitchen.jpg'
    },
  ];

  let successCount = 0;

  for (const image of images) {
    const success = await generateImage(image.prompt, image.filename);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 4000));
  }

  console.log(`\n✨ 완료: ${successCount}/${images.length}개 생성 성공`);
}

main().catch(console.error);
