import { useId, useState } from 'react';
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
  const uid=useId().replace(/:/g,'');
  const [lower,upper]=colors[id]??['#ae7640','#e2b477'];
  const hot=id.endsWith('-hot');
  const whipped=['yogurt','choco','green'].includes(id);
  const tint=(name:string)=>'url(#'+uid+name+')';
  return <svg className="yellow-art" viewBox="0 0 160 180" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={uid+'body'} x1="0" x2="0.16" y1="1" y2="0"><stop stopColor={lower}/><stop offset=".48" stopColor={lower}/><stop offset=".83" stopColor={upper}/><stop offset="1" stopColor={upper}/></linearGradient>
      <linearGradient id={uid+'glass'}><stop stopColor="#222" stopOpacity=".25"/><stop offset=".16" stopColor="#fff" stopOpacity=".55"/><stop offset=".38" stopColor="#fff" stopOpacity="0"/><stop offset=".8" stopColor="#fff" stopOpacity=".12"/><stop offset="1" stopColor="#222" stopOpacity=".24"/></linearGradient>
      <radialGradient id={uid+'ice'} cx=".25" cy=".2"><stop stopColor="#fff" stopOpacity=".88"/><stop offset="1" stopColor="#c4b49c" stopOpacity=".32"/></radialGradient>
      <radialGradient id={uid+'shadow'}><stop stopColor="#333" stopOpacity=".22"/><stop offset="1" stopColor="#333" stopOpacity="0"/></radialGradient>
      <clipPath id={uid+'clip'}><path d="M31 43 L43 153 Q80 167 117 153 L129 43Z"/></clipPath>
    </defs>
    <ellipse cx="80" cy="165" rx="58" ry="11" fill={tint('shadow')}/>
    {id==='cookie'?<><ellipse cx="80" cy="91" rx="58" ry="52" fill="#9d592e"/><ellipse cx="80" cy="85" rx="58" ry="52" fill={tint('body')}/>{Array.from({length:16},(_,i)=><ellipse key={i} cx={80+Math.cos(i*2.4)*(12+i%4*10)} cy={85+Math.sin(i*2.4)*(12+i%4*10)} rx={4+i%3} ry="4" fill="#563123" transform={'rotate('+i*29+' 80 85)'}/>)}</>:<>
      <path d="M31 43 L43 153 Q80 167 117 153 L129 43Z" fill={hot?lower:tint('body')} stroke="#9b8c7c" strokeWidth="1"/>
      {!hot&&<g clipPath={tint('clip')}>
        {id==='strawberry'&&Array.from({length:13},(_,i)=><circle key={i} cx={40+i*37%80} cy={92+i*17%59} r={3+i%5} fill="#b52447" opacity=".45"/>)}
        {['americano-ice','latte-ice','cube','lemon','peach','caramel'].includes(id)&&Array.from({length:9},(_,i)=><rect key={i} x={36+i*29%75} y={47+i*19%52} width="21" height="16" rx="4" fill={id==='cube'?'#98643b':tint('ice')} opacity=".63" transform={'rotate('+((i*31)%60-30)+' '+(46+i*29%75)+' '+(55+i*19%52)+')'}/>)}
      </g>}
      <path d="M31 43 L43 153 Q80 167 117 153 L129 43Z" fill={tint('glass')}/>
      <ellipse cx="80" cy="43" rx="49" ry="14" fill="#eee" stroke="#aaa"/>
      <ellipse cx="80" cy="43" rx="45" ry="11" fill={upper}/>
      {!hot&&!whipped&&Array.from({length:7},(_,i)=><rect key={i} x={40+i*12} y={34+i%2*5} width="16" height="11" rx="3" fill={id==='cube'?'#a67542':tint('ice')} stroke="#fff" strokeOpacity=".35" transform={'rotate('+((i%3-1)*19)+' '+(48+i*12)+' 40)'}/>)}
      {hot&&id==='latte-hot'&&<path d="M80 49 C50 38 68 31 80 40 C92 31 110 38 80 49Z" fill="#fff4de"/>}
      {whipped&&<><path d="M37 43 Q29 34 49 28 Q39 20 63 16 Q58 7 81 4 Q99 12 97 17 Q120 20 111 29 Q132 36 123 43 Q80 58 37 43Z" fill={id==='yogurt'?'#ef9eb4':'#fff0d9'} stroke="#d3b69b"/><path d="M49 28 Q77 39 111 29 M63 16 Q81 25 97 17" fill="none" stroke={id==='choco'?'#78452e':'#d6b8aa'} strokeWidth="3" strokeLinecap="round"/>{id==='choco'&&<path d="M48 34 Q60 18 69 35 T91 34 T112 35" stroke="#68351e" strokeWidth="3" fill="none"/>}</>}
      {id==='lemon'&&<g transform="translate(118 29)"><circle r="21" fill="#edbd24" stroke="#fff3ad" strokeWidth="3"/><circle r="16" fill="#ffe574"/>{Array.from({length:6},(_,i)=><path key={i} d="M0 0 L0 -15" stroke="#fff7ca" strokeWidth="2" transform={'rotate('+i*60+')'}/>)}</g>}
      {id==='caramel'&&<path d="M46 41 Q55 33 65 46 T85 41 T105 41 M55 35 L100 48 M72 33 L115 43" stroke="#b76b23" strokeWidth="2.5" fill="none"/>}
      <path d="M40 59 L48 144" stroke="#fff" strokeWidth="4" opacity=".38" strokeLinecap="round"/>
      <ellipse cx="80" cy="153" rx="37" ry="7" fill="none" stroke="#fff" opacity=".3"/>
      <circle cx="80" cy="108" r="17" fill={hot?'#fff5cf':'#fff'} opacity=".9"/>
      <path d="M72 101 H85 V111 Q78 118 72 111Z M85 103 Q95 103 88 110 H85" fill="none" stroke="#51432b" strokeWidth="2.5"/>
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
    <div className="yellow-head"><button className="secondary" onClick={()=>send({type:'BACK'})}>홈</button><strong>YELLOW CAFE</strong><span className="yellow-clock">◷ 남은시간 <b>{remaining}초</b></span></div>
    <div className="yellow-tabs" role="group" aria-label="메뉴 카테고리"><button aria-pressed={recommended} onClick={()=>{setRecommended(true);setPage(0);}}>추천메뉴</button>{scenario.categories.map(c=><button key={c.id} aria-pressed={!recommended&&category===c.id} onClick={()=>{setRecommended(false);setPage(0);send({type:'CATEGORY',id:c.id});}}>{c.label}</button>)}</div>
    <div className="yellow-grid">{menus.slice(current*pageSize,(current+1)*pageSize).map(m=><button key={m.id} onClick={()=>send({type:'SELECT_MENU',menuId:m.id})}><ProductArt id={m.id}/><strong>{m.label}</strong><span>{money(m.price)}</span></button>)}</div>
    <nav className="yellow-pages" aria-label="메뉴 페이지"><button disabled={current===0} onClick={()=>setPage(current-1)} aria-label="이전 메뉴 페이지">‹</button><span>{current+1} / {pages}</span><button disabled={current+1>=pages} onClick={()=>setPage(current+1)} aria-label="다음 메뉴 페이지">›</button></nav>
    <div className="yellow-summary"><div className="yellow-summary-head"><strong>주문하신 메뉴</strong><strong>수량</strong><strong>주문금액</strong></div>{cart.length===0?<p>주문하실 메뉴를 선택해주세요.</p>:<ul>{cart.map((l,i)=><li key={i}><span>{scenario.menus.find(m=>m.id===l.menuId)?.label}</span><span>{l.quantity}개</span><strong>{money(((scenario.menus.find(m=>m.id===l.menuId)?.price??0)+(scenario.menus.find(m=>m.id===l.menuId)?.optionGroups.flatMap(g=>g.options).filter(o=>l.optionIds.includes(o.id)).reduce((n,o)=>n+o.priceDelta,0)??0))*l.quantity)}</strong></li>)}</ul>}</div>
    <div className="yellow-footer"><button className="secondary" onClick={()=>send({type:'CANCEL'})}>전체취소</button><span>주문수량 {count}개</span><strong>주문금액 {money(total)}</strong><button className="yellow-pay" onClick={()=>send({type:'VIEW_CART'})}>결제하기</button></div>
    <p className="hint">타이머는 연습용 표시입니다. 시간이 지나도 주문을 계속할 수 있습니다.</p>
  </div>;
}
