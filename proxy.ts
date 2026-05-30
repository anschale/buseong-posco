import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('aptadmin_session');

  // 관리자 페이지 경로 보호
  if (pathname.startsWith('/admin')) {
    // 로그인 페이지는 패스
    if (pathname === '/admin/login') {
      // 이미 세션이 있으면 메인 어드민으로 리다이렉트
      if (sessionCookie) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // 세션이 없으면 로그인 페이지로 리다이렉트
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
