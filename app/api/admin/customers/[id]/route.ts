import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

// 고객 수정
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: '관리자 권한이 없습니다.' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '유효하지 않은 고객 ID입니다.' }, { status: 400 });
    }

    const data = await request.json();
    const { name, phone, birthDate, address, interests } = data;

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        phone,
        birthDate,
        address,
        interests,
      },
    });

    return NextResponse.json({ success: true, data: updatedCustomer });
  } catch (error) {
    console.error('Update customer API error:', error);
    return NextResponse.json(
      { error: '고객 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 고객 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: '관리자 권한이 없습니다.' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '유효하지 않은 고객 ID입니다.' }, { status: 400 });
    }

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete customer API error:', error);
    return NextResponse.json(
      { error: '고객 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
