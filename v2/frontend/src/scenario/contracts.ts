import Ajv2020 from 'ajv/dist/2020.js';
import schema from '../../../contracts/scenario.schema.json' with { type: 'json' };

export type Packing = 'DINE_IN' | 'TAKE_OUT';
export type Payment = 'CARD' | 'CASH';
export interface OrderLine { menuId: string; optionIds: string[]; packing: Packing; quantity: number }
export interface Option { id: string; label: string; priceDelta: number }
export interface OptionGroup { id: string; label: string; required: boolean; options: Option[] }
export interface Menu { id: string; categoryId: string; label: string; price: number; optionGroups: OptionGroup[] }
export interface Scenario {
  scenarioId: string;
  version: number;
  title: string;
  description: string;
  categories: { id: string; label: string }[];
  menus: Menu[];
  packingOptions: Packing[];
  paymentOptions: Payment[];
  missions: { id: string; instruction: string; expected: OrderLine[]; payment: Payment }[];
}

const validator = new Ajv2020({ allErrors: true, strict: true }).compile<Scenario>(schema);

export function parseScenario(value: unknown): Scenario {
  if (!validator(value)) throw new Error('Invalid scenario contract');
  return value;
}

export async function getScenario(id: string, version: number, signal?: AbortSignal): Promise<Scenario> {
  const response = await fetch('/api/scenarios/' + encodeURIComponent(id) + '/' + version, {
    signal,
    cache: 'no-store',
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error('Scenario request failed');
  return parseScenario(await response.json());
}
