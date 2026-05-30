import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://buseong-thesharp.vercel.app';

  // 1. 기본 메인 페이지 경로
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ];

  // 2. 데이터베이스에서 새소식 글을 긁어와 동적 경로 생성
  try {
    const posts = await prisma.post.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
      take: 100, // 최대 100개 글
    });

    const newsRoutes = posts.map((post) => ({
      url: `${baseUrl}/#news`, // 원페이지 특성상 뉴스 앵커로 보냄 (상세 팝업 유도)
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...routes, ...newsRoutes];
  } catch (error) {
    console.error('Sitemap generator DB fetch error:', error);
    return routes;
  }
}
