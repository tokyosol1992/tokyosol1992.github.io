/** 히어로 페르소나 스캔 모드. stats는 HUD에 보이는 장식용 수치 */
export const modes = [
  {
    key: 'visual',
    label: 'visual',
    stats: [
      { label: 'signal', value: 98 },
      { label: 'exposure', value: 64 },
      { label: 'noise', value: 7 },
    ],
  },
  {
    key: 'thermal',
    label: 'thermal',
    stats: [
      { label: 'heat index', value: 72 },
      { label: 'contrast', value: 88 },
      { label: 'noise', value: 18 },
    ],
  },
  {
    key: 'edge',
    label: 'edge scan',
    stats: [
      { label: 'edge density', value: 91 },
      { label: 'mesh sync', value: 83 },
      { label: 'noise', value: 3 },
    ],
  },
] as const;
