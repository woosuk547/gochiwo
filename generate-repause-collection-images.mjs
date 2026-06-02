#!/usr/bin/env node

import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";

config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function generateImage(prompt, filepath) {
  console.log(`\n생성 중: ${path.basename(filepath)}`);

  try {
    const response = await ai.models.generateImages({
      model: "imagen-4.0-fast-generate-001",
      prompt,
      config: { numberOfImages: 1 },
    });

    const bytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!bytes) {
      throw new Error("이미지 응답이 비어 있습니다.");
    }

    const buffer = Buffer.from(bytes, "base64");
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
    prompt: "Premium Korean forest villa exterior in Yangyang, minimalist concrete and cedar architecture nestled among tall pine trees, warm interior glow at dusk, reflective plunge pool, cinematic hospitality photography, refined luxury stay, 8k",
    filename: "./public/repause/collection/sol-atelier-cover.jpg",
  },
  {
    prompt: "Luxury forest villa living room in Korea, large panoramic pine forest window, low modular sofa, natural stone floor, calm beige and cedar palette, boutique stay interior photography, soft afternoon light, 8k",
    filename: "./public/repause/collection/sol-atelier-room.jpg",
  },
  {
    prompt: "Jeju cliffside boutique stay exterior at sunset, pale limestone walls, infinity edge terrace, ocean horizon, warm lantern glow, high-end hospitality photography, serene luxury, 8k",
    filename: "./public/repause/collection/morae-cove-cover.jpg",
  },
  {
    prompt: "Minimalist oceanview suite interior in Jeju, king bed, built-in stone soaking tub beside floor-to-ceiling window, beige plaster walls, premium resort photography, sunset sea light, 8k",
    filename: "./public/repause/collection/morae-cove-room.jpg",
  },
  {
    prompt: "Modern premium hanok courtyard pool villa in Gyeongju at blue hour, low tiled roof, stone courtyard, glowing interior lights, elegant landscaping, luxury boutique stay photography, 8k",
    filename: "./public/repause/collection/noeul-ridge-cover.jpg",
  },
  {
    prompt: "Refined hanok-inspired villa interior in Korea, dining and living space opening to a private courtyard pool, oak furniture, soft indirect lighting, premium hospitality interior, 8k",
    filename: "./public/repause/collection/noeul-ridge-room.jpg",
  },
];

let success = 0;
for (const image of images) {
  const ok = await generateImage(image.prompt, image.filename);
  if (ok) success += 1;
  await new Promise((resolve) => setTimeout(resolve, 2500));
}

console.log(`\n완료: ${success}/${images.length}개 생성`);
