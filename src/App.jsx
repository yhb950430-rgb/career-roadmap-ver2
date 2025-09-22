import React, { useState } from 'react';
import PadletPanel from './components/PadletPanel.jsx';

export default function App() {
  const [show, setShow] = useState(true)
  return (
    <main style={{minHeight:'100vh', background:'#f9fafb', padding:24, fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, "Noto Sans KR", sans-serif'}}>
      <header style={{textAlign:'center', marginBottom:32}}>
        <h1 style={{margin:0, fontSize:28, fontWeight:700}}>커리어 로드맵 ver2</h1>
        <p style={{margin:0, color:'#6b7280'}}>나의 커리어 로드맵을 작성하고, 동기들과 함께 공유해보세요 ✨</p>
      </header>

      {/* (여기에 기존 로드맵 작성/시뮬레이션 UI를 추가하세요) */}

      <section style={{background:'#fff', borderRadius:20, boxShadow:'0 2px 10px rgba(0,0,0,.08)', padding:24}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <h2 style={{margin:0, fontSize:20, fontWeight:600}}>동기들과 공유하기 (Padlet)</h2>
          <button
            onClick={() => setShow(v=>!v)}
            style={{padding:'6px 14px', borderRadius:12, background:'#3b82f6', color:'#fff', border:0, cursor:'pointer'}}
          >
            {show ? '숨기기' : '보이기'}
          </button>
        </div>
        {show && <PadletPanel />}
        <p style={{fontSize:13, color:'#6b7280', marginTop:12}}>
          ※ 회사망에서 iframe 차단 시 보이지 않을 수 있어요.{' '}
          <a href="https://padlet.com/ruddudrydbrxla/2025-vikyzjwbipl0vco7" target="_blank" rel="noopener">새 창에서 열기</a>
        </p>
      </section>
    </main>
  )
}
