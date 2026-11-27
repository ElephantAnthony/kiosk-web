import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { parseScenario, type Scenario, type OrderLine } from '../src/scenario/contracts';

const button=(page:Page,name:string|RegExp)=>page.getByRole('button',{name});
const packing={DINE_IN:'매장에서 먹기',TAKE_OUT:'포장하기'};
const payment={CARD:'카드',CASH:'현금'};
async function axe(page:Page){
  const result=await new AxeBuilder({page}).analyze();
  expect(result.violations.filter(v=>v.impact==='serious'||v.impact==='critical')).toEqual([]);
}
async function start(page:Page,title='보람 카페'){
  await page.goto('/');
  await button(page,new RegExp(title)).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('오늘의 연습 미션');
  await button(page,'메뉴 선택 시작').click();
}
async function capture(page:Page,name:string){
  await axe(page);
  const path=test.info().outputPath(name+'.jpg');
  await page.screenshot({path,type:'jpeg',quality:72,fullPage:true});
  await test.info().attach(name,{path,contentType:'image/jpeg'});
}
async function add(page:Page,s:Scenario,line:OrderLine,captureOption=false){
  const menu=s.menus.find(m=>m.id===line.menuId)!;
  const category=s.categories.find(c=>c.id===menu.categoryId)!;
  await page.getByRole('group',{name:'메뉴 카테고리'}).getByRole('button',{name:category.label,exact:true}).click();
  await button(page,menu.label).click();
  if(s.scenarioId==='doran-burger-lite'&&['burgers','sets'].includes(menu.categoryId)) await button(page,menu.categoryId==='sets'?'세트 구성 선택':'주문 옵션 확인').click();
  for(const group of menu.optionGroups) for(const opt of group.options.filter(o=>line.optionIds.includes(o.id))) await button(page,new RegExp(opt.label)).click();
  await button(page,packing[line.packing]).click();
  for(let i=1;i<line.quantity;i++) await button(page,'수량 늘리기').click();
  if(captureOption)await capture(page,'release-option');
  await button(page,'장바구니 담기').click();
}
const cafe=async(page:Page)=>parseScenario(await (await page.request.get('/api/scenarios/boram-cafe/1')).json());

test('all registered scenarios can be completed by the same renderer',async({page})=>{
  const raw:unknown=await (await page.request.get('/api/scenarios')).json();
  expect(Array.isArray(raw)).toBe(true);
  const scenarios=(raw as unknown[]).map(parseScenario);
  expect(scenarios.map(s=>s.scenarioId)).toEqual(expect.arrayContaining(['boram-cafe','doran-burger']));
  for(const s of scenarios){
    await page.goto('/');
    const record=s.scenarioId==='boram-cafe';
    await expect(page.getByRole('button').filter({has:page.locator('strong').getByText(s.title,{exact:true})})).toBeVisible();
    if(record)await capture(page,'release-start');
    await button(page,new RegExp(s.title)).click();
    const missionText=await page.locator('.mission p').innerText();
    const mission=s.missions.find(m=>m.instruction===missionText)!;
    expect(mission).toBeDefined();
    if(record)await capture(page,'release-mission');
    if(s.scenarioId==='doran-burger-lite') await button(page,packing[mission.expected[0].packing]).click();
    else await button(page,'메뉴 선택 시작').click();
    if(s.scenarioId==='boram-cafe'){
      await axe(page);
      await page.screenshot({path:test.info().outputPath('kiosk-menu.jpg'),type:'jpeg',quality:72,fullPage:true});
      await test.info().attach('kiosk-menu',{path:test.info().outputPath('kiosk-menu.jpg'),contentType:'image/jpeg'});
    }
    for(let i=0;i<mission.expected.length;i++){
      if(i>0) await button(page,'메뉴 추가').click();
      await add(page,s,mission.expected[i],record&&i===0);
    }
    if(record)await capture(page,'release-cart');
    await button(page,'결제하기').click();
    await button(page,payment[mission.payment]).click();
    if(record)await capture(page,'release-payment');
    if(['yellow-cafe','doran-burger-lite'].includes(s.scenarioId)) await button(page,'결제하기').click();
    await button(page,'모의 결제 완료').click();
    if(['yellow-cafe','doran-burger-lite'].includes(s.scenarioId)) await button(page,'연습 결과 확인').click();
    await expect(page.getByRole('heading',{level:1})).toHaveText('연습 결과');
    await expect(page.getByText('미션 성공!',{exact:true})).toBeVisible();
    await expect(page.locator('.score strong')).toHaveText('100%');
    await axe(page);
    if(record)await capture(page,'release-result');
    await button(page,'다시 연습하기').click();
    await expect(page.getByRole('heading',{level:1})).toContainText('스스로 주문');
    console.log('SCENARIO_UI_PASS '+s.scenarioId+' v'+s.version);
  }
});
test('wrong order, empty checkout, editing and keyboard accessibility',async({page})=>{
  const s=await cafe(page);await start(page);
  await button(page,/장바구니 보기/).click();await expect(button(page,'결제하기')).toBeDisabled();
  await button(page,'메뉴 추가').click();
  await button(page,'도움말').click();await expect(page.getByRole('complementary',{name:'도움말'})).toBeVisible();
  await button(page,'도움말 닫기').click();
  await button(page,'고대비 모드').focus();await page.keyboard.press('Enter');
  await expect(button(page,'고대비 모드')).toHaveAttribute('aria-pressed','true');
  await axe(page);
  const sizes=await page.getByRole('button').evaluateAll(nodes=>nodes.filter(n=>n.getClientRects().length>0).map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height})));
  expect(sizes.every(r=>r.w>=48&&r.h>=48)).toBe(true);
  await add(page,s,s.missions[0].expected[0]);
  await button(page,'아메리카노 1번 수정').click();
  await button(page,'따뜻하게').click();await button(page,'수량 줄이기').click();
  await button(page,'변경 내용 저장').click();
  await expect(page.getByText('아메리카노 1개')).toBeVisible();
  await button(page,'결제하기').click();await button(page,/뒤로 가기/).click();
  await expect(page.getByText('아메리카노 1개')).toBeVisible();
  await button(page,'결제하기').click();await button(page,'현금').click();await button(page,'모의 결제 완료').click();
  await expect(page.locator('.score strong')).toHaveText('0%');await expect(page.getByText('모의 결제: 불일치')).toBeVisible();
});
test('lost server response replays identical order without duplicate finalization',async({page})=>{
  const s=await cafe(page);await start(page);await add(page,s,s.missions[0].expected[0]);await button(page,'결제하기').click();await button(page,'카드').click();
  const bodies:string[]=[];let serverResult:unknown;
  await page.route('**/api/sessions/*/submit',async route=>{
    bodies.push(route.request().postData()!);
    if(bodies.length===1){const response=await route.fetch();expect(response.status()).toBe(200);serverResult=await response.json();await route.abort('failed');}
    else await route.continue();
  });
  await button(page,'모의 결제 완료').click();await expect(page.getByRole('heading',{level:1})).toHaveText('주문 결과를 확인하지 못했어요');
  await expect(button(page,'같은 주문 다시 제출')).toBeVisible();
  const replay=page.waitForResponse(r=>r.url().endsWith('/submit')&&r.status()===200);
  await button(page,'같은 주문 다시 제출').click();expect(await (await replay).json()).toEqual(serverResult);
  await expect(page.locator('.score strong')).toHaveText('100%');
  expect(bodies).toHaveLength(2);expect(bodies[1]).toBe(bodies[0]);
});
test('server cancellation clears cart and allows fresh practice',async({page})=>{
  const s=await cafe(page);await start(page);await add(page,s,s.missions[0].expected[0]);
  const response=page.waitForResponse(r=>r.url().endsWith('/cancel')&&r.status()===200);
  await button(page,'연습 취소').click();const cancelled=await (await response).json();
  expect(cancelled.status).toBe('CANCELLED');await expect(page.getByRole('heading',{level:1})).toHaveText('연습을 취소했어요');
  expect((await (await page.request.get('/api/sessions/'+cancelled.id)).json()).status).toBe('CANCELLED');
  await button(page,'다시 연습하기').click();await button(page,/보람 카페/).click();await button(page,'메뉴 선택 시작').click();
  await expect(button(page,/장바구니 보기/)).toContainText('0개');
});
