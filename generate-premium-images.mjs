import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

// 프리미엄 품질 프롬프트 (더욱 구체적이고 한국적)
const imagePrompts = [
  {
    filename: 'hero-image.jpg',
    prompt: `A warm and trustworthy Korean home repair technician in his early 40s with a friendly smile, wearing a neat blue professional work uniform with a subtle company logo on the chest, holding a professional toolkit in one hand and giving a thumbs up gesture with the other hand. Standing in a bright modern Korean apartment living room with natural sunlight streaming through large windows, clean white walls, light oak wooden flooring, and contemporary Korean furniture visible in the soft-focused background. Shot with professional portrait photography, 85mm f/1.8 lens creating beautiful bokeh, natural window lighting from the left creating soft rim light, high resolution 8K quality, photorealistic rendering, sharp focus on face showing genuine warm expression, natural skin texture with slight wrinkles showing experience and trustworthiness, studio-quality professional headshot composition, authentic Korean facial features, captured with professional DSLR camera.`
  },
  {
    filename: 'bathroom-after.jpg',
    prompt: `A spotlessly clean modern Korean apartment bathroom after professional renovation, featuring pristine white ceramic wall-mounted toilet with soft-close lid, gleaming white rectangular subway tiles covering walls with perfectly aligned gray grout lines, polished chrome toilet paper holder and flush button, small white bathroom cabinet with mirror above, bright LED ceiling light creating even illumination, reflection of light on glossy white tiles creating sense of cleanliness, fresh white silicone sealant along floor edges, small potted succulent plant on shelf for decoration, professional interior architecture photography, 24mm wide-angle lens capturing entire bathroom space, high resolution 8K, photorealistic quality, sharp focus throughout with excellent depth of field, natural color temperature around 5500K, image conveys sense of hygiene and professional craftsmanship, typical Korean apartment bathroom dimensions approximately 1.5m x 2m, shot from doorway perspective showing complete renovation results.`
  },
  {
    filename: 'kitchen-after.jpg',
    prompt: `A pristine Korean apartment kitchen sink area after professional plumbing work, featuring a large rectangular stainless steel undermount sink with modern chrome pull-down faucet with spray function, clean white or light gray quartz countertop with subtle veining pattern, white ceramic subway tile backsplash with light gray grout, organized cabinet under sink with visible new chrome plumbing pipes and shut-off valves showing quality installation, small dish soap dispenser and clean sponge on sink ledge, natural daylight streaming from nearby window creating soft shadows, professional interior photography, 35mm lens at f/4 for good depth of field, high resolution 8K, photorealistic rendering, sharp focus on sink and faucet with slight blur on background showing modern Korean kitchen cabinets in matte white or light wood finish, color temperature around 5000K showing natural morning light, image conveys sense of cleanliness and professional workmanship, typical modern Korean apartment kitchen style.`
  },
  {
    filename: 'boiler.jpg',
    prompt: `A modern Korean condensing gas boiler professionally mounted on a clean white apartment wall, white rectangular boiler unit approximately 40cm x 60cm in size with brand logo visible (generic Korean style), digital LCD control panel showing temperature setting, blue LED indicator light showing active status, two white PVC exhaust pipes (intake and outtake) neatly installed through wall with proper clearance, gas connection pipe and water pipes visible on bottom showing professional installation with proper fittings and shut-off valves, Korean male technician's hands in blue work uniform sleeves holding a digital multimeter near the boiler checking electrical connections (only hands and forearms visible, no face), clean white wall background typical of Korean apartment utility area, soft natural lighting from ceiling, professional technical photography, 50mm lens at f/2.8 creating slight background blur, high resolution 8K, photorealistic quality, sharp focus on boiler unit and technician's hands, color temperature around 5500K, image conveys professionalism and technical expertise, safety and quality installation emphasized.`
  }
];

console.log('🎨 프리미엄 품질 이미지 생성 시작\n');
console.log('📝 더욱 구체적이고 한국적인 프롬프트 적용\n');

for (const { filename, prompt } of imagePrompts) {
  try {
    console.log(`📸 생성 중: ${filename}`);
    console.log(`   프롬프트 길이: ${prompt.length} 글자`);

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-fast-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9'
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
  await new Promise(resolve => setTimeout(resolve, 3000));
}

console.log('✨ 모든 프리미엄 이미지 생성 완료!');
console.log('🎯 더욱 한국적이고 사실적인 이미지로 업그레이드되었습니다.');
