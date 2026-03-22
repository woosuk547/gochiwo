#!/usr/bin/env node

import https from 'https'
import fs from 'fs'
import path from 'path'

// Pexels API 키 (무료)
const PEXELS_API_KEY = 'tWAj7EvV4TIZ9rPTCG7FkMQ8xqYKxQ7GOT8vhMBhLSH4qfKlZGVV5xLX'

async function searchPexels(query, perPage = 1) {
  return new Promise((resolve, reject) => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`

    https.get(url, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    }, (response) => {
      let data = ''
      response.on('data', chunk => data += chunk)
      response.on('end', () => {
        try {
          const result = JSON.parse(data)
          resolve(result)
        } catch (e) {
          reject(e)
        }
      })
    }).on('error', reject)
  })
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filepath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const file = fs.createWriteStream(filepath)
    https.get(url, (response) => {
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
  console.log('🇰🇷 Pexels API로 한국 이미지 다운로드 시작...\n')

  const imageQueries = [
    // Hero 이미지
    {
      name: 'Hero - 아시아 수리 전문가',
      query: 'asian handyman worker uniform',
      path: './public/hero-image.jpg',
      description: '아시아 전문가'
    },

    // 시공 사례 이미지
    {
      name: '한국 아파트 욕실',
      query: 'modern asian bathroom clean',
      path: './public/cases/bathroom-after.jpg',
      description: '깨끗한 아시아 욕실'
    },
    {
      name: '한국 주방',
      query: 'modern asian kitchen interior',
      path: './public/cases/kitchen-after.jpg',
      description: '현대적인 아시아 주방'
    },

    // 서비스 카테고리
    {
      name: '보일러 수리',
      query: 'heating boiler technician',
      path: './public/services/boiler.jpg',
      description: '보일러 기술자'
    }
  ]

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < imageQueries.length; i++) {
    const img = imageQueries[i]
    try {
      console.log(`[${i + 1}/${imageQueries.length}] 🔍 "${img.query}" 검색 중...`)
      console.log(`   └─ ${img.description}`)

      const result = await searchPexels(img.query, 1)

      if (result.photos && result.photos.length > 0) {
        const photo = result.photos[0]
        const imageUrl = photo.src.large2x || photo.src.large

        console.log(`   ⬇️  다운로드: ${imageUrl.substring(0, 60)}...`)
        await downloadImage(imageUrl, img.path)

        const stats = fs.statSync(img.path)
        console.log(`   ✅ 완료 (${(stats.size / 1024).toFixed(1)}KB)`)
        successCount++
      } else {
        console.log(`   ⚠️  검색 결과 없음`)
        failCount++
      }

      // API rate limit 방지 (200 requests/hour)
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('')
    } catch (error) {
      console.error(`   ❌ 실패: ${error.message}`)
      failCount++
      console.log('')
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✨ 다운로드 완료!`)
  console.log(`   성공: ${successCount}개`)
  if (failCount > 0) {
    console.log(`   실패: ${failCount}개`)
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('📁 다운로드된 이미지:')
  console.log('   ./public/hero-image.jpg')
  console.log('   ./public/cases/*.jpg')
  console.log('   ./public/services/boiler.jpg')
}

main().catch(console.error)
