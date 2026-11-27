import { useEffect,useRef,useState,type FormEvent } from 'react';
import { adminMe,adminLogin,adminLogout,getReport,defaults,type Filters,type Report } from './api';
import { ApiError } from '../api/sessions';
import { listScenarios,type Scenario } from '../scenario/contracts';
const number=(n:number)=>n.toLocaleString('ko-KR');
const rate=(n:number|null)=>n===null?'—':(n*100).toFixed(1)+'%';
const duration=(n:number|null)=>n===null?'—':(n/1000).toFixed(1)+'초';
const names:Record<string,string>={START:'연습 시작',MISSION:'미션 도달',MENU:'메뉴 도달',CART:'장바구니 도달',PAYMENT:'결제 도달',COMPLETE:'서버 완료'};
export function AdminApp(){
 const [auth,setAuth]=useState<'checking'|'guest'|'admin'|'error'>('checking');
 const [contrast,setContrast]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [filters,setFilters]=useState<Filters>(()=>defaults()),[applied,setApplied]=useState<Filters>(()=>defaults());
 const [report,setReport]=useState<Report|null>(null),[catalog,setCatalog]=useState<Scenario[]>([]);
 const [attempt,setAttempt]=useState(0),[loading,setLoading]=useState(false);
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{heading.current?.focus();},[auth]);
 useEffect(()=>{
   const c=new AbortController();
   adminMe(c.signal).then(()=>{if(!c.signal.aborted)setAuth('admin');}).catch(e=>{if(!c.signal.aborted)setAuth(e instanceof ApiError&&e.status===401?'guest':'error');});
   return()=>c.abort();
 },[attempt]);
 useEffect(()=>{
   if(auth!=='admin')return;
   const c=new AbortController();
   listScenarios(c.signal).then(setCatalog).catch(()=>{if(!c.signal.aborted)setError('시나리오 목록을 불러오지 못했습니다.');});
   return()=>c.abort();
 },[auth]);
 useEffect(()=>{
   if(auth!=='admin')return;
   const c=new AbortController();
   setLoading(true);setReport(null);setError('');
   getReport(applied,c.signal).then(data=>{if(!c.signal.aborted)setReport(data);}).catch(e=>{
     if(c.signal.aborted)return;
     if(e instanceof ApiError&&e.status===401){setAuth('guest');setError('세션이 만료되었습니다. 다시 로그인해 주세요.');}
     else setError(e instanceof ApiError&&e.status===400?'조회 기간을 확인해 주세요. 최대 366일입니다.':'통계를 불러오지 못했습니다. 다시 조회해 주세요.');
   }).finally(()=>{if(!c.signal.aborted)setLoading(false);});
   return()=>c.abort();
 },[auth,applied]);
 async function login(e:FormEvent<HTMLFormElement>){
   e.preventDefault();if(busy)return;
   const form=e.currentTarget,data=new FormData(form);setBusy(true);setError('');
   try{await adminLogin(String(data.get('username')),String(data.get('password')));form.reset();setAuth('admin');}
   catch(e){form.reset();setError(e instanceof ApiError&&e.status===401?'로그인 정보를 확인해 주세요.':'로그인 요청에 실패했습니다. 다시 시도해 주세요.');}
   finally{setBusy(false);}
 }
 async function logout(){
   if(busy)return;setBusy(true);setError('');
   try{await adminLogout();setReport(null);setAuth('guest');}
   catch(e){if(e instanceof ApiError&&e.status===401){setReport(null);setAuth('guest');}else setError('로그아웃 요청에 실패했습니다. 다시 시도해 주세요.');}
   finally{setBusy(false);}
 }
 const m=report?.metrics;
 return <div className={contrast?'app contrast':'app'}>
   <a className="skip" href="#admin-content">본문 바로가기</a>
   <header className="header"><div><span className="brand">SENIOSK</span><span className="brand-sub"> 관리자</span></div><div className="tools">
     <a className="admin-link" href="/">학습 화면</a><button className="secondary" aria-pressed={contrast} onClick={()=>setContrast(v=>!v)}>고대비 모드</button>
     {auth==='admin'&&<button className="secondary" disabled={busy} onClick={()=>void logout()}>로그아웃</button>}</div></header>
   <main id="admin-content" className="shell admin-shell" tabIndex={-1}>
     <p className="eyebrow">SENIOSK / LEARNING ANALYTICS</p>
     <h1 tabIndex={-1} ref={heading}>{auth==='admin'?'학습 분석 대시보드':'관리자 로그인'}</h1>
     {error&&<p role="alert" className="error">{error}</p>}
     {auth==='checking'&&<p role="status">인증 확인 중입니다.</p>}
     {auth==='error'&&<><p role="alert">서버 연결을 확인해 주세요.</p><button onClick={()=>{setAuth('checking');setAttempt(n=>n+1);}}>다시 확인</button></>}
     {auth==='guest'&&<section className="panel admin-login"><p>허가된 관리자만 합성 학습 통계를 조회할 수 있습니다.</p>
       <form onSubmit={login} className="admin-form">
       <label htmlFor="admin-user">관리자 아이디</label><input id="admin-user" name="username" autoComplete="username" maxLength={80} required/>
       <label htmlFor="admin-password">비밀번호</label><input id="admin-password" name="password" type="password" autoComplete="current-password" maxLength={72} required/>
       <button disabled={busy} type="submit">로그인</button></form></section>}
     {auth==='admin'&&<>
       <p>실제 PostgreSQL에 저장된 교육용 연습 세션의 집계입니다. 사용자 개인 정보는 표시하지 않습니다.</p>
       <section className="panel admin-filter"><h2>조회 조건</h2><form className="filters" onSubmit={e=>{e.preventDefault();setApplied({...filters});}}>
         <div className="filter-field"><label htmlFor="report-from">시작일 (UTC)</label><input id="report-from" type="date" required value={filters.from} onChange={e=>setFilters(v=>({...v,from:e.target.value}))}/></div>
         <div className="filter-field"><label htmlFor="report-to">종료일 (제외)</label><input id="report-to" type="date" required value={filters.to} onChange={e=>setFilters(v=>({...v,to:e.target.value}))}/></div>
         <div className="filter-field"><label htmlFor="report-scenario">시나리오</label><select id="report-scenario" value={filters.scenario} onChange={e=>setFilters(v=>({...v,scenario:e.target.value}))}><option value="">전체 매장</option>{catalog.map(s=><option key={s.scenarioId+':'+s.version} value={s.scenarioId+':'+s.version}>{s.title} (v{s.version})</option>)}</select></div>
         <button type="submit" disabled={loading}>통계 조회</button></form></section>
       {loading&&<p role="status">통계를 조회하고 있습니다.</p>}
       {report&&m&&<div className="admin-results">
         <p className="hint">조회 기간: {report.from} ~ {report.toExclusive} (종료일 제외) / 집계 시각 {new Date(report.asOf).toLocaleString('ko-KR')}</p>
         {m.total===0&&<p role="status" className="notice">해당 조건의 학습 데이터가 없습니다. 비율과 평균은 계산하지 않습니다.</p>}
         <section aria-labelledby="summary-title"><h2 id="summary-title">학습 현황</h2><dl className="admin-metrics">
           {([['전체 세션',number(m.total)],['서버 완료',number(m.completed)],['취소',number(m.cancelled)],['활성',number(m.active)],['이탈 추정',number(m.abandoned)],['성공률',rate(m.successRate)],['평균 정확도',rate(m.averageAccuracy)],['평균 서버 시간',duration(m.averageElapsedMs)],['도움말 사용',number(m.helped)]] as const).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
         </dl><p className="hint">성공률: 성공한 채점 결과 {m.successful} / 전체 채점 결과 {m.graded}. 이탈 추정: 최근 {report.inactivityMinutes}분간 수신 기록이 없는 활성 상태 세션.</p></section>
         <section className="panel admin-report"><h2>단계별 전환 퍼널</h2><p>이전 단계까지 모두 관측된 세션을 누적 집계합니다. 마지막 단계는 서버 완료 결과도 필요합니다. 미도달 수는 실제 이탈 확정이 아닙니다.</p>
           <div className="table-scroll" role="region" aria-label="전환 퍼널 표" tabIndex={0}><table><caption>단계별 도달 및 다음 단계 미도달</caption><thead><tr><th scope="col">단계</th><th scope="col">도달 세션</th><th scope="col">이전 단계 대비</th><th scope="col">다음 단계 미도달</th></tr></thead><tbody>{report.funnel.map(s=><tr key={s.stage}><th scope="row">{names[s.stage]??s.stage}</th><td><div className="bar-track" aria-hidden="true"><div style={{width:(m.total?s.reached/m.total*100:0)+'%'}}/></div>{number(s.reached)}</td><td>{rate(s.conversionFromPrevious)}</td><td>{s.notReachedNext===null?'—':number(s.notReachedNext)}</td></tr>)}</tbody></table></div>
         </section>
         <section className="panel admin-report"><h2>시나리오별 분석</h2><div className="table-scroll" role="region" aria-label="시나리오 통계 표" tabIndex={0}><table><caption>시나리오 및 버전별 서버 집계</caption><thead><tr><th scope="col">시나리오</th><th scope="col">전체</th><th scope="col">완료</th><th scope="col">이탈 추정</th><th scope="col">성공률</th><th scope="col">정확도</th></tr></thead><tbody>{report.scenarios.map(s=><tr key={s.scenarioId+':'+s.version}><th scope="row">{catalog.find(c=>c.scenarioId===s.scenarioId&&c.version===s.version)?.title??s.scenarioId} v{s.version}</th><td>{number(s.metrics.total)}</td><td>{number(s.metrics.completed)}</td><td>{number(s.metrics.abandoned)}</td><td>{rate(s.metrics.successRate)}</td><td>{rate(s.metrics.averageAccuracy)}</td></tr>)}</tbody></table></div></section>
       </div>}
     </>}
   </main><footer>시니스크 2.0 / 합성 연습 데이터 기반 분석</footer>
 </div>;
}
