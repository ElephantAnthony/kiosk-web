import { assign, fromPromise, setup } from 'xstate';
import { listScenarios, type Scenario, type OrderLine, type Packing, type Payment } from '../scenario/contracts';
import { ApiError, startSession, submitOrder, cancelSession, type TrainingSession, type SubmissionInput, type GradeResult } from '../api/sessions';

export interface Draft { menuId: string; optionIds: string[]; packing: Packing | null; quantity: number; editIndex: number | null }
interface Context {
  catalog: Scenario[];
  scenario: Scenario | null;
  session: TrainingSession | null;
  category: string;
  preferredPacking: Packing | null;
  cart: OrderLine[];
  draft: Draft | null;
  payment: Payment | null;
  frozen: SubmissionInput | null;
  result: GradeResult | null;
  activeMs: number;
  help: boolean;
  error: string;
}
type Event =
  | { type: 'CHOOSE_SCENARIO'; scenarioId: string; version: number }
  | { type: 'CATEGORY'; id: string }
  | { type: 'SELECT_MENU'; menuId: string }
  | { type: 'SWITCH_PRODUCT'; menuId: string }
  | { type: 'START_ORDER'; packing: Packing }
  | { type: 'EDIT'; index: number }
  | { type: 'OPTION'; groupId: string; optionId: string | null }
  | { type: 'PACKING'; packing: Packing }
  | { type: 'QUANTITY'; delta: number }
  | { type: 'REMOVE'; index: number }
  | { type: 'CART_QUANTITY'; index: number; delta: number }
  | { type: 'PAY_METHOD'; payment: Payment }
  | { type: 'TICK'; ms: number }
  | { type: 'CONTINUE' | 'ADD' | 'VIEW_CART' | 'CHECKOUT' | 'SUBMIT' | 'BACK' | 'CANCEL' | 'HELP' | 'RETRY' | 'RESTART' };
export interface KioskApi {
  list: (signal: AbortSignal) => Promise<Scenario[]>;
  start: (scenarioId: string, version: number, signal: AbortSignal) => Promise<TrainingSession>;
  submit: (id: string, input: SubmissionInput, signal: AbortSignal) => Promise<GradeResult>;
  cancel: (id: string, signal: AbortSignal) => Promise<TrainingSession>;
}
const api: KioskApi = { list: listScenarios, start: startSession, submit: submitOrder, cancel: cancelSession };
const blank = (): Context => ({ catalog: [], scenario: null, session: null, category: '', preferredPacking: null, cart: [], draft: null,
  payment: null, frozen: null, result: null, activeMs: 0, help: false, error: '' });
export function draftValid(c: Context): boolean {
  const d = c.draft, s = c.scenario;
  if (!d || !s || !d.packing || !s.packingOptions.includes(d.packing) || d.quantity < 1 || d.quantity > 20) return false;
  const menu = s.menus.find(m => m.id === d.menuId);
  if (!menu || new Set(d.optionIds).size !== d.optionIds.length) return false;
  const known = new Set(menu.optionGroups.flatMap(g => g.options.map(o => o.id)));
  if (!d.optionIds.every(id => known.has(id))) return false;
  return menu.optionGroups.every(g => {
    const count = g.options.filter(o => d.optionIds.includes(o.id)).length;
    return count <= 1 && (!g.required || count === 1);
  }) && (d.editIndex !== null || c.cart.length < 100);
}
function message(error: unknown) {
  if (error instanceof ApiError && error.status === 404) return '연습 정보를 찾을 수 없습니다. 연결 또는 세션이 만료되었을 수 있습니다.';
  if (error instanceof ApiError && error.status === 409) return '이미 완료되거나 취소된 연습입니다. 기존 주문은 변경되지 않습니다.';
  return '연결에 문제가 발생했습니다. 주문은 유지됩니다. 다시 시도해 주세요.';
}
export function createKioskMachine(client: KioskApi = api) {
  return setup({
    types: { context: {} as Context, events: {} as Event },
    actors: {
      load: fromPromise<Scenario[]>(({ signal }) => client.list(signal)),
      start: fromPromise(async ({ input, signal }: { input: Scenario; signal: AbortSignal }) => {
        const session = await client.start(input.scenarioId, input.version, signal);
        if (session.scenarioId !== input.scenarioId || session.scenarioVersion !== input.version || session.status !== 'ACTIVE') throw new Error('Unexpected session');
        return session;
      }),
      submit: fromPromise(async ({ input, signal }: { input: { id: string; payload: SubmissionInput }; signal: AbortSignal }) => {
        const result = await client.submit(input.id, input.payload, signal);
        if (result.sessionId !== input.id) throw new Error('Unexpected result');
        return result;
      }),
      cancel: fromPromise(async ({ input, signal }: { input: string; signal: AbortSignal }) => {
        const result = await client.cancel(input, signal);
        if (result.id !== input || result.status !== 'CANCELLED') throw new Error('Unexpected cancellation');
        return result;
      }),
    },
    actions: {
      reset: assign(({ context }) => ({ ...blank(), catalog: context.catalog })),
      closeHelp: assign({ help: false }),
      clearError: assign({ error: '' }),
    },
  }).createMachine({
    id: 'kiosk', initial: 'LOADING', context: blank(),
    on: {
      HELP: { actions: assign({ help: ({ context }) => !context.help }) },
      TICK: { guard: ({ context, event }) => !!context.session && !context.frozen && Number.isFinite(event.ms) && event.ms > 0,
        actions: assign({ activeMs: ({ context, event }) => Math.min(86400000, context.activeMs + Math.round(event.ms)) }) },
    },
    states: {
      LOADING: { invoke: { src: 'load', onDone: { target: 'START', actions: assign({ catalog: ({ event }) => event.output, error: '' }) },
        onError: { target: 'LOAD_ERROR', actions: assign({ error: ({ event }) => message(event.error) }) } } },
      LOAD_ERROR: { on: { RETRY: 'LOADING' } },
      START: { on: { CHOOSE_SCENARIO: {
        guard: ({ context, event }) => context.catalog.some(s => s.scenarioId === event.scenarioId && s.version === event.version),
        target: 'STARTING', actions: assign(({ context, event }) => {
          const scenario = context.catalog.find(s => s.scenarioId === event.scenarioId && s.version === event.version)!;
          return { ...blank(), catalog: context.catalog, scenario, category: scenario.categories[0].id };
        }),
      } } },
      STARTING: { invoke: { src: 'start', input: ({ context }) => context.scenario!,
        onDone: { target: 'MISSION', actions: assign({ session: ({ event }) => event.output }) },
        onError: { target: 'START', actions: assign({ error: ({ event }) => message(event.error) }) } } },
      MISSION: { on: { CONTINUE: 'MENU', START_ORDER: { guard: ({context,event})=>context.scenario?.scenarioId==='doran-burger-lite' && context.scenario.packingOptions.includes(event.packing), target:'MENU', actions:assign({preferredPacking:({event})=>event.packing}) }, CANCEL: 'CANCELLING' } },
      MENU: { on: {
        CATEGORY: { guard: ({ context, event }) => !!context.scenario?.categories.some(c => c.id === event.id), actions: assign({ category: ({ event }) => event.id }) },
        SELECT_MENU: { guard: ({ context, event }) => !!context.scenario?.menus.some(m => m.id === event.menuId),
          target: 'OPTION', actions: assign({ draft: ({ context,event }) => ({ menuId: event.menuId, optionIds: [], packing: context.preferredPacking, quantity: 1, editIndex: null }) }) },
        VIEW_CART: 'CART', BACK: 'MISSION', CANCEL: 'CANCELLING',
      } },
      OPTION: { on: {
        SWITCH_PRODUCT: { guard: ({context,event})=>context.scenario?.scenarioId==='doran-burger-lite' && !!context.draft && context.draft.menuId.replace(/-set$/,'')===event.menuId.replace(/-set$/,'') && context.scenario.menus.some(m=>m.id===event.menuId && ['burgers','sets'].includes(m.categoryId)), actions:assign({draft:({context,event})=>({...context.draft!,menuId:event.menuId,optionIds:[]})}) },
        OPTION: { actions: assign({ draft: ({ context, event }) => {
          const d = context.draft!;
          const g = context.scenario!.menus.find(m => m.id === d.menuId)?.optionGroups.find(g => g.id === event.groupId);
          if (!g || (event.optionId === null ? g.required : !g.options.some(o => o.id === event.optionId))) return d;
          const ids = d.optionIds.filter(id => !g.options.some(o => o.id === id));
          return { ...d, optionIds: event.optionId === null ? ids : [...ids, event.optionId] };
        } }) },
        PACKING: { guard: ({ context, event }) => !!context.scenario?.packingOptions.includes(event.packing),
          actions: assign({ draft: ({ context, event }) => ({ ...context.draft!, packing: event.packing }) }) },
        QUANTITY: { actions: assign({ draft: ({ context, event }) => ({ ...context.draft!,
          quantity: Math.max(1, Math.min(20, context.draft!.quantity + (event.delta === 1 ? 1 : event.delta === -1 ? -1 : 0))) }) }) },
        ADD: { guard: ({ context }) => draftValid(context), target: 'CART',
          actions: assign(({ context }) => {
            const d = context.draft!;
            const line: OrderLine = { menuId: d.menuId, optionIds: [...d.optionIds].sort(), packing: d.packing!, quantity: d.quantity };
            return { cart: d.editIndex === null ? [...context.cart, line] : context.cart.map((item,i) => i === d.editIndex ? line : item), draft: null };
          }) },
        BACK: [{ guard: ({ context }) => context.draft?.editIndex !== null, target: 'CART', actions: assign({ draft: null }) },
          { target: 'MENU', actions: assign({ draft: null }) }],
        CANCEL: 'CANCELLING',
      } },
      CART: { on: {
        CART_QUANTITY: { guard: ({ context, event }) => Number.isInteger(event.index) && !!context.cart[event.index] && (event.delta===1||event.delta===-1), actions: assign({ cart: ({ context, event }) => context.cart.map((line,i)=>i===event.index?{...line,quantity:Math.max(1,Math.min(20,line.quantity+event.delta))}:line) }) },
        EDIT: { guard: ({ context, event }) => Number.isInteger(event.index) && !!context.cart[event.index], target: 'OPTION',
          actions: assign({ draft: ({ context, event }) => ({ ...context.cart[event.index], optionIds: [...context.cart[event.index].optionIds], editIndex: event.index }) }) },
        REMOVE: { guard: ({ event }) => Number.isInteger(event.index), actions: assign({ cart: ({ context, event }) => context.cart.filter((_,i) => i !== event.index) }) },
        CHECKOUT: { guard: ({ context }) => context.cart.length > 0, target: 'PAYMENT', actions: assign({ payment: null }) },
        BACK: 'MENU', CANCEL: 'CANCELLING',
      } },
      PAYMENT: { on: {
        PAY_METHOD: { guard: ({ context, event }) => !!context.scenario?.paymentOptions.includes(event.payment),
          actions: assign({ payment: ({ event }) => event.payment }) },
        SUBMIT: { guard: ({ context }) => context.cart.length > 0 && !!context.payment && !context.frozen, target: 'SUBMITTING',
          actions: assign({ frozen: ({ context }) => ({ order: context.cart.map(line => ({ ...line, optionIds: [...line.optionIds] })), payment: context.payment!, clientActiveMs: context.activeMs }), error: '' }) },
        BACK: 'CART', CANCEL: 'CANCELLING',
      } },
      SUBMITTING: { invoke: { src: 'submit', input: ({ context }) => ({ id: context.session!.id, payload: context.frozen! }),
        onDone: { target: 'COMPLETE', actions: assign({ result: ({ event }) => event.output, error: '' }) },
        onError: [{ guard: ({ event }) => event.error instanceof ApiError && event.error.status === 404, target: 'EXPIRED', actions: assign({ error: ({ event }) => message(event.error) }) },
          { target: 'SUBMIT_ERROR', actions: assign({ error: ({ event }) => message(event.error) }) }] } },
      SUBMIT_ERROR: { on: { RETRY: 'SUBMITTING', CANCEL: 'CANCELLING' } },
      CANCELLING: { invoke: { src: 'cancel', input: ({ context }) => context.session!.id,
        onDone: { target: 'CANCELLED', actions: assign({ cart: [], draft: null, frozen: null, error: '', help: false }) },
        onError: [{ guard: ({ event }) => event.error instanceof ApiError && event.error.status === 404, target: 'EXPIRED', actions: assign({ error: ({ event }) => message(event.error) }) },
          { target: 'CANCEL_ERROR', actions: assign({ error: ({ event }) => message(event.error) }) }] } },
      CANCEL_ERROR: { on: { RETRY: 'CANCELLING', SUBMIT: { guard: ({ context }) => !!context.frozen, target: 'SUBMITTING' } } },
      EXPIRED: { on: { RESTART: { target: 'START', actions: 'reset' } } },
      CANCELLED: { on: { RESTART: { target: 'START', actions: 'reset' } } },
      COMPLETE: { on: { RESTART: { target: 'START', actions: 'reset' } } },
    },
  });
}
export const kioskMachine = createKioskMachine();
