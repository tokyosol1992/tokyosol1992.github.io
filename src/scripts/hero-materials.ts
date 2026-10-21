/** 히어로 오브젝트 재질 프리셋. stats는 HUD에 보이는 장식용 수치 */
export const materials = [
  {
    key: 'holographic',
    label: 'holographic',
    stats: [
      { label: 'iridescence', value: 92 },
      { label: 'gloss', value: 85 },
      { label: 'transparency', value: 12 },
    ],
  },
  {
    key: 'prism',
    label: 'prism glass',
    stats: [
      { label: 'refraction', value: 89 },
      { label: 'dispersion', value: 74 },
      { label: 'transparency', value: 96 },
    ],
  },
  {
    key: 'metallic',
    label: 'liquid metal',
    stats: [
      { label: 'reflection', value: 97 },
      { label: 'roughness', value: 22 },
      { label: 'transparency', value: 0 },
    ],
  },
] as const;
