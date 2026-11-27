import { useState } from 'react';
import type { Scenario, OrderLine } from '../../scenario/contracts';
import type { EventFrom } from 'xstate';
import type { kioskMachine } from '../../kiosk/machine';
import './yellow.css';

const money = (n:number) => n.toLocaleString('ko-KR')+'원';
const pageSize = 12;
const colors: Record<string,[string,string]> = {
  'americano-ice':['#452719','#a56b31'], 'americano-hot':['#f5c629','#51301c'],
  'latte-ice':['#fff0db','#a36b40'], 'latte-hot':['#f5c629','#cfa16f'],
  strawberry:['#d83355','#fff1eb'], cube:['#f8e4cd','#8c5937'],
  lemon:['#f7cf26','#fff3a0'], yogurt:['#ed8da5','#f5b9c5'],
  choco:['#81513e','#bd9274'], green:['#739540','#c0d28b'],
  peach:['#c7671d','#ffba53'], caramel:['#f5e5ce','#a6602d']
};
export function ProductArt({id}:{id:string}) {
  const [lower,upper]=colors[id]??['#ae7640','#e2b477'];
  const hot=id.endsWith('-hot');
  return <svg className="yellow-art" viewBox="0 0 120 130" aria-hidden="true" focusable="false">
    <ellipse cx="60" cy="119" rx="35" ry="5" fill="#000" opacity=".12"/>
    {id==='cookie'?<><circle cx="60" cy="65" r="43" fill={lower} stroke="#80532e" strokeWidth="2"/>{[[-17,-12],[16,-20],[4,12],[-22,20],[23,15]].map(([x,y],i)=><circle key={i} cx={60+x} cy={65+y} r="5" fill="#482b20"/>)}</>:<>
      <path d="M23 27 L32 112 Q60 123 88 112 L97 27Z" fill={lower} stroke="#777" strokeWidth="1.5"/>
      {!hot&&<path d="M24 30 L96 30 L91 72 Q60 60 29 72Z" fill={upper}/>}
      <ellipse cx="60" cy="27" rx="37" ry="10" fill={upper} stroke="#aaa" strokeWidth="1.5"/>
      {!hot&&[0,1,2,3].map(i=><rect key={i} x={32+i*14} y={19+i%2*5} width="13" height="10" rx="3" fill="#fff" opacity=".42" transform={'rotate(15 '+(38+i*14)+' 25)'}/>)}
      <path d="M33 40 L40 104" stroke="#fff" strokeWidth="4" opacity=".35" strokeLinecap="round"/>
      <circle cx="60" cy="80" r="15" fill="#fff" opacity=".82"/>
      <path d="M53 74 H65 V83 Q59 89 53 83Z M65 76 Q74 76 68 81 H65" fill="none" stroke="#51432b" strokeWidth="2"/>
    </>}
  </svg>;
}
type Props={scenario:Scenario;category:string;cart:OrderLine[];total:number;count:number;send:(event:EventFrom<typeof kioskMachine>)=>void;activeMs:number};
export function YellowMenu({scenario,category,cart,total,count,send,activeMs}:Props){
  const [recommended,setRecommended]=useState(true);
  const [page,setPage]=useState(0);
  const menus=recommended?scenario.menus:scenario.menus.filter(m=>m.categoryId===category);
  const pages=Math.max(1,Math.ceil(menus.length/pageSize));
  const current=Math.min(page,pages-1);
  const remaining=Math.max(0,120-Math.floor(activeMs/1000));
  return <div className="yellow-menu">
    <div className="yellow-head"><button className="secondary" onClick={()=>send({type:'BACK'})}>홈</button><strong>YELLOW CAFE</strong><span>연습 타이머 {remaining}초</span></div>
    <div className="yellow-tabs" role="group" aria-label="메뉴 카테고리"><button aria-pressed={recommended} onClick={()=>{setRecommended(true);setPage(0);}}>추천메뉴</button>{scenario.categories.map(c=><button key={c.id} aria-pressed={!recommended&&category===c.id} onClick={()=>{setRecommended(false);setPage(0);send({type:'CATEGORY',id:c.id});}}>{c.label}</button>)}</div>
    <div className="yellow-grid">{menus.slice(current*pageSize,(current+1)*pageSize).map(m=><button key={m.id} onClick={()=>send({type:'SELECT_MENU',menuId:m.id})}><ProductArt id={m.id}/><strong>{m.label}</strong><span>{money(m.price)}</span></button>)}</div>
    <nav className="yellow-pages" aria-label="메뉴 페이지"><button disabled={current===0} onClick={()=>setPage(current-1)} aria-label="이전 메뉴 페이지">‹</button><span>{current+1} / {pages}</span><button disabled={current+1>=pages} onClick={()=>setPage(current+1)} aria-label="다음 메뉴 페이지">›</button></nav>
    <div className="yellow-summary"><strong>주문하신 메뉴</strong>{cart.length===0?<p>주문하실 메뉴를 선택해주세요.</p>:<ul>{cart.map((l,i)=><li key={i}>{scenario.menus.find(m=>m.id===l.menuId)?.label} / {l.quantity}개</li>)}</ul>}</div>
    <div className="yellow-footer"><button className="secondary" onClick={()=>send({type:'CANCEL'})}>전체취소</button><span>주문수량 {count}개</span><strong>주문금액 {money(total)}</strong><button className="yellow-pay" onClick={()=>send({type:'VIEW_CART'})}>장바구니 보기 ({count}개)</button></div>
    <p className="hint">타이머는 연습용 표시입니다. 시간이 지나도 주문을 계속할 수 있습니다.</p>
  </div>;
}
