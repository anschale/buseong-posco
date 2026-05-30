import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { referrer, path, searchParams } = body;

    // 1. IP 익명화/해싱
    const ipHeader = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const clientIp = ipHeader.split(',')[0].trim();
    const hashedIp = crypto.createHash('sha256').update(clientIp).digest('hex').substring(0, 16);

    // 2. User-Agent 수집
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // 3. 유입 검색어 파싱
    let keyword = null;
    let finalReferrer = referrer || request.headers.get('referer') || '';

    if (searchParams) {
      const params = new URLSearchParams(searchParams);
      // 네이버, 구글, 다음 등에서 넘어올 때의 검색어나 유입 매개변수 추출
      keyword = params.get('q') || params.get('query') || params.get('keyword') || params.get('utm_term') || params.get('n_keyword') || null;
    }

    // 만약 리퍼러가 있는 경우 리퍼러 URL에서 검색어 추출 시도
    if (!keyword && finalReferrer) {
      try {
        const refUrl = new URL(finalReferrer);
        keyword = refUrl.searchParams.get('q') || refUrl.searchParams.get('query') || null;
      } catch (e) {
        // 리퍼러 파싱 오류 시 무시
      }
    }

    // 4. DB에 방문 로그 비동기 적재
    try {
      await prisma.visitorLog.create({
        data: {
          ip: hashedIp,
          userAgent: userAgent.substring(0, 255),
          referrer: finalReferrer ? finalReferrer.substring(0, 255) : null,
          keyword: keyword ? decodeURIComponent(keyword).substring(0, 100) : null,
          path: path || '/',
        },
      });
    } catch (dbErr) {
      console.error('Failed to log visitor in database:', dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Visitor logging API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
