#!/usr/bin/env node

import https from 'https'
import fs from 'fs'
import path from 'path'

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filepath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const file = fs.createWriteStream(filepath)
    https.get(url, (response) => {
      // 리다이렉트 처리
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file)
          file.on('finish', () => {
            file.close()
            resolve()
          })
        }).on('error', (err) => {
          fs.unlink(filepath, () => {})
          reject(err)
        })
      } else {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve()
        })
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {})
      reject(err)
    })
  })
}

async function main() {
  console.log('🖼️  무료 이미지 다운로드 시작...\n')
  console.log('📦 Unsplash API를 사용합니다\n')

  // Unsplash 무료 이미지 URL (한국/아시아 관련 고품질 이미지)
  const images = [
    // Hero 이미지 - 한국인 전문가
    {
      name: 'Hero - 한국인 집수리 전문가',
      url: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=1200&q=85&auto=format',
      path: './public/hero-image.jpg',
      description: '친절한 한국 수리 전문가'
    },

    // 시공 사례 Before/After - 한국 주택
    {
      name: '한국 아파트 욕실 - Before',
      url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80&auto=format',
      path: './public/cases/bathroom-before.jpg',
      description: '한국 아파트 욕실 누수 수리 전'
    },
    {
      name: '한국 아파트 욕실 - After',
      url: 'https://images.unsplash.com/photo-1564540583246-934409427776?w=800&q=80&auto=format',
      path: './public/cases/bathroom-after.jpg',
      description: '한국 아파트 욕실 누수 수리 후'
    },
    {
      name: '한국 주방 - Before',
      url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80&auto=format',
      path: './public/cases/kitchen-before.jpg',
      description: '한국 주방 배관 수리 전'
    },
    {
      name: '한국 주방 - After',
      url: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=80&auto=format',
      path: './public/cases/kitchen-after.jpg',
      description: '한국 주방 배관 수리 후'
    },

    // 서비스 카테고리 이미지
    {
      name: '누수 수리',
      url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80&auto=format',
      path: './public/services/leak.jpg',
      description: '누수 탐지 및 수리'
    },
    {
      name: '보일러',
      url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80&auto=format',
      path: './public/services/boiler.jpg',
      description: '보일러 수리'
    },
    {
      name: '전기',
      url: 'https://images.unsplash.com/photo-1621905252472-8d0b6a30e3cd?w=800&q=80&auto=format',
      path: './public/services/electrical.jpg',
      description: '전기 공사'
    },
    {
      name: '배관',
      url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80&auto=format',
      path: './public/services/plumbing.jpg',
      description: '배관 공사'
    },
    {
      name: '공구',
      url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80&auto=format',
      path: './public/services/tools.jpg',
      description: '전문 공구'
    },

    // 추가 컨텍스트 이미지 - 아시아 전문가
    {
      name: '아시아 전문가 작업 모습 1',
      url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80&auto=format',
      path: './public/work/professional-1.jpg',
      description: '전문가 작업 중'
    },
    {
      name: '아시아 전문가 작업 모습 2',
      url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80&auto=format',
      path: './public/work/professional-2.jpg',
      description: '배관 작업 중'
    }
  ]

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    try {
      console.log(`[${i + 1}/${images.length}] ⬇️  ${img.name}`)
      console.log(`   └─ ${img.description}`)
      await downloadImage(img.url, img.path)
      const stats = fs.statSync(img.path)
      console.log(`   ✅ 완료 (${(stats.size / 1024).toFixed(1)}KB)`)
      successCount++

      // API rate limit 방지
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`   ❌ 실패: ${error.message}`)
      failCount++
    }
    console.log('')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✨ 다운로드 완료!`)
  console.log(`   성공: ${successCount}개`)
  if (failCount > 0) {
    console.log(`   실패: ${failCount}개`)
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('📁 다운로드된 이미지 위치:')
  console.log('   ./public/hero-image.jpg')
  console.log('   ./public/cases/*.jpg')
  console.log('   ./public/services/*.jpg')
  console.log('   ./public/work/*.jpg')
}

main().catch(console.error)
