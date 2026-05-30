import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/auth';

export async function POST() {
  try {
    await clearAdminSession();
    return NextResponse.json({ success: true, message: '성공적으로 로그아웃되었습니다.' });
  } catch (error) {
    console.error('Admin logout API error:', error);
    return NextResponse.json(
      { error: '로그아웃 처리 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
