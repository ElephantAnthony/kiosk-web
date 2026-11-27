import { ApiError,getCsrf } from '../api/sessions';
export interface Metrics {
 total:number; completed:number; cancelled:number; active:number; abandoned:number; successful:number; graded:number;
 successRate:number|null; averageAccuracy:number|null; averageElapsedMs:number|null; helped:number;
}
export interface Report {
 from:string;toExclusive:string;asOf:string;inactivityMinutes:number;metrics:Metrics;
 funnel:{stage:string;reached:number;notReachedNext:number|null;conversionFromPrevious:number|null}[];
 scenarios:{scenarioId:string;version:number;metrics:Metrics}[];
}
export interface Filters {from:string;to:string;scenario:string}
async function check(response:Response){if(!response.ok)throw new ApiError(response.status);return response;}
export async function adminMe(signal?:AbortSignal){
 await check(await fetch('/api/admin/me',{credentials:'same-origin',cache:'no-store',signal}));
}
export async function adminLogin(username:string,password:string){
 const csrf=await getCsrf();
 await check(await fetch('/api/admin/login',{method:'POST',credentials:'same-origin',cache:'no-store',
 headers:{'Content-Type':'application/json',[csrf.headerName]:csrf.token},body:JSON.stringify({username,password})}));
}
export async function adminLogout(){
 const csrf=await getCsrf();
 await check(await fetch('/api/admin/logout',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{[csrf.headerName]:csrf.token}}));
}
export async function getReport(filters:Filters,signal?:AbortSignal):Promise<Report>{
 const q=new URLSearchParams({from:filters.from,to:filters.to});
 if(filters.scenario){const [id,version]=filters.scenario.split(':');q.set('scenarioId',id);q.set('version',version);}
 const response=await check(await fetch('/api/admin/funnel?'+q,{credentials:'same-origin',cache:'no-store',signal}));
 const data=await response.json() as Report;
 if(!data.metrics||!Array.isArray(data.funnel)||!Array.isArray(data.scenarios)||!Number.isSafeInteger(data.metrics.total))throw new Error('Invalid report');
 return data;
}
export function defaults(now=new Date()):Filters{
 const today=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));
 const date=(delta:number)=>new Date(today.getTime()+delta*86400000).toISOString().slice(0,10);
 return {from:date(-29),to:date(1),scenario:''};
}
