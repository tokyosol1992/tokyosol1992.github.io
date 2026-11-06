/** base 경로를 붙여 내부 링크를 만듭니다. 예) url('/work') */
export function url(path = '/') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}` || '/';
}
