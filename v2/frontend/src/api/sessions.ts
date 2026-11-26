export interface TrainingSession {
  id: string;
  scenarioId: string;
  scenarioVersion: number;
  uiVariant: 'standard';
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startedAt: string;
  mission: { id: string; templateId: string; instruction: string };
}

export class ApiError extends Error {
  constructor(public readonly status: number) { super('API request failed (' + status + ')'); }
}

async function json(response: Response): Promise<unknown> {
  if (!response.ok) throw new ApiError(response.status);
  return response.json();
}
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function parseSession(value: unknown): TrainingSession {
  if (!isObject(value) || typeof value.id !== 'string' || typeof value.scenarioId !== 'string' ||
      typeof value.scenarioVersion !== 'number' || value.uiVariant !== 'standard' ||
      (value.status !== 'ACTIVE' && value.status !== 'COMPLETED' && value.status !== 'CANCELLED') ||
      typeof value.startedAt !== 'string' || !isObject(value.mission) ||
      typeof value.mission.id !== 'string' || typeof value.mission.templateId !== 'string' ||
      typeof value.mission.instruction !== 'string') {
    throw new Error('Invalid session response');
  }
  return { id: value.id, scenarioId: value.scenarioId, scenarioVersion: value.scenarioVersion,
    uiVariant: value.uiVariant, status: value.status, startedAt: value.startedAt,
    mission: { id: value.mission.id, templateId: value.mission.templateId, instruction: value.mission.instruction } };
}

export async function startSession(scenarioId: string, version: number, signal?: AbortSignal): Promise<TrainingSession> {
  const csrf = await json(await fetch('/api/csrf', { credentials: 'same-origin', cache: 'no-store', signal }));
  if (!isObject(csrf) || csrf.headerName !== 'X-CSRF-TOKEN' || typeof csrf.token !== 'string') {
    throw new Error('Invalid CSRF response');
  }
  const response = await fetch('/api/sessions', {
    method: 'POST', credentials: 'same-origin', cache: 'no-store', signal,
    headers: { 'Content-Type': 'application/json', [csrf.headerName]: csrf.token },
    body: JSON.stringify({ scenarioId, version, uiVariant: 'standard' }),
  });
  return parseSession(await json(response));
}

export async function getSession(id: string, signal?: AbortSignal): Promise<TrainingSession> {
  return parseSession(await json(await fetch('/api/sessions/' + encodeURIComponent(id), {
    credentials: 'same-origin', cache: 'no-store', signal,
  })));
}
