import { useState } from 'react';
import type { EventFrom } from 'xstate';
import type { kioskMachine } from '../../kiosk/machine';
import type { Scenario,OrderLine,Packing } from '../../scenario/contracts';
import { DoranArt } from './DoranArt';
import './doran.css';
type Send=(event:EventFrom<typeof kioskMachine>)=>void;
const money=(n:number)=>n.toLocaleString('ko-KR')+'원';
export function DoranStart({onChoose}:{onChoose:(p:Packing)=>void}){
 return <div className="doran-start"><h2>주문 방법을 선택해 주세요</h2><p>이용 방법을 선택해 주세요.</p><div className="doran-start-grid"><button onClick={()=>onChoose('DINE_IN')}><strong>매장에서 먹기</strong><svg viewBox="0 0 160 120" aria-hidden="true"><path d="M15 48 H145 M80 48 V108 M45 108 H115 M15 25 V90 H51 V108 M145 25 V90 H109 V108" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"/><path d="M65 26 Q80 5 95 26Z M65 31 H95" stroke="#8f293b" strokeWidth="4" fill="none"/></svg></button><button onClick={()=>onChoose('TAKE_OUT')}><strong>포장하기</strong><svg viewBox="0 0 160 120" aria-hidden="true"><path d="M45 22 H115 L130 109 H30Z" fill="#d5b58c" stroke="#8b7254" strokeWidth="2"/><path d="M45 22 L56 8 H105 L115 22 M61 62 Q80 39 99 62 M61 69 H99 M61 76 H99" stroke="#8f293b" strokeWidth="4" fill="none" strokeLinecap="round"/></svg></button></div><p className="hint">한국어 주문 연습 / 실제 결제 없음</p></div>;
}
export function DoranHeader({send,activeMs,complete=false}:{send:Send;activeMs:number;complete?:boolean}){
 const left=Math.max(0,180-Math.floor(activeMs/1000));
 return <div className="doran-head"><span className="doran-wordmark"><svg viewBox="0 0 40 35" aria-hidden="true"><path d="M3 14 Q20 -6 37 14Z M3 21 H37 M3 28 Q20 38 37 28Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/></svg><b>DORAN<br/>BURGER</b></span><button className="secondary" onClick={()=>send({type:complete?'RESTART':'BACK'})}>⌂ <span>이전</span></button><span className="doran-clock">◷ 남은 시간 <b>{Math.floor(left/60)}:{String(left%60).padStart(2,'0')}</b></span></div>;
}
const icons:Record<string,string>={burgers:'☰',sets:'▤',sides:'▥',drinks:'▱',desserts:'◇'};
export function DoranMenu({scenario,category,cart,count,total,send,activeMs}:{scenario:Scenario;category:string;cart:OrderLine[];count:number;total:number;send:Send;activeMs:number}){
 const [recommended,setRecommended]=useState(true);
 const items=recommended?['double-bacon','mushroom','chicken','double-bacon-set','classic','bulgogi','shrimp','fries','cola'].map(id=>scenario.menus.find(m=>m.id===id)!):scenario.menus.filter(m=>m.categoryId===category);
 return <div className="doran-menu"><DoranHeader send={send} activeMs={activeMs}/><div className="doran-browser"><nav className="doran-categories" role="group" aria-label="메뉴 카테고리"><button aria-pressed={recommended} onClick={()=>setRecommended(true)}><span aria-hidden="true">☆</span>추천</button>{scenario.categories.map(c=><button key={c.id} aria-pressed={!recommended&&category===c.id} onClick={()=>{setRecommended(false);send({type:'CATEGORY',id:c.id});}}><span aria-hidden="true">{icons[c.id]}</span>{c.label}</button>)}</nav><div className="doran-catalog"><h2>{recommended?'추천 메뉴':scenario.categories.find(c=>c.id===category)?.label}</h2>{recommended&&<div className="doran-banner"><div><strong>트러플 머쉬룸 버거</strong><p>풍부한 버섯의 맛</p></div><DoranArt id="mushroom"/></div>}<div className="doran-grid">{items.map(m=><button key={m.id} onClick={()=>send({type:'SELECT_MENU',menuId:m.id})}><DoranArt id={m.id}/><strong>{m.label}</strong><span>{money(m.price)}</span></button>)}</div></div></div><div className="doran-orderbar"><div><b>주문내역 {count}개</b><div className="doran-mini-cart">{cart.map((l,i)=><span key={i}>{scenario.menus.find(m=>m.id===l.menuId)?.label} × {l.quantity}</span>)}</div></div><div><span>총 결제금액</span><strong>{money(total)}</strong></div><button className="yellow-action" onClick={()=>send({type:'VIEW_CART'})}>결제하기</button></div><p className="hint">타이머는 연습용 표시이며 시간이 지나도 주문할 수 있습니다.</p></div>;
}
