import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '유효하지 않은 게시글 ID입니다.' }, { status: 400 });
    }

    // 조회수 1 증가
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true, data: { views: updatedPost.views } });
  } catch (error) {
    console.error('Update news views error:', error);
    return NextResponse.json(
      { error: '조회수 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
