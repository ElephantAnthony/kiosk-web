import { afterEach, describe, expect, it, vi } from 'vitest';
import { getResult, submitOrder, type SubmissionInput } from './sessions';

const input: SubmissionInput = { order: [{ menuId: 'americano', optionIds: ['ice'], packing: 'TAKE_OUT', quantity: 2 }], payment: 'CARD', clientActiveMs: 1000 };
const result = { sessionId: 'synthetic', matched: 2, missing: 0, extra: 0, accuracy: 1,
  paymentMatched: true, correct: true, serverElapsedMs: 1200, clientActiveMs: 1000, completedAt: '2026-01-01T00:00:00Z' };
const response = (value: unknown) => new Response(JSON.stringify(value));
afterEach(() => vi.unstubAllGlobals());

describe('grading API client', () => {
  it('uses cookie-bound CSRF and sends the original submission', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response({ headerName: 'X-CSRF-TOKEN', token: 'synthetic-test-value' })).mockResolvedValueOnce(response(result));
    vi.stubGlobal('fetch', fetcher);
    await expect(submitOrder('synthetic', input)).resolves.toEqual(result);
    expect(fetcher.mock.calls[1][0]).toBe('/api/sessions/synthetic/submit');
    expect(fetcher.mock.calls[1][1]).toMatchObject({ method: 'POST', credentials: 'same-origin', body: JSON.stringify(input), headers: { 'X-CSRF-TOKEN': 'synthetic-test-value' } });
  });
  it('reads the persisted grade', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(result)));
    await expect(getResult('synthetic')).resolves.toEqual(result);
  });
  it('rejects invalid grade response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ ...result, accuracy: 2 })));
    await expect(getResult('synthetic')).rejects.toThrow('Invalid grade response');
  });
  it('preserves conflict status for caller', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response({ headerName: 'X-CSRF-TOKEN', token: 'synthetic-test-value' })).mockResolvedValueOnce(new Response('', { status: 409 })));
    await expect(submitOrder('synthetic', input)).rejects.toMatchObject({ status: 409 });
  });
});
