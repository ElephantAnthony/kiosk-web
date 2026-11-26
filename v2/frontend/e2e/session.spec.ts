import { test, expect, type APIRequestContext } from '@playwright/test';
import { parseScenario } from '../src/scenario/contracts';

const input = { scenarioId: 'boram-cafe', version: 1, uiVariant: 'standard' };
async function start(client: APIRequestContext): Promise<string> {
  const csrfResponse = await client.get('/api/csrf');
  expect(csrfResponse.status()).toBe(200);
  const csrf = await csrfResponse.json();
  const response = await client.post('/api/sessions', {
    headers: { [csrf.headerName]: csrf.token }, data: input,
  });
  expect(response.status()).toBe(201);
  const data = await response.json();
  expect(data.status).toBe('ACTIVE');
  expect(data.mission.instruction).toContain('아메리카노');
  expect(data.ownerId).toBeUndefined();
  return data.id;
}

test('isolated session API works through the frontend proxy', async ({ request, playwright }) => {
  const scenario = await request.get('/api/scenarios/boram-cafe/1');
  expect(scenario.status()).toBe(200);
  expect(parseScenario(await scenario.json()).menus).toHaveLength(3);
  expect((await request.post('/api/sessions', { data: input })).status()).toBe(403);
  const other = await playwright.request.newContext({ baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5173' });
  try {
    const [a, b] = await Promise.all([start(request), start(other)]);
    expect(a).not.toBe(b);
    expect((await request.get('/api/sessions/' + a)).status()).toBe(200);
    expect((await other.get('/api/sessions/' + a)).status()).toBe(404);
    expect((await request.get('/api/sessions/' + b)).status()).toBe(404);
  } finally { await other.dispose(); }
});
