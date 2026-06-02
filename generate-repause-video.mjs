#!/usr/bin/env node

import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import { config } from "dotenv";

config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function generateVideo(prompt, outputPath) {
  console.log(`\n영상 생성 시작...`);
  console.log(`프롬프트: ${prompt.substring(0, 80)}...`);

  let operation = await ai.models.generateVideos({
    model: "veo-2.0-generate-001",
    prompt,
    config: {
      aspectRatio: "16:9",
      numberOfVideos: 1,
    },
  });

  console.log(`생성 중 (약 2~3분 소요)...`);

  while (!operation.done) {
    await new Promise((r) => setTimeout(r, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
    process.stdout.write(".");
  }

  console.log("\n완료!");

  const video = operation.response?.generatedVideos?.[0];
  if (!video?.video?.uri) {
    console.error("영상 URI를 찾을 수 없습니다.");
    console.log("응답:", JSON.stringify(operation.response, null, 2));
    return false;
  }

  const uri = video.video.uri;
  console.log(`다운로드 중: ${uri}`);

  const res = await fetch(`${uri}&key=${process.env.GEMINI_API_KEY}`);
  if (!res.ok) {
    console.error(`다운로드 실패: ${res.status} ${res.statusText}`);
    return false;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const dir = outputPath.substring(0, outputPath.lastIndexOf("/"));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  console.log(`저장 완료: ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
  return true;
}

const prompt = `
Cinematic aerial drone shot slowly gliding over a private villa nestled in a Korean mountain forest at golden hour.
The camera descends to reveal floor-to-ceiling windows glowing with warm interior light,
a wooden deck surrounded by bamboo and pine trees.
Mist gently rises from the valley below.
The scene feels serene, private, and luxurious.
Slow cinematic movement, shallow depth of field, warm amber tones.
No people visible. Premium boutique accommodation atmosphere.
`.trim();

const ok = await generateVideo(prompt, "./public/repause/hero.mp4");

if (ok) {
  console.log(`\n히어로 영상 생성 완료: public/repause/hero.mp4`);
  console.log(`이제 page.tsx의 히어로 섹션에 <video> 태그로 적용하면 됩니다.`);
} else {
  console.log(`\n생성 실패. API 할당량 또는 키를 확인하세요.`);
}
