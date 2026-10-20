import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** 포트폴리오 케이스 스터디 — src/content/work/*.md */
const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    company: z.string().optional(),
    role: z.string().optional(),
    period: z.string().optional(),       // 예) '2023.03 – 2024.08'
    tags: z.array(z.string()).default([]),
    order: z.number().default(0),        // 클수록 위에 노출
    draft: z.boolean().default(false),   // true면 사이트에 안 보임
  }),
});

/** 개인 저장소(노트·기록·레퍼런스) — src/content/archive/*.md */
const archive = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/archive' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work, archive };
