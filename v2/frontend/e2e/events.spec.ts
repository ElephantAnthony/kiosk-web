import { test,expect,type Page } from '@playwright/test';

async function pending(page:Page){
  return page.evaluate(()=>new Promise<{eventId:string;sessionId:string;eventType:string;sequence:number}[]>((resolve,reject)=>{
    const r=indexedDB.open('seniosk-events-v1',1);
    r.onerror=()=>reject(r.error);
    r.onsuccess=()=>{const db=r.result;try{
      const q=db.transaction('events','readonly').objectStore('events').getAll();
      q.onsuccess=()=>{db.close();resolve(q.result);};q.onerror=()=>{db.close();reject(q.error);};
    }catch(error){db.close();reject(error);}};
  }));
}
async function start(page:Page){
  await page.goto('/');
  await page.getByRole('button',{name:/보람 카페/}).click();
  await page.getByRole('button',{name:'메뉴 선택 시작'}).click();
  await expect.poll(async()=> (await pending(page)).length).toBeGreaterThan(0);
}
test('offline events survive reload and lost ACK, then drain',async({page,context})=>{
  let allow=false, lost=false;
  const attempted:string[][]=[];
  await page.route('**/api/sessions/*/events',async route=>{
    if(!allow){await route.abort();return;}
    const batch=route.request().postDataJSON().events as {eventId:string}[];
    attempted.push(batch.map(e=>e.eventId).sort());
    if(!lost){lost=true;const response=await route.fetch();expect(response.status()).toBe(200);await route.abort('failed');}
    else await route.continue();
  });
  await start(page);
  await context.setOffline(true);
  await page.getByRole('button',{name:/아메리카노/}).click();
  await page.getByRole('button',{name:'차갑게'}).click();
  await page.getByRole('button',{name:'수량 늘리기'}).click();
  await expect.poll(async()=> (await pending(page)).some(e=>e.eventType==='QUANTITY_CHANGED')).toBe(true);
  const before=await pending(page);
  expect(new Set(before.map(e=>e.sequence)).size).toBe(before.length);
  await context.setOffline(false);
  await page.reload();
  await expect(page.getByRole('button',{name:/보람 카페/})).toBeVisible();
  await expect.poll(async()=> (await pending(page)).map(e=>e.eventId).sort()).toEqual(before.map(e=>e.eventId).sort());
  allow=true;
  await expect.poll(async()=> (await pending(page)).length,{timeout:22000}).toBe(0);
  expect(attempted.length).toBeGreaterThanOrEqual(2);
  expect(attempted[1]).toEqual(attempted[0]);
  console.log('OUTBOX_RECOVERY_PASS '+before.length+' persisted events');
});
test('429 retry-after delays identical batch and keeps events until ACK',async({page})=>{
  const times:number[]=[],bodies:string[]=[];
  await page.route('**/api/sessions/*/events',async route=>{
    times.push(Date.now());bodies.push(route.request().postData()!);
    if(times.length===1)await route.fulfill({status:429,headers:{'Retry-After':'2'},body:'rate limited'});
    else await route.continue();
  });
  await start(page);
  await expect.poll(()=>times.length,{timeout:20000}).toBeGreaterThanOrEqual(2);
  expect(times[1]-times[0]).toBeGreaterThanOrEqual(1900);expect(bodies[1]).toBe(bodies[0]);
  await expect.poll(async()=> (await pending(page)).length).toBe(0);
});
