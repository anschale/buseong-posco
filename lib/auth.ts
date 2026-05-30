import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'aptadmin_session';

// 임의의 비밀 키 생성 (환경 변수 또는 임의 해시)
const COOKIE_SECRET = process.env.ADMIN_PASSWORD || 'buseong_posco_default_secret_2026';

/**
 * 어드민 토큰 생성
 */
export function generateAdminToken(): string {
  const username = process.env.ADMIN_USERNAME || 'aptadmin';
  const data = `${username}:${Date.now() + 24 * 60 * 60 * 1000}`; // 24시간 유효
  const signature = crypto.createHmac('sha256', COOKIE_SECRET).update(data).digest('hex');
  return Buffer.from(`${data}|${signature}`).toString('base64');
}

/**
 * 어드민 세션 검증
 */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) return false;

    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    const [data, signature] = decoded.split('|');
    if (!data || !signature) return false;

    // 서명 위조 검사
    const expectedSignature = crypto.createHmac('sha256', COOKIE_SECRET).update(data).digest('hex');
    if (signature !== expectedSignature) return false;

    // 만료 시간 검사
    const [username, expireStr] = data.split(':');
    const expireTime = parseInt(expireStr);
    const expectedUsername = process.env.ADMIN_USERNAME || 'aptadmin';

    if (username !== expectedUsername) return false;
    if (Date.now() > expireTime) return false;

    return true;
  } catch (error) {
    console.error('Session verification error:', error);
    return false;
  }
}

/**
 * 세션 삭제 (로그아웃)
 */
export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * 세션 설정 (로그인성공 시)
 */
export async function setAdminSession() {
  const token = generateAdminToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24시간
    path: '/',
  });
}
