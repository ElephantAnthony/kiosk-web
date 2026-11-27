import { useId, useState } from 'react';
export function DoranArt({id}:{id:string}) {
  const [failed,setFailed]=useState(false);
  const uid=useId().replace(/:/g,'');
  const set=id.endsWith('-set'),drink=['cola','zero','sprite','coffee'].includes(id), fries=id==='fries', snack=['sticks','nuggets','salad','icecream'].includes(id);
  const burger=(x:number,y:number,scale:number)=><g transform={'translate('+x+' '+y+') scale('+scale+')'}>
    <ellipse cx="90" cy="132" rx="78" ry="8" fill="#000" opacity=".12"/>
    <path d="M16 64 C16 6 164 6 164 64Z" fill={'url(#'+uid+'bun)'} stroke="#aa652d"/>
    {Array.from({length:22},(_,i)=><ellipse key={i} cx={33+(i*29)%116} cy={34+(i*13)%24} rx="2.5" ry="1.1" fill="#fff1cd" transform={'rotate('+(i*31%100-50)+' '+(33+(i*29)%116)+' '+(34+(i*13)%24)+')'}/>)}
    <path d="M15 67 Q24 57 36 66 T58 66 T80 66 T102 66 T124 66 T164 65 L162 77 H16Z" fill="#528426"/>
    <rect x="18" y="77" width="144" height="9" rx="4" fill="#b33822"/>
    {id.startsWith('double-bacon')&&<path d="M15 84 Q40 68 67 86 T117 84 T165 83" stroke="#b54b35" strokeWidth="10" fill="none"/>}
    {id.startsWith('mushroom')&&[38,72,106,140].map(n=><ellipse key={n} cx={n} cy="84" rx="20" ry="9" fill="#ad8762" stroke="#795d45"/>)}
    <rect x="15" y="88" width="150" height="17" rx="8" fill={id.startsWith('chicken')||id.startsWith('shrimp')?'#ce8b30':'#633620'}/>
    <path d="M16 93 H164 L133 109 L91 98 L49 109Z" fill="#ffc83d"/>
    {id.startsWith('double-bacon')&&<rect x="18" y="105" width="144" height="13" rx="5" fill="#633620"/>}
    <path d="M16 113 H164 Q159 135 90 135 Q21 135 16 113Z" fill={'url(#'+uid+'bun)'}/>
  </g>;
  const chip=(x:number,y:number,scale:number)=><g transform={'translate('+x+' '+y+') scale('+scale+')'}>{Array.from({length:11},(_,i)=><rect key={i} x={19+i*8} y={12+i%3*7} width="9" height="68" rx="2" fill={i%2?'#f2bc46':'#e8a835'} transform={'rotate('+(i%5*5-10)+' '+(23+i*8)+' 70)'}/>)}<path d="M12 62 Q64 81 116 62 L105 126 H23Z" fill="#eee" stroke="#bbb"/><path d="M48 87 Q64 67 80 87 M48 93 H80 M48 99 H80" fill="none" stroke="#8f293b" strokeWidth="3" strokeLinecap="round"/></g>;
  const cup=(x:number,y:number,scale:number)=><g transform={'translate('+x+' '+y+') scale('+scale+')'}><path d="M20 20 H100 L90 128 Q60 137 30 128Z" fill={id==='sprite'?'#dce5e1':'#59321e'} stroke="#aaa"/><ellipse cx="60" cy="20" rx="40" ry="12" fill={id==='sprite'?'#e7ecea':'#93623e'}/>{Array.from({length:6},(_,i)=><rect key={i} x={27+i*10} y={15+i%2*6} width="14" height="10" rx="2" fill="#fff" opacity=".5"/>)}<path d="M29 36 L36 116" stroke="#fff" opacity=".35" strokeWidth="4"/><path d="M45 78 Q60 58 75 78 M45 84 H75 M45 90 H75" fill="none" stroke="#fff" strokeWidth="2.5"/></g>;
  if(!failed)return <img className="doran-art" src={'/doran/products/'+id+'.webp'} alt="" onError={()=>setFailed(true)}/>;
  return <svg className="doran-art" viewBox="0 0 240 180" aria-hidden="true"><defs><linearGradient id={uid+'bun'} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f6cd83"/><stop offset=".55" stopColor="#d68a3b"/><stop offset="1" stopColor="#b5682c"/></linearGradient></defs>{set?<>{cup(150,12,.77)}{chip(145,72,.72)}{burger(1,38,1.02)}</>:drink?cup(60,10,1.2):fries?chip(55,10,1.25):snack?<>{id==='icecream'?<><path d="M85 80 H155 L120 167Z" fill="#c69455"/><path d="M78 80 Q67 65 91 52 Q80 41 105 32 Q97 20 120 7 Q138 19 132 32 Q157 40 147 52 Q171 66 157 80Z" fill="#fff4dc" stroke="#d8cdbb"/></>:id==='salad'?<><ellipse cx="120" cy="100" rx="86" ry="45" fill="#e7e7e7" stroke="#aaa"/>{Array.from({length:18},(_,i)=><ellipse key={i} cx={65+i*31%112} cy={72+i*17%57} rx="16" ry="12" fill={i%4===0?'#d65335':'#739c42'}/>)}</>:Array.from({length:4},(_,i)=><rect key={i} x={48+i%2*71} y={48+Math.floor(i/2)*46} width={id==='sticks'?80:60} height="30" rx="14" transform={'rotate('+(i%2?15:-15)+' 120 90)'} fill="#d49a39" stroke="#a77527"/>)}</>:burger(30,13,1.02)}</svg>;
}
