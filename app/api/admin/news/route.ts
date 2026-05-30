import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

// 1. 새소식 리스트 조회 (GET) - 로그인 불필요 (일반 방문객 오픈)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: skip,
    });

    const total = await prisma.post.count();

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch news error:', error);
    return NextResponse.json(
      { error: '새소식을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 2. 새소식 작성 (POST) - 관리자 전용
export async function POST(request: Request) {
  try {
    // 관리자 세션 검증
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: '관리자 권한이 없습니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, imageUrl } = body;

    if (!title || !content) {
      return NextResponse.json({ error: '제목과 내용을 입력해주세요.' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Create news error:', error);
    return NextResponse.json(
      { error: '새소식 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 3. 새소식 수정 (PUT) - 관리자 전용
export async function PUT(request: Request) {
  try {
    // 관리자 세션 검증
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: '관리자 권한이 없습니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, content, imageUrl } = body;

    if (!id || !title || !content) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json({ success: true, data: updatedPost });
  } catch (error) {
    console.error('Update news error:', error);
    return NextResponse.json(
      { error: '새소식 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 4. 새소식 삭제 (DELETE) - 관리자 전용
export async function DELETE(request: Request) {
  try {
    // 관리자 세션 검증
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: '관리자 권한이 없습니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');

    if (!idStr) {
      return NextResponse.json({ error: '삭제할 게시글 ID가 누락되었습니다.' }, { status: 400 });
    }

    await prisma.post.delete({
      where: { id: parseInt(idStr) },
    });

    return NextResponse.json({ success: true, message: '게시글이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete news error:', error);
    return NextResponse.json(
      { error: '새소식 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
