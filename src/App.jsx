import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts";

/**
 * #커리어로드맵_ver2
 * Career Tree + Curved Path + Vision Wheel (Radar)
 * - Wheel categories + current/target(0~10) feed into radar chart
 * - Session-scoped persistence via localStorage (?sid=...)
 */

/***********************
 * Helpers: storage per-session
 ***********************/
const STORAGE_KEY_BASE = "career-demo-v2";
function getSessionId() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("sid") || "default";
  } catch {
    return "default";
  }
}
function storageKey() {
  return `${STORAGE_KEY_BASE}:${getSessionId()}`;
}
function saveState(state) {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(state));
  } catch {}
}
function loadState() {
  try {
    const raw = localStorage.getItem(storageKey());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function randomSid() {
  return Math.random().toString(36).slice(2, 10);
}

/***********************
 * Stages & Logic (Tree)
 ***********************/
const STAGES = [
  { min: 0, key: "seed", name: "씨앗" },
  { min: 20, key: "sprout", name: "새싹" },
  { min: 50, key: "small", name: "작은 나무" },
  { min: 100, key: "big", name: "큰 나무" },
  { min: 150, key: "fruit", name: "열매 나무" },
];
function stageForPoints(points) {
  let cur = STAGES[0];
  for (const s of STAGES) {
    if (points >= s.min) cur = s;
    else break;
  }
  return cur;
}
function useStage(points) {
  const stage = useMemo(() => stageForPoints(points), [points]);
  const next = useMemo(
    () => STAGES[STAGES.findIndex((s) => s.key === stage.key) + 1] || null,
    [stage]
  );
  const pctToNext = useMemo(() => {
    if (!next) return 100;
    const span = next.min - stage.min;
    const cur = points - stage.min;
    return Math.max(0, Math.min(100, Math.round((cur / span) * 100)));
  }, [points, stage, next]);
  return { stage, next, pctToNext };
}

/***********************
 * Cute Tree SVG (inline)
 ***********************/
function Sparkle({ x, y, delay = 0 }) {
  return (
    <g
      style={{ animation: `float 2.2s ease-in-out ${delay}s infinite` }}
      opacity={0.9}
    >
      <polygon
        points={`${x},${y - 6} ${x + 2},${y - 2} ${x + 6},${y} ${x + 2},${y + 2} ${x},${y + 6} ${x - 2},${y + 2} ${x - 6},${y} ${x - 2},${y - 2}`}
        fill="#fde68a"
        stroke="#f59e0b"
      />
    </g>
  );
}
function CuteTree({ stageKey, celebrate }) {
  const sway = { animation: "sway 3.8s ease-in-out infinite" };
  const bump = celebrate ? { animation: "bump 600ms ease" } : {};
  return (
    <svg viewBox="0 0 320 260" style={{ width: "100%", height: "auto" }} role="img" aria-label="커리어 나무">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="4"
            floodColor="#94a3b8"
            floodOpacity="0.5"
          />
        </filter>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f9fafb" />
        </linearGradient>
        <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="320" height="260" rx="24" fill="url(#sky)" />
      <ellipse cx="160" cy="220" rx="90" ry="18" fill="#cbd5e1" opacity=".5" />
      <rect x="16" y="210" width="288" height="34" rx="12" fill="url(#soil)" />

      <g filter="url(#shadow)" style={{ ...sway, ...bump }}>
        {stageKey === "seed" && (
          <g>
            <ellipse cx="160" cy="200" rx="10" ry="6" fill="#92400e" />
            <path d="M160 194 q3 -8 0 -12" stroke="#92400e" />
          </g>
        )}
        {stageKey === "sprout" && (
          <g>
            <rect x="156" y="170" width="8" height="40" rx="4" fill="#7c2d12" />
            <ellipse
              cx="146"
              cy="172"
              rx="14"
              ry="8"
              fill="#86efac"
              stroke="#16a34a"
            />
            <ellipse
              cx="174"
              cy="172"
              rx="14"
              ry="8"
              fill="#86efac"
              stroke="#16a34a"
            />
          </g>
        )}
        {stageKey === "small" && (
          <g>
            <rect x="154" y="150" width="12" height="60" rx="6" fill="#7c2d12" />
            <circle cx="160" cy="140" r="34" fill="#86efac" stroke="#16a34a" />
          </g>
        )}
        {stageKey === "big" && (
          <g>
            <rect x="152" y="138" width="16" height="72" rx="8" fill="#7c2d12" />
            <circle cx="160" cy="126" r="46" fill="#86efac" stroke="#16a34a" />
            <circle cx="190" cy="140" r="30" fill="#6ee7b7" stroke="#16a34a" />
            <circle cx="130" cy="146" r="28" fill="#6ee7b7" stroke="#16a34a" />
          </g>
        )}
        {stageKey === "fruit" && (
          <g>
            <rect x="150" y="130" width="20" height="80" rx="10" fill="#7c2d12" />
            <circle cx="160" cy="120" r="52" fill="#86efac" stroke="#16a34a" />
            <circle cx="196" cy="144" r="34" fill="#6ee7b7" stroke="#16a34a" />
            <circle cx="126" cy="148" r="30" fill="#6ee7b7" stroke="#16a34a" />
            <circle cx="140" cy="126" r="6" fill="#ef4444" stroke="#991b1b" />
            <circle cx="178" cy="136" r="6" fill="#ef4444" stroke="#991b1b" />
            <circle cx="164" cy="158" r="6" fill="#ef4444" stroke="#991b1b" />
            <Sparkle x={232} y={80} />
            <Sparkle x={88} y={72} delay={0.6} />
            <Sparkle x={248} y={160} delay={1.0} />
          </g>
        )}
      </g>

      <style>{`
        @keyframes sway { 0%{ transform: rotate(0deg) } 50%{ transform: rotate(1.4deg) } 100%{ transform: rotate(0deg) } }
        @keyframes bump { 0%{ transform: scale(0.9) } 60%{ transform: scale(1.06)} 100%{ transform: scale(1)} }
        @keyframes float { 0%{ transform: translateY(0) scale(1)} 50%{ transform: translateY(-6px) scale(1.05)} 100%{ transform: translateY(0) scale(1)} }
      `}</style>
    </svg>
  );
}

/***********************
 * Curved Career Path (fun)
 ***********************/
function CareerPath({ nodes, onUpdate, points }) {
  const w = 720, h = 220;
  const padX = 60;
  const ys = [120, 86, 110];
  const step = (w - padX * 2) / (nodes.length - 1);
  const xs = nodes.map((_, i) => padX + i * step);
  function buildPath() {
    let d = `M ${xs[0]} ${ys[0]}`;
    for (let i = 1; i < xs.length; i++) {
      const x0 = xs[i - 1], y0 = ys[i - 1];
      const x1 = xs[i], y1 = ys[i];
      const cx = (x0 + x1) / 2;
      d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    return d;
  }
  const filledCount = nodes.filter(n => (n.keyword || '').trim().length > 0).length;
  const progress = filledCount / nodes.length; // 0..1
  const golden = points >= 100; // glow
  const drawKey = `${filledCount}-${points}`;
  const stickers = ['🎯','🌱','🚀'];

  return (
    <div style={{ background: '#ffe4e6', borderRadius: 24, boxShadow: '0 2px 10px rgba(0,0,0,.08)', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontWeight: 600 }}>커리어 길 (고정 시점)</h3>
        <div style={{ fontSize: 12, color: '#64748b' }}>1년 → 3년 → 5년</div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ minWidth: 620, width:'100%', height: 220 }}>
          <defs>
            <linearGradient id="gradPath" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.6"/></filter>
          </defs>
          <path d={buildPath()} stroke="#e2e8f0" strokeWidth="8" fill="none" strokeLinecap="round" />
          <g filter={golden ? 'url(#glow)' : undefined}>
            <path key={drawKey} d={buildPath()} stroke="url(#gradPath)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset={1000 * (1 - progress)} style={{ animation: 'draw 900ms ease forwards' }} />
          </g>
          {nodes.map((n, i) => {
            const filled = (n.keyword || '').trim().length > 0;
            return (
              <g key={n.key}>
                <circle cx={xs[i]} cy={ys[i]} r={18} fill={filled ? '#38bdf8' : '#94a3b8'} stroke="#0f172a" />
                <text x={xs[i]} y={ys[i] - 30} textAnchor="middle" fontSize="12" fill="#0f172a">{n.label}</text>
                <text x={xs[i]} y={ys[i] + 40} textAnchor="middle" fontSize="12" fill="#334155">{n.keyword || '키워드 입력'}</text>
                {filled && (<text x={xs[i] + 24} y={ys[i] - 10} fontSize="16">{stickers[i % stickers.length]}</text>)}
              </g>
            );
          })}
          <style>{`@keyframes draw { from { stroke-dashoffset: 1000 } to { stroke-dashoffset: ${1000 * (1 - progress)} } }`}</style>
        </svg>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap: 8, marginTop: 12 }}>
        {nodes.map((n, i) => (
          <div key={n.key} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <label style={{ fontSize: 12, color:'#475569', width: 64 }}>{n.label}</label>
            <input
              style={{ flex:1, border:'1px solid #e5e7eb', borderRadius: 8, padding: '8px', fontSize: 14 }}
              placeholder="예: 백엔드 개발자"
              value={n.keyword || ''}
              onChange={(e) => onUpdate(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ flex:1, height: 8, background:'#e2e8f0', borderRadius: 999, overflow:'hidden' }}>
          <div style={{ height: 8, background:'#06b6d4', width: `${Math.round((filledCount / nodes.length)*100)}%` }} />
        </div>
        <div style={{ fontSize: 12, color:'#475569', minWidth: 90, textAlign:'right' }}>
          완성도 {Math.round((filledCount / nodes.length)*100)}%
        </div>
      </div>

      {filledCount === nodes.length && (
        <div style={{ marginTop: 8, fontSize: 14, color:'#92400e' }}>
          모든 시점 키워드 완성! 🎉 다음 단계: 미션에 시점 연결해서 실행 계획 채우기
        </div>
      )}
    </div>
  );
}

/***********************
 * Career Vision Wheel (Radar)
 ***********************/
const WHEEL_CATEGORIES = ["AI학습","건강","영어","시간관리","네트워킹","프로젝트 기획력","멘토링","대화법"];
function clamp01(x){ return Math.max(0, Math.min(10, Number(x)||0)); }

function WheelCard({ wheelMap, onReset }){
  const data = WHEEL_CATEGORIES.map((name)=>({
    name,
    현재: wheelMap[name]?.current ?? 0,
    목표: wheelMap[name]?.target ?? 0,
  }));
  return (
    <div style={{ borderRadius: 24, boxShadow:'0 2px 10px rgba(0,0,0,.08)', background:'#eff6ff', padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <h3 style={{ margin:0, fontWeight:600 }}>Career Vision Wheel</h3>
        <div style={{ fontSize:12, color:'#64748b' }}>0~10 척도 · 파랑=현재 · 빨강=목표</div>
      </div>
      <div style={{ width:'100%', height:340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius={110} startAngle={90} endAngle={-270}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0,10]} tick={{ fontSize: 10 }} />
            <Radar name="현재" dataKey="현재" fill="#3b82f6" fillOpacity={0.25} stroke="#3b82f6" />
            <Radar name="목표" dataKey="목표" fill="#ef4444" fillOpacity={0.18} stroke="#ef4444" />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Tooltip formatter={(v)=>v} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginTop: 8 }}>
        <button onClick={onReset} style={{ padding:'8px 12px', border:'1px solid #e5e7eb', borderRadius:12, background:'#fff', cursor:'pointer' }}>
          휠 초기화
        </button>
      </div>
    </div>
  );
}

/***********************
 * Mission Form (expanded & wheel input)
 ***********************/
function MissionForm({ onSubmit, onWheelInput }) {
  const [role, setRole] = useState("");
  const [actions, setActions] = useState("");
  const [category, setCategory] = useState("knowledge");
  const [timeline, setTimeline] = useState("1년 후");
  const [skills, setSkills] = useState("");
  const [resources, setResources] = useState("");
  // wheel-related
  const [wheelCategory, setWheelCategory] = useState(WHEEL_CATEGORIES[0]);
  const [wheelCurrent, setWheelCurrent] = useState(0);
  const [wheelTarget, setWheelTarget] = useState(0);
  const [applyWheel, setApplyWheel] = useState(true);

  const can = role.trim() && actions.trim() && typeof onSubmit === 'function';
  const warn = typeof onSubmit !== 'function';

  const handleSubmit = () => {
    if (!can) return;
    const m = {
      role, actions, category, timeline, skills, resources,
      wheel: applyWheel
        ? { category: wheelCategory, current: clamp01(wheelCurrent), target: clamp01(wheelTarget) }
        : null
    };
    onSubmit(m);
    if (applyWheel && typeof onWheelInput === 'function') onWheelInput(m.wheel);
    setRole(""); setActions("");
  };

  const inputStyle = { width:'100%', border:'1px solid #e5e7eb', borderRadius: 8, padding:'8px', fontSize: 14 };

  return (
    <div style={{ display:'grid', gap: 12 }}>
      {warn && (
        <div style={{ fontSize:12, color:'#be123c', background:'#fff1f2', border:'1px solid #fecdd3', borderRadius: 10, padding: 8 }}>
          onSubmit prop이 함수가 아닙니다. 상위에서 <code>{'<MissionForm onSubmit={addMission} />'}</code> 형태로 전달해주세요.
        </div>
      )}

      <div style={{ display:'grid', gap:12, gridTemplateColumns:'1fr 1fr 1fr' }}>
        <div style={{ gridColumn:'span 2' }}>
          <label style={{ fontSize:12, color:'#475569' }}>목표/주제</label>
          <input style={inputStyle} placeholder="예: AI 보안 기본 수강" value={role} onChange={(e)=>setRole(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize:12, color:'#475569' }}>시점</label>
          <select style={inputStyle} value={timeline} onChange={(e)=>setTimeline(e.target.value)}>
            <option value="1년 후">1년 후</option>
            <option value="3년 후">3년 후</option>
            <option value="5년 후">5년 후</option>
          </select>
        </div>
      </div>

      <div style={{ display:'grid', gap:12, gridTemplateColumns:'1fr 1fr' }}>
        <div>
          <label style={{ fontSize:12, color:'#475569' }}>분류</label>
          <select style={inputStyle} value={category} onChange={(e)=>setCategory(e.target.value)}>
            <option value="knowledge">지식</option>
            <option value="skill">기술</option>
            <option value="team">협업</option>
            <option value="lead">리더십</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize:12, color:'#475569' }}>필요 역량/스킬</label>
          <input style={inputStyle} placeholder="예: 보안 인증, 데이터 분석" value={skills} onChange={(e)=>setSkills(e.target.value)} />
        </div>
      </div>

      <div>
        <label style={{ fontSize:12, color:'#475569' }}>실천 계획</label>
        <textarea rows={3} style={inputStyle} placeholder="예: 2주 내 수강 완료, 핵심 3줄 요약, 위키 등록" value={actions} onChange={(e)=>setActions(e.target.value)} />
      </div>

      {/* Wheel hook-in */}
      <div style={{ padding:12, borderRadius: 12, background:'rgba(255,255,255,.7)', border:'1px solid #e5e7eb' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 8 }}>
          <div style={{ fontSize:14, fontWeight:500 }}>Career Wheel 반영</div>
          <label style={{ fontSize:12, display:'flex', alignItems:'center', gap:8 }}>
            <input type="checkbox" checked={applyWheel} onChange={(e)=>setApplyWheel(e.target.checked)} /> 적용
          </label>
        </div>
        <div style={{ display:'grid', gap:12, gridTemplateColumns:'1fr 1fr 1fr' }}>
          <div>
            <label style={{ fontSize:12, color:'#475569' }}>카테고리</label>
            <select style={inputStyle} value={wheelCategory} onChange={(e)=>setWheelCategory(e.target.value)}>
              {WHEEL_CATEGORIES.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, color:'#475569' }}>현재 점수 (0~10)</label>
            <input type="number" min={0} max={10} style={inputStyle} value={wheelCurrent} onChange={(e)=>setWheelCurrent(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize:12, color:'#475569' }}>목표 점수 (0~10)</label>
            <input type="number" min={0} max={10} style={inputStyle} value={wheelTarget} onChange={(e)=>setWheelTarget(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
        <button onClick={handleSubmit} disabled={!can} style={{ padding:'8px 12px', borderRadius: 12, background:'#3b82f6', border:'none', color:'#fff', cursor: can ? 'pointer' : 'not-allowed', opacity: can ? 1 : .6 }}>
          미션 저장 & +포인트
        </button>
      </div>
    </div>
  );
}

/***********************
 * Self-test (light)
 ***********************/
function useSelfTests(nodes) {
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    const results = [];
    const assert = (name, cond) => results.push({ name, pass: !!cond });
    assert("stage 0 -> seed", stageForPoints(0).key === "seed");
    assert("stage 20 -> sprout", stageForPoints(20).key === "sprout");
    assert("career path has 3 nodes", nodes.length === 3);
    setSummary({
      total: results.length,
      passed: results.filter((r) => r.pass).length,
      results,
    });
    console.table(results);
  }, [nodes]);
  return summary;
}

/***********************
 * Defaults
 ***********************/
const DEFAULT_NODES = [
  { key: "y1", label: "1년 후", keyword: "" },
  { key: "y3", label: "3년 후", keyword: "" },
  { key: "y5", label: "5년 후", keyword: "" },
];

/***********************
 * Main App
 ***********************/
export default function App() {
  const [points, setPoints] = useState(0);
  const [missions, setMissions] = useState([]);
  const [celebrate, setCelebrate] = useState(false);
  const [lastStageKey, setLastStageKey] = useState("seed");
  const waterCooldown = useRef(0);
  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [saveHint, setSaveHint] = useState("");
  const [wheelMap, setWheelMap] = useState({}); // { [category]: {current,target} }

  // Load persisted state on mount for this sid
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setPoints(saved.points ?? 0);
      setMissions(saved.missions ?? []);
      setNodes(saved.nodes ?? DEFAULT_NODES);
      setWheelMap(saved.wheelMap ?? {});
    }
  }, []);

  // Auto save
  useEffect(() => {
    saveState({ points, missions, nodes, wheelMap });
    setSaveHint("저장됨");
    const t = setTimeout(() => setSaveHint(""), 1000);
    return () => clearTimeout(t);
  }, [points, missions, nodes, wheelMap]);

  const { stage, pctToNext } = useStage(points);
  useEffect(() => {
    if (stage.key !== lastStageKey) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 700);
      setLastStageKey(stage.key);
      return () => clearTimeout(t);
    }
  }, [stage.key, lastStageKey]);

  function addMission(m) {
    const base = 20;
    const bonus = Math.min(
      30,
      Math.floor(((m.role || "").length + (m.actions || "").length) / 30)
    );
    const gained = base + bonus;
    setPoints((p) => p + gained);
    setMissions((arr) => [{ id: Date.now(), ...m, gained }, ...arr]);
  }

  function water() {
    const now = Date.now();
    if (now - waterCooldown.current < 5000) return;
    waterCooldown.current = now;
    setPoints((p) => p + 5);
  }
  function updateNode(index, value) {
    setNodes((prev) =>
      prev.map((n, i) => (i === index ? { ...n, keyword: value } : n))
    );
  }
  function resetAll() {
    setPoints(0);
    setMissions([]);
    setNodes(DEFAULT_NODES);
    setWheelMap({});
    saveState({ points: 0, missions: [], nodes: DEFAULT_NODES, wheelMap: {} });
    setSaveHint("초기화 완료");
  }
  function newSessionLink() {
    const sid = randomSid();
    const url = new URL(window.location.href);
    url.searchParams.set("sid", sid);
    window.history.pushState({}, "", url.toString());
    resetAll();
    setSaveHint("새 세션 시작");
  }

  function applyWheelInput(w) {
    if (!w) return;
    setWheelMap((prev) => ({
      ...prev,
      [w.category]: {
        current: clamp01(w.current),
        target: clamp01(w.target),
      },
    }));
  }
  function resetWheel() {
    setWheelMap({});
  }

  const levelLabel = useMemo(() => {
    if (points >= 150) return "Legendary";
    if (points >= 100) return "Mature";
    if (points >= 50) return "Growing";
    if (points >= 20) return "Sprout";
    return "Fresh";
  }, [points]);
  const testSummary = useSelfTests(nodes);

  // ======= PAGE LAYOUT (no Tailwind, simple styles) =======
  return (
    <div style={{ minHeight: '100vh', background:'#fff', padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display:'grid', gap: 24, gridTemplateColumns: '1fr',  }}>
        {/* Left: Tree panel */}
        <section style={{ background:'#ecfdf5', borderRadius: 24, boxShadow:'0 2px 10px rgba(0,0,0,.08)', padding: 24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#64748b', marginBottom: 4 }}>
            <div>세션: <b>{getSessionId()}</b></div>
            <div>{saveHint && <span style={{ color:'#059669' }}>{saveHint}</span>}</div>
          </div>
          <div style={{ fontSize:14, color:'#475569', marginBottom: 8 }}>
            스테이지: <b>{stage.name}</b> · 레벨: <b>{levelLabel}</b>
          </div>
          <div style={{ width:'100%', maxWidth: 480, margin: '0 auto' }}>
            <CuteTree stageKey={stage.key} celebrate={celebrate} />
          </div>
          <div style={{ width:'100%', marginTop: 8 }}>
            <div style={{ fontSize:12, color:'#64748b', marginBottom: 4 }}>다음 단계 진행률 {pctToNext}%</div>
            <div style={{ width:'100%', height:8, background:'#e2e8f0', borderRadius: 999 }}>
              <div style={{ height:8, background:'#10b981', borderRadius: 999, width: `${pctToNext}%` }} />
            </div>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop: 16 }}>
            <button onClick={water} style={{ padding:'8px 12px', borderRadius:12, background:'#10b981', color:'#fff', border:0, cursor:'pointer' }}>물 주기 +5</button>
            <button onClick={resetAll} style={{ padding:'8px 12px', borderRadius:12, background:'#fff', color:'#0f172a', border:'1px solid #e5e7eb', cursor:'pointer' }}>초기화</button>
            <button onClick={newSessionLink} style={{ padding:'8px 12px', borderRadius:12, background:'#fff', color:'#0f172a', border:'1px solid #e5e7eb', cursor:'pointer' }}>새 세션 링크</button>
          </div>
          <div style={{ fontSize:11, color:'#64748b', marginTop:8, textAlign:'center', padding:'0 8px' }}>
            같은 URL이라도 브라우저/기기마다 데이터가 분리됩니다. 필요 시 주소 뒤에 <code>?sid=나만의값</code>을 붙여 세션을 나눌 수 있어요.
          </div>
        </section>

        {/* Right: Wheel + Path + Missions */}
        <section style={{ display:'grid', gap: 16 }}>
          <WheelCard wheelMap={wheelMap} onReset={resetWheel} />
          <CareerPath nodes={nodes} onUpdate={updateNode} points={points} />

          <div style={{ borderRadius: 24, boxShadow:'0 2px 10px rgba(0,0,0,.08)', background:'#f5f3ff' }}>
            <div style={{ padding: 24 }}>
              <h2 style={{ margin:0, fontWeight:600, marginBottom:12 }}>커리어 미션</h2>
              <MissionForm onSubmit={addMission} onWheelInput={applyWheelInput} />
              <div style={{ marginTop:16, fontSize:14 }}>
                총 포인트: <b>{points}</b>
              </div>

              <h3 style={{ fontWeight:500, marginTop:16, marginBottom:8 }}>미션 기록</h3>
              {missions.length === 0 ? (
                <div style={{ fontSize:14, color:'#475569' }}>아직 미션이 없습니다. 첫 미션을 등록해보세요.</div>
              ) : (
                <ul style={{ display:'grid', gap:8, maxHeight: 288, overflow:'auto', paddingRight: 4, margin:0, listStyle:'none' }}>
                  {missions.map((m) => (
                    <li key={m.id} style={{ padding:12, border:'1px solid #e5e7eb', borderRadius:12, background:'rgba(255,255,255,.6)' }}>
                      <div style={{ fontSize:12, color:'#64748b' }}>분류: {m.category} · 시점: {m.timeline}</div>
                      <div style={{ fontWeight:500 }}>목표: {m.role}</div>
                      {m.skills && <div style={{ fontSize:12, marginTop:4 }}>필요 역량: {m.skills}</div>}
                      {m.resources && <div style={{ fontSize:12, marginTop:4 }}>리소스: {m.resources}</div>}
                      {m.wheel && (
                        <div style={{ fontSize:12, marginTop:4 }}>
                          휠 반영: {m.wheel.category} (현재 {m.wheel.current} → 목표 {m.wheel.target})
                        </div>
                      )}
                      <div style={{ fontSize:14, whiteSpace:'pre-wrap', marginTop:4 }}>실천: {m.actions}</div>
                      <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>획득 포인트: +{m.gained}</div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Self test */}
              {testSummary && (
                <div style={{ marginTop:16, padding:12, borderRadius:12, background:'rgba(255,255,255,.7)', border:'1px solid #e5e7eb', fontSize:12 }}>
                  <div style={{ fontWeight:500, marginBottom:6 }}>
                    Self-tests: {testSummary.passed}/{testSummary.total} passed
                  </div>
                  <ul style={{ margin:0, paddingLeft:18 }}>
                    {testSummary.results.map((r, i) => (
                      <li key={i} style={{ color: r.pass ? '#065f46' : '#9f1239' }}>
                        {r.name} — {r.pass ? "OK" : "FAIL"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
