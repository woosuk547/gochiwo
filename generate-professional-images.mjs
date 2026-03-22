import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

// 고품질 프롬프트 작성 (2026 베스트 프랙티스)
const imagePrompts = [
  {
    filename: 'hero-image.jpg',
    prompt: `A friendly Korean male home repair professional in his 40s, wearing a clean blue work uniform with company logo, holding professional tools (wrench and toolkit), standing confidently in a modern Korean apartment living room. Natural warm lighting from window, shallow depth of field with 85mm portrait lens effect, professional photography quality, sharp focus on subject with blurred background, photorealistic, high resolution 8K, natural skin texture, authentic and trustworthy expression, studio quality portrait. Korean apartment interior visible in background with white walls and wooden flooring.`
  },
  {
    filename: 'bathroom-after.jpg',
    prompt: `A pristine Korean apartment bathroom after professional repair work, featuring a modern white wall-mounted toilet and clean white tiles, bright natural lighting from ceiling LED panels, spotless plumbing fixtures with chrome finish, fresh white grout between tiles, reflection on glossy tile surface, professional interior photography, wide-angle shot 24mm lens perspective, high resolution 8K, photorealistic details, clean and hygienic atmosphere, modern Korean bathroom design aesthetic, sharp focus throughout, no people in frame.`
  },
  {
    filename: 'kitchen-after.jpg',
    prompt: `A clean Korean apartment kitchen sink area after professional plumbing repair, featuring a stainless steel sink with modern chrome faucet, white subway tile backsplash, organized under-sink plumbing with new pipes visible, natural daylight from kitchen window, professional interior photography, 35mm lens perspective, high resolution 8K, photorealistic rendering, spotless and well-maintained appearance, modern Korean kitchen cabinet design in light wood or white finish, sharp focus on sink area, warm and inviting atmosphere.`
  },
  {
    filename: 'boiler.jpg',
    prompt: `A modern Korean gas boiler (condensing boiler) professionally installed on a white apartment wall, clean and well-maintained condition, control panel with digital display clearly visible, white or beige boiler unit, proper ventilation pipes attached, professional service maintenance scene, a Korean male technician's hand holding diagnostic tool near the boiler (hand and tool only, no full person), soft natural lighting, professional equipment photography, 50mm lens perspective, high resolution 8K, photorealistic quality, technical accuracy, clean white wall background, safe and professional installation.`
  },
  {
    filename: 'estimate-calculator.jpg',
    prompt: `A clean modern UI mockup showing a digital estimate calculator on a tablet device, Korean language interface visible, simple form fields for selecting repair types with checkboxes, price ranges displayed in Korean won, professional and trustworthy design, light blue and white color scheme, held by hands in business casual attire, natural office lighting, product photography style, 45-degree angle perspective, high resolution, photorealistic tablet screen, sharp focus on screen content, blurred office background, user-friendly interface design.`
  },
  {
    filename: 'expert-profile.jpg',
    prompt: `A professional Korean handyman profile photo showing upper body and face, male in his late 30s, wearing neat blue work uniform, friendly and confident smile, holding tablet showing customer reviews and ratings, modern Korean apartment service center background, professional business portrait photography, 85mm portrait lens with bokeh background, natural window lighting, high resolution 8K, photorealistic, natural skin texture, trustworthy and approachable expression, studio quality headshot.`
  }
];

console.log('🎨 고품질 이미지 생성 시작 (2026 베스트 프랙티스 적용)\n');

for (const { filename, prompt } of imagePrompts) {
  try {
    console.log(`📸 생성 중: ${filename}`);
    console.log(`   프롬프트: ${prompt.substring(0, 100)}...`);

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-fast-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        // 고품질 설정
        aspectRatio: filename === 'estimate-calculator.jpg' || filename === 'expert-profile.jpg' ? '4:3' : '16:9'
      }
    });

    if (response?.images?.[0]?.image) {
      const imageBuffer = response.images[0].image;

      // 저장 경로 결정
      let savePath;
      if (filename === 'hero-image.jpg') {
        savePath = path.join(__dirname, 'public', filename);
      } else if (filename.includes('bathroom') || filename.includes('kitchen')) {
        savePath = path.join(__dirname, 'public', 'cases', filename);
      } else if (filename === 'boiler.jpg') {
        savePath = path.join(__dirname, 'public', 'services', filename);
      } else {
        // 새 이미지들은 public/features 폴더에
        const featuresDir = path.join(__dirname, 'public', 'features');
        if (!fs.existsSync(featuresDir)) {
          fs.mkdirSync(featuresDir, { recursive: true });
        }
        savePath = path.join(featuresDir, filename);
      }

      fs.writeFileSync(savePath, imageBuffer);
      const stats = fs.statSync(savePath);
      const fileSizeKB = (stats.size / 1024).toFixed(1);

      console.log(`   ✅ 저장 완료: ${savePath}`);
      console.log(`   📦 크기: ${fileSizeKB}KB\n`);
    }
  } catch (error) {
    console.error(`   ❌ 오류 (${filename}):`, error.message);
  }

  // API 속도 제한 방지
  await new Promise(resolve => setTimeout(resolve, 2000));
}

console.log('✨ 모든 이미지 생성 완료!');
