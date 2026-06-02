/**
 * 네이버 예약 스나이퍼 - 드림이스케이프 "바야흐로,여름이었다."
 * 목표: 4월 5일(일) 오후 5시 이후 / launchd 자동 실행용
 * 예약자: 이우석 / 010-5059-8558 / 2인
 */

import { chromium } from 'playwright';
import { existsSync, readFileSync } from 'fs';

const TARGET_DATE = '2026-04-05';
const BOOKING_URL = `https://booking.naver.com/booking/12/bizes/843881/items/6627331?isProgramBizItem=false&startDateTime=${TARGET_DATE}T00%3A00%3A00%2B09%3A00`;
const COOKIE_FILE = '/Users/wooseok/Downloads/우석/naver_cookies.json';
const TARGET_HOUR = 17;


// KST HH:MM 까지 남은 ms
function msUntilKST(hh, mm) {
  const now = new Date();
  // KST = UTC+9, so KST 00:00 = UTC 15:00
  const t = new Date(now);
  t.setUTCHours(hh - 9, mm, 0, 0);
  if (t <= now) t.setUTCDate(t.getUTCDate() + 1);
  return t.getTime() - now.getTime();
}

function nowKST() {
  return new Date(Date.now() + 9 * 3600000).toISOString().replace('T', ' ').slice(0, 19);
}

async function getAvailableSlots(page) {
  return page.evaluate((targetHour) => {
    const btns = Array.from(document.querySelectorAll('.btn_time'));
    return btns
      .filter(btn => !btn.classList.contains('unselectable') && !btn.classList.contains('disable'))
      .map(btn => {
        const text = btn.textContent?.trim() || '';
        const pmMatch = text.match(/오후\s*(\d{1,2}):(\d{2})/);
        const amMatch = text.match(/오전\s*(\d{1,2}):(\d{2})/);
        let hour = -1;
        if (pmMatch) hour = parseInt(pmMatch[1]) === 12 ? 12 : parseInt(pmMatch[1]) + 12;
        else if (amMatch) hour = parseInt(amMatch[1]) === 12 ? 0 : parseInt(amMatch[1]);
        return { text, hour };
      })
      .filter(s => s.hour >= targetHour);
  }, TARGET_HOUR);
}

async function fillForm(page) {
  await page.waitForTimeout(1200);

  // 실명인증 다이얼로그 처리 (나타나면 확인 버튼 클릭 후 종료)
  const dialog = await page.$('text=실명이 확인된 네이버ID만 예약 가능');
  if (dialog) {
    console.log('[!] 실명인증 다이얼로그 감지 - 확인 클릭');
    const ok = await page.$('button:has-text("확인"), button:has-text("닫기"), button:has-text("취소")');
    if (ok) await ok.click();
    await page.waitForTimeout(500);
    return false;
  }

  // 네이버 예약 폼: 이름/전화는 계정에서 자동 입력됨
  // 3개 개별 약관 체크박스 클릭
  const checkboxes = await page.$$('input[type="checkbox"]');
  console.log(`[폼] 체크박스 ${checkboxes.length}개 발견`);
  for (const cb of checkboxes) {
    const checked = await cb.isChecked();
    if (!checked) {
      await cb.click();
      await page.waitForTimeout(150);
    }
  }
  // label 방식 체크박스 대비
  const labels = await page.$$('label:has(input[type="checkbox"])');
  for (const label of labels) {
    const cb = await label.$('input[type="checkbox"]');
    if (cb && !(await cb.isChecked())) {
      await label.click();
      await page.waitForTimeout(150);
    }
  }
  console.log('[폼] 약관 동의 완료');
  return true;
}

async function tryBook(page) {
  // 예약오픈 버튼 클릭 (자정 직후 첫 번째 시도)
  const openBtn = await page.$('button:has-text("예약오픈")');
  if (openBtn) { await openBtn.click(); await page.waitForTimeout(600); }

  // 날짜 5 클릭
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('button, td'));
    for (const el of all) {
      if (el.textContent?.trim() === '5' && !el.disabled &&
          !el.closest?.('td')?.classList.contains('prev_month')) {
        el.click(); return;
      }
    }
  });
  await page.waitForTimeout(400);

  const slots = await getAvailableSlots(page);
  if (!slots.length) return false;

  const slot = slots[0];
  console.log(`[!!] 슬롯 발견: ${slot.text}`);

  // 슬롯 클릭
  const clicked = await page.evaluate((text) => {
    const btn = Array.from(document.querySelectorAll('.btn_time'))
      .find(b => b.textContent?.trim() === text && !b.classList.contains('unselectable'));
    if (btn) { btn.click(); return true; }
    return false;
  }, slot.text);

  if (!clicked) return false;
  await page.waitForTimeout(500);

  // 다음 버튼
  const next = await page.$('button:has-text("다음")');
  if (!next || await next.isDisabled()) return false;

  await next.click();
  console.log('[OK] 다음!');
  await page.waitForTimeout(1500);

  const formOk = await fillForm(page);
  if (!formOk) return false;

  // "동의하고 결제하기" 버튼 클릭
  await page.waitForTimeout(600);
  const payBtn = await page.$('button:has-text("동의하고 결제하기")');
  if (payBtn && !(await payBtn.isDisabled())) {
    await payBtn.click();
    console.log('[OK] 동의하고 결제하기 클릭!');
  } else {
    // fallback: 다음/신청/결제 순서로 시도
    for (let i = 0; i < 4; i++) {
      await page.waitForTimeout(800);
      const btn = await page.$('button:has-text("다음"), button:has-text("신청"), button:has-text("결제")');
      if (!btn || await btn.isDisabled()) break;
      const t = (await btn.textContent())?.trim();
      await btn.click();
      console.log(`[단계${i + 1}] "${t}"`);
      if (t?.includes('결제') || t?.includes('신청')) break;
    }
  }
  return true;
}

async function main() {
  console.log(`[${nowKST()}] 네이버 예약 스나이퍼 시작`);
  console.log(`목표: ${TARGET_DATE} 오후 5시 이후`);

  const browser = await chromium.launch({
    headless: false,
    args: ['--window-size=430,932', '--window-position=0,0']
  });
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  });

  // 저장된 쿠키 복원
  if (existsSync(COOKIE_FILE)) {
    try {
      await context.addCookies(JSON.parse(readFileSync(COOKIE_FILE, 'utf-8')));
      console.log('[OK] 저장된 세션 복원');
    } catch (e) { console.log('[!] 쿠키 복원 실패'); }
  }

  const page = await context.newPage();

  // 로그인 확인
  await page.goto('https://www.naver.com', { waitUntil: 'domcontentloaded' });
  const cookies = await context.cookies('https://www.naver.com');
  if (!cookies.some(c => c.name === 'NID_AUT')) {
    console.log('[!] 로그인 필요 - 브라우저에서 로그인하세요');
    await page.goto('https://nid.naver.com/nidlogin.login');
    const deadline = Date.now() + 3 * 60 * 1000;
    while (Date.now() < deadline) {
      await page.waitForTimeout(2000);
      const c = await context.cookies();
      if (c.some(x => x.name === 'NID_AUT')) { console.log('[OK] 로그인!'); break; }
      process.stdout.write('.');
    }
  } else {
    console.log('[OK] 로그인 확인');
  }

  // 예약 페이지 미리 로드 (자정 전에 페이지 열어두기)
  console.log(`[*] 예약 페이지 미리 로드 중...`);
  await page.goto(BOOKING_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
  console.log(`[OK] 예약 페이지 로드 완료`);

  // 자정까지 대기
  const msLeft = msUntilKST(0, 0);
  const sec = Math.floor(msLeft / 1000);
  console.log(`[*] 자정까지 ${Math.floor(sec / 60)}분 ${sec % 60}초 대기...`);

  // 10초마다 카운트다운 출력
  const countdownInterval = setInterval(() => {
    const left = msUntilKST(0, 0);
    const s = Math.floor(left / 1000);
    if (s > 0) process.stdout.write(`\r[${nowKST()}] D-${Math.floor(s/60)}분 ${s%60}초  `);
  }, 1000);

  // 자정 5초 전까지 대기
  if (msLeft > 6000) await new Promise(r => setTimeout(r, msLeft - 5000));
  clearInterval(countdownInterval);

  // 자정 직전 페이지 새로고침 (최신 상태 반영)
  console.log(`\n[!!] ${nowKST()} 준비! 페이지 새로고침...`);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 4000 }).catch(() => {});

  await new Promise(r => setTimeout(r, msUntilKST(0, 0)));
  console.log(`\n[!!] ${nowKST()} 자정! 실행!`);

  // 자정 이후 즉시 시도 (페이지는 이미 열려있음)
  let booked = false;
  for (let attempt = 1; attempt <= 15 && !booked; attempt++) {
    console.log(`\n[시도${attempt}] ${nowKST()}`);
    try {
      booked = await tryBook(page);
      if (!booked) {
        // 슬롯 없으면 페이지 새로고침 후 재시도
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 4000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 200));
      }
    } catch (e) {
      console.log(`[오류] ${e.message.slice(0, 80)}`);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 4000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 200));
    }
  }

  if (booked) {
    console.log(`\n[완료] ${nowKST()} 예약 성공! 결제 페이지 확인`);
  } else {
    console.log(`\n[실패] ${nowKST()} 자동 예약 실패`);
  }

  console.log('[*] 브라우저 유지 중. Ctrl+C로 종료');
  await new Promise(() => {});
}

main().catch(console.error);
