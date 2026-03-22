#!/usr/bin/env node

import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import path from "path";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

async function generateImage(prompt, filepath) {
  console.log(`\n🎨 "${path.basename(filepath)}" 생성 중...`);
  console.log(`   프롬프트: ${prompt.substring(0, 80)}...`);

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-fast-generate-001', // 가장 빠르고 저렴한 모델
      prompt: prompt,
      config: {
        numberOfImages: 1,
      },
    });

    const generatedImage = response.generatedImages[0];
    const buffer = Buffer.from(generatedImage.image.imageBytes, "base64");

    // 디렉토리 생성
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filepath, buffer);
    console.log(`✅ 저장 완료: ${filepath} (${(buffer.length / 1024).toFixed(1)}KB)`);
    return true;

  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🇰🇷 한국 스타일 이미지 생성 시작...\n');
  console.log('📦 Gemini Imagen 4 Fast 사용\n');

  const images = [
    // 1. 히어로 이미지 - 한국 집수리 전문가
    {
      prompt: 'A friendly Korean home repair professional in blue work uniform, smiling warmly, holding tools (wrench and screwdriver), standing in a clean modern Korean apartment. Korean male, age 35-40, professional appearance, natural lighting, high quality photography, realistic style, welcoming atmosphere.',
      filename: './public/hero-image.jpg'
    },

    // 2. 한국 아파트 욕실 수리 완료
    {
      prompt: 'Modern Korean apartment bathroom after repair, clean white tiles, pristine condition, natural daylight through frosted window, minimalist Korean bathroom design, spotless sink and fixtures, interior photography, high quality realistic image, bright and clean atmosphere.',
      filename: './public/cases/bathroom-after.jpg'
    },

    // 3. 한국 아파트 주방 수리 완료
    {
      prompt: 'Modern Korean apartment kitchen after repair, clean stainless steel sink, white cabinets, organized and pristine, natural daylight, typical Korean kitchen interior, smooth water flow from faucet, interior photography, high quality realistic image, bright and tidy atmosphere.',
      filename: './public/cases/kitchen-after.jpg'
    },

    // 4. 보일러 수리
    {
      prompt: 'Korean boiler heating system being serviced by technician, clean white boiler unit on wall, typical Korean apartment boiler, professional repair tools visible, realistic photography, interior shot, technical and professional atmosphere.',
      filename: './public/services/boiler.jpg'
    }
  ];

  let successCount = 0;
  let totalCount = images.length;

  for (const image of images) {
    const success = await generateImage(image.prompt, image.filename);
    if (success) successCount++;

    // API 호출 제한을 고려한 대기 시간 (3초)
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✨ 완료: ${successCount}/${totalCount}개 이미지 생성 성공`);

  if (successCount < totalCount) {
    console.log('\n⚠️  일부 이미지 생성 실패. API 키 또는 할당량을 확인하세요.');
  } else {
    console.log('\n📁 생성된 이미지:');
    console.log('   ./public/hero-image.jpg');
    console.log('   ./public/cases/bathroom-after.jpg');
    console.log('   ./public/cases/kitchen-after.jpg');
    console.log('   ./public/services/boiler.jpg');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(console.error);
