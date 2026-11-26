import { useEffect, useState } from 'react';
import { getHealth, type ServiceStatus } from './api/health';

export function App() {
  const [status, setStatus] = useState<ServiceStatus | 'CHECKING' | 'ERROR'>('CHECKING');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => { setStatus('ERROR'); controller.abort(); }, 6000);
    getHealth(controller.signal)
      .then((result) => { if (!controller.signal.aborted) setStatus(result); })
      .catch(() => { if (!controller.signal.aborted) setStatus('ERROR'); })
      .finally(() => window.clearTimeout(timeout));
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [attempt]);
  const label = { UP: '서버 및 데이터베이스 연결 정상', DOWN: '데이터베이스 연결 불가',
    CHECKING: '서비스 상태 확인 중', ERROR: '서비스 연결을 확인해 주세요' }[status];
  return (
    <>
      <a className="skip" href="#content">본문 바로가기</a>
      <header className="header"><span className="brand">SENIOSK</span><span className="version">2.0 / 개발 버전</span></header>
      <main id="content" className="shell" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">DIGITAL ACCESSIBILITY</p>
          <h1 id="hero-title">천천히 연습하고,<br />스스로 주문할 수 있도록.</h1>
          <p className="intro">시니스크는 실제 결제 없이 키오스크 주문을 연습하고, 학습 과정을 정확하게 기록하는 서비스입니다.</p>
          <div className="status-card">
            <p className="status" role="status" aria-live="polite">{label}</p>
            <button type="button" disabled={status === 'CHECKING'} onClick={() => { setStatus('CHECKING'); setAttempt((value) => value + 1); }}>연결 다시 확인</button>
          </div>
        </section>
        <section aria-labelledby="roadmap-title">
          <h2 id="roadmap-title">서비스 개발 현황</h2>
          <div className="features">
            <article><h3>01 주문 연습</h3><p>가상 카페의 메뉴 선택과 모의 결제 화면을 개발할 예정입니다.</p></article>
            <article><h3>02 학습 결과</h3><p>서버 채점과 세션별 학습 결과를 개발할 예정입니다.</p></article>
            <article><h3>03 사용자 행동 분석</h3><p>이벤트 수집과 관리자 통계를 개발할 예정입니다.</p></article>
          </div>
        </section>
      </main>
      <footer>시니스크 2.0 / 실제 결제가 없는 교육용 프로젝트</footer>
    </>
  );
}
