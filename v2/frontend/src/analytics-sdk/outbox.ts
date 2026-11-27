import { validEvent, type TrainingEvent } from './contract';

export const DB_NAME='seniosk-events-v1';
const EVENT_STORE='events', SEQUENCE_STORE='sequences';
function request<T>(r:IDBRequest<T>):Promise<T>{
  return new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
}
function completed(tx:IDBTransaction):Promise<void>{
  return new Promise((resolve,reject)=>{tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error??new Error('Outbox transaction aborted'));tx.onerror=()=>reject(tx.error??new Error('Outbox transaction failed'));});
}
export interface Outbox {
  append(event:Omit<TrainingEvent,'sequence'>):Promise<void>;
  pending():Promise<TrainingEvent[]>;
  acknowledge(ids:string[]):Promise<void>;
}
export class IndexedOutbox implements Outbox {
  private connection:Promise<IDBDatabase>|undefined;
  private db(){
    if(!this.connection) this.connection=new Promise<IDBDatabase>((resolve,reject)=>{
      const r=indexedDB.open(DB_NAME,1);
      r.onupgradeneeded=()=>{r.result.createObjectStore(EVENT_STORE,{keyPath:'eventId'});r.result.createObjectStore(SEQUENCE_STORE);};
      r.onsuccess=()=>{const db=r.result;db.onversionchange=()=>{db.close();this.connection=undefined;};resolve(db);};
      r.onerror=()=>reject(r.error);
      r.onblocked=()=>reject(new Error('Outbox upgrade blocked'));
    }).catch(error=>{this.connection=undefined;throw error;});
    return this.connection;
  }
  async append(event:Omit<TrainingEvent,'sequence'>){
    const db=await this.db(),tx=db.transaction([EVENT_STORE,SEQUENCE_STORE],'readwrite');
    const done=completed(tx);
    const sequences=tx.objectStore(SEQUENCE_STORE), events=tx.objectStore(EVENT_STORE);
    // Use request callbacks so the write stays within the live IndexedDB transaction.
    const r=sequences.get(event.sessionId);
    r.onsuccess=()=>{
      const record={...event,sequence:(Number(r.result)||0)+1};
      if(!validEvent(record)){tx.abort();return;}
      sequences.put(record.sequence,event.sessionId);
      events.add(record);
    };
    await done;
  }
  async pending(){
    const db=await this.db(),tx=db.transaction(EVENT_STORE,'readonly');
    const rows=await request<TrainingEvent[]>(tx.objectStore(EVENT_STORE).getAll());
    return rows.sort((a,b)=>a.clientTimestamp.localeCompare(b.clientTimestamp)||a.sequence-b.sequence||a.eventId.localeCompare(b.eventId));
  }
  async acknowledge(ids:string[]){
    const db=await this.db(),tx=db.transaction(EVENT_STORE,'readwrite'),done=completed(tx);
    for(const id of ids) tx.objectStore(EVENT_STORE).delete(id);
    await done;
  }
}
