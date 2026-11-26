import { test, expect, type APIRequestContext } from '@playwright/test';

const startInput = { scenarioId: 'boram-cafe', version: 1, uiVariant: 'standard' };
const orderInput = { order: [{ menuId: 'americano', optionIds: ['ice'], packing: 'TAKE_OUT', quantity: 2 }], payment: 'CARD', clientActiveMs: 1000 };
async function csrf(client: APIRequestContext): Promise<Record<string,string>> {
  const r = await client.get('/api/csrf');
  expect(r.status()).toBe(200);
  const body = await r.json();
  return { [body.headerName]: body.token };
}
test('real proxy grading is deterministic, isolated and replay-safe', async ({ request, playwright }) => {
  const headers = await csrf(request);
  const start = await request.post('/api/sessions', { headers, data: startInput });
  expect(start.status()).toBe(201);
  const session = await start.json();
  const path = '/api/sessions/' + session.id;
  const other = await playwright.request.newContext({ baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5173' });
  try {
    const otherHeaders = await csrf(other);
    expect((await other.post(path + '/submit', { headers: otherHeaders, data: orderInput })).status()).toBe(404);
    const [first, second] = await Promise.all([
      request.post(path + '/submit', { headers, data: orderInput }),
      request.post(path + '/submit', { headers, data: orderInput }),
    ]);
    expect(first.status()).toBe(200);
    expect(second.status()).toBe(200);
    const grade = await first.json();
    expect(await second.json()).toEqual(grade);
    expect(grade).toMatchObject({ sessionId: session.id, matched: 2, missing: 0, extra: 0, accuracy: 1,
      paymentMatched: true, correct: true, clientActiveMs: 1000 });
    expect(grade.serverElapsedMs).toBeGreaterThanOrEqual(0);
    expect((await request.post(path + '/submit', { headers, data: { ...orderInput, payment: 'CASH' } })).status()).toBe(409);
    expect(await (await request.get(path + '/result')).json()).toEqual(grade);
    expect((await other.get(path + '/result')).status()).toBe(404);
    expect((await (await request.get(path)).json()).status).toBe('COMPLETED');
  } finally { await other.dispose(); }
});
