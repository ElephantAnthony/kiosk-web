import { getCsrf } from '../api/sessions';
import type { TrainingEvent } from './contract';

export class DeliveryError extends Error {
  constructor(public readonly status:number,public readonly retryAfterMs=0){super('Event delivery failed ('+status+')');}
}
export function retryAfter(value:string|null, now=Date.now()):number{
  if(!value)return 0;
  if(/^\d+$/.test(value)) return Math.min(2147483647,Number(value)*1000);
  const date=Date.parse(value);return Number.isFinite(date)?Math.max(0,Math.min(2147483647,date-now)):0;
}
export type Transport=(events:TrainingEvent[],keepalive?:boolean)=>Promise<string[]>;
export const sendBatch:Transport=async(events,keepalive=false)=>{
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),10000);
  try{
    const csrf=await getCsrf(controller.signal);
    const response=await fetch('/api/sessions/'+encodeURIComponent(events[0].sessionId)+'/events',{
      method:'POST',credentials:'same-origin',cache:'no-store',keepalive,signal:controller.signal,
      headers:{'Content-Type':'application/json',[csrf.headerName]:csrf.token},body:JSON.stringify({events})
    });
    if(!response.ok)throw new DeliveryError(response.status,retryAfter(response.headers.get('Retry-After')));
    const value:unknown=await response.json();
    if(typeof value!=='object'||value===null||!('acknowledgedIds' in value)||!Array.isArray(value.acknowledgedIds)||
      !value.acknowledgedIds.every((x:unknown)=>typeof x==='string'))throw new Error('Invalid ACK');
    return value.acknowledgedIds as string[];
  }finally{clearTimeout(timeout);}
};
