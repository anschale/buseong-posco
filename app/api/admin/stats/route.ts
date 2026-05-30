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

    const now = new Date();

    // 2. 오늘 기준 시간대 설정 (KST 기준 처리를 위해 서버시각 보정)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 3. 오늘 방문 로그 조회
    const todayLogs = await prisma.visitorLog.findMany({
      where: {
        createdAt: { gte: todayStart }
      }
    });

    // 4. 이번달 방문 로그 조회
    const monthLogs = await prisma.visitorLog.findMany({
      where: {
        createdAt: { gte: monthStart }
      }
    });

    // 5. 전체 로그 조회 (최근 30일 데이터 추이)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0,0,0,0);

    const recentLogs = await prisma.visitorLog.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // 6. 통계 계산
    const todayPV = todayLogs.length;
    const todayUV = new Set(todayLogs.map(l => l.ip)).size;

    const monthPV = monthLogs.length;
    const monthUV = new Set(monthLogs.map(l => l.ip)).size;

    // 7. 최근 7일간 일별 추이 집계 (SQLite/PostgreSQL 공통 호환 처리를 위해 메모리 집계)
    const dailyStatsMap: { [key: string]: { pv: number; uv: Set<string> } } = {};
    
    // 최근 7일 날짜 뼈대 초기화
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
      dailyStatsMap[dateStr] = { pv: 0, uv: new Set() };
    }

    recentLogs.forEach(log => {
      const logDate = new Date(log.createdAt);
      const dateStr = logDate.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
      if (dailyStatsMap[dateStr]) {
        dailyStatsMap[dateStr].pv += 1;
        dailyStatsMap[dateStr].uv.add(log.ip);
      }
    });

    const dailyTrend = Object.keys(dailyStatsMap).map(date => ({
      date,
      pv: dailyStatsMap[date].pv,
      uv: dailyStatsMap[date].uv.size
    }));

    // 8. 검색 유입어 순위 집계 (Top 10)
    const keywordMap: { [key: string]: number } = {};
    recentLogs.forEach(log => {
      if (log.keyword && log.keyword.trim()) {
        const kw = log.keyword.trim();
        keywordMap[kw] = (keywordMap[kw] || 0) + 1;
      }
    });

    const popularKeywords = Object.keys(keywordMap)
      .map(kw => ({ keyword: kw, count: keywordMap[kw] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 9. 리퍼러 유입 채널 집계 (Top 5)
    const referrerMap: { [key: string]: number } = {};
    recentLogs.forEach(log => {
      if (log.referrer) {
        try {
          const url = new URL(log.referrer);
          let host = url.hostname.replace('www.', '');
          if (host.includes('naver')) host = 'naver.com';
          else if (host.includes('daum')) host = 'daum.net';
          else if (host.includes('google')) host = 'google.com';
          referrerMap[host] = (referrerMap[host] || 0) + 1;
        } catch (e) {
          referrerMap['기타/직접입력'] = (referrerMap['기타/직접입력'] || 0) + 1;
        }
      } else {
        referrerMap['직접입력/북마크'] = (referrerMap['직접입력/북마크'] || 0) + 1;
      }
    });

    const referrerStats = Object.keys(referrerMap)
      .map(ref => ({ name: ref, count: referrerMap[ref] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          todayPV,
          todayUV,
          monthPV,
          monthUV,
          totalRegistered: await prisma.customer.count()
        },
        dailyTrend,
        popularKeywords,
        referrerStats
      }
    });

  } catch (error) {
    console.error('Fetch statistics admin API error:', error);
    return NextResponse.json(
      { error: '통계 정보를 가공하는 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
