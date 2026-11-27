import { useState } from 'react';
import type { EventFrom, SnapshotFrom } from 'xstate';
import { draftValid, type kioskMachine } from '../../kiosk/machine';
import type { Scenario, OrderLine } from '../../scenario/contracts';
import { ProductArt } from './YellowMenu';

const money=(n:number)=>n.toLocaleString('ko-KR')+'원';
const packing={DINE_IN:'매장에서 먹기',TAKE_OUT:'포장하기'};
const payment={CARD:'카드',CASH:'현금'};
type Send=(event:EventFrom<typeof kioskMachine>)=>void;
type Props={snapshot:SnapshotFrom<typeof kioskMachine>;send:Send;total:number;count:number;onGrade:()=>void};
function price(s:Scenario,line:Pick<OrderLine,'menuId'|'optionIds'|'quantity'>){
  const m=s.menus.find(m=>m.id===line.menuId)!;
  return (m.price+m.optionGroups.flatMap(g=>g.options).filter(o=>line.optionIds.includes(o.id)).reduce((a,o)=>a+o.priceDelta,0))*line.quantity;
}
export function YellowHeader({activeMs,send,complete=false}:{activeMs:number;send:Send;complete?:boolean}){
  return <div className="yellow-head yellow-common-head"><button className="secondary" aria-label="홈" onClick={()=>send({type:complete?'RESTART':'BACK'})}>⌂</button><strong>YELLOW CAFE</strong><span className="yellow-clock">◷ 남은시간 <b>{Math.max(0,120-Math.floor(activeMs/1000))}초</b></span></div>;
}
function Receipt({scenario,cart,send}:{scenario:Scenario;cart:OrderLine[];send?:Send}){
  return <div className="yellow-receipt"><div className="yellow-summary-head"><strong>주문하신 메뉴</strong><strong>수량</strong><strong>주문금액</strong></div>{cart.length===0?<p className="yellow-empty">장바구니가 비어 있습니다. 메뉴를 추가해 주세요.</p>:cart.map((l,i)=>{
    const m=scenario.menus.find(m=>m.id===l.menuId)!;
    const labels=m.optionGroups.flatMap(g=>g.options).filter(o=>l.optionIds.includes(o.id)).map(o=>o.label);
    return <div className="yellow-receipt-row" key={i}><div className="yellow-receipt-product"><ProductArt id={m.id}/><div><strong>{m.label}</strong><p>{[...labels,packing[l.packing]].join(' / ')}</p>{send&&<div className="yellow-row-actions"><button className="secondary" aria-label={m.label+' '+(i+1)+'번 수정'} onClick={()=>send({type:'EDIT',index:i})}>수정</button><button className="secondary" aria-label={m.label+' '+(i+1)+'번 삭제'} onClick={()=>send({type:'REMOVE',index:i})}>삭제</button></div>}</div></div><div className="yellow-row-qty">{send&&<button className="secondary" aria-label={m.label+' '+(i+1)+'번 수량 줄이기'} disabled={l.quantity<=1} onClick={()=>send({type:'CART_QUANTITY',index:i,delta:-1})}>−</button>}<strong>{l.quantity}개</strong>{send&&<button className="secondary" aria-label={m.label+' '+(i+1)+'번 수량 늘리기'} disabled={l.quantity>=20} onClick={()=>send({type:'CART_QUANTITY',index:i,delta:1})}>+</button>}</div><strong>{money(price(scenario,l))}</strong></div>;
  })}</div>;
}
function Totals({total,count}:{total:number;count:number}){return <div className="yellow-totals"><div><span>주문수량</span><strong>{count}개</strong></div><div><span>총 결제금액</span><strong>{money(total)}</strong></div></div>;}
function TerminalArt(){
  const [failed,setFailed]=useState(false);
  return failed?<svg className="yellow-terminal-art" viewBox="0 0 360 240" aria-hidden="true"><defs><linearGradient id="terminal" x2="1" y2="1"><stop stopColor="#575b62"/><stop offset="1" stopColor="#16181b"/></linearGradient></defs><path d="M70 24 H260 Q280 24 294 54 L334 169 Q343 202 305 214 H59 Q29 211 36 184 L48 59 Q53 24 70 24Z" fill="url(#terminal)" stroke="#111" strokeWidth="3"/><path d="M77 44 H248 L283 135 H60Z" fill="#111"/><rect x="146" y="54" width="28" height="5" rx="2" fill="#63ed8f"/><g stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"><path d="M155 79 Q185 100 155 121 M165 71 Q207 100 165 129 M145 86 Q164 100 145 114"/><rect x="186" y="91" width="43" height="27" rx="3" transform="rotate(-22 207 104)"/></g><rect x="82" y="162" width="208" height="19" rx="9" fill="#070707"/><rect x="96" y="167" width="179" height="8" rx="4" fill="#ffd329"/><rect x="156" y="189" width="48" height="23" rx="4" fill="none" stroke="#fff" strokeWidth="2"/></svg>:<img className="yellow-terminal-art" src="/yellow/card-terminal.webp" alt="" onError={()=>setFailed(true)}/>;
}
function PaymentStage({snapshot,send,total,count}:Omit<Props,'onGrade'>){
  const c=snapshot.context,s=c.scenario!;
  const [terminal,setTerminal]=useState(false);
  if(terminal&&c.payment) return <div className="yellow-stage yellow-terminal">
    <div className="yellow-terminal-title">{payment[c.payment]} 결제</div>
    <h2>{c.payment==='CARD'?'카드를 단말기에 삽입하거나 태그해 주세요':'연습용 지폐를 투입해 주세요'}</h2>
    {c.payment==='CARD'?<TerminalArt/>:<svg className="yellow-terminal-art" viewBox="0 0 320 200" aria-hidden="true"><rect x="24" y="100" width="272" height="76" rx="12" fill="#303238"/><rect x="53" y="112" width="214" height="16" rx="6" fill="#111"/><path d="M74 18 H246 V113 H74Z" fill="#cde0b8" stroke="#53754c" strokeWidth="2"/><rect x="86" y="29" width="148" height="70" rx="6" fill="none" stroke="#53754c"/><text x="160" y="75" fontSize="30" fontWeight="bold" textAnchor="middle" fill="#365c36">₩</text></svg>}
    <Totals total={total} count={count}/><p className="yellow-note">실제 카드나 현금을 사용하지 않는 모의 결제입니다.</p>
    <div className="yellow-actions"><button className="secondary" onClick={()=>setTerminal(false)}>이전으로</button><button className="yellow-action" onClick={()=>send({type:'SUBMIT'})}>모의 결제 완료</button></div>
  </div>;
  return <div className="yellow-stage">
    <section className="yellow-step-card"><h2><span>STEP 1</span> 할인수단</h2><p className="yellow-discount">해당없음</p><p className="hint">이번 연습에서는 쿠폰 및 할인을 사용하지 않습니다.</p></section>
    <section className="yellow-step-card"><h2><span>STEP 2</span> 결제수단</h2><div className="yellow-choice-grid" role="group" aria-label="결제 방법">{s.paymentOptions.map(p=><button key={p} className="choice" aria-pressed={c.payment===p} onClick={()=>send({type:'PAY_METHOD',payment:p})}><span aria-hidden="true" className="yellow-pay-icon">{p==='CARD'?'▤':'₩'}</span>{payment[p]} 결제</button>)}</div></section>
    <Receipt scenario={s} cart={c.cart}/><Totals total={total} count={count}/>
    <p className="yellow-note">실제 결제가 없는 연습입니다.</p><div className="yellow-actions"><button className="secondary" onClick={()=>send({type:'BACK'})}>이전으로</button><button className="yellow-action" disabled={!c.payment} onClick={()=>setTerminal(true)}>결제하기</button></div>
  </div>;
}
export function YellowStages({snapshot,send,total,count,onGrade}:Props){
  const c=snapshot.context,s=c.scenario!,d=c.draft,state=String(snapshot.value);
  if(state==='OPTION'&&d){
    const m=s.menus.find(m=>m.id===d.menuId)!;
    return <div className="yellow-stage"><div className="yellow-product-detail"><ProductArt id={m.id}/><div><h2>{m.label}</h2><p>기본 가격</p><strong>{money(m.price)}</strong></div></div>
      {m.optionGroups.map(g=><fieldset key={g.id} className="yellow-step-card"><legend>{g.label} {g.required?'(필수)':'(선택)'}</legend><div className="yellow-choice-grid">{!g.required&&<button className="choice" aria-pressed={!g.options.some(o=>d.optionIds.includes(o.id))} onClick={()=>send({type:'OPTION',groupId:g.id,optionId:null})}>기본 선택</button>}{g.options.map(o=><button key={o.id} className="choice" aria-pressed={d.optionIds.includes(o.id)} onClick={()=>send({type:'OPTION',groupId:g.id,optionId:o.id})}>{o.label}{o.priceDelta>0?' +'+money(o.priceDelta):''}</button>)}</div></fieldset>)}
      <fieldset className="yellow-step-card"><legend>이용 방법 (필수)</legend><div className="yellow-choice-grid">{s.packingOptions.map(p=><button className="choice" key={p} aria-pressed={d.packing===p} onClick={()=>send({type:'PACKING',packing:p})}>{packing[p]}</button>)}</div></fieldset>
      <fieldset className="yellow-step-card"><legend>수량</legend><div className="quantity yellow-quantity"><button className="secondary" aria-label="수량 줄이기" disabled={d.quantity<=1} onClick={()=>send({type:'QUANTITY',delta:-1})}>−</button><output aria-label="선택 수량">{d.quantity}</output><button className="secondary" aria-label="수량 늘리기" disabled={d.quantity>=20} onClick={()=>send({type:'QUANTITY',delta:1})}>+</button></div></fieldset>
      <p className="total">선택 금액 <strong>{money(price(s,d))}</strong></p>{!draftValid(c)&&<p className="hint">필수 옵션과 이용 방법을 선택해 주세요.</p>}<button className="yellow-action wide" disabled={!draftValid(c)} onClick={()=>send({type:'ADD'})}>{d.editIndex===null?'장바구니 담기':'변경 내용 저장'}</button>
    </div>;
  }
  if(state==='CART')return <div className="yellow-stage yellow-cart-stage"><Receipt scenario={s} cart={c.cart} send={send}/><div className="yellow-stage-bottom"><Totals total={total} count={count}/><div className="yellow-actions"><button className="secondary" onClick={()=>send({type:'BACK'})}>메뉴 추가</button><button className="yellow-action" disabled={c.cart.length===0} onClick={()=>send({type:'CHECKOUT'})}>결제하기</button></div></div></div>;
  if(state==='PAYMENT')return <PaymentStage snapshot={snapshot} send={send} total={total} count={count}/>;
  if(state==='COMPLETE'&&c.result)return <div className="yellow-stage"><div className="yellow-completed"><span aria-hidden="true">✓</span><h2>주문이 완료되었습니다</h2><p>모의 결제가 완료되었습니다.</p><p>연습용 픽업 안내: 주문한 음료를 받아 주세요.</p></div><Receipt scenario={s} cart={c.cart}/><Totals total={total} count={count}/><p className="yellow-note">결제수단: {c.payment?payment[c.payment]:'—'} / 실제 결제 없음</p><button className="yellow-action wide" onClick={onGrade}>연습 결과 확인</button></div>;
  return null;
}
