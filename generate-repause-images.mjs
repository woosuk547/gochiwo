#!/usr/bin/env node

import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import path from "path";
import { config } from "dotenv";

config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function generateImage(prompt, filepath) {
  console.log(`\n생성 중: ${path.basename(filepath)}`);

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-fast-generate-001',
      prompt,
      config: { numberOfImages: 1 },
    });

    const buffer = Buffer.from(response.generatedImages[0].image.imageBytes, "base64");
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filepath, buffer);
    console.log(`완료: ${filepath} (${(buffer.length / 1024).toFixed(1)}KB)`);
    return true;
  } catch (error) {
    console.error(`오류: ${error.message}`);
    return false;
  }
}

const images = [
  {
    prompt: 'Elegant Korean private villa exterior at dusk, warm golden interior light glowing through floor-to-ceiling windows, surrounded by lush greenery and bamboo, minimalist modern architecture, stone wall details, wooden deck, premium boutique stay, cinematic photography, 8K quality, natural warm lighting',
    filename: './public/repause/hero-exterior.jpg'
  },
  {
    prompt: 'Luxurious Korean private villa master bedroom interior, king bed with white linen, exposed wood beam ceiling, large panoramic window overlooking nature, morning light, minimalist Scandinavian-Korean fusion design, warm tones, premium boutique accommodation, interior photography, 8K',
    filename: './public/repause/room-bedroom.jpg'
  },
  {
    prompt: 'Private villa living room with floor-to-ceiling windows, natural wood furniture, white sofa, stone fireplace, overlooking Korean mountain forest landscape, golden hour light, premium stay interior, cozy and spacious, architectural photography, 8K quality',
    filename: './public/repause/room-living.jpg'
  },
  {
    prompt: 'Outdoor wooden deck of a private Korean villa, rattan lounge chairs, overlooking lush green valley and mountains, morning mist, private infinity-style pool edge visible, premium glamping atmosphere, lifestyle photography, natural daylight, 8K',
    filename: './public/repause/room-outdoor.jpg'
  },
  {
    prompt: 'Modern minimalist kitchen and dining area of Korean private villa, white marble countertop, wooden table set for two, large window with forest view, natural light, warm interior, premium boutique stay kitchen, interior photography, 8K quality',
    filename: './public/repause/room-kitchen.jpg'
  },
  {
    prompt: 'Elegant private bathroom of Korean villa, freestanding oval bathtub, natural stone tiles, bamboo accents, frosted window with soft natural light, premium spa-like atmosphere, white and beige tones, minimalist design, interior photography, 8K',
    filename: './public/repause/room-bathroom.jpg'
  },
  {
    prompt: 'Korean private villa property at night, dramatic exterior lighting, string lights on wooden pergola, warm glow from windows, stars visible in dark sky, private garden with stepping stones, luxury boutique stay night photography, cinematic quality, 8K',
    filename: './public/repause/villa-night.jpg'
  },
];

let success = 0;
for (const img of images) {
  const ok = await generateImage(img.prompt, img.filename);
  if (ok) success++;
  await new Promise(r => setTimeout(r, 3000));
}

console.log(`\n완료: ${success}/${images.length}개 생성`);
