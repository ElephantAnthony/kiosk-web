import { describe,expect,it,vi } from 'vitest';
import { EventSdk } from './sdk';
import { validEvent,type TrainingEvent } from './contract';
import type { Outbox } from './outbox';
import { DeliveryError,retryAfter,type Transport } from './transport';
const session={sessionId:'00000000-0000-4000-8000-000000000001',scenarioId:'boram-cafe',scenarioVersion:1,uiVariant:'standard' as const};
const row=(sequence:number):TrainingEvent=>({...session,eventId:'00000000-0000-4000-8000-'+String(sequence).padStart(12,'0'),sequence,eventType:'SESSION_STARTED',clientTimestamp:'2026-01-01T00:00:00.000Z',payload:{}});
function store(rows:TrainingEvent[]):Outbox{
  return {append:async event=>{rows.push({...event,sequence:rows.length+1});},pending:async()=>[...rows],acknowledge:async ids=>{for(let i=rows.length-1;i>=0;i--)if(ids.includes(rows[i].eventId))rows.splice(i,1);}};
}
describe('durable event delivery',()=>{
  it('validates shared contract and rejects free text',()=>{
    expect(validEvent(row(1))).toBe(true);
    expect(validEvent({...row(1),payload:{freeText:'not allowed'}})).toBe(false);
    expect(validEvent({...row(1),eventType:'QUANTITY_CHANGED',payload:{quantity:21}})).toBe(false);
  });
  it('batches at most 20 and removes acknowledged IDs only',async()=>{
    const rows=Array.from({length:43},(_,i)=>row(i+1));
    const send=vi.fn<Transport>(async events=>events.map(e=>e.eventId));
    await new EventSdk(store(rows),send).flush();
    expect(send.mock.calls.map(c=>c[0].length)).toEqual([20,20,3]);expect(rows).toEqual([]);
  });
  it('keeps same records after lost ACK and respects backoff',async()=>{
    const rows=[row(1),row(2)];let now=1000;
    const send=vi.fn<Transport>().mockRejectedValueOnce(new Error('lost ACK')).mockImplementation(async events=>events.map(e=>e.eventId));
    const sdk=new EventSdk(store(rows),send,()=>now,()=>1);
    await sdk.flush();expect(rows).toHaveLength(2);await sdk.flush();expect(send).toHaveBeenCalledTimes(1);
    now+=1001;await sdk.flush();expect(send.mock.calls[1][0]).toEqual(send.mock.calls[0][0]);expect(rows).toEqual([]);
  });
  it('retains entire atomic batch for incomplete or foreign ACK',async()=>{
    const rows=[row(1),row(2)];
    await new EventSdk(store(rows),async events=>[events[0].eventId]).flush();expect(rows).toHaveLength(2);
    await new EventSdk(store(rows),async()=>['unrelated','foreign']).flush();expect(rows).toHaveLength(2);
  });
  it('respects Retry-After even if manually flushed',async()=>{
    const rows=[row(1)];let now=1000;
    const send=vi.fn<Transport>().mockRejectedValueOnce(new DeliveryError(429,5000)).mockImplementation(async events=>events.map(e=>e.eventId));
    const sdk=new EventSdk(store(rows),send,()=>now,()=>0);
    await sdk.flush();now+=4999;await sdk.flush();expect(send).toHaveBeenCalledTimes(1);
    now+=1;await sdk.flush();expect(rows).toEqual([]);
    expect(retryAfter('3',0)).toBe(3000);expect(retryAfter('Thu, 01 Jan 1970 00:00:10 GMT',5000)).toBe(5000);
  });
  it('prevents simultaneous flush and retains conflict records',async()=>{
    const rows=[row(1)];const send=vi.fn<Transport>().mockRejectedValue(new DeliveryError(409));
    const sdk=new EventSdk(store(rows),send);
    await Promise.all([sdk.flush(),sdk.flush()]);await sdk.flush();
    expect(send).toHaveBeenCalledTimes(1);expect(rows).toHaveLength(1);
  });
});
