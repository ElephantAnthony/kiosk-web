import type { EventSession,EventType,Payload } from './contract';
import { IndexedOutbox,type Outbox } from './outbox';
import { DeliveryError,sendBatch,type Transport } from './transport';

export type DeliveryStatus='ready'|'pending'|'retrying'|'blocked'|'storage-error';
export class EventSdk {
  private running=false;
  private busy=false;
  private interval:ReturnType<typeof setInterval>|undefined;
  private timer:ReturnType<typeof setTimeout>|undefined;
  private retryAt=0;
  private failures=0;
  private storageFailed=false;
  private readonly blocked=new Set<string>();
  private readonly listeners=new Set<(status:DeliveryStatus)=>void>();
  private status:DeliveryStatus='ready';
  constructor(private readonly outbox:Outbox=new IndexedOutbox(),private readonly transport:Transport=sendBatch,
    private readonly clock=Date.now,private readonly random=Math.random){}
  subscribe(listener:(status:DeliveryStatus)=>void){this.listeners.add(listener);listener(this.status);return()=>{this.listeners.delete(listener);};}
  private notify(status:DeliveryStatus){
    this.status=this.storageFailed?'storage-error':status;
    for(const listener of this.listeners)listener(this.status);
  }
  start(){
    if(this.running)return;
    this.running=true;
    this.interval=setInterval(()=>{void this.flush();},5000);
    window.addEventListener('online',this.onOnline);
    window.addEventListener('pagehide',this.onPageHide);
    void this.flush();
  }
  stop(){
    this.running=false;
    clearInterval(this.interval);clearTimeout(this.timer);
    window.removeEventListener('online',this.onOnline);
    window.removeEventListener('pagehide',this.onPageHide);
  }
  private onOnline=()=>{void this.flush();};
  private onPageHide=()=>{void this.flush(true);};
  async track(session:EventSession,eventType:EventType,payload:Payload={}){
    try{
      await this.outbox.append({...session,eventId:crypto.randomUUID(),eventType,clientTimestamp:new Date(this.clock()).toISOString(),payload:{...payload}});
      this.notify(this.blocked.size?'blocked':'pending');
      if((await this.outbox.pending()).filter(e=>e.sessionId===session.sessionId).length>=20)void this.flush();
    }catch{this.storageFailed=true;this.notify('storage-error');}
  }
  async flush(keepalive=false){
    if(this.busy||this.clock()<this.retryAt|| (typeof navigator!=='undefined' && navigator.onLine===false))return;
    this.busy=true;
    try{
      const locks=typeof navigator!=='undefined'?navigator.locks:undefined;
      if(locks)await locks.request('seniosk-event-flush',{ifAvailable:true},async lock=>{if(lock)await this.drain(keepalive);});
      else await this.drain(keepalive);
    }finally{this.busy=false;}
  }
  private async drain(keepalive:boolean){
    for(;;){
      let pending;
      try{pending=await this.outbox.pending();}catch{this.storageFailed=true;this.notify('storage-error');return;}
      const first=pending.find(e=>!this.blocked.has(e.sessionId));
      if(!first){this.notify(pending.length?'blocked':'ready');return;}
      const batch=pending.filter(e=>e.sessionId===first.sessionId).sort((a,b)=>a.sequence-b.sequence).slice(0,20);
      let ack:string[];
      try{
        ack=await this.transport(batch,keepalive);
        const sent=new Set(batch.map(e=>e.eventId)), received=new Set(ack);
        if(received.size!==ack.length||ack.length!==batch.length||ack.some(id=>!sent.has(id)))throw new Error('Incomplete or foreign ACK');
      }catch(error){
        if(error instanceof DeliveryError&&[400,403,404,409].includes(error.status)){
          this.blocked.add(first.sessionId);this.notify('blocked');continue;
        }
        this.failures++;
        const backoff=Math.min(60000,1000*2**Math.min(this.failures-1,6))*(0.5+this.random()*0.5);
        const delay=Math.max(backoff,error instanceof DeliveryError?error.retryAfterMs:0);
        this.retryAt=this.clock()+delay;
        this.notify('retrying');
        if(this.running){clearTimeout(this.timer);this.timer=setTimeout(()=>{void this.flush();},delay+1);}
        return;
      }
      try{await this.outbox.acknowledge(ack);}catch{this.storageFailed=true;this.notify('storage-error');return;}
      this.failures=0;this.retryAt=0;
      // Unloading is best-effort and bounded; persisted rows survive if interrupted.
      if(keepalive)return;
    }
  }
}
export const eventSdk=new EventSdk();
