import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categorySlugs } from './lib/categories';

/** 포트폴리오 케이스 스터디 — src/content/work/*.md */
const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    summary: z.string(),
    category: z.enum(categorySlugs).default('portfolio'), // src/lib/categories.ts의 slug
    cover: image().optional(),           // 카드·상단 이미지. 예) ./my-project/cover.png
    company: z.string().optional(),
    role: z.string().optional(),
    period: z.string().optional(),       // 예) '2023.03 – 2024.08'
    date: z.coerce.date().optional(),    // 목록 정렬용 (보통 프로젝트 종료일)
    tags: z.array(z.string()).default([]),
    order: z.number().default(0),        // 클수록 위에 노출
    draft: z.boolean().default(false),   // true면 사이트에 안 보임
  }),
});

/** 노트·팁·기록 — src/content/archive/*.md */
const archive = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/archive' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    category: z.enum(categorySlugs).default('notes'),
    cover: image().optional(),
    tags: z.array(z.string()).default([]),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work, archive };
