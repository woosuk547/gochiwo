#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

async function generateImage(prompt, filename) {
  console.log(`\n🎨 "${filename}" 생성 중...`)
  console.log(`   프롬프트: ${prompt}`)

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/png',
          data: ''
        }
      },
      { text: prompt }
    ])

    const response = await result.response
    const text = response.text()

    // 이미지 데이터 추출 (base64)
    const base64Match = text.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)
    if (!base64Match) {
      console.log('⚠️  이미지 생성 실패 - base64 데이터를 찾을 수 없습니다')
      return false
    }

    const imageData = base64Match[1]
    const buffer = Buffer.from(imageData, 'base64')

    // 파일 저장
    const dir = path.dirname(filename)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(filename, buffer)
    console.log(`✅ 저장 완료: ${filename} (${(buffer.length / 1024).toFixed(1)}KB)`)
    return true

  } catch (error) {
    console.error(`❌ 오류: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 사이트 이미지 생성 시작...\n')

  const publicDir = './public'
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  const images = [
    // 1. Hero 이미지
    {
      prompt: 'Professional Korean home repair expert in blue work uniform, smiling warmly, holding tools (wrench and screwdriver), standing in a modern clean workshop with bright lighting. Friendly and trustworthy appearance, 35-40 years old, professional photography style, high quality, realistic, bright and welcoming atmosphere.',
      filename: './public/hero-image.png'
    },

    // 2. 서비스 카테고리 일러스트
    {
      prompt: 'Modern minimalist icon illustration of water leaking from a pipe, clean blue and white colors, simple geometric shapes, flat design style, professional service illustration, transparent background friendly style',
      filename: './public/services/leak-repair.png'
    },
    {
      prompt: 'Modern minimalist icon illustration of a boiler heating system, warm orange and red colors, simple geometric shapes, flat design style, professional service illustration, transparent background, friendly style',
      filename: './public/services/boiler.png'
    },
    {
      prompt: 'Modern minimalist icon illustration of electrical wiring and light bulb, bright yellow and black colors, simple geometric shapes, flat design style, professional service illustration, transparent background, friendly style',
      filename: './public/services/electrical.png'
    },
    {
      prompt: 'Modern minimalist icon illustration of plumbing pipes and faucet, green and blue colors, simple geometric shapes, flat design style, professional service illustration, transparent background, friendly style',
      filename: './public/services/plumbing.png'
    },
    {
      prompt: 'Modern minimalist icon illustration of door hardware and lock, gray and silver colors, simple geometric shapes, flat design style, professional service illustration, transparent background, friendly style',
      filename: './public/services/hardware.png'
    },
    {
      prompt: 'Modern minimalist icon illustration of home maintenance tools (hammer, paint brush, screwdriver), purple and pink colors, simple geometric shapes, flat design style, professional service illustration, transparent background, friendly style',
      filename: './public/services/other.png'
    },

    // 3. 프로세스 일러스트
    {
      prompt: 'Modern minimalist illustration of a smartphone with map location pin, blue and white colors, clean flat design style, simple geometric shapes, professional UI illustration, friendly and welcoming atmosphere',
      filename: './public/process/location.png'
    },
    {
      prompt: 'Modern minimalist illustration of a camera taking photo, blue and white colors, clean flat design style, simple geometric shapes, professional UI illustration, friendly and welcoming atmosphere',
      filename: './public/process/photo.png'
    },
    {
      prompt: 'Modern minimalist illustration of a phone ringing with notification, blue and white colors, clean flat design style, simple geometric shapes, professional UI illustration, friendly and welcoming atmosphere',
      filename: './public/process/contact.png'
    },

    // 4. 신뢰 뱃지 일러스트
    {
      prompt: 'Modern minimalist illustration of a shield with checkmark, representing trust and verification, blue and gold colors, clean flat design style, professional badge illustration, premium quality feel',
      filename: './public/badges/verified.png'
    },
    {
      prompt: 'Modern minimalist illustration of a star with ribbon, representing quality and award, gold and blue colors, clean flat design style, professional badge illustration, premium quality feel',
      filename: './public/badges/quality.png'
    },

    // 5. Before/After 시공 사례 배경
    {
      prompt: 'Photo of a modern Korean bathroom sink area with visible water damage on wall, before repair, realistic photography style, natural lighting, interior photography, high quality realistic image',
      filename: './public/cases/bathroom-before.png'
    },
    {
      prompt: 'Photo of the same modern Korean bathroom sink area after professional repair, clean white tiles, pristine condition, realistic photography style, natural lighting, interior photography, high quality realistic image, matching the before photo layout',
      filename: './public/cases/bathroom-after.png'
    },
    {
      prompt: 'Photo of a Korean apartment kitchen sink with clogged drain, water pooling, before repair, realistic photography style, natural lighting, interior photography, high quality realistic image',
      filename: './public/cases/kitchen-before.png'
    },
    {
      prompt: 'Photo of the same Korean apartment kitchen sink after drain cleaning, water flowing smoothly, pristine condition, realistic photography style, natural lighting, interior photography, high quality realistic image, matching the before photo layout',
      filename: './public/cases/kitchen-after.png'
    }
  ]

  let successCount = 0
  let totalCount = images.length

  for (const image of images) {
    const success = await generateImage(image.prompt, image.filename)
    if (success) successCount++

    // API 호출 제한을 고려한 대기 시간
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log(`\n✨ 완료: ${successCount}/${totalCount}개 이미지 생성 성공`)

  if (successCount < totalCount) {
    console.log('\n⚠️  일부 이미지 생성 실패. 수동으로 재시도하거나 다른 이미지를 사용하세요.')
  }
}

main().catch(console.error)
