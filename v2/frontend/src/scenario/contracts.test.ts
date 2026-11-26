import { describe, expect, it } from 'vitest';
import fixture from '../../../contracts/scenarios/boram-cafe.v1.json';
import { parseScenario } from './contracts';

describe('shared scenario JSON Schema', () => {
  it('accepts the bundled fictional cafe', () => {
    expect(parseScenario(fixture).scenarioId).toBe('boram-cafe');
  });
  it('rejects an empty expected order', () => {
    const value = structuredClone(fixture);
    value.missions[0].expected = [];
    expect(() => parseScenario(value)).toThrow('Invalid scenario contract');
  });
  it('rejects unknown properties', () => {
    expect(() => parseScenario({ ...fixture, unexpected: true })).toThrow('Invalid scenario contract');
  });
  it('rejects invalid quantity and payment', () => {
    const value = structuredClone(fixture);
    value.missions[0].expected[0].quantity = 0;
    expect(() => parseScenario(value)).toThrow();
    value.missions[0].expected[0].quantity = 2;
    value.missions[0].payment = 'REAL_PAYMENT';
    expect(() => parseScenario(value)).toThrow();
  });
});
