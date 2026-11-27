import { describe,it,expect } from 'vitest';
import { defaults } from './api';
describe('UTC cohort filter defaults',()=>{it('uses inclusive start and exclusive end across month boundary',()=>{expect(defaults(new Date('2026-03-01T23:59:00Z'))).toEqual({from:'2026-01-31',to:'2026-03-02',scenario:''});});});
