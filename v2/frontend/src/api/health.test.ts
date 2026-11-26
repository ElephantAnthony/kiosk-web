import { afterEach, describe, expect, it, vi } from 'vitest';
import { getHealth } from './health';

afterEach(() => vi.unstubAllGlobals());

describe('health API', () => {
  it('recognizes database readiness', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"status":"UP"}')));
    await expect(getHealth()).resolves.toBe('UP');
  });
  it('recognizes an unavailable database', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    await expect(getHealth()).resolves.toBe('DOWN');
  });
  it('rejects unexpected responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"status":"unknown"}')));
    await expect(getHealth()).rejects.toThrow('Invalid health response');
  });
  it('rejects network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(getHealth()).rejects.toThrow('offline');
  });
});
