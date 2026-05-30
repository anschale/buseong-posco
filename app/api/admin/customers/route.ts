import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    // 1. 관리자 권한 확인
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: '관리자 권한이 없습니다.' }, { status: 401 });
    }

    // 2. 관심고객 리스트 최신순 조회
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    console.error('Fetch customers admin API error:', error);
    return NextResponse.json(
      { error: '관심고객 리스트를 가져오는 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
