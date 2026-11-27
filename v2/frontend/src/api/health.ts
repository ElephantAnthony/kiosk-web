export type ServiceStatus = 'UP' | 'DOWN';

export async function getHealth(signal?: AbortSignal): Promise<ServiceStatus> {
  const response = await fetch('/healthz', { signal, cache: 'no-store' });
  if (response.status === 503) return 'DOWN';
  if (!response.ok) throw new Error('Health request failed');
  const body: unknown = await response.json();
  if (typeof body === 'object' && body !== null && 'status' in body && body.status === 'UP') {
    return 'UP';
  }
  throw new Error('Invalid health response');
}
