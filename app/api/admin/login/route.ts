import { NextResponse } from 'next/server';
import { setAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const expectedUsername = process.env.ADMIN_USERNAME || 'aptadmin';
    const expectedPassword = process.env.ADMIN_PASSWORD || '20260530!@';

    if (username === expectedUsername && password === expectedPassword) {
      await setAdminSession();
      return NextResponse.json({ success: true, message: '로그인에 성공했습니다.' });
    }

    return NextResponse.json(
      { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin login API error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
