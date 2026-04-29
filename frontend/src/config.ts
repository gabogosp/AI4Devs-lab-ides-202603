/**
 * API base URL. Leave unset to use relative URLs with Create React App `proxy` (see package.json).
 */
export function getApiBaseUrl(): string {
  return (process.env.REACT_APP_API_URL ?? '').replace(/\/$/, '');
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!base) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
