/**
 * 사이트의 항목(카테고리). 여기만 고치면 탭·배지·카테고리 페이지가 같이 바뀝니다.
 * - slug: 주소와 md 파일의 `category` 값에 쓰는 영문 id
 * - hue: 카드 썸네일·배지 색 (0–360 색상환 각도)
 */
export const categories = [
  { slug: 'portfolio', label: '포트폴리오', description: '실제 프로젝트를 문제 · 과정 · 결과로 정리한 작업 사례', hue: 250 },
  { slug: 'tips', label: '디자인 팁', description: '실무에서 쓰는 작은 요령과 체크리스트', hue: 155 },
  { slug: 'ai', label: 'AI · 프롬프트', description: '디자인 작업에 쓰는 AI 활용법과 프롬프트', hue: 300 },
  { slug: 'tools', label: '툴 · 리소스', description: '자주 쓰는 툴, 플러그인, 레퍼런스', hue: 65 },
  { slug: 'notes', label: '기록', description: '작업 노트, 회고, 생각 정리', hue: 20 },
] as const;

export type CategorySlug = (typeof categories)[number]['slug'];
export const categorySlugs = categories.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];

export function getCategory(slug: CategorySlug) {
  return categories.find((c) => c.slug === slug)!;
}
