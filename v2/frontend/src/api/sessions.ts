import type { OrderLine, Payment } from '../scenario/contracts';

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

export async function getCsrf(signal?: AbortSignal): Promise<{ headerName: string; token: string }> {
  const csrf = await json(await fetch('/api/csrf', { credentials: 'same-origin', cache: 'no-store', signal }));
  if (!isObject(csrf) || csrf.headerName !== 'X-CSRF-TOKEN' || typeof csrf.token !== 'string') {
    throw new Error('Invalid CSRF response');
  }
  return { headerName: csrf.headerName, token: csrf.token };
}

export async function startSession(scenarioId: string, version: number, signal?: AbortSignal): Promise<TrainingSession> {
  const csrf = await getCsrf(signal);
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

export interface SubmissionInput {
  order: OrderLine[];
  payment: Payment;
  clientActiveMs: number;
}
export interface GradeResult {
  sessionId: string;
  matched: number;
  missing: number;
  extra: number;
  accuracy: number;
  paymentMatched: boolean;
  correct: boolean;
  serverElapsedMs: number;
  clientActiveMs: number;
  completedAt: string;
}
function nonNegativeInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function parseGrade(value: unknown): GradeResult {
  if (!isObject(value) || typeof value.sessionId !== 'string' ||
      !nonNegativeInt(value.matched) || !nonNegativeInt(value.missing) ||
      !nonNegativeInt(value.extra) || typeof value.accuracy !== 'number' ||
      !Number.isFinite(value.accuracy) || value.accuracy < 0 || value.accuracy > 1 ||
      typeof value.paymentMatched !== 'boolean' || typeof value.correct !== 'boolean' ||
      !nonNegativeInt(value.serverElapsedMs) || !nonNegativeInt(value.clientActiveMs) ||
      typeof value.completedAt !== 'string') {
    throw new Error('Invalid grade response');
  }
  return { sessionId: value.sessionId, matched: value.matched, missing: value.missing,
    extra: value.extra, accuracy: value.accuracy, paymentMatched: value.paymentMatched,
    correct: value.correct, serverElapsedMs: value.serverElapsedMs,
    clientActiveMs: value.clientActiveMs, completedAt: value.completedAt };
}
// A retry must pass the same frozen input, including active time.
export async function submitOrder(id: string, input: SubmissionInput, signal?: AbortSignal): Promise<GradeResult> {
  const csrf = await getCsrf(signal);
  return parseGrade(await json(await fetch('/api/sessions/' + encodeURIComponent(id) + '/submit', {
    method: 'POST', credentials: 'same-origin', cache: 'no-store', signal,
    headers: { 'Content-Type': 'application/json', [csrf.headerName]: csrf.token },
    body: JSON.stringify(input),
  })));
}

export async function getResult(id: string, signal?: AbortSignal): Promise<GradeResult> {
  return parseGrade(await json(await fetch('/api/sessions/' + encodeURIComponent(id) + '/result', {
    credentials: 'same-origin', cache: 'no-store', signal,
  })));
}

export async function cancelSession(id: string, signal?: AbortSignal): Promise<TrainingSession> {
  const csrf = await getCsrf(signal);
  return parseSession(await json(await fetch('/api/sessions/' + encodeURIComponent(id) + '/cancel', {
    method: 'POST', credentials: 'same-origin', cache: 'no-store', signal,
    headers: { [csrf.headerName]: csrf.token },
  })));
}
