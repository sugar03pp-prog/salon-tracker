import React, { useState, useMemo, useEffect } from "react";

const COURSES = [
  "100分","130分","200分","230分","260分","300分","330分",
  "360分","390分","400分","430分","460分","490分","500分","520分","530分","600分","70分"
];

const COURSE_COLORS = {
  "100分": "#8148f2", "130分": "#8e48f2", "200分": "#9b48f2", "230分": "#a848f2",
  "260分": "#b548f2", "300分": "#c348f2", "330分": "#d048f2", "360分": "#dd48f2",
  "390分": "#ea48f2", "400分": "#f248ec", "430分": "#f248df", "460分": "#f248d2",
  "490分": "#f248c5", "500分": "#f248b7", "520分": "#f248aa", "530分": "#f2489d",
  "600分": "#e040fb",
  "70分": "#6366f1",
};

function daysBetween(d1, d2) {
  return Math.round(Math.abs(new Date(d2) - new Date(d1)) / 86400000);
}
function avgCycleDays(visits) {
  if (visits.length < 2) return null;
  const sorted = [...visits].sort((a, b) => new Date(a.date) - new Date(b.date));
  let total = 0;
  for (let i = 1; i < sorted.length; i++) total += daysBetween(sorted[i-1].date, sorted[i].date);
  return Math.round(total / (sorted.length - 1));
}
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

// コース料金テーブル
const COURSE_PRICES = {
  "70分":  { client: 41000, back: 27000, frames: 1, pts: 7 },
  "100分": { client: 60000, back: 37000, frames: 1, pts: 10 },
  "130分": { client: 79000, back: 47000, frames: 1, pts: 13 },
  "200分": { client: 120000, back: 74000, frames: 2, pts: 20 },
  "230分": { client: 139000, back: 84000, frames: 2, pts: 23 },
  "260分": { client: 158000, back: 94000, frames: 2, pts: 26 },
  "300分": { client: 180000, back: 111000, frames: 3, pts: 30 },
  "330分": { client: 199000, back: 121000, frames: 3, pts: 33 },
  "360分": { client: 218000, back: 131000, frames: 3, pts: 36 },
  "390分": { client: 237000, back: 141000, frames: 3, pts: 39 },
  "400分": { client: 240000, back: 148000, frames: 4, pts: 40 },
  "430分": { client: 259000, back: 158000, frames: 4, pts: 43 },
  "460分": { client: 278000, back: 168000, frames: 4, pts: 46 },
  "490分": { client: 297000, back: 178000, frames: 4, pts: 49 },
  "500分": { client: 300000, back: 185000, frames: 5, pts: 50 },
  "520分": { client: 316000, back: 188000, frames: 4, pts: 52 },
  "530分": { client: 319000, back: 195000, frames: 5, pts: 53 },
  "600分": { client: 360000, back: 222000, frames: 6, pts: 60 },
};

function calcPrices(course, isFirstVisit) {
  const base = COURSE_PRICES[course];
  if (!base) return { client: 0, back: 0 };
  const client = base.client;
  const backRaw = base.back - (isFirstVisit ? 2000 : 0);
  const back = Math.round(backRaw * 0.9);
  return { client, back };
}

function fmt(n) {
  return "¥" + n.toLocaleString();
}

function MiniBar({ value, max, color }) {
  return (
    <div style={{ background: "#1e1e2e", borderRadius: 4, height: 8, width: "100%", overflow: "hidden" }}>
      <div style={{ width: `${(value / max) * 100}%`, background: color, height: "100%", borderRadius: 4, transition: "width 0.5s" }} />
    </div>
  );
}

function VisitHistoryEditor({ visits, onUpdate, onDelete, onAdd, personName, hideSalary }) {
  const [editingId, setEditingId] = React.useState(null);
  const [editForm, setEditForm] = React.useState({ date: "", course: COURSES[0], firstVisit: false });
  const [addMode, setAddMode] = React.useState(false);
  const [addForm, setAddForm] = React.useState({ date: "", course: COURSES[0], firstVisit: false });
  const sorted = [...visits].sort((a, b) => new Date(a.date) - new Date(b.date));
  function startEdit(v) { setEditingId(v.id); setEditForm({ date: v.date, course: v.course, firstVisit: v.firstVisit || false }); setAddMode(false); }
  function saveEdit(id) { if (!editForm.date) return; onUpdate(id, editForm.date, editForm.course, editForm.firstVisit); setEditingId(null); }
  function saveAdd() { if (!addForm.date) return; onAdd(personName, addForm.date, addForm.course, addForm.firstVisit); setAddForm({ date: "", course: COURSES[0], firstVisit: false }); setAddMode(false); }
  const inputStyle = { background: "#0f0f1a", border: "1px solid #a78bfa", borderRadius: 6, padding: "4px 8px", color: "#e2e8f0", fontSize: 12, outline: "none", colorScheme: "dark", whiteSpace: "nowrap" };
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "#6b7280" }}>来店履歴（全件）</span>
        <button onClick={() => { setAddMode(m => !m); setEditingId(null); setAddForm({ date: "", course: COURSES[0], firstVisit: false }); }}
          style={{ background: addMode ? "#374151" : "linear-gradient(135deg,#a78bfa,#ec4899)", border: "none", borderRadius: 7, padding: "5px 12px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          {addMode ? "✕ キャンセル" : "＋ 追加"}
        </button>
      </div>
      {addMode && (
        <div style={{ background: "#0f0f1a", borderRadius: 8, padding: "10px 12px", marginBottom: 10, border: "1px solid #a78bfa44", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input type="date" value={addForm.date} onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
          <select value={addForm.course} onChange={e => setAddForm(f => ({ ...f, course: e.target.value }))} style={inputStyle}>{COURSES.map(c => <option key={c}>{c}</option>)}</select>
          <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#f59e0b", cursor: "pointer" }}>
            <input type="checkbox" checked={addForm.firstVisit} onChange={e => setAddForm(f => ({ ...f, firstVisit: e.target.checked }))} />
            初指名
          </label>
          <button onClick={saveAdd} style={{ background: "#a78bfa", border: "none", borderRadius: 6, padding: "5px 12px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>保存</button>
        </div>
      )}
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ borderBottom: "1px solid #2d2d44", color: "#4b5563", fontSize: 11 }}>
            <th style={{ padding: "4px 6px", textAlign: "left" }}>来店日</th>
            <th style={{ padding: "4px 6px", textAlign: "left" }}>コース</th>
            <th style={{ padding: "4px 6px", textAlign: "right" }}>金額</th>
            <th style={{ padding: "4px 6px" }}></th>
          </tr></thead>
          <tbody>
            {[...sorted].reverse().map((v, i) => {
              const prices = calcPrices(v.course, v.firstVisit);
              if (editingId === v.id) {
                return (
                  <tr key={v.id}>
                    <td colSpan={4} style={{ padding: 0 }}>
                      <div style={{ background: "#0f0f1a", borderRadius: 8, padding: "10px 12px", margin: "6px 0", border: "1px solid #a78bfa44" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                          <input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
                          <select value={editForm.course} onChange={e => setEditForm(f => ({ ...f, course: e.target.value }))} style={inputStyle}>{COURSES.map(c => <option key={c}>{c}</option>)}</select>
                          <label style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#f59e0b", cursor: "pointer" }}>
                            <input type="checkbox" checked={editForm.firstVisit} onChange={e => setEditForm(f => ({ ...f, firstVisit: e.target.checked }))} />
                            初指名
                          </label>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => saveEdit(v.id)} style={{ background: "#a78bfa", border: "none", borderRadius: 6, padding: "6px 14px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>保存</button>
                          <button onClick={() => setEditingId(null)} style={{ background: "#374151", border: "none", borderRadius: 6, padding: "6px 14px", color: "#9ca3af", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>取消</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }
              return (
              <tr key={v.id} style={{ borderBottom: "1px solid #16162a" }}>
                    <td style={{ padding: "6px 6px", color: "#9ca3af", whiteSpace: "nowrap" }}>
                      {v.date}
                      {v.firstVisit && <span style={{ marginLeft: 4, fontSize: 10, color: "#f59e0b" }}>初</span>}
                    </td>
                    <td style={{ padding: "6px 6px" }}><span style={{ background: COURSE_COLORS[v.course] + "33", color: COURSE_COLORS[v.course], borderRadius: 5, padding: "2px 8px", fontWeight: 700, whiteSpace: "nowrap", display: "inline-block" }}>{v.course}</span></td>
                    <td style={{ padding: "6px 6px", textAlign: "right", whiteSpace: "nowrap", fontSize: 11 }}>
                      <div style={{ color: "#34d399" }}>{hideSalary ? "¥●●●,●●●" : fmt(prices.client)}</div>
                      <div style={{ color: "#a78bfa", marginTop: 2 }}>{hideSalary ? "¥●●●,●●●" : fmt(prices.back)}</div>
                    </td>
                    <td style={{ padding: "6px 6px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button onClick={() => startEdit(v)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13, marginRight: 2 }}>✏️</button>
                      <button onClick={() => onDelete(v.id)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 13 }}>🗑</button>
                    </td>
              </tr>
            )})}
            {sorted.length === 0 && (<tr><td colSpan={4} style={{ padding: "12px 6px", color: "#4b5563", textAlign: "center", fontSize: 12 }}>来店履歴がありません</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NameEditor({ name, onRename }) {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(name);
  if (!editing) return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontWeight: 800, fontSize: 16 }}>{name}</span>
      <button onClick={() => { setVal(name); setEditing(true); }}
        style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13, padding: 0 }}>✏️</button>
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input value={val} onChange={e => setVal(e.target.value)} autoFocus
        onKeyDown={e => { if (e.key === "Enter") { onRename(name, val.trim()); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
        style={{ background: "#0f0f1a", border: "1px solid #a78bfa", borderRadius: 6, padding: "4px 8px", color: "#e2e8f0", fontSize: 15, fontWeight: 800, outline: "none", width: 140 }} />
      <button onClick={() => { onRename(name, val.trim()); setEditing(false); }}
        style={{ background: "#a78bfa", border: "none", borderRadius: 6, padding: "4px 10px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>保存</button>
      <button onClick={() => setEditing(false)}
        style={{ background: "#374151", border: "none", borderRadius: 6, padding: "4px 8px", color: "#9ca3af", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>✕</button>
    </div>
  );
}

export default function App() {
  const [visits, setVisits] = useState(() => {
    try {
      const saved = localStorage.getItem("salon_visits");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [tab, setTab] = useState("record");
  const [form, setForm] = useState({ name: "", date: "", course: COURSES[0], firstVisit: false });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [nameSearch, setNameSearch] = useState("");
  const [expandedHistory, setExpandedHistory] = useState({});
  const [expandedCycles, setExpandedCycles] = useState({});
  const [recentSearches, setRecentSearches] = useState([]);
  const [newCustomerMode, setNewCustomerMode] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [registeredCustomers, setRegisteredCustomers] = useState(() => {
    try { const s = localStorage.getItem("salon_customers"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [showPeriodSalary, setShowPeriodSalary] = useState(false);
  const [hideSalary, setHideSalary] = useState(false);
  const [graphStart, setGraphStart] = useState("");
  const [graphEnd, setGraphEnd] = useState("");
  const [expandedAbsent, setExpandedAbsent] = useState({});
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  // 過去データ: { "顧客名": { firstDate: "2021-09-03", pastCount: 42 } }
  const [pastData, setPastData] = useState(() => {
    try { const s = localStorage.getItem("salon_past"); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });

  useEffect(() => {
    try { localStorage.setItem("salon_visits", JSON.stringify(visits)); } catch {}
  }, [visits]);

  useEffect(() => {
    try { localStorage.setItem("salon_past", JSON.stringify(pastData)); } catch {}
  }, [pastData]);

  useEffect(() => {
    try { localStorage.setItem("salon_customers", JSON.stringify(registeredCustomers)); } catch {}
  }, [registeredCustomers]);

  function setPast(name, field, value) {
    setPastData(prev => ({ ...prev, [name]: { ...(prev[name] || {}), [field]: value } }));
  }

  const customers = useMemo(() => {
    const fromVisits = visits.map(v => v.name);
    return [...new Set([...registeredCustomers, ...fromVisits])].sort();
  }, [visits, registeredCustomers]);

  const personalStats = useMemo(() => customers.map(name => {
    const myVisits = visits.filter(v => v.name === name).sort((a, b) => new Date(a.date) - new Date(b.date));
    const cycle = avgCycleDays(myVisits);
    const courseCounts = {};
    myVisits.forEach(v => { courseCounts[v.course] = (courseCounts[v.course] || 0) + 1; });
    const topCourse = Object.entries(courseCounts).sort((a, b) => b[1] - a[1])[0];
    const lastVisit = myVisits.length ? myVisits[myVisits.length - 1].date : null;
    const nextVisit = lastVisit && cycle ? addDays(lastVisit, cycle) : null;
    const daysSinceLast = lastVisit ? daysBetween(lastVisit, today()) : null;
    const overdue = cycle && daysSinceLast ? daysSinceLast > cycle * 1.5 : false;
    const totalClient = myVisits.reduce((sum, v) => sum + calcPrices(v.course, v.firstVisit).client, 0);
    const totalBack = myVisits.reduce((sum, v) => sum + calcPrices(v.course, v.firstVisit).back, 0);
    const past = pastData[name] || {};
    const firstDate = past.firstDate || (myVisits.length ? myVisits[0].date : null);
    const pastCount = parseInt(past.pastCount || 0);
    const totalCount = myVisits.length + pastCount;
    return { name, visits: myVisits, cycle, courseCounts, topCourse, total: myVisits.length, lastVisit, nextVisit, daysSinceLast, overdue, totalClient, totalBack, firstDate, pastCount, totalCount };
  }), [customers, visits, pastData]);

  const overallStats = useMemo(() => {
    const allCycles = personalStats.filter(p => p.cycle !== null).map(p => p.cycle);
    const avgCycle = allCycles.length ? Math.round(allCycles.reduce((a, b) => a + b, 0) / allCycles.length) : null;
    const courseCounts = {};
    visits.forEach(v => { courseCounts[v.course] = (courseCounts[v.course] || 0) + 1; });
    // 月別来店数
    const monthCounts = {};
    visits.forEach(v => {
      const m = v.date.slice(0, 7);
      monthCounts[m] = (monthCounts[m] || 0) + 1;
    });
    const months = Object.entries(monthCounts).sort((a, b) => a[0].localeCompare(b[0]));
    // 要フォロー（直近来店から平均周期×1.5以上経過）
    const followUp = personalStats.filter(p => p.overdue).sort((a, b) => b.daysSinceLast - a.daysSinceLast);
    return { avgCycle, courseCounts, total: visits.length, months, followUp };
  }, [visits, personalStats]);

  function handleAdd() {
    if (!form.name.trim()) { setError("顧客名を入力してください"); return; }
    if (!form.date) { setError("来店日を入力してください"); return; }
    setError("");
    const newVisit = { id: Date.now(), name: form.name.trim(), date: form.date, course: form.course, firstVisit: form.firstVisit };
    setVisits(prev => [...prev, newVisit]);
    setForm(f => ({ ...f, name: "", date: "", firstVisit: false }));
    setSuccessMsg(`${newVisit.name} の来店を記録しました`);
    setTimeout(() => setSuccessMsg(""), 3000);
  }
  function handleDelete(id) { setVisits(prev => prev.filter(v => v.id !== id)); }
  function handleUpdate(id, date, course, firstVisit) { setVisits(prev => prev.map(v => v.id === id ? { ...v, date, course, firstVisit: firstVisit || false } : v)); }
  function handleAddVisitForPerson(name, date, course, firstVisit) { setVisits(prev => [...prev, { id: Date.now(), name, date, course, firstVisit: firstVisit || false }]); }
  function toggleHistory(name) { setExpandedHistory(prev => ({ ...prev, [name]: !prev[name] })); }
  function toggleCycles(name) { setExpandedCycles(prev => ({ ...prev, [name]: !prev[name] })); }
  function exportData() {
    const data = {
      visits: localStorage.getItem('salon_visits'),
      past: localStorage.getItem('salon_past'),
      customers: localStorage.getItem('salon_customers'),
    };
    const json = JSON.stringify(data);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(json).then(() => alert('データをクリップボードにコピーしました！新しいアプリに貼り付けてください。'));
    } else {
      prompt('以下のデータをコピーしてください：', json);
    }
  }

  function importData(json) {
    try {
      const data = JSON.parse(json);
      if (data.visits) localStorage.setItem('salon_visits', data.visits);
      if (data.past) localStorage.setItem('salon_past', data.past);
      if (data.customers) localStorage.setItem('salon_customers', data.customers);
      alert('インポート完了！ページを再読み込みします。');
      window.location.reload();
    } catch(e) {
      alert('データの形式が正しくありません。');
    }
  }

  const tabStyle = (t) => ({ padding: "8px 14px", borderRadius: "8px 8px 0 0", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: tab === t ? "#1e1e2e" : "transparent", color: tab === t ? "#a78bfa" : "#6b7280", borderBottom: tab === t ? "2px solid #a78bfa" : "2px solid transparent", transition: "all 0.2s", fontFamily: "inherit", whiteSpace: "nowrap" });

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", color: "#e2e8f0", fontFamily: "'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif" }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 16px 40px" }}>
        <div style={{ padding: "28px 0 20px", borderBottom: "1px solid #2d2d44" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#a78bfa,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌸</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>顧客管理ダッシュボード</h1>
              <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>来店記録・周期・コース分析</p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={exportData}
                style={{ background: "#16162a", border: "1px solid #374151", borderRadius: 8, padding: "5px 10px", color: "#9ca3af", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                📤 出力
              </button>
              <button onClick={() => {
                const json = prompt('インポートするデータを貼り付けてください：');
                if (json) importData(json);
              }}
                style={{ background: "#16162a", border: "1px solid #374151", borderRadius: 8, padding: "5px 10px", color: "#9ca3af", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                📥 入力
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 24, borderBottom: "1px solid #2d2d44", overflowX: "auto" }}>
          <button style={tabStyle("record")} onClick={() => setTab("record")}>📝 記録</button>
          <button style={tabStyle("personal")} onClick={() => setTab("personal")}>👤 顧客</button>
          <button style={tabStyle("overall")} onClick={() => setTab("overall")}>📊 全体</button>
          <button style={tabStyle("period")} onClick={() => setTab("period")}>📅 期間</button>
          <button style={tabStyle("monthly")} onClick={() => setTab("monthly")}>📆 月別</button>
          <button style={tabStyle("graphs")} onClick={() => setTab("graphs")}>📈 グラフ</button>
          <button style={tabStyle("retention")} onClick={() => setTab("retention")}>🔍 リテンション</button>
        </div>
        <div style={{ background: "#1e1e2e", borderRadius: "0 8px 8px 8px", padding: 24 }}>

          {/* 来店記録タブ */}
          {tab === "record" && (
            <div>
              {/* 新規顧客登録 */}
              {newCustomerMode ? (
                <div style={{ background: "#16162a", borderRadius: 12, padding: 20, marginBottom: 24, border: "1px solid #a78bfa44" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>▸ 新規顧客を登録</h3>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 4 }}>顧客名</label>
                      <input value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} placeholder="例：田中 太郎"
                        style={{ width: "100%", background: "#0f0f1a", border: "1px solid #374151", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
                    </div>
                    <button onClick={() => {
                      if (!newCustomerName.trim()) return;
                      const name = newCustomerName.trim();
                      setRegisteredCustomers(prev => prev.includes(name) ? prev : [...prev, name]);
                      setNewCustomerMode(false);
                      setForm(f => ({ ...f, name }));
                      setNewCustomerName("");
                      setSuccessMsg(`${name} を登録しました`);
                      setTimeout(() => setSuccessMsg(""), 3000);
                    }} style={{ background: "linear-gradient(135deg,#a78bfa,#ec4899)", border: "none", borderRadius: 8, padding: "10px 16px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>登録</button>
                    <button onClick={() => { setNewCustomerMode(false); setNewCustomerName(""); }}
                      style={{ background: "#374151", border: "none", borderRadius: 8, padding: "10px 16px", color: "#9ca3af", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>戻る</button>
                  </div>
                </div>
              ) : (
                <div style={{ background: "#16162a", borderRadius: 12, padding: 20, marginBottom: 24, border: "1px solid #2d2d44" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>▸ 来店を記録</h3>
                    <button onClick={() => setNewCustomerMode(true)}
                      style={{ background: "#0f0f1a", border: "1px solid #374151", borderRadius: 8, padding: "6px 12px", color: "#9ca3af", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>＋ 新規顧客</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 4 }}>顧客名</label>
                      <select value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        style={{ width: "100%", background: "#0f0f1a", border: "1px solid #374151", borderRadius: 8, padding: "9px 12px", color: form.name ? "#e2e8f0" : "#6b7280", fontSize: 14, boxSizing: "border-box", outline: "none" }}>
                        <option value="">選択してください</option>
                        {customers.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 4 }}>来店日</label>
                      <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ width: "100%", background: "#0f0f1a", border: "1px solid #374151", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 4 }}>コース</label>
                      <select value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} style={{ width: "100%", background: "#0f0f1a", border: "1px solid #374151", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none" }}>
                        {COURSES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#f59e0b", cursor: "pointer", paddingTop: 4 }}>
                        <input type="checkbox" checked={form.firstVisit} onChange={e => setForm(f => ({ ...f, firstVisit: e.target.checked }))} />
                        初指名（-¥2,000）
                      </label>
                      {(() => {
                        const p = calcPrices(form.course, form.firstVisit);
                        return (
                          <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.6 }}>
                            客払 <span style={{ color: "#34d399", fontWeight: 700 }}>{fmt(p.client)}</span>　給与 <span style={{ color: "#a78bfa", fontWeight: 700 }}>{fmt(p.back)}</span>
                          </div>
                        );
                      })()}
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gridColumn: "1 / -1" }}>
                      <button onClick={handleAdd} style={{ width: "100%", background: "linear-gradient(135deg,#a78bfa,#ec4899)", border: "none", borderRadius: 8, padding: "10px 0", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>＋ 記録する</button>
                    </div>
                  </div>
                  {error && <p style={{ color: "#f87171", fontSize: 12, margin: "10px 0 0" }}>⚠ {error}</p>}
                  {successMsg && <p style={{ color: "#34d399", fontSize: 12, margin: "10px 0 0" }}>✓ {successMsg}</p>}
                </div>
              )}
              {/* 選択中の顧客の直近履歴 */}
              {form.name && (() => {
                const recentVisits = [...visits]
                  .filter(v => v.name === form.name)
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 5);
                if (recentVisits.length === 0) return (
                  <div style={{ background: "#16162a", borderRadius: 10, padding: "14px 16px", border: "1px solid #2d2d44" }}>
                    <div style={{ fontSize: 12, color: "#4b5563" }}>まだ来店記録がありません</div>
                  </div>
                );
                return (
                  <div style={{ background: "#16162a", borderRadius: 10, padding: "14px 16px", border: "1px solid #2d2d44" }}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>{form.name} の直近来店</div>
                    {recentVisits.map(v => {
                      const p = calcPrices(v.course, v.firstVisit);
                      return (
                        <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #0f0f1a" }}>
                          <div style={{ fontSize: 12, color: "#9ca3af" }}>{v.date}{v.firstVisit && <span style={{ marginLeft: 4, fontSize: 10, color: "#f59e0b" }}>初</span>}</div>
                          <span style={{ background: COURSE_COLORS[v.course] + "33", color: COURSE_COLORS[v.course], borderRadius: 5, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{v.course}</span>
                          <div style={{ textAlign: "right", fontSize: 11 }}>
                            <div style={{ color: "#34d399" }}>{fmt(p.client)}</div>
                            <div style={{ color: "#a78bfa" }}>{fmt(p.back)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* 個人分析タブ */}
          {tab === "personal" && (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                <button onClick={() => setHideSalary(v => !v)}
                  style={{ background: "#16162a", border: "1px solid #374151", borderRadius: 8, padding: "5px 10px", color: "#9ca3af", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                  {hideSalary ? "👁 給与を表示" : "🙈 給与を隠す"}
                </button>
              </div>
              <div style={{ position: "relative", marginBottom: 16 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#6b7280", pointerEvents: "none" }}>🔍</span>
                <input value={nameSearch} onChange={e => { setNameSearch(e.target.value); setSelectedCustomer(null); }} placeholder="名前で検索…" style={{ width: "100%", background: "#16162a", border: "1px solid #374151", borderRadius: 10, padding: "10px 12px 10px 36px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
                {nameSearch && (<button onClick={() => {
                  // 検索中の一致顧客を履歴に追加
                  const matched = personalStats.filter(p => p.name.includes(nameSearch)).map(p => p.name);
                  if (matched.length > 0) {
                    setRecentSearches(prev => {
                      const updated = [matched[0], ...prev.filter(n => n !== matched[0])].slice(0, 3);
                      return updated;
                    });
                  }
                  setNameSearch("");
                }} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 16 }}>✕</button>)}
              </div>
              {/* 最近検索した3件 */}
              {!nameSearch && recentSearches.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#4b5563", marginBottom: 8 }}>最近見た顧客</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {recentSearches.map(name => {
                      const p = personalStats.find(p => p.name === name);
                      return (
                        <button key={name} onClick={() => setNameSearch(name)}
                          style={{ padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                            background: p && p.overdue ? "#3b1a1a" : "#16162a",
                            color: p && p.overdue ? "#f87171" : "#9ca3af" }}>
                          {p && p.overdue ? "⚠ " : ""}{name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {personalStats.filter(p => nameSearch ? p.name.includes(nameSearch) : false).map(p => {
                const maxCount = p.total > 0 ? Math.max(...Object.values(p.courseCounts)) : 1;
                const historyOpen = expandedHistory[p.name];
                const cyclesOpen = expandedCycles[p.name];
                return (
                  <div key={p.name} style={{ background: "#16162a", borderRadius: 12, padding: 20, marginBottom: 16, border: `1px solid ${p.overdue ? "#7f1d1d" : "#2d2d44"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: p.overdue ? "linear-gradient(135deg,#7f1d1d,#b91c1c)" : "linear-gradient(135deg,#a78bfa33,#ec489933)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{p.overdue ? "⚠️" : "👤"}</div>
                      <div style={{ flex: 1 }}>
                        <NameEditor
                          name={p.name}
                          onRename={(oldName, newName) => {
                            if (!newName.trim() || newName === oldName) return;
                            setVisits(prev => prev.map(v => v.name === oldName ? { ...v, name: newName } : v));
                            setRegisteredCustomers(prev => prev.map(n => n === oldName ? newName : n));
                            setPastData(prev => {
                              if (!prev[oldName]) return prev;
                              const next = { ...prev, [newName]: prev[oldName] };
                              delete next[oldName];
                              return next;
                            });
                            setNameSearch(newName);
                          }}
                        />
                        <div style={{ fontSize: 12, color: "#6b7280" }}>来店 {p.total} 回</div>
                      </div>
                      <div style={{ marginLeft: "auto", textAlign: "right" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: p.cycle ? "#a78bfa" : "#4b5563" }}>{p.cycle ? `${p.cycle}日` : "—"}</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>平均来店周期</div>
                      </div>
                    </div>

                    {/* 最終来店・次回予測・初回来店 */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                      <div style={{ background: "#0f0f1a", borderRadius: 8, padding: "8px 12px", flex: 1, minWidth: 100 }}>
                        <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 3 }}>初回来店</div>
                        <input type="date" value={p.firstDate || ""} onChange={e => setPast(p.name, "firstDate", e.target.value)}
                          style={{ background: "none", border: "none", color: "#f59e0b", fontWeight: 700, fontSize: 12, outline: "none", padding: 0, width: "100%", colorScheme: "dark" }} />
                      </div>
                      <div style={{ background: "#0f0f1a", borderRadius: 8, padding: "8px 12px", flex: 1, minWidth: 100 }}>
                        <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 3 }}>最終来店</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{p.lastVisit || "—"}</div>
                        {p.daysSinceLast !== null && <div style={{ fontSize: 10, color: p.overdue ? "#f87171" : "#6b7280", marginTop: 2 }}>{p.daysSinceLast}日前</div>}
                      </div>
                      <div style={{ background: "#0f0f1a", borderRadius: 8, padding: "8px 12px", flex: 1, minWidth: 100 }}>
                        <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 3 }}>次回予測</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: p.nextVisit ? "#34d399" : "#4b5563" }}>{p.nextVisit || "—"}</div>
                        {p.nextVisit && <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>
                          {new Date(p.nextVisit) < new Date(today()) ? `${daysBetween(p.nextVisit, today())}日超過` : `あと${daysBetween(today(), p.nextVisit)}日`}
                        </div>}
                      </div>
                    </div>

                    {/* 累計来店数 */}
                    <div style={{ background: "#0f0f1a", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>過去分（アプリ外）</div>
                        <input type="number" min={0} value={p.pastCount || ""} placeholder="0"
                          onChange={e => setPast(p.name, "pastCount", e.target.value)}
                          style={{ background: "none", border: "none", borderBottom: "1px solid #374151", color: "#9ca3af", fontWeight: 700, fontSize: 14, outline: "none", padding: "2px 0", width: 60, colorScheme: "dark" }} />
                        <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 4 }}>回</span>
                      </div>
                      <div style={{ color: "#374151", fontSize: 18 }}>＋</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>アプリ記録</div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#a78bfa" }}>{p.total}</span>
                        <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 4 }}>回</span>
                      </div>
                      <div style={{ color: "#374151", fontSize: 18 }}>＝</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>累計来店数</div>
                        <span style={{ fontSize: 18, fontWeight: 900, color: "#ec4899" }}>{p.totalCount}</span>
                        <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 4 }}>回</span>
                      </div>
                    </div>

                    {p.overdue && (
                      <div style={{ background: "#7f1d1d33", border: "1px solid #b91c1c55", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#f87171" }}>
                        ⚠ 平均周期の1.5倍（{p.cycle ? Math.round(p.cycle * 1.5) : "—"}日）を超えています
                      </div>
                    )}

                    {p.total > 0 && (<>
                      {/* 累計金額 */}
                      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                        <div style={{ background: "#0f0f1a", borderRadius: 8, padding: "8px 12px", flex: 1 }}>
                          <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 3 }}>累計客払い</div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "#34d399" }}>{hideSalary ? "¥●●●,●●●" : fmt(p.totalClient)}</div>
                        </div>
                        <div style={{ background: "#0f0f1a", borderRadius: 8, padding: "8px 12px", flex: 1 }}>
                          <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 3 }}>累計給与</div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "#a78bfa" }}>{hideSalary ? "¥●●●,●●●" : fmt(p.totalBack)}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>コース内訳</div>
                      {Object.entries(p.courseCounts).sort((a, b) => b[1] - a[1]).map(([course, count]) => (
                        <div key={course} style={{ marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 13, color: COURSE_COLORS[course], fontWeight: 600 }}>{course}</span>
                            <span style={{ fontSize: 12, color: "#9ca3af" }}>{count}回 ({Math.round(count / p.total * 100)}%)</span>
                          </div>
                          <MiniBar value={count} max={maxCount} color={COURSE_COLORS[course]} />
                        </div>
                      ))}

                      {/* 平均コース時間 */}
                      {(() => {
                        const totalMins = p.visits.reduce((sum, v) => {
                          const m = parseInt(v.course);
                          return sum + (isNaN(m) ? 0 : m);
                        }, 0);
                        const avgMins = Math.round(totalMins / p.total);
                        return (
                          <div style={{ background: "#0f0f1a", borderRadius: 8, padding: "8px 14px", marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "#6b7280" }}>平均コース時間</span>
                            <span style={{ fontSize: 15, fontWeight: 800, color: "#f59e0b" }}>{avgMins}分</span>
                          </div>
                        );
                      })()}

                      {/* 来店曜日の傾向 */}
                      {(() => {
                        const days = ["日","月","火","水","木","金","土"];
                        const dayCounts = [0,0,0,0,0,0,0];
                        p.visits.forEach(v => { dayCounts[new Date(v.date).getDay()]++; });
                        const maxD = Math.max(...dayCounts);
                        return (
                          <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>来店曜日の傾向</div>
                            <div style={{ display: "flex", gap: 4 }}>
                              {days.map((d, i) => (
                                <div key={d} style={{ flex: 1, textAlign: "center" }}>
                                  <div style={{ fontSize: 10, color: dayCounts[i] === maxD && maxD > 0 ? "#ec4899" : "#6b7280", marginBottom: 4 }}>{d}</div>
                                  <div style={{ background: "#0f0f1a", borderRadius: 4, height: 32, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                                    <div style={{ width: "100%", background: dayCounts[i] === maxD && maxD > 0 ? "#ec4899" : "#374151", height: maxD > 0 ? `${(dayCounts[i] / maxD) * 100}%` : "0%", borderRadius: 3, transition: "height 0.4s" }} />
                                  </div>
                                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>{dayCounts[i] || ""}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* 月別来店数（直近6ヶ月） */}
                      {(() => {
                        const monthCounts = {};
                        p.visits.forEach(v => { const m = v.date.slice(0,7); monthCounts[m] = (monthCounts[m]||0)+1; });
                        const months = Object.entries(monthCounts).sort((a,b) => a[0].localeCompare(b[0])).slice(-6);
                        if (months.length < 1) return null;
                        const maxM = Math.max(...months.map(m => m[1]));
                        return (
                          <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>月別来店数（直近6ヶ月）</div>
                            {[...months].reverse().map(([m, cnt]) => (
                              <div key={m} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                <div style={{ fontSize: 11, color: "#9ca3af", width: 42, flexShrink: 0 }}>{m.slice(2).replace("-", "/")}</div>
                                <div style={{ flex: 1, background: "#0f0f1a", borderRadius: 4, height: 14, overflow: "hidden" }}>
                                  <div style={{ width: `${(cnt/maxM)*100}%`, background: "#a78bfa", height: "100%", borderRadius: 4, transition: "width 0.4s" }} />
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", width: 20, textAlign: "right", flexShrink: 0 }}>{cnt}</div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </>)}

                    {p.visits.length >= 2 && (() => {
                      const sorted = [...p.visits].sort((a, b) => new Date(a.date) - new Date(b.date));
                      const cycles = sorted.slice(1).map((v, i) => ({ from: sorted[i].date, to: v.date, days: daysBetween(sorted[i].date, v.date) }));
                      const avg = p.cycle;
                      const maxDays = Math.max(...cycles.map(c => c.days));
                      return (
                        <div style={{ marginTop: 14, borderTop: "1px solid #2d2d44", paddingTop: 12 }}>
                          <button onClick={() => toggleCycles(p.name)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 11, color: "#6b7280" }}>{cyclesOpen ? "▼" : "▶"}</span>
                            来店周期の推移を{cyclesOpen ? "閉じる" : "見る"}
                          </button>
                          {cyclesOpen && (
                            <div style={{ marginTop: 12 }}>
                              {[...cycles].reverse().map((c, i) => {
                                const diff = c.days - avg;
                                const barColor = diff > 7 ? "#f87171" : diff < -7 ? "#34d399" : "#a78bfa";
                                return (
                                  <div key={i} style={{ marginBottom: 9 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                                      <span style={{ fontSize: 11, color: "#6b7280" }}>{c.from} → {c.to}</span>
                                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: barColor }}>{c.days}日</span>
                                        {diff !== 0 && <span style={{ fontSize: 10, color: diff > 0 ? "#f87171" : "#34d399" }}>{diff > 0 ? `+${diff}` : diff}日</span>}
                                      </div>
                                    </div>
                                    <div style={{ background: "#0f0f1a", borderRadius: 4, height: 6, width: "100%", overflow: "hidden" }}>
                                      <div style={{ width: `${(c.days / maxDays) * 100}%`, background: barColor, height: "100%", borderRadius: 4, transition: "width 0.4s" }} />
                                    </div>
                                  </div>
                                );
                              })}
                              <div style={{ fontSize: 11, color: "#4b5563", marginTop: 6, display: "flex", gap: 12 }}>
                                <span style={{ color: "#34d399" }}>● 早い</span>
                                <span style={{ color: "#a78bfa" }}>● 平均前後</span>
                                <span style={{ color: "#f87171" }}>● 遅い</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <div style={{ marginTop: 14, borderTop: "1px solid #2d2d44", paddingTop: 12 }}>
                      <button onClick={() => toggleHistory(p.name)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "#6b7280" }}>{historyOpen ? "▼" : "▶"}</span>
                        来店履歴を{historyOpen ? "閉じる" : "編集する"}
                      </button>
                      {historyOpen && <VisitHistoryEditor visits={p.visits} onUpdate={handleUpdate} onDelete={handleDelete} onAdd={handleAddVisitForPerson} personName={p.name} hideSalary={hideSalary} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 全体分析タブ */}
          {tab === "overall" && (
            <div>
              {/* サマリーカード */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
                {[{ label: "総来店数", value: overallStats.total + "件", icon: "🗓", color: "#6366f1" }, { label: "顧客数", value: customers.length + "名", icon: "👥", color: "#ec4899" }, { label: "平均来店周期", value: overallStats.avgCycle ? overallStats.avgCycle + "日" : "—", icon: "🔄", color: "#a78bfa" }].map(c => (
                  <div key={c.label} style={{ background: "#16162a", borderRadius: 12, padding: "16px 14px", border: "1px solid #2d2d44", textAlign: "center" }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.value}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{c.label}</div>
                  </div>
                ))}
              </div>

              {/* 要フォロー顧客 */}
              {overallStats.followUp.length > 0 && (
                <div style={{ background: "#1a0f0f", borderRadius: 12, padding: 20, border: "1px solid #7f1d1d", marginBottom: 20 }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#f87171", fontWeight: 700 }}>⚠ 要フォロー顧客</h3>
                  {overallStats.followUp.map(p => (
                    <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #2d1a1a" }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                        <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 8 }}>最終: {p.lastVisit}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171" }}>{p.daysSinceLast}日経過</div>
                        <div style={{ fontSize: 10, color: "#6b7280" }}>予測: {p.nextVisit}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 来店数ランキング */}
              <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>▸ 来店数ランキング</h3>
                {[...personalStats].sort((a, b) => b.total - a.total).map((p, i) => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #0f0f1a" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : i === 2 ? "#cd7c2f" : "#2d2d44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: i < 3 ? "#000" : "#6b7280", flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>平均周期 {p.cycle ? p.cycle + "日" : "—"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#a78bfa" }}>{p.total}</div>
                      <div style={{ fontSize: 10, color: "#6b7280" }}>回</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 月別来店数 */}
              {overallStats.months.length > 0 && (
                <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>▸ 月別来店数・給与推移</h3>
                  {(() => {
                    const monthData = {};
                    visits.forEach(v => {
                      const m = v.date.slice(0,7);
                      if (!monthData[m]) monthData[m] = { count: 0, back: 0 };
                      monthData[m].count++;
                      monthData[m].back += calcPrices(v.course, v.firstVisit).back;
                    });
                    const months = Object.entries(monthData).sort((a,b) => a[0].localeCompare(b[0]));
                    const maxCount = Math.max(...months.map(m => m[1].count));
                    const maxBack = Math.max(...months.map(m => m[1].back));
                    return months.map(([month, data]) => (
                      <div key={month} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>{month}</span>
                          <span style={{ fontSize: 12, color: "#6b7280" }}>
                            <span style={{ color: "#a78bfa", fontWeight: 700 }}>{data.count}件</span>　<span style={{ color: "#34d399", fontWeight: 700 }}>{fmt(data.back)}</span>
                          </span>
                        </div>
                        <div style={{ background: "#0f0f1a", borderRadius: 4, height: 6, width: "100%", overflow: "hidden", marginBottom: 3 }}>
                          <div style={{ width: `${(data.count / maxCount) * 100}%`, background: "#a78bfa", height: "100%", borderRadius: 4, transition: "width 0.5s" }} />
                        </div>
                        <div style={{ background: "#0f0f1a", borderRadius: 4, height: 6, width: "100%", overflow: "hidden" }}>
                          <div style={{ width: `${(data.back / maxBack) * 100}%`, background: "#34d399", height: "100%", borderRadius: 4, transition: "width 0.5s" }} />
                        </div>
                      </div>
                    ));
                  })()}
                  <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 11, color: "#6b7280" }}>
                    <span><span style={{ color: "#a78bfa" }}>■</span> 来店数</span>
                    <span><span style={{ color: "#34d399" }}>■</span> 給与</span>
                  </div>
                </div>
              )}

              {/* 曜日別来店数 */}
              <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>▸ 曜日別来店数</h3>
                {(() => {
                  const days = ["日","月","火","水","木","金","土"];
                  const dayCounts = [0,0,0,0,0,0,0];
                  visits.forEach(v => { dayCounts[new Date(v.date).getDay()]++; });
                  const maxD = Math.max(...dayCounts);
                  return (
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                      {days.map((d, i) => (
                        <div key={d} style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4, fontWeight: 700 }}>{dayCounts[i]}</div>
                          <div style={{ background: "#0f0f1a", borderRadius: 4, height: 60, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                            <div style={{ width: "100%", background: i === 0 || i === 6 ? "#ec4899" : "#a78bfa", height: maxD > 0 ? `${(dayCounts[i]/maxD)*100}%` : "0%", borderRadius: "3px 3px 0 0", transition: "height 0.4s" }} />
                          </div>
                          <div style={{ fontSize: 12, color: i === 0 || i === 6 ? "#ec4899" : "#9ca3af", marginTop: 4 }}>{d}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* リピート率 */}
              <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>▸ リピート率</h3>
                {(() => {
                  const total = customers.length;
                  const repeat2 = personalStats.filter(p => p.total >= 2).length;
                  const repeat3 = personalStats.filter(p => p.total >= 3).length;
                  const repeat5 = personalStats.filter(p => p.total >= 5).length;
                  const items = [
                    { label: "2回以上来店", count: repeat2, color: "#34d399" },
                    { label: "3回以上来店", count: repeat3, color: "#a78bfa" },
                    { label: "5回以上来店", count: repeat5, color: "#ec4899" },
                  ];
                  return items.map(item => (
                    <div key={item.label} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: item.color, fontWeight: 600 }}>{item.label}</span>
                        <span style={{ fontSize: 13, color: "#9ca3af" }}>{item.count}名　<span style={{ color: item.color, fontWeight: 700 }}>{Math.round(item.count/total*100)}%</span></span>
                      </div>
                      <div style={{ background: "#0f0f1a", borderRadius: 4, height: 8, overflow: "hidden" }}>
                        <div style={{ width: `${item.count/total*100}%`, background: item.color, height: "100%", borderRadius: 4, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* コース別利用比率 */}
              <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>▸ コース別利用比率</h3>
                {Object.entries(overallStats.courseCounts).sort((a, b) => b[1] - a[1]).map(([course, count]) => (
                  <div key={course} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, color: COURSE_COLORS[course], fontWeight: 700 }}>{course}</span>
                      <span style={{ fontSize: 13, color: "#9ca3af" }}>{count}件　<span style={{ color: COURSE_COLORS[course], fontWeight: 700 }}>{Math.round(count / overallStats.total * 100)}%</span></span>
                    </div>
                    <div style={{ background: "#0f0f1a", borderRadius: 6, height: 10, width: "100%", overflow: "hidden" }}>
                      <div style={{ width: `${(count / overallStats.total) * 100}%`, background: COURSE_COLORS[course], height: "100%", borderRadius: 6 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* 顧客別来店周期 */}
              <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>▸ 顧客別来店周期</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr style={{ borderBottom: "1px solid #2d2d44", color: "#6b7280", fontSize: 11, textAlign: "left" }}><th style={{ padding: "6px 8px" }}>顧客名</th><th style={{ padding: "6px 8px", textAlign: "center" }}>来店回数</th><th style={{ padding: "6px 8px", textAlign: "center" }}>平均周期</th><th style={{ padding: "6px 8px", textAlign: "center" }}>次回予測</th></tr></thead>
                  <tbody>
                    {[...personalStats].sort((a, b) => b.total - a.total).map(p => (
                      <tr key={p.name} style={{ borderBottom: "1px solid #0f0f1a" }}>
                        <td style={{ padding: "10px 8px", fontWeight: 600, color: p.overdue ? "#f87171" : "#e2e8f0" }}>{p.overdue ? "⚠ " : ""}{p.name}</td>
                        <td style={{ padding: "10px 8px", textAlign: "center", color: "#9ca3af" }}>{p.total}回</td>
                        <td style={{ padding: "10px 8px", textAlign: "center" }}><span style={{ color: p.cycle ? "#a78bfa" : "#4b5563", fontWeight: 700 }}>{p.cycle ? `${p.cycle}日` : "—"}</span></td>
                        <td style={{ padding: "10px 8px", textAlign: "center", fontSize: 12, color: p.overdue ? "#f87171" : "#34d399" }}>{p.nextVisit || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 期間分析タブ */}
          {tab === "period" && (
            <div>
              {/* 期間選択 */}
              <div style={{ background: "#16162a", borderRadius: 12, padding: 20, marginBottom: 20, border: "1px solid #2d2d44" }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>▸ 期間を選択</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 4 }}>開始日</label>
                    <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)}
                      style={{ width: "100%", background: "#0f0f1a", border: "1px solid #374151", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none", colorScheme: "dark" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 4 }}>終了日</label>
                    <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)}
                      style={{ width: "100%", background: "#0f0f1a", border: "1px solid #374151", borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none", colorScheme: "dark" }} />
                  </div>
                </div>
                {/* クイック選択 */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { label: "今月", fn: () => { const n = new Date(); setPeriodStart(`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-01`); setPeriodEnd(today()); }},
                    { label: "先月", fn: () => { const n = new Date(); n.setMonth(n.getMonth()-1); const y = n.getFullYear(); const m = n.getMonth()+1; const last = new Date(y, m, 0).getDate(); setPeriodStart(`${y}-${String(m).padStart(2,'0')}-01`); setPeriodEnd(`${y}-${String(m).padStart(2,'0')}-${last}`); }},
                    { label: "過去3ヶ月", fn: () => { const n = new Date(); const s = new Date(n); s.setMonth(s.getMonth()-3); setPeriodStart(s.toISOString().slice(0,10)); setPeriodEnd(today()); }},
                    { label: "過去1年", fn: () => { const n = new Date(); const s = new Date(n); s.setFullYear(s.getFullYear()-1); setPeriodStart(s.toISOString().slice(0,10)); setPeriodEnd(today()); }},
                  ].map(q => (
                    <button key={q.label} onClick={q.fn}
                      style={{ background: "#0f0f1a", border: "1px solid #374151", borderRadius: 8, padding: "6px 12px", color: "#9ca3af", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {periodStart && periodEnd && (() => {
                const inPeriod = visits.filter(v => v.date >= periodStart && v.date <= periodEnd);
                const total = inPeriod.length;

                // 前期間計算
                const periodDays = daysBetween(periodStart, periodEnd) + 1;
                const prevEnd = new Date(periodStart);
                prevEnd.setDate(prevEnd.getDate() - 1);
                const prevStart = new Date(prevEnd);
                prevStart.setDate(prevStart.getDate() - periodDays + 1);
                const prevStartStr = prevStart.toISOString().slice(0,10);
                const prevEndStr = prevEnd.toISOString().slice(0,10);
                const inPrevPeriod = visits.filter(v => v.date >= prevStartStr && v.date <= prevEndStr);
                const prevTotal = inPrevPeriod.length;
                const prevClient = inPrevPeriod.reduce((s,v) => s + calcPrices(v.course, v.firstVisit).client, 0);
                const prevBack = inPrevPeriod.reduce((s,v) => s + calcPrices(v.course, v.firstVisit).back, 0);

                if (total === 0) return (
                  <div style={{ textAlign: "center", color: "#4b5563", padding: 40, fontSize: 14 }}>この期間の来店データがありません</div>
                );

                // 新規・既存判定（顧客単位：期間内に初来店した顧客）
                const uniqueNames = [...new Set(inPeriod.map(v => v.name))];
                const newCustomers = uniqueNames.filter(name => {
                  const allVisitsForName = visits.filter(v => v.name === name).sort((a, b) => new Date(a.date) - new Date(b.date));
                  return allVisitsForName[0].date >= periodStart;
                });
                const existingCustomers = uniqueNames.filter(n => !newCustomers.includes(n));
                // 来店単位の新規/既存（その来店日より前に来店歴があるか）
                const newVisits = inPeriod.filter(v => !visits.some(prev => prev.name === v.name && prev.date < v.date));
                const existVisits = inPeriod.filter(v => visits.some(prev => prev.name === v.name && prev.date < v.date));

                // 金額集計
                const totalClient = inPeriod.reduce((sum, v) => sum + calcPrices(v.course, v.firstVisit).client, 0);
                const totalBack = inPeriod.reduce((sum, v) => sum + calcPrices(v.course, v.firstVisit).back, 0);

                // 枠数集計
                const totalFrames = inPeriod.reduce((sum, v) => sum + (COURSE_PRICES[v.course]?.frames || 0), 0);

                // 本指名ポイント（初指名除く・その来店日より前に来店歴がある顧客のみ）
                const totalPts = inPeriod
                  .filter(v => {
                    if (v.firstVisit) return false;
                    return visits.some(prev => prev.name === v.name && prev.date < v.date);
                  })
                  .reduce((sum, v) => sum + (COURSE_PRICES[v.course]?.pts || 0), 0);

                // 複数回来店した人
                const visitCountByName = {};
                inPeriod.forEach(v => { visitCountByName[v.name] = (visitCountByName[v.name] || 0) + 1; });
                const repeatVisitors = Object.entries(visitCountByName)
                  .filter(([, count]) => count >= 2)
                  .sort((a, b) => b[1] - a[1]);

                // コース別
                const courseCounts = {};
                inPeriod.forEach(v => { courseCounts[v.course] = (courseCounts[v.course] || 0) + 1; });

                return (
                  <div>
                    {/* サマリー */}
                    {/* 来店数はサブ表示 */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "#4b5563" }}>来店数（延べ）: <span style={{ color: "#6b7280", fontWeight: 700 }}>{total}件</span></span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                      {(() => {
                        const honshimeiFrames = inPeriod
                          .filter(v => {
                            if (v.firstVisit) return false;
                            return visits.some(prev => prev.name === v.name && prev.date < v.date);
                          })
                          .reduce((sum, v) => sum + (COURSE_PRICES[v.course]?.frames || 0), 0);
                        return [
                          { label: "来店客数", value: uniqueNames.length + "名", icon: "👥", color: "#ec4899", sub: [
                              { label: "新規", value: newCustomers.length + "名", color: "#34d399" },
                              { label: "本指名", value: (uniqueNames.length - newCustomers.length) + "名", color: "#a78bfa" },
                            ]},
                          { label: "総枠数", value: totalFrames + "枠", icon: "🎯", color: "#f59e0b", sub: [
                              { label: "新規", value: (totalFrames - honshimeiFrames) + "枠", color: "#34d399" },
                              { label: "本指名", value: honshimeiFrames + "枠", color: "#a78bfa" },
                            ]},
                          { label: "本指名PT", value: totalPts + "pt", icon: "🌟", color: "#8b5cf6" },
                        ].map(c => (
                          <div key={c.label} style={{ background: "#16162a", borderRadius: 12, padding: "16px 14px", border: "1px solid #2d2d44", textAlign: "center" }}>
                            <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{c.value}</div>
                            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{c.label}</div>
                            {c.sub && (
                              <div style={{ marginTop: 8, borderTop: "1px solid #2d2d44", paddingTop: 8 }}>
                                {c.sub.map(s => (
                                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                                    <span style={{ fontSize: 11, color: "#6b7280" }}>{s.label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>

                    {/* 売上・給与（トグル） */}
                    <div style={{ marginBottom: 20 }}>
                      <button onClick={() => setShowPeriodSalary(v => !v)}
                        style={{ width: "100%", background: "#16162a", border: "1px solid #2d2d44", borderRadius: 12, padding: "12px 16px", color: "#9ca3af", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>💰 客払い・給与合計</span>
                        <span style={{ fontSize: 11, color: "#6b7280" }}>{showPeriodSalary ? "▲ 隠す" : "▼ 表示"}</span>
                      </button>
                      {showPeriodSalary && (
                        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                          <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", flex: 1, textAlign: "center" }}>
                            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>💰 期間客払い合計</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "#34d399" }}>{fmt(totalClient)}</div>
                          </div>
                          <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", flex: 1, textAlign: "center" }}>
                            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>💜 期間給与合計</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "#a78bfa" }}>{fmt(totalBack)}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 新規客リピート率（3ヶ月以内） */}
                    {newCustomers.length > 0 && (() => {
                      const repeatWithin90 = newCustomers.filter(name => {
                        const allForName = visits.filter(v => v.name === name).sort((a,b) => new Date(a.date)-new Date(b.date));
                        if (allForName.length < 2) return false;
                        const firstInPeriod = allForName.find(v => v.date >= periodStart && v.date <= periodEnd);
                        if (!firstInPeriod) return false;
                        const nextVisit = allForName.find(v => v.date > firstInPeriod.date);
                        if (!nextVisit) return false;
                        return daysBetween(firstInPeriod.date, nextVisit.date) <= 90;
                      });
                      const rate = Math.round(repeatWithin90.length / newCustomers.length * 100);
                      const notRepeat = newCustomers.filter(n => !repeatWithin90.includes(n));
                      return (
                        <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                          <h3 style={{ margin: "0 0 4px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>🔄 新規客 3ヶ月以内リピート率</h3>
                          <p style={{ margin: "0 0 14px", fontSize: 11, color: "#4b5563" }}>期間内の新規客が90日以内に再来店した割合</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                            <div style={{ fontSize: 42, fontWeight: 900, color: rate >= 60 ? "#34d399" : rate >= 30 ? "#f59e0b" : "#f87171" }}>{rate}%</div>
                            <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.8 }}>
                              <div style={{ color: "#34d399" }}>{repeatWithin90.length}名がリピート済み</div>
                              <div style={{ color: "#f87171" }}>{notRepeat.length}名が未リピート</div>
                            </div>
                          </div>
                          <div style={{ background: "#0f0f1a", borderRadius: 6, height: 10, overflow: "hidden", marginBottom: 10 }}>
                            <div style={{ width: `${rate}%`, background: rate >= 60 ? "#34d399" : rate >= 30 ? "#f59e0b" : "#f87171", height: "100%", borderRadius: 6, transition: "width 0.6s" }} />
                          </div>
                          {repeatWithin90.length > 0 && <div style={{ fontSize: 11, color: "#34d399", marginBottom: 4 }}>リピート: {repeatWithin90.join("、")}</div>}
                          {notRepeat.length > 0 && <div style={{ fontSize: 11, color: "#f87171" }}>未リピート: {notRepeat.join("、")}</div>}
                        </div>
                      );
                    })()}

                    {/* 新規・既存比率 */}
                    <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                      <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>▸ 新規 vs 既存</h3>
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>👥 人数ベース</div>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: "#34d399", fontWeight: 600 }}>✨ 新規客</span>
                          <span style={{ fontSize: 13, color: "#9ca3af" }}>{newCustomers.length}名　<span style={{ color: "#34d399", fontWeight: 700 }}>{Math.round(newCustomers.length / uniqueNames.length * 100)}%</span></span>
                        </div>
                        <div style={{ background: "#0f0f1a", borderRadius: 4, height: 8, overflow: "hidden" }}>
                          <div style={{ width: `${newCustomers.length / uniqueNames.length * 100}%`, background: "#34d399", height: "100%", borderRadius: 4, transition: "width 0.5s" }} />
                        </div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: "#a78bfa", fontWeight: 600 }}>👤 既存客</span>
                          <span style={{ fontSize: 13, color: "#9ca3af" }}>{existingCustomers.length}名　<span style={{ color: "#a78bfa", fontWeight: 700 }}>{Math.round(existingCustomers.length / uniqueNames.length * 100)}%</span></span>
                        </div>
                        <div style={{ background: "#0f0f1a", borderRadius: 4, height: 8, overflow: "hidden" }}>
                          <div style={{ width: `${existingCustomers.length / uniqueNames.length * 100}%`, background: "#a78bfa", height: "100%", borderRadius: 4, transition: "width 0.5s" }} />
                        </div>
                      </div>
                      {(() => {
                        const newFrames = newVisits.reduce((sum, v) => sum + (COURSE_PRICES[v.course]?.frames || 0), 0);
                        const existFrames = existVisits.reduce((sum, v) => sum + (COURSE_PRICES[v.course]?.frames || 0), 0);
                        const totalF = newFrames + existFrames;
                        return (
                          <>
                            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>🎯 枠数ベース（計{totalF}枠）</div>
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 13, color: "#34d399", fontWeight: 600 }}>✨ 新規</span>
                                <span style={{ fontSize: 13, color: "#9ca3af" }}>{newFrames}枠　<span style={{ color: "#34d399", fontWeight: 700 }}>{totalF ? Math.round(newFrames / totalF * 100) : 0}%</span></span>
                              </div>
                              <div style={{ background: "#0f0f1a", borderRadius: 4, height: 8, overflow: "hidden" }}>
                                <div style={{ width: `${totalF ? newFrames / totalF * 100 : 0}%`, background: "#34d399", height: "100%", borderRadius: 4, transition: "width 0.5s" }} />
                              </div>
                            </div>
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 13, color: "#a78bfa", fontWeight: 600 }}>👤 既存</span>
                                <span style={{ fontSize: 13, color: "#9ca3af" }}>{existFrames}枠　<span style={{ color: "#a78bfa", fontWeight: 700 }}>{totalF ? Math.round(existFrames / totalF * 100) : 0}%</span></span>
                              </div>
                              <div style={{ background: "#0f0f1a", borderRadius: 4, height: 8, overflow: "hidden" }}>
                                <div style={{ width: `${totalF ? existFrames / totalF * 100 : 0}%`, background: "#a78bfa", height: "100%", borderRadius: 4, transition: "width 0.5s" }} />
                              </div>
                            </div>
                          </>
                        );
                      })()}
                      {newCustomers.length > 0 && (
                        <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>新規: {newCustomers.join("、")}</div>
                      )}
                    </div>

                    {/* 前期間比較 */}
                    {prevTotal > 0 && (
                      <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                        <h3 style={{ margin: "0 0 4px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>▸ 前期間比較</h3>
                        <div style={{ fontSize: 11, color: "#4b5563", marginBottom: 12 }}>{prevStartStr} 〜 {prevEndStr}</div>
                        {[
                          { label: "来店数", curr: total, prev: prevTotal, unit: "件", color: "#6366f1" },
                          { label: "客払い合計", curr: totalClient, prev: prevClient, unit: "", color: "#34d399", money: true },
                          { label: "給与合計", curr: totalBack, prev: prevBack, unit: "", color: "#a78bfa", money: true },
                        ].map(item => {
                          const diff = item.curr - item.prev;
                          const pct = Math.round((diff / item.prev) * 100);
                          return (
                            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #0f0f1a" }}>
                              <span style={{ fontSize: 13, color: "#9ca3af" }}>{item.label}</span>
                              <div style={{ textAlign: "right" }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.money ? fmt(item.curr) : item.curr + item.unit}</span>
                                <span style={{ fontSize: 11, color: diff >= 0 ? "#34d399" : "#f87171", marginLeft: 8 }}>
                                  {diff >= 0 ? "▲" : "▼"}{item.money ? fmt(Math.abs(diff)) : Math.abs(diff) + item.unit}（{diff >= 0 ? "+" : ""}{pct}%）
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 日別内訳 */}
                    {(() => {
                      const byDate = {};
                      inPeriod.forEach(v => {
                        if (!byDate[v.date]) byDate[v.date] = [];
                        byDate[v.date].push(v);
                      });
                      const days = Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0]));
                      return (
                        <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                          <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>▸ 日別内訳</h3>
                          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr", gap: "6px 10px", alignItems: "center" }}>
                            <div style={{ fontSize: 10, color: "#4b5563" }}>日付</div>
                            <div style={{ fontSize: 10, color: "#4b5563", textAlign: "center" }}>人数</div>
                            <div style={{ fontSize: 10, color: "#4b5563", textAlign: "center" }}>枠数</div>
                            <div style={{ fontSize: 10, color: "#4b5563", textAlign: "center" }}>本指名PT</div>
                            {days.map(([date, dayVisits]) => {
                              const people = [...new Set(dayVisits.map(v => v.name))].length;
                              const frames = dayVisits.reduce((s, v) => s + (COURSE_PRICES[v.course]?.frames || 0), 0);
                              const pts = dayVisits
                                .filter(v => {
                                  if (v.firstVisit) return false;
                                  // その日より前に来店歴があるか
                                  return visits.some(prev => prev.name === v.name && prev.date < date);
                                })
                                .reduce((s, v) => s + (COURSE_PRICES[v.course]?.pts || 0), 0);
                              return (
                                <React.Fragment key={date}>
                                  <div style={{ fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>{date}</div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: "#ec4899", textAlign: "center" }}>{people}名</div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", textAlign: "center" }}>{frames}枠</div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", textAlign: "center" }}>{pts}pt</div>
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 来店回数別集計 */}
                    <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                      <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>▸ 来店回数別（リピート分析）</h3>
                      {(() => {
                        const buckets = { 1: [], 2: [], 3: [], 4: [], "5+": [] };
                        uniqueNames.forEach(name => {
                          const allForName = visits.filter(v => v.name === name).sort((a,b) => new Date(a.date)-new Date(b.date));
                          inPeriod.filter(v => v.name === name).forEach(v => {
                            const nthVisit = allForName.findIndex(av => av.id === v.id) + 1;
                            const key = nthVisit <= 4 ? nthVisit : "5+";
                            buckets[key].push({ name, nthVisit, course: v.course });
                          });
                        });
                        const labels = { 1: "初来店（1回目）", 2: "2回目", 3: "3回目", 4: "4回目", "5+": "5回目以上" };
                        const colors = { 1: "#34d399", 2: "#f59e0b", 3: "#a78bfa", 4: "#ec4899", "5+": "#6366f1" };
                        return Object.entries(labels).map(([key, label]) => {
                          const items = buckets[key] || [];
                          if (items.length === 0) return null;
                          const uniquePeople = [...new Set(items.map(i => i.name))];
                          return (
                            <div key={key} style={{ marginBottom: 10, padding: "10px 12px", background: "#0f0f1a", borderRadius: 8, borderLeft: `3px solid ${colors[key]}` }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 13, color: colors[key], fontWeight: 700 }}>{label}</span>
                                <span style={{ fontSize: 12, color: "#9ca3af" }}>{uniquePeople.length}名 / {items.length}件</span>
                              </div>
                              <div style={{ fontSize: 12, color: "#6b7280" }}>{uniquePeople.join("、")}</div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* 顧客別売上ランキング */}
                    <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                      <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>▸ 顧客別売上ランキング</h3>
                      {(() => {
                        const ranked = uniqueNames.map(name => {
                          const theirVisits = inPeriod.filter(v => v.name === name);
                          const client = theirVisits.reduce((s,v) => s + calcPrices(v.course, v.firstVisit).client, 0);
                          const back = theirVisits.reduce((s,v) => s + calcPrices(v.course, v.firstVisit).back, 0);
                          const firstVisitDate = theirVisits.sort((a,b) => new Date(a.date)-new Date(b.date))[0]?.date || "";
                          return { name, client, back, count: theirVisits.length, firstVisitDate };
                        }).sort((a,b) => b.client - a.client || a.firstVisitDate.localeCompare(b.firstVisitDate));

                        // 同順位の計算
                        let rank = 1;
                        return ranked.map((r, i) => {
                          if (i > 0 && ranked[i].client < ranked[i-1].client) rank = i + 1;
                          const badgeBg = rank === 1 ? "#f59e0b" : rank === 2 ? "#9ca3af" : rank === 3 ? "#cd7c2f" : "#2d2d44";
                          const badgeColor = rank <= 3 ? "#000" : "#6b7280";
                          return (
                            <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #0f0f1a" }}>
                              <div style={{ width: 24, height: 24, borderRadius: "50%", background: badgeBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: badgeColor, flexShrink: 0 }}>
                                {rank}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</div>
                                <div style={{ fontSize: 11, color: "#6b7280" }}>{r.count}回</div>
                              </div>
                              <div style={{ textAlign: "right", fontSize: 11 }}>
                                <div style={{ color: "#34d399" }}>{fmt(r.client)}</div>
                                <div style={{ color: "#a78bfa" }}>{fmt(r.back)}</div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {repeatVisitors.length > 0 && (
                      <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                        <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>▸ 期間内複数来店</h3>
                        {repeatVisitors.map(([name, count]) => {
                          const theirVisits = inPeriod.filter(v => v.name === name);
                          const coursesSummary = {};
                          theirVisits.forEach(v => { coursesSummary[v.course] = (coursesSummary[v.course] || 0) + 1; });
                          return (
                            <div key={name} style={{ padding: "10px 0", borderBottom: "1px solid #0f0f1a" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                <span style={{ fontWeight: 700, fontSize: 14 }}>{name}</span>
                                <span style={{ fontSize: 13, color: "#ec4899", fontWeight: 700 }}>{count}回</span>
                              </div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {Object.entries(coursesSummary).map(([course, n]) => (
                                  <span key={course} style={{ background: COURSE_COLORS[course] + "33", color: COURSE_COLORS[course], borderRadius: 5, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>
                                    {course}×{n}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* コース別利用比率 */}
                    <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44" }}>
                      <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>▸ コース別利用比率</h3>
                      {Object.entries(courseCounts).sort((a, b) => b[1] - a[1]).map(([course, count]) => (
                        <div key={course} style={{ marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 14, color: COURSE_COLORS[course], fontWeight: 700 }}>{course}</span>
                            <span style={{ fontSize: 13, color: "#9ca3af" }}>{count}件　<span style={{ color: COURSE_COLORS[course], fontWeight: 700 }}>{Math.round(count / total * 100)}%</span></span>
                          </div>
                          <div style={{ background: "#0f0f1a", borderRadius: 6, height: 10, overflow: "hidden" }}>
                            <div style={{ width: `${count / total * 100}%`, background: COURSE_COLORS[course], height: "100%", borderRadius: 6, transition: "width 0.5s" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 月別比較タブ */}
          {tab === "monthly" && (() => {
            // 全月のデータを集計
            const monthMap = {};
            visits.forEach(v => {
              const m = v.date.slice(0, 7);
              if (!monthMap[m]) monthMap[m] = [];
              monthMap[m].push(v);
            });
            const allMonths = Object.keys(monthMap).sort();
            if (allMonths.length === 0) return (
              <div style={{ textAlign: "center", color: "#4b5563", padding: 40, fontSize: 14 }}>来店データがありません</div>
            );

            const monthStats = allMonths.map(m => {
              const mv = monthMap[m];
              const uniqueNames = [...new Set(mv.map(v => v.name))];
              const newC = uniqueNames.filter(name => {
                const allForName = visits.filter(v => v.name === name).sort((a,b) => new Date(a.date)-new Date(b.date));
                return allForName[0].date.slice(0,7) === m;
              });
              // 来店単位の新規/既存枠数
              const mvNewVisits = mv.filter(v => !visits.some(prev => prev.name === v.name && prev.date < v.date));
              const mvExistVisits = mv.filter(v => visits.some(prev => prev.name === v.name && prev.date < v.date));
              const frames = mv.reduce((s,v) => s + (COURSE_PRICES[v.course]?.frames || 0), 0);
              const pts = mv.filter(v => {
                if (v.firstVisit) return false;
                return visits.some(prev => prev.name === v.name && prev.date < v.date);
              }).reduce((s,v) => s + (COURSE_PRICES[v.course]?.pts || 0), 0);
              const client = mv.reduce((s,v) => s + calcPrices(v.course, v.firstVisit).client, 0);
              const back = mv.reduce((s,v) => s + calcPrices(v.course, v.firstVisit).back, 0);
              // 来店回数別（その月にN回目来店した人数）
              const nthCounts = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), "5+": new Set() };
              mv.forEach(v => {
                const allForName = visits.filter(vv => vv.name === v.name).sort((a,b) => new Date(a.date)-new Date(b.date));
                const nth = allForName.findIndex(av => av.id === v.id) + 1;
                const key = nth <= 4 ? nth : "5+";
                nthCounts[key].add(v.name);
              });
              return { m, count: mv.length, people: uniqueNames.length, newCount: newC.length, frames, pts, client, back,
                nth1: nthCounts[1].size, nth2: nthCounts[2].size, nth3: nthCounts[3].size, nth4: nthCounts[4].size, nth5p: nthCounts["5+"].size };
            }).reverse(); // 新しい月が上

            const maxCount = Math.max(...monthStats.map(s => s.count));

            return (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>📆 月別 接客データ比較</h3>
                  <button onClick={() => setHideSalary(v => !v)}
                    style={{ background: "#16162a", border: "1px solid #374151", borderRadius: 8, padding: "5px 10px", color: "#9ca3af", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                    {hideSalary ? "👁 給与を表示" : "🙈 給与を隠す"}
                  </button>
                </div>
                {monthStats.map((s, i) => {
                  const prev = monthStats[i + 1];
                  const diffCount = prev ? s.count - prev.count : null;
                  const diffFrames = prev ? s.frames - prev.frames : null;
                  const diffBack = prev ? s.back - prev.back : null;

                  return (
                    <div key={s.m} style={{ background: "#16162a", borderRadius: 12, padding: 18, marginBottom: 12, border: "1px solid #2d2d44" }}>
                      {/* 月ヘッダー */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>{s.m.replace("-", "年")}月</div>
                        {diffCount !== null && (
                          <div style={{ fontSize: 11, color: diffCount >= 0 ? "#34d399" : "#f87171" }}>
                            前月比 {diffCount >= 0 ? "▲" : "▼"}{Math.abs(diffCount)}件
                          </div>
                        )}
                      </div>

                      {/* 来店数バー */}
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                          <span style={{ fontSize: 10, color: "#4b5563" }}>来店数（延べ）: <span style={{ color: "#6b7280", fontWeight: 700 }}>{s.count}件</span></span>
                        </div>
                        <div style={{ background: "#0f0f1a", borderRadius: 4, height: 10, overflow: "hidden" }}>
                          <div style={{ width: `${(s.count / maxCount) * 100}%`, background: "linear-gradient(90deg,#a78bfa,#ec4899)", height: "100%", borderRadius: 4, transition: "width 0.5s" }} />
                        </div>
                      </div>

                      {/* 数値グリッド */}
                      {(() => {
                        const mvNewFrames = monthMap[s.m].filter(v => !visits.some(prev => prev.name === v.name && prev.date < v.date)).reduce((sum,v) => sum + (COURSE_PRICES[v.course]?.frames||0), 0);
                        const mvExistFrames = s.frames - mvNewFrames;
                        const cards = [
                          { label: "来店客数", value: s.people + "名", color: "#ec4899", sub: [
                            { label: "新規", value: s.newCount + "名", color: "#34d399" },
                            { label: "本指名", value: (s.people - s.newCount) + "名", color: "#a78bfa" },
                          ]},
                          { label: "総枠数", value: s.frames + "枠", color: "#f59e0b", sub: [
                            { label: "新規", value: mvNewFrames + "枠", color: "#34d399" },
                            { label: "本指名", value: mvExistFrames + "枠", color: "#a78bfa" },
                          ]},
                          { label: "本指名PT", value: s.pts + "pt", color: "#a78bfa" },
                          { label: "給与", value: hideSalary ? "¥●●●,●●●" : fmt(s.back), color: "#34d399",
                            sub: diffBack !== null ? [{ label: diffBack >= 0 ? "▲前月比" : "▼前月比", value: hideSalary ? "●●●" : fmt(Math.abs(diffBack)), color: diffBack >= 0 ? "#34d399" : "#f87171" }] : null },
                        ];
                        return (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                            {cards.map(c => (
                              <div key={c.label} style={{ background: "#0f0f1a", borderRadius: 8, padding: "10px 12px" }}>
                                <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>{c.label}</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: c.color, marginBottom: c.sub ? 6 : 0 }}>{c.value}</div>
                                {c.sub && (
                                  <div style={{ borderTop: "1px solid #2d2d44", paddingTop: 6 }}>
                                    {c.sub.map(s => (
                                      <div key={s.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                                        <span style={{ fontSize: 10, color: "#6b7280" }}>{s.label}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                      {/* 来店回数別テーブル */}
                      <div style={{ background: "#0f0f1a", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 8 }}>来店回数別 人数</div>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid #2d2d44" }}>
                              <th style={{ padding: "4px 6px", textAlign: "left", fontSize: 10, color: "#4b5563", fontWeight: 600 }}>区分</th>
                              <th style={{ padding: "4px 6px", textAlign: "center", fontSize: 10, color: "#4b5563", fontWeight: 600 }}>人数</th>
                              {prev && <th style={{ padding: "4px 6px", textAlign: "center", fontSize: 10, color: "#4b5563", fontWeight: 600 }}>前月</th>}
                              {prev && <th style={{ padding: "4px 6px", textAlign: "center", fontSize: 10, color: "#4b5563", fontWeight: 600 }}>増減</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { label: "初来店", curr: s.nth1, prevVal: prev?.nth1, color: "#34d399" },
                              { label: "2回目", curr: s.nth2, prevVal: prev?.nth2, color: "#f59e0b" },
                              { label: "3回目", curr: s.nth3, prevVal: prev?.nth3, color: "#a78bfa" },
                              { label: "4回目", curr: s.nth4, prevVal: prev?.nth4, color: "#ec4899" },
                              { label: "5回目以上", curr: s.nth5p, prevVal: prev?.nth5p, color: "#6366f1" },
                            ].map(row => {
                              const diff = row.prevVal !== undefined ? row.curr - row.prevVal : null;
                              return (
                                <tr key={row.label} style={{ borderBottom: "1px solid #16162a" }}>
                                  <td style={{ padding: "6px 6px", color: row.color, fontWeight: 600, fontSize: 12 }}>{row.label}</td>
                                  <td style={{ padding: "6px 6px", textAlign: "center", fontWeight: 800, color: row.color, fontSize: 14 }}>{row.curr}名</td>
                                  {prev && <td style={{ padding: "6px 6px", textAlign: "center", color: "#6b7280", fontSize: 12 }}>{row.prevVal}名</td>}
                                  {prev && <td style={{ padding: "6px 6px", textAlign: "center", fontSize: 12, fontWeight: 700, color: diff === 0 ? "#6b7280" : diff > 0 ? "#34d399" : "#f87171" }}>
                                    {diff === 0 ? "−" : diff > 0 ? `+${diff}` : diff}
                                  </td>}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* 新規vs既存 比率 */}
                      {s.people > 0 && (() => {
                        const existCount = s.people - s.newCount;
                        const newPct = Math.round(s.newCount / s.people * 100);
                        const existPct = 100 - newPct;
                        const mv = monthMap[s.m];
                        const newFrames = mv.filter(v => !visits.some(prev => prev.name === v.name && prev.date < v.date))
                          .reduce((sum,v) => sum + (COURSE_PRICES[v.course]?.frames || 0), 0);
                        const existFrames = s.frames - newFrames;
                        const newFPct = s.frames > 0 ? Math.round(newFrames / s.frames * 100) : 0;
                        const existFPct = 100 - newFPct;
                        return (
                          <div style={{ background: "#0f0f1a", borderRadius: 8, padding: "10px 12px" }}>
                            <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 8 }}>新規 vs 既存</div>
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 10, color: "#6b7280" }}>
                                <span>👥 人数</span>
                                <span style={{ color: "#34d399" }}>新規{s.newCount}名 {newPct}%</span>
                                <span style={{ color: "#a78bfa" }}>既存{existCount}名 {existPct}%</span>
                              </div>
                              <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", height: 8 }}>
                                <div style={{ width: `${newPct}%`, background: "#34d399", transition: "width 0.5s" }} />
                                <div style={{ width: `${existPct}%`, background: "#a78bfa", transition: "width 0.5s" }} />
                              </div>
                            </div>
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 10, color: "#6b7280" }}>
                                <span>🎯 枠数</span>
                                <span style={{ color: "#34d399" }}>新規{newFrames}枠 {newFPct}%</span>
                                <span style={{ color: "#a78bfa" }}>既存{existFrames}枠 {existFPct}%</span>
                              </div>
                              <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", height: 8 }}>
                                <div style={{ width: `${newFPct}%`, background: "#34d399", transition: "width 0.5s" }} />
                                <div style={{ width: `${existFPct}%`, background: "#a78bfa", transition: "width 0.5s" }} />
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* 今月来なかった常連（折りたたみ） */}
                      {(() => {
                        if (i >= monthStats.length - 1) return null; // 最古月は前月なし
                        const prevS = monthStats[i + 1];
                        const prevM = prevS.m;
                        const targetVisitors = new Set((monthMap[s.m] || []).map(v => v.name));
                        const prevVisitors = [...new Set((monthMap[prevM] || []).map(v => v.name))];
                        const today_ = today();
                        const absentList = prevVisitors
                          .filter(name => !targetVisitors.has(name))
                          .map(name => {
                            const allForName = visits.filter(v => v.name === name).sort((a,b) => new Date(a.date)-new Date(b.date));
                            const total = allForName.length;
                            const cycle = avgCycleDays(allForName);
                            const lastVisit = allForName[allForName.length - 1].date;
                            const daysSince = daysBetween(lastVisit, today_);
                            const ratio = cycle ? Math.round(daysSince / cycle * 10) / 10 : null;
                            const prevVisitsForName = (monthMap[prevM] || []).filter(v => v.name === name);
                            const prevFrames = prevVisitsForName.reduce((s,v) => s + (COURSE_PRICES[v.course]?.frames||0), 0);
                            const prevPts = prevVisitsForName.filter(v => !v.firstVisit && visits.some(prev => prev.name === v.name && prev.date < v.date))
                              .reduce((s,v) => s + (COURSE_PRICES[v.course]?.pts||0), 0);
                            const allMonthKeys = Object.keys(monthMap).sort();
                            const prevIdx = allMonthKeys.indexOf(prevM);
                            const consecutive3 = prevIdx >= 2 && allMonthKeys.slice(prevIdx-2, prevIdx+1).every(m => (monthMap[m]||[]).some(v => v.name === name));
                            let status = null, statusColor = "#6b7280";
                            if (ratio !== null) {
                              if (ratio >= 2) { status = "危険"; statusColor = "#f87171"; }
                              else if (ratio >= 1.5) { status = "注意"; statusColor = "#f59e0b"; }
                            }
                            return { name, total, cycle, lastVisit, daysSince, ratio, prevFrames, prevPts, consecutive3, status, statusColor, lowData: total < 3 };
                          })
                          .sort((a,b) => b.prevPts - a.prevPts || b.prevFrames - a.prevFrames || (b.ratio||0) - (a.ratio||0));

                        if (absentList.length === 0) return null;
                        const isOpen = expandedAbsent[s.m];
                        const consec = absentList.filter(p => p.consecutive3);
                        const danger = absentList.filter(p => p.status === "危険" && !p.consecutive3);
                        const others = absentList.filter(p => p.status !== "危険" && !p.consecutive3);

                        const renderRow = (p) => (
                          <div key={p.name} style={{ padding: "10px 0", borderBottom: "1px solid #0f0f1a" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                              <div>
                                <span style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</span>
                                <span style={{ fontSize: 10, color: "#6b7280", marginLeft: 6 }}>累計{p.total}回</span>
                                {p.consecutive3 && <span style={{ fontSize: 9, background: "#7f1d1d", color: "#f87171", borderRadius: 4, padding: "1px 5px", marginLeft: 4 }}>3ヶ月連続→途切れ</span>}
                              </div>
                              {p.status && <span style={{ fontSize: 10, fontWeight: 700, color: p.statusColor, background: p.statusColor + "22", borderRadius: 5, padding: "1px 7px" }}>{p.status}{p.lowData ? "参考" : ""}</span>}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
                              <div style={{ background: "#16162a", borderRadius: 5, padding: "5px 7px" }}>
                                <div style={{ fontSize: 9, color: "#4b5563" }}>最終来店</div>
                                <div style={{ fontSize: 10, color: "#9ca3af" }}>{p.lastVisit}</div>
                                <div style={{ fontSize: 10, color: p.status === "危険" ? "#f87171" : "#6b7280" }}>{p.daysSince}日前</div>
                              </div>
                              <div style={{ background: "#16162a", borderRadius: 5, padding: "5px 7px" }}>
                                <div style={{ fontSize: 9, color: "#4b5563" }}>周期/乖離</div>
                                <div style={{ fontSize: 10, color: "#a78bfa" }}>{p.cycle ? p.cycle + "日" : "—"}</div>
                                {p.ratio && <div style={{ fontSize: 10, color: p.statusColor, fontWeight: 700 }}>{p.ratio}倍</div>}
                              </div>
                              <div style={{ background: "#16162a", borderRadius: 5, padding: "5px 7px" }}>
                                <div style={{ fontSize: 9, color: "#4b5563" }}>前月実績</div>
                                <div style={{ fontSize: 10, color: "#f59e0b" }}>{p.prevFrames}枠</div>
                                <div style={{ fontSize: 10, color: "#a78bfa" }}>{p.prevPts}pt</div>
                              </div>
                            </div>
                          </div>
                        );

                        return (
                          <div style={{ marginTop: 10, borderTop: "1px solid #2d2d44", paddingTop: 10 }}>
                            <button onClick={() => setExpandedAbsent(prev => ({ ...prev, [s.m]: !prev[s.m] }))}
                              style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0, fontFamily: "inherit" }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: consec.length > 0 ? "#f87171" : "#9ca3af" }}>
                                👀 前月来店→今月未来店 {absentList.length}名
                                {consec.length > 0 && <span style={{ fontSize: 10, marginLeft: 6, color: "#f87171" }}>（うち習慣途切れ{consec.length}名）</span>}
                              </span>
                              <span style={{ fontSize: 11, color: "#6b7280" }}>{isOpen ? "▲" : "▼"}</span>
                            </button>
                            {isOpen && (
                              <div style={{ marginTop: 10 }}>
                                {consec.length > 0 && (
                                  <>
                                    <div style={{ fontSize: 11, color: "#f87171", fontWeight: 700, marginBottom: 6, padding: "4px 8px", background: "#7f1d1d33", borderRadius: 5 }}>
                                      ⚠️ 3ヶ月連続→途切れ（{consec.length}名）
                                    </div>
                                    {consec.map(renderRow)}
                                  </>
                                )}
                                {danger.length > 0 && (
                                  <>
                                    <div style={{ fontSize: 11, color: "#f87171", fontWeight: 700, marginBottom: 6, marginTop: consec.length > 0 ? 12 : 0, padding: "4px 8px", background: "#7f1d1d22", borderRadius: 5 }}>
                                      🔴 危険（{danger.length}名）
                                    </div>
                                    {danger.map(renderRow)}
                                  </>
                                )}
                                {others.length > 0 && (
                                  <>
                                    <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, marginBottom: 6, marginTop: (consec.length + danger.length) > 0 ? 12 : 0, padding: "4px 8px", background: "#2d2d44", borderRadius: 5 }}>
                                      その他（{others.length}名）
                                    </div>
                                    {others.map(renderRow)}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* グラフタブ */}
          {tab === "graphs" && (() => {
            // 月別データ集計
            const monthMap = {};
            visits.forEach(v => {
              const m = v.date.slice(0,7);
              if (!monthMap[m]) monthMap[m] = [];
              monthMap[m].push(v);
            });
            const allMonths = Object.keys(monthMap).sort();

            const monthStats = allMonths.map(m => {
              const mv = monthMap[m];
              const uniqueN = [...new Set(mv.map(v => v.name))];
              const newC = uniqueN.filter(name => {
                const allForName = visits.filter(v => v.name === name).sort((a,b) => new Date(a.date)-new Date(b.date));
                return allForName[0].date.slice(0,7) === m;
              });
              const honshimei = uniqueN.length - newC.length;
              const pts = mv.filter(v => {
                if (v.firstVisit) return false;
                return visits.some(prev => prev.name === v.name && prev.date < v.date);
              }).reduce((s,v) => s + (COURSE_PRICES[v.course]?.pts || 0), 0);
              return { m, people: uniqueN.length, newCount: newC.length, honshimei, pts };
            });

            // 来店回数分布
            const visitCountDist = {};
            personalStats.forEach(p => {
              const key = p.total >= 10 ? "10+" : String(p.total);
              visitCountDist[key] = (visitCountDist[key] || 0) + 1;
            });

            // SVG折れ線グラフ描画関数
            const LineChart = ({ data, lines, height = 160 }) => {
              const W = 320, H = height, padL = 32, padR = 12, padT = 16, padB = 28;
              const chartW = W - padL - padR;
              const chartH = H - padT - padB;
              const n = data.length;
              if (n < 2) return <div style={{color:"#4b5563",fontSize:12,textAlign:"center",padding:20}}>データが2ヶ月以上必要です</div>;
              const allVals = lines.flatMap(l => data.map(d => d[l.key]));
              const maxV = Math.max(...allVals, 1);
              const xPos = (i) => padL + (i / (n-1)) * chartW;
              const yPos = (v) => padT + chartH - (v / maxV) * chartH;
              const labelStep = Math.max(1, Math.floor(n / 6));
              return (
                <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
                  {/* グリッド */}
                  {[0,0.25,0.5,0.75,1].map(r => (
                    <line key={r} x1={padL} y1={padT + chartH * (1-r)} x2={W-padR} y2={padT + chartH * (1-r)}
                      stroke="#2d2d44" strokeWidth="0.5" />
                  ))}
                  {[0,0.25,0.5,0.75,1].map(r => (
                    <text key={r} x={padL-4} y={padT + chartH * (1-r) + 4} textAnchor="end" fontSize="8" fill="#4b5563">
                      {Math.round(maxV * r)}
                    </text>
                  ))}
                  {/* 折れ線 */}
                  {lines.map(l => (
                    <polyline key={l.key}
                      points={data.map((d,i) => `${xPos(i)},${yPos(d[l.key])}`).join(" ")}
                      fill="none" stroke={l.color} strokeWidth="2" strokeLinejoin="round" />
                  ))}
                  {/* ドットと数値 */}
                  {lines.map(l => data.map((d,i) => (
                    <g key={`${l.key}-${i}`}>
                      <circle cx={xPos(i)} cy={yPos(d[l.key])} r="3" fill={l.color} />
                      <text x={xPos(i)} y={yPos(d[l.key]) - 6} textAnchor="middle" fontSize="7" fill={l.color} fontWeight="bold">{d[l.key]}</text>
                    </g>
                  )))}
                  {/* X軸ラベル */}
                  {data.map((d,i) => i % labelStep === 0 && (
                    <text key={i} x={xPos(i)} y={H-4} textAnchor="middle" fontSize="8" fill="#6b7280">
                      {d.m.slice(2).replace("-","/")}
                    </text>
                  ))}
                </svg>
              );
            };

            // 棒グラフ描画
            const BarChart = ({ data, height = 160 }) => {
              const W = 320, H = height, padL = 32, padR = 12, padT = 16, padB = 28;
              const chartW = W - padL - padR;
              const chartH = H - padT - padB;
              const n = data.length;
              const maxV = Math.max(...data.map(d => d.value), 1);
              const barW = chartW / n * 0.6;
              const gap = chartW / n;
              return (
                <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
                  {[0,0.5,1].map(r => (
                    <line key={r} x1={padL} y1={padT + chartH*(1-r)} x2={W-padR} y2={padT + chartH*(1-r)}
                      stroke="#2d2d44" strokeWidth="0.5" />
                  ))}
                  {[0,0.5,1].map(r => (
                    <text key={r} x={padL-4} y={padT + chartH*(1-r) + 4} textAnchor="end" fontSize="8" fill="#4b5563">
                      {Math.round(maxV*r)}
                    </text>
                  ))}
                  {data.map((d,i) => {
                    const bH = (d.value / maxV) * chartH;
                    const x = padL + gap * i + gap * 0.2;
                    const y = padT + chartH - bH;
                    return (
                      <g key={d.label}>
                        <rect x={x} y={y} width={barW} height={bH} fill={d.color} rx="2" />
                        <text x={x + barW/2} y={y - 3} textAnchor="middle" fontSize="8" fill={d.color} fontWeight="bold">{d.value}</text>
                        <text x={x + barW/2} y={H - 4} textAnchor="middle" fontSize="8" fill="#6b7280">{d.label}</text>
                      </g>
                    );
                  })}
                </svg>
              );
            };

            const distColors = ["#34d399","#f59e0b","#a78bfa","#ec4899","#6366f1","#f87171","#10b981","#8b5cf6","#f59e0b","#ec4899","#6b7280"];
            const distKeys = ["1","2","3","4","5","6","7","8","9","10+"];
            const distData = distKeys.filter(k => visitCountDist[k]).map((k,i) => ({
              label: k === "10+" ? "10+" : k + "回",
              value: visitCountDist[k] || 0,
              color: distColors[i] || "#6b7280"
            }));

            // 期間フィルター
            const filteredMonths = monthStats.filter(s => {
              if (graphStart && s.m < graphStart.slice(0,7)) return false;
              if (graphEnd && s.m > graphEnd.slice(0,7)) return false;
              return true;
            });

            return (
              <div>
                {/* 期間選択 */}
                <div style={{ background: "#16162a", borderRadius: 12, padding: 16, border: "1px solid #2d2d44", marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>表示期間</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, color: "#9ca3af", display: "block", marginBottom: 4 }}>開始</label>
                      <input type="date" value={graphStart} onChange={e => setGraphStart(e.target.value)}
                        style={{ width: "100%", background: "#0f0f1a", border: "1px solid #374151", borderRadius: 8, padding: "8px 10px", color: "#e2e8f0", fontSize: 13, boxSizing: "border-box", outline: "none", colorScheme: "dark" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "#9ca3af", display: "block", marginBottom: 4 }}>終了</label>
                      <input type="date" value={graphEnd} onChange={e => setGraphEnd(e.target.value)}
                        style={{ width: "100%", background: "#0f0f1a", border: "1px solid #374151", borderRadius: 8, padding: "8px 10px", color: "#e2e8f0", fontSize: 13, boxSizing: "border-box", outline: "none", colorScheme: "dark" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    {[
                      { l: "直近6ヶ月", fn: () => { const d = new Date(); const s = new Date(d); s.setMonth(s.getMonth()-6); setGraphStart(s.toISOString().slice(0,10)); setGraphEnd(d.toISOString().slice(0,10)); }},
                      { l: "直近1年", fn: () => { const d = new Date(); const s = new Date(d); s.setFullYear(s.getFullYear()-1); setGraphStart(s.toISOString().slice(0,10)); setGraphEnd(d.toISOString().slice(0,10)); }},
                      { l: "全期間", fn: () => { setGraphStart(""); setGraphEnd(""); }},
                    ].map(o => (
                      <button key={o.l} onClick={o.fn}
                        style={{ padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit", background: "#0f0f1a", color: "#9ca3af" }}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 月別推移折れ線グラフ */}
                <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>📈 月別 客数推移</h3>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 11 }}>
                    <span style={{ color: "#ec4899" }}>● 来店客数</span>
                    <span style={{ color: "#34d399" }}>● 新規</span>
                    <span style={{ color: "#a78bfa" }}>● 本指名</span>
                  </div>
                  <LineChart data={filteredMonths} lines={[
                    { key: "people", color: "#ec4899" },
                    { key: "newCount", color: "#34d399" },
                    { key: "honshimei", color: "#a78bfa" },
                  ]} />
                </div>

                {/* 本指名PT推移 */}
                <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>⭐ 月別 本指名PT推移</h3>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 11 }}>
                    <span style={{ color: "#f59e0b" }}>● 本指名PT</span>
                  </div>
                  <LineChart data={filteredMonths} lines={[
                    { key: "pts", color: "#f59e0b" },
                  ]} />
                </div>

                {/* 来店回数分布 */}
                <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>📊 来店回数分布</h3>
                  <p style={{ margin: "0 0 12px", fontSize: 11, color: "#4b5563" }}>何回来店した顧客が何人いるか</p>
                  <BarChart data={distData} />
                  <div style={{ marginTop: 12 }}>
                    {distData.map(d => (
                      <div key={d.label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #0f0f1a", fontSize: 12 }}>
                        <span style={{ color: d.color, fontWeight: 600 }}>{d.label}</span>
                        <span style={{ color: "#9ca3af" }}>{d.value}名</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* リピーター曜日分布 */}
                {(() => {
                  const repeatVisits = visits.filter(v => visits.some(prev => prev.name === v.name && prev.date < v.date));
                  const days = ["日","月","火","水","木","金","土"];
                  const dayCounts = [0,0,0,0,0,0,0];
                  repeatVisits.forEach(v => { dayCounts[new Date(v.date).getDay()]++; });
                  const maxD = Math.max(...dayCounts, 1);
                  const dayData = days.map((d, i) => ({
                    label: d, value: dayCounts[i],
                    color: i === 0 || i === 6 ? "#ec4899" : "#a78bfa"
                  }));
                  return (
                    <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                      <h3 style={{ margin: "0 0 4px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>📅 リピーター 曜日分布</h3>
                      <p style={{ margin: "0 0 12px", fontSize: 11, color: "#4b5563" }}>2回目以降の来店が多い曜日</p>
                      <BarChart data={dayData} height={140} />
                    </div>
                  );
                })()}

                {/* リピーター月別分布 */}
                {(() => {
                  const repeatVisits = visits.filter(v => visits.some(prev => prev.name === v.name && prev.date < v.date));
                  const monthCounts = {};
                  repeatVisits.forEach(v => { const m = v.date.slice(0,7); monthCounts[m] = (monthCounts[m]||0)+1; });
                  const rMonthStats = Object.entries(monthCounts).sort((a,b) => a[0].localeCompare(b[0])).map(([m, count]) => ({ m, repeat: count }));
                  const filtered = rMonthStats.filter(s => {
                    if (graphStart && s.m < graphStart.slice(0,7)) return false;
                    if (graphEnd && s.m > graphEnd.slice(0,7)) return false;
                    return true;
                  });
                  if (filtered.length < 2) return null;
                  return (
                    <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44" }}>
                      <h3 style={{ margin: "0 0 4px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>📈 リピーター 月別来店数</h3>
                      <p style={{ margin: "0 0 12px", fontSize: 11, color: "#4b5563" }}>2回目以降の来店数の月別推移</p>
                      <div style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 11 }}>
                        <span style={{ color: "#f59e0b" }}>● リピート来店数</span>
                      </div>
                      <LineChart data={filtered} lines={[{ key: "repeat", color: "#f59e0b" }]} />
                    </div>
                  );
                })()}
              </div>
            );
          })()}

          {/* リテンションタブ */}
          {tab === "retention" && (() => {
            const RETENTION_DAYS = 90;

            // 1. 初来店から90日以内リテンション率
            const firstTimers = personalStats.filter(p => p.total >= 1);
            const retained = firstTimers.filter(p => {
              const sorted = [...p.visits].sort((a,b) => new Date(a.date)-new Date(b.date));
              if (sorted.length < 2) return false;
              return daysBetween(sorted[0].date, sorted[1].date) <= RETENTION_DAYS;
            });
            const notRetained = firstTimers.filter(p => {
              const sorted = [...p.visits].sort((a,b) => new Date(a.date)-new Date(b.date));
              if (sorted.length < 2) return daysBetween(sorted[0].date, today()) > RETENTION_DAYS;
              return daysBetween(sorted[0].date, sorted[1].date) > RETENTION_DAYS;
            });
            const retentionRate = firstTimers.length > 0 ? Math.round(retained.length / firstTimers.length * 100) : 0;

            // 2. 来店回数別離脱
            const atN = (n) => personalStats.filter(p => p.total === n);
            const overN = (n) => personalStats.filter(p => p.total >= n);

            // 3. コースアップ率
            const started100 = personalStats.filter(p => {
              const sorted = [...p.visits].sort((a,b) => new Date(a.date)-new Date(b.date));
              return sorted.length >= 1 && parseInt(sorted[0].course) === 100;
            });
            const courseUpgraded = started100.filter(p => {
              const sorted = [...p.visits].sort((a,b) => new Date(a.date)-new Date(b.date));
              return sorted.slice(1).some(v => parseInt(v.course) >= 130);
            });

            // 4. 来店間隔の急拡大
            const gapAlerts = personalStats.filter(p => p.total >= 3 && p.cycle).map(p => {
              const sorted = [...p.visits].sort((a,b) => new Date(a.date)-new Date(b.date));
              const intervals = sorted.slice(1).map((v,i) => ({ from: sorted[i].date, to: v.date, days: daysBetween(sorted[i].date, v.date) }));
              const spikes = intervals.filter(iv => iv.days > p.cycle * 2);
              return spikes.length > 0 ? { name: p.name, spikes, avg: p.cycle } : null;
            }).filter(Boolean);

            return (
              <div>
                {/* 初来店90日リテンション */}
                <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>🔄 初来店90日以内 リテンション率</h3>
                  <p style={{ margin: "0 0 16px", fontSize: 11, color: "#4b5563" }}>初来店から90日以内に2回目来店があった顧客の割合</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                    <div style={{ fontSize: 48, fontWeight: 900, color: retentionRate >= 70 ? "#34d399" : retentionRate >= 40 ? "#f59e0b" : "#f87171" }}>
                      {retentionRate}%
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.8 }}>
                      <div>{retained.length}名が90日以内に再来店</div>
                      <div style={{ color: "#f87171" }}>{notRetained.length}名が離脱（または未来店）</div>
                    </div>
                  </div>
                  <div style={{ background: "#0f0f1a", borderRadius: 6, height: 12, overflow: "hidden", marginBottom: 12 }}>
                    <div style={{ width: `${retentionRate}%`, background: retentionRate >= 70 ? "#34d399" : retentionRate >= 40 ? "#f59e0b" : "#f87171", height: "100%", borderRadius: 6, transition: "width 0.6s" }} />
                  </div>
                  {notRetained.length > 0 && (
                    <div style={{ fontSize: 11, color: "#f87171" }}>離脱・未来店: {notRetained.map(p => p.name).join("、")}</div>
                  )}
                </div>

                {/* 来店回数別離脱 */}
                <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>📉 来店回数別 離脱割合</h3>
                  <p style={{ margin: "0 0 16px", fontSize: 11, color: "#4b5563" }}>その回数で来店が止まっている顧客の割合（現在進行形も含む）</p>
                  {[2,3,4,5].map(n => {
                    const stoppedHere = atN(n).length;
                    const reachedN = overN(n).length;
                    if (reachedN === 0) return null;
                    const dropRate = Math.round(stoppedHere / reachedN * 100);
                    const color = dropRate >= 50 ? "#f87171" : dropRate >= 30 ? "#f59e0b" : "#34d399";
                    return (
                      <div key={n} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: "#9ca3af" }}>{n}回目で止まっている</span>
                          <span style={{ fontSize: 13 }}>{stoppedHere}名/{reachedN}名中　<span style={{ color, fontWeight: 700 }}>{dropRate}%</span></span>
                        </div>
                        <div style={{ background: "#0f0f1a", borderRadius: 4, height: 8, overflow: "hidden", marginBottom: 4 }}>
                          <div style={{ width: `${dropRate}%`, background: color, height: "100%", borderRadius: 4, transition: "width 0.5s" }} />
                        </div>
                        {stoppedHere > 0 && (
                          <div style={{ fontSize: 11, color: "#4b5563" }}>{atN(n).map(p => p.name).join("、")}</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* コースアップ率 */}
                <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44", marginBottom: 20 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>⬆️ コースアップ率</h3>
                  <p style={{ margin: "0 0 16px", fontSize: 11, color: "#4b5563" }}>初回100分→その後130分以上に移行した顧客の割合</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                    <div style={{ fontSize: 48, fontWeight: 900, color: "#f59e0b" }}>
                      {started100.length > 0 ? Math.round(courseUpgraded.length / started100.length * 100) : 0}%
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.8 }}>
                      <div>{started100.length}名が100分スタート</div>
                      <div style={{ color: "#f59e0b" }}>{courseUpgraded.length}名がコースアップ済み</div>
                    </div>
                  </div>
                  <div style={{ background: "#0f0f1a", borderRadius: 6, height: 10, overflow: "hidden", marginBottom: 12 }}>
                    <div style={{ width: `${started100.length > 0 ? courseUpgraded.length / started100.length * 100 : 0}%`, background: "#f59e0b", height: "100%", borderRadius: 6, transition: "width 0.6s" }} />
                  </div>
                  {courseUpgraded.length > 0 && (
                    <div style={{ fontSize: 11, color: "#f59e0b" }}>コースアップ済み: {courseUpgraded.map(p => p.name).join("、")}</div>
                  )}
                  {started100.filter(p => !courseUpgraded.includes(p)).length > 0 && (
                    <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>まだ100分のまま: {started100.filter(p => !courseUpgraded.includes(p)).map(p => p.name).join("、")}</div>
                  )}
                </div>

                {/* 来店間隔の急拡大 */}
                <div style={{ background: "#16162a", borderRadius: 12, padding: 20, border: "1px solid #2d2d44" }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>⚡ 来店間隔の急拡大</h3>
                  <p style={{ margin: "0 0 16px", fontSize: 11, color: "#4b5563" }}>平均周期の2倍以上間隔が空いたタイミングを検出</p>
                  {gapAlerts.length === 0 ? (
                    <div style={{ fontSize: 13, color: "#4b5563" }}>該当する顧客はいません</div>
                  ) : gapAlerts.map(alert => (
                    <div key={alert.name} style={{ marginBottom: 14, padding: "12px 14px", background: "#0f0f1a", borderRadius: 8, borderLeft: "3px solid #f87171" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{alert.name}</span>
                        <span style={{ fontSize: 11, color: "#6b7280" }}>平均{alert.avg}日</span>
                      </div>
                      {alert.spikes.map((s, i) => (
                        <div key={i} style={{ fontSize: 12, color: "#f87171", marginBottom: 4 }}>
                          ⚠ {s.from} → {s.to}：<span style={{ fontWeight: 700 }}>{s.days}日</span>
                          <span style={{ color: "#6b7280", marginLeft: 6 }}>（平均の{Math.round(s.days/alert.avg*10)/10}倍）</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
