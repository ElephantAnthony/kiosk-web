import { useEffect, useRef, useState } from 'react';
import { getHealth, type ServiceStatus } from './api/health';
import { useKiosk } from './kiosk/useKiosk';
import { draftValid } from './kiosk/machine';
import type { OrderLine, Scenario, Packing, Payment } from './scenario/contracts';

const money = (n: number) => n.toLocaleString('ko-KR') + '원';
const packingLabel: Record<Packing,string> = { DINE_IN: '매장에서 먹기', TAKE_OUT: '포장하기' };
const paymentLabel: Record<Payment,string> = { CARD: '카드', CASH: '현금' };
const steps = ['미션', '메뉴', '장바구니', '결제', '결과'];
const stepIndex: Record<string,number> = { MISSION:0,MENU:1,OPTION:1,CART:2,PAYMENT:3,SUBMITTING:3,SUBMIT_ERROR:3,COMPLETE:4 };
function linePrice(s: Scenario, line: Pick<OrderLine,'menuId'|'optionIds'|'quantity'>) {
  const menu = s.menus.find(m => m.id === line.menuId)!;
  return (menu.price + menu.optionGroups.flatMap(g => g.options).filter(o => line.optionIds.includes(o.id)).reduce((n,o) => n+o.priceDelta,0))*line.quantity;
}
function HealthStatus() {
  const [status, setStatus] = useState<ServiceStatus | 'CHECKING' | 'ERROR'>('CHECKING');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => { setStatus('ERROR'); controller.abort(); }, 6000);
    getHealth(controller.signal).then(result => { if (!controller.signal.aborted) setStatus(result); })
      .catch(() => { if (!controller.signal.aborted) setStatus('ERROR'); }).finally(() => window.clearTimeout(timeout));
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [attempt]);
  const label = { UP:'서버 및 데이터베이스 연결 정상', DOWN:'데이터베이스 연결 불가', CHECKING:'서비스 상태 확인 중', ERROR:'서비스 연결을 확인해 주세요' }[status];
  return <div className="health"><p role="status">{label}</p><button className="secondary" disabled={status==='CHECKING'} onClick={() => { setStatus('CHECKING'); setAttempt(n=>n+1); }}>연결 다시 확인</button></div>;
}

export function App() {
  const { snapshot, send, delivery } = useKiosk();
  const c = snapshot.context;
  const state = String(snapshot.value);
  const [contrast, setContrast] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [state]);
  const s = c.scenario;
  const d = c.draft;
  const total = s ? c.cart.reduce((n,l) => n+linePrice(s,l),0) : 0;
  const count = c.cart.reduce((n,l)=>n+l.quantity,0);
  const title: Record<string,string> = { LOADING:'연습을 준비하고 있어요',LOAD_ERROR:'연습을 불러오지 못했어요', START:'천천히 연습하고, 스스로 주문할 수 있도록.',
    STARTING:'미션을 준비하고 있어요',MISSION:'오늘의 연습 미션',MENU:'메뉴를 골라 주세요',OPTION:'주문 옵션을 선택해 주세요',CART:'장바구니를 확인해 주세요',
    PAYMENT:'결제 방법을 선택해 주세요',SUBMITTING:'주문을 확인하고 있어요',SUBMIT_ERROR:'주문 결과를 확인하지 못했어요',COMPLETE:'연습 결과',CANCELLING:'연습을 취소하고 있어요',
    CANCEL_ERROR:'취소 결과를 확인하지 못했어요',CANCELLED:'연습을 취소했어요',EXPIRED:'연습 정보를 찾을 수 없어요' };
  const back = ['MENU','OPTION','CART','PAYMENT'].includes(state);
  const cancel = ['MISSION','MENU','OPTION','CART','PAYMENT','SUBMIT_ERROR'].includes(state);
  return <div className={contrast?'app contrast':'app'}>
    <a className="skip" href="#content">본문 바로가기</a>
    <header className="header"><div><span className="brand">SENIOSK</span><span className="brand-sub"> 시니스크 2.0</span></div>
      <div className="tools"><button className="secondary" aria-pressed={contrast} onClick={()=>setContrast(v=>!v)}>고대비 모드</button>
      <button className="secondary" aria-expanded={c.help} aria-controls={c.help?"help-panel":undefined} onClick={()=>send({type:'HELP'})}>도움말</button></div></header>
    <main id="content" className="shell" tabIndex={-1}>
      {['retrying','blocked','storage-error'].includes(delivery) && <p role="status" className="notice">{delivery==='storage-error'?'행동 기록 저장에 문제가 있습니다. 주문 연습은 계속할 수 있습니다.':delivery==='blocked'?'일부 행동 기록을 전송하지 못했습니다. 기록은 기기에 유지됩니다.':'행동 기록 연결이 불안정합니다. 저장된 기록은 다시 전송합니다.'}</p>}
      <div className="topline"><span>키오스크 주문 연습</span><span className="tag">실제 결제 없음</span></div>
      {stepIndex[state]!==undefined && <nav aria-label="연습 단계"><ol className="steps">{steps.map((step,i)=><li key={step} aria-current={i===stepIndex[state]?'step':undefined} className={i===stepIndex[state]?'current':i<stepIndex[state]?'done':''}><span>{i+1}</span>{step}</li>)}</ol></nav>}
      <section className={state==='START'?'panel hero':'panel'} aria-labelledby="page-title">
        <p className="eyebrow">{s && state!=='START' ? s.title : 'SENIOSK / PRACTICE'}</p>
        <h1 id="page-title" tabIndex={-1} ref={heading}>{title[state]??state}</h1>
        {c.help && <aside id="help-panel" className="notice" aria-label="도움말"><h2>천천히 진행해도 괜찮아요</h2><p>미션에 적힌 메뉴와 옵션을 골라 장바구니에 담아 주세요. 뒤로 가서 수정할 수 있고 실제 돈은 사용하지 않습니다.</p><button className="secondary" onClick={()=>send({type:'HELP'})}>도움말 닫기</button></aside>}
        {c.error && <p role="alert" className="error">{c.error}</p>}
        {state==='LOADING' && <p>시나리오를 불러오는 중입니다.</p>}
        {state==='LOAD_ERROR' && <button onClick={()=>send({type:'RETRY'})}>다시 불러오기</button>}
        {state==='START' && <>
          <p className="intro">실제 매장에 가기 전에 메뉴 선택부터 모의 결제까지 차근차근 연습해 보세요.</p>
          <h2>연습할 매장을 선택하세요</h2>
          <div className="cards">{c.catalog.map((scenario,i)=><button className="store card" key={scenario.scenarioId+scenario.version} onClick={()=>send({type:'CHOOSE_SCENARIO',scenarioId:scenario.scenarioId,version:scenario.version})}>
            <span className="store-icon" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><strong>{scenario.title}</strong><span>{scenario.description}</span><span className="link-label">연습 시작 →</span>
          </button>)}</div><HealthStatus/>
        </>}
        {state==='STARTING' && <p>서버에서 연습 미션을 발급하는 중입니다.</p>}
        {c.session && ['MISSION','MENU','OPTION','CART','PAYMENT','SUBMIT_ERROR'].includes(state) &&
          <aside className="mission" aria-label="현재 미션"><strong>오늘의 미션</strong><p>{c.session.mission.instruction}</p></aside>}
        {state==='MISSION' && <><p>미션을 읽고 준비되면 시작 버튼을 눌러 주세요. 주문 중에도 미션을 다시 볼 수 있어요.</p><button className="primary" onClick={()=>send({type:'CONTINUE'})}>메뉴 선택 시작</button></>}
        {state==='MENU' && s && <>
          <div className="choices" role="group" aria-label="메뉴 카테고리">{s.categories.map(category=><button key={category.id} className="choice" aria-pressed={c.category===category.id} onClick={()=>send({type:'CATEGORY',id:category.id})}>{category.label}</button>)}</div>
          <div className="cards">{s.menus.filter(m=>m.categoryId===c.category).map(menu=><button key={menu.id} className="card menu" onClick={()=>send({type:'SELECT_MENU',menuId:menu.id})}><span className="menu-mark" aria-hidden="true">{menu.label.slice(0,1)}</span><strong>{menu.label}</strong><span>{money(menu.price)}</span><span className="link-label">선택하기 →</span></button>)}</div>
          <button className="primary wide" onClick={()=>send({type:'VIEW_CART'})}>장바구니 보기 ({count}개)</button>
        </>}
        {state==='OPTION' && s && d && <>
          <h2>{s.menus.find(m=>m.id===d.menuId)?.label}</h2>
          {s.menus.find(m=>m.id===d.menuId)?.optionGroups.map(g=><fieldset key={g.id}><legend>{g.label} {g.required?'(필수)':'(선택)'}</legend><div className="choices">
            {!g.required && <button className="choice" aria-pressed={!g.options.some(o=>d.optionIds.includes(o.id))} onClick={()=>send({type:'OPTION',groupId:g.id,optionId:null})}>기본 선택</button>}
            {g.options.map(o=><button className="choice" key={o.id} aria-pressed={d.optionIds.includes(o.id)} onClick={()=>send({type:'OPTION',groupId:g.id,optionId:o.id})}>{o.label}{o.priceDelta>0?' +'+money(o.priceDelta):''}</button>)}
          </div></fieldset>)}
          <fieldset><legend>이용 방법 (필수)</legend><div className="choices">{s.packingOptions.map(p=><button key={p} className="choice" aria-pressed={d.packing===p} onClick={()=>send({type:'PACKING',packing:p})}>{packingLabel[p]}</button>)}</div></fieldset>
          <fieldset><legend>수량</legend><div className="quantity"><button className="secondary" aria-label="수량 줄이기" disabled={d.quantity<=1} onClick={()=>send({type:'QUANTITY',delta:-1})}>−</button><output aria-label="선택 수량">{d.quantity}</output><button className="secondary" aria-label="수량 늘리기" disabled={d.quantity>=20} onClick={()=>send({type:'QUANTITY',delta:1})}>+</button></div></fieldset>
          <p className="total">선택 금액 <strong>{money(linePrice(s,d))}</strong></p>
          {!draftValid(c) && <p className="hint">필수 옵션과 이용 방법을 선택해 주세요. 장바구니는 최대 100줄까지 담을 수 있어요.</p>}
          <button className="primary wide" disabled={!draftValid(c)} onClick={()=>send({type:'ADD'})}>{d.editIndex===null?'장바구니 담기':'변경 내용 저장'}</button>
        </>}
        {state==='CART' && s && <>
          {c.cart.length===0 ? <p>장바구니가 비어 있습니다. 메뉴를 추가해 주세요.</p> : <ul className="cart">{c.cart.map((line,i)=>{
            const menu=s.menus.find(m=>m.id===line.menuId)!;const labels=menu.optionGroups.flatMap(g=>g.options).filter(o=>line.optionIds.includes(o.id)).map(o=>o.label);
            return <li key={i}><div><strong>{menu.label} {line.quantity}개</strong><p>{[...labels,packingLabel[line.packing]].join(' / ')}</p><strong>{money(linePrice(s,line))}</strong></div><div className="choices"><button className="secondary" aria-label={menu.label+' '+(i+1)+'번 수정'} onClick={()=>send({type:'EDIT',index:i})}>수정</button><button className="secondary" aria-label={menu.label+' '+(i+1)+'번 삭제'} onClick={()=>send({type:'REMOVE',index:i})}>삭제</button></div></li>;
          })}</ul>}
          <p className="total">합계 <strong>{money(total)}</strong></p><div className="choices"><button className="secondary" onClick={()=>send({type:'BACK'})}>메뉴 추가</button><button className="primary" disabled={c.cart.length===0} onClick={()=>send({type:'CHECKOUT'})}>결제하기</button></div>
        </>}
        {state==='PAYMENT' && s && <><p className="total">모의 결제 금액 <strong>{money(total)}</strong></p><p>연습용 결제입니다. 카드 정보나 현금을 입력하지 마세요.</p>
          <div className="choices" role="group" aria-label="결제 방법">{s.paymentOptions.map(p=><button key={p} className="choice" aria-pressed={c.payment===p} onClick={()=>send({type:'PAY_METHOD',payment:p})}>{paymentLabel[p]}</button>)}</div>
          <button className="primary wide" disabled={!c.payment} onClick={()=>send({type:'SUBMIT'})}>모의 결제 완료</button></>}
        {state==='SUBMITTING' && <p>서버 채점 결과를 기다리는 중입니다. 같은 주문을 중복 제출하지 않습니다.</p>}
        {state==='SUBMIT_ERROR' && <><p>기존 주문과 결제 선택이 보존되었습니다. 동일한 내용으로 다시 확인할 수 있습니다.</p><button className="primary" onClick={()=>send({type:'RETRY'})}>같은 주문 다시 제출</button></>}
        {state==='CANCELLING' && <p>서버에 취소를 요청했습니다.</p>}
        {state==='CANCEL_ERROR' && <div className="choices"><button onClick={()=>send({type:'RETRY'})}>취소 다시 확인</button>{c.frozen && <button className="secondary" onClick={()=>send({type:'SUBMIT'})}>기존 주문 결과 확인</button>}</div>}
        {state==='COMPLETE' && c.result && <><div className="score"><p>{c.result.correct?'미션 성공!':'다시 연습해 볼까요?'}</p><strong>{(c.result.accuracy*100).toLocaleString('ko-KR',{maximumFractionDigits:2})}%</strong><span>주문 정확도</span></div>
          <dl className="metrics"><div><dt>일치</dt><dd>{c.result.matched}개</dd></div><div><dt>누락</dt><dd>{c.result.missing}개</dd></div><div><dt>초과</dt><dd>{c.result.extra}개</dd></div></dl><p>모의 결제: {c.result.paymentMatched?'일치':'불일치'}</p><p>서버 기준 경과 시간: {Math.round(c.result.serverElapsedMs/1000)}초</p><p className="hint">서버가 저장한 실제 채점 결과입니다.</p><button className="primary" onClick={()=>send({type:'RESTART'})}>다시 연습하기</button></>}
        {['CANCELLED','EXPIRED'].includes(state) && <><p>{state==='CANCELLED'?'서버에서 취소를 확인했습니다. 새 연습을 시작할 수 있어요.':'기존 결과를 변경하지 않고 새 연습을 시작할 수 있어요.'}</p><button className="primary" onClick={()=>send({type:'RESTART'})}>다시 연습하기</button></>}
        {(back||cancel) && <div className="bottom-nav">{back&&<button className="secondary" onClick={()=>send({type:'BACK'})}>← 뒤로 가기</button>}{cancel&&<button className="danger" onClick={()=>send({type:'CANCEL'})}>연습 취소</button>}</div>}
      </section>
    </main><footer>시니스크 2.0 / 실제 결제가 없는 교육용 프로젝트 <a className="admin-link" href="/admin">관리자 화면</a></footer>
  </div>;
}
