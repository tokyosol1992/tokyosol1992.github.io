import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import type { CategorySlug } from './categories';

/** 케이스 스터디(work)와 노트(archive)를 한 목록에서 다루기 위한 공통 형태 */
export interface Item {
  kind: 'work' | 'archive';
  id: string;
  href: string;
  title: string;
  summary?: string;
  category: CategorySlug;
  tags: string[];
  date?: Date;
  cover?: ImageMetadata;
  order: number;
}

export const kindLabel = { work: '케이스 스터디', archive: '노트' } as const;

export async function getItems(): Promise<Item[]> {
  const work = await getCollection('work', ({ data }) => !data.draft);
  const archive = await getCollection('archive', ({ data }) => !data.draft);
  const items: Item[] = [
    ...work.map((e) => ({
      kind: 'work' as const,
      id: e.id,
      href: `/work/${e.id}`,
      title: e.data.title,
      summary: e.data.summary,
      category: e.data.category,
      tags: e.data.tags,
      date: e.data.date,
      cover: e.data.cover,
      order: e.data.order,
    })),
    ...archive.map((e) => ({
      kind: 'archive' as const,
      id: e.id,
      href: `/archive/${e.id}`,
      title: e.data.title,
      summary: e.data.description,
      category: e.data.category,
      tags: e.data.tags,
      date: e.data.date,
      cover: e.data.cover,
      order: e.data.order,
    })),
  ];
  // order가 큰 글이 먼저, 그다음 최신순
  return items.sort((a, b) => b.order - a.order || (b.date?.valueOf() ?? 0) - (a.date?.valueOf() ?? 0));
}

/** 2026-10-20 → 2026.10.20 */
export function formatDate(d?: Date) {
  return d ? d.toISOString().slice(0, 10).replaceAll('-', '.') : '';
}
