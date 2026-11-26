import { createActor, waitFor } from 'xstate';
import { describe, expect, it, vi } from 'vitest';
import fixture from '../../../contracts/scenarios/boram-cafe.v1.json';
import { parseScenario } from '../scenario/contracts';
import { createKioskMachine, type KioskApi } from './machine';
import type { GradeResult, TrainingSession } from '../api/sessions';

const scenario=parseScenario(fixture);
const session: TrainingSession={id:'synthetic-session',scenarioId:scenario.scenarioId,scenarioVersion:1,uiVariant:'standard',status:'ACTIVE',startedAt:'2026-01-01T00:00:00Z',mission:{id:'synthetic-mission',templateId:'coffee-takeout',instruction:scenario.missions[0].instruction}};
const grade: GradeResult={sessionId:session.id,matched:2,missing:0,extra:0,accuracy:1,paymentMatched:true,correct:true,serverElapsedMs:2500,clientActiveMs:1000,completedAt:'2026-01-01T00:00:03Z'};
async function setup(overrides:Partial<KioskApi>={}) {
  const api:KioskApi={list:vi.fn(async()=>[scenario]),start:vi.fn(async()=>session),submit:vi.fn(async()=>grade),cancel:vi.fn(async()=>({...session,status:'CANCELLED' as const})),...overrides};
  const actor=createActor(createKioskMachine(api)).start();
  await waitFor(actor,s=>s.matches('START'));
  actor.send({type:'CHOOSE_SCENARIO',scenarioId:scenario.scenarioId,version:1});
  await waitFor(actor,s=>s.matches('MISSION'));
  actor.send({type:'CONTINUE'});
  return {actor,api};
}
type Actor=Awaited<ReturnType<typeof setup>>['actor'];
function fill(actor:Actor){
  actor.send({type:'SELECT_MENU',menuId:'americano'});
  actor.send({type:'OPTION',groupId:'temperature',optionId:'ice'});
  actor.send({type:'PACKING',packing:'TAKE_OUT'});
  actor.send({type:'QUANTITY',delta:1});
  actor.send({type:'ADD'});
  actor.send({type:'CHECKOUT'});
  actor.send({type:'PAY_METHOD',payment:'CARD'});
}
describe('kiosk XState workflow',()=>{
  it('blocks invalid states, required options and empty cart',async()=>{
    const {actor,api}=await setup();
    actor.send({type:'SUBMIT'}); expect(api.submit).not.toHaveBeenCalled();
    actor.send({type:'VIEW_CART'}); actor.send({type:'CHECKOUT'});
    expect(actor.getSnapshot().matches('CART')).toBe(true);
    actor.send({type:'BACK'});actor.send({type:'SELECT_MENU',menuId:'americano'});actor.send({type:'ADD'});
    expect(actor.getSnapshot().matches('OPTION')).toBe(true);
    actor.send({type:'OPTION',groupId:'temperature',optionId:'unknown'});
    expect(actor.getSnapshot().context.draft?.optionIds).toEqual([]);
    actor.stop();
  });
  it('edits quantity and options, back preserves cart, help preserves state',async()=>{
    const {actor}=await setup();fill(actor);actor.send({type:'BACK'});
    actor.send({type:'EDIT',index:0});actor.send({type:'OPTION',groupId:'temperature',optionId:'hot'});
    actor.send({type:'QUANTITY',delta:-1});actor.send({type:'ADD'});
    expect(actor.getSnapshot().context.cart).toEqual([{menuId:'americano',optionIds:['hot'],packing:'TAKE_OUT',quantity:1}]);
    actor.send({type:'HELP'});expect(actor.getSnapshot().context.help).toBe(true);
    expect(actor.getSnapshot().matches('CART')).toBe(true);
    actor.send({type:'REMOVE',index:0});actor.send({type:'CHECKOUT'});
    expect(actor.getSnapshot().matches('CART')).toBe(true);actor.stop();
  });
  it('freezes retry payload and ignores concurrent submit and back',async()=>{
    const submit=vi.fn<KioskApi['submit']>().mockRejectedValueOnce(new Error('lost response')).mockResolvedValueOnce(grade);
    const {actor}=await setup({submit});fill(actor);actor.send({type:'TICK',ms:1000});
    actor.send({type:'SUBMIT'});actor.send({type:'SUBMIT'});actor.send({type:'BACK'});
    await waitFor(actor,s=>s.matches('SUBMIT_ERROR'));
    expect(submit).toHaveBeenCalledTimes(1);expect(actor.getSnapshot().context.cart).toHaveLength(1);
    actor.send({type:'TICK',ms:1000});actor.send({type:'RETRY'});
    await waitFor(actor,s=>s.matches('COMPLETE'));
    expect(submit.mock.calls[1][1]).toEqual(submit.mock.calls[0][1]);
    expect(actor.getSnapshot().context.result).toEqual(grade);
    actor.send({type:'RESTART'});expect(actor.getSnapshot().context.cart).toEqual([]);
    expect(actor.getSnapshot().matches('START')).toBe(true);actor.stop();
  });
  it('only clears cart after confirmed server cancellation',async()=>{
    const cancel=vi.fn<KioskApi['cancel']>().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({...session,status:'CANCELLED'});
    const {actor}=await setup({cancel});fill(actor);actor.send({type:'CANCEL'});
    await waitFor(actor,s=>s.matches('CANCEL_ERROR'));
    expect(actor.getSnapshot().context.cart).toHaveLength(1);
    actor.send({type:'RETRY'});await waitFor(actor,s=>s.matches('CANCELLED'));
    expect(actor.getSnapshot().context.cart).toEqual([]);actor.stop();
  });
});
