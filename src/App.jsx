import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Brain, Wrench, Heart, Rocket, Award, Shield, Sparkles, CheckCircle2,
  Target, MessageSquare, Plus, X, ChevronRight, TrendingUp,
  UserCircle2, Smile, Meh, HelpCircle, Loader2, Flame, Trophy, Crown,
  Lightbulb, Bot, Armchair, Code2, Star, Lock, Zap, BarChart3, Gift,
  LayoutGrid, Medal, ClipboardList, LogOut, LogIn
} from 'lucide-react';
import { supabase } from './supabaseClient';

/* ---------------------------------- palette --------------------------------- */

const COLORS = {
  bg: '#0B0F16', panel: '#151C27', panelAlt: '#1B2431', panelSoft: '#101724',
  border: '#232E3D', borderStrong: '#34445A',
  text: '#EEF2F6', textMuted: '#93A1B2', textFaint: '#5B6B7E',
  xp: '#F5B942', behavior: '#FF8A65', robotics: '#4C86F5',
  coding: '#33C7B0', challenge: '#B07CFF', reward: '#FF6FA8', success: '#5FD489',
};

/* ---------------------------------- data ------------------------------------ */

const CATEGORY_ORDER = [
  'Respect', 'Responsibility', 'Participation', 'Teamwork', 'Digital Citizenship',
  'Problem Solving & Mindset', 'Robotics Behavior', 'Leadership', 'Creativity',
];

const PILLAR_MAP = {
  Respect: 'behavior', Responsibility: 'behavior', Participation: 'behavior',
  Teamwork: 'behavior', 'Digital Citizenship': 'behavior',
  'Problem Solving & Mindset': 'skills', 'Robotics Behavior': 'skills',
  Leadership: 'skills', Creativity: 'skills',
};

const CATEGORY_COLOR = {
  Respect: COLORS.behavior, Responsibility: COLORS.behavior, Participation: COLORS.behavior,
  Teamwork: COLORS.behavior, 'Digital Citizenship': COLORS.behavior,
  'Problem Solving & Mindset': COLORS.robotics, 'Robotics Behavior': COLORS.robotics,
  Leadership: COLORS.challenge, Creativity: COLORS.reward,
};

const DEFAULT_BEHAVIORS = [
  { id: 'b1', category: 'Respect', name: 'Respectful behavior', points: 5 },
  { id: 'b2', category: 'Respect', name: 'Respecting different opinions', points: 5 },
  { id: 'b3', category: 'Teamwork', name: 'Excellent teamwork', points: 10 },
  { id: 'b4', category: 'Teamwork', name: 'Helping a classmate', points: 5 },
  { id: 'b5', category: 'Responsibility', name: 'Excellent responsibility', points: 10 },
  { id: 'b6', category: 'Responsibility', name: 'Taking care of equipment', points: 5 },
  { id: 'b7', category: 'Participation', name: 'Outstanding participation', points: 5 },
  { id: 'b8', category: 'Leadership', name: 'Demonstrating leadership', points: 10 },
  { id: 'b9', category: 'Problem Solving & Mindset', name: 'Excellent problem-solving attitude', points: 10 },
  { id: 'b10', category: 'Problem Solving & Mindset', name: 'Showing perseverance', points: 10 },
  { id: 'b11', category: 'Digital Citizenship', name: 'Excellent digital citizenship', points: 10 },
  { id: 'b12', category: 'Robotics Behavior', name: 'Careful, safe robot handling', points: 5 },
  { id: 'b13', category: 'Creativity', name: 'Creative idea or solution', points: 10 },
];

const DEFAULT_STUDENTS = [
  { id: 's1', name: 'Ahmed', ageGroup: 'primary' },
  { id: 's2', name: 'Layla', ageGroup: 'primary' },
  { id: 's3', name: 'Omar', ageGroup: 'middle' },
  { id: 's4', name: 'Sara', ageGroup: 'middle' },
  { id: 's5', name: 'Youssef', ageGroup: 'high' },
  { id: 's6', name: 'Mariam', ageGroup: 'high' },
];

const LEVELS = [
  { level: 1, title: 'Beginner', min: 0 },
  { level: 2, title: 'Explorer', min: 100 },
  { level: 3, title: 'Coder', min: 250 },
  { level: 4, title: 'Problem Solver', min: 450 },
  { level: 5, title: 'Robotics Builder', min: 700 },
  { level: 6, title: 'Innovator', min: 1000 },
  { level: 7, title: 'Tech Champion', min: 1350 },
];

const BADGE_DEFS = [
  { id: 'bd1', name: 'Respect Champion', icon: 'Shield', type: 'category', category: 'Respect', threshold: 4, criteria: 'Receive 4 Respect recognitions' },
  { id: 'bd2', name: 'Team Player', icon: 'Users', type: 'category', category: 'Teamwork', threshold: 5, criteria: 'Receive 5 Teamwork recognitions' },
  { id: 'bd3', name: 'Robotics Builder', icon: 'Bot', type: 'category', category: 'Robotics Behavior', threshold: 4, criteria: 'Receive 4 Robotics Behavior recognitions' },
  { id: 'bd4', name: 'Problem Solver', icon: 'Brain', type: 'category', category: 'Problem Solving & Mindset', threshold: 5, criteria: 'Receive 5 Problem-Solving recognitions' },
  { id: 'bd5', name: 'Never Give Up', icon: 'Flame', type: 'category', category: 'Problem Solving & Mindset', threshold: 8, criteria: 'Receive 8 Problem-Solving recognitions' },
  { id: 'bd6', name: 'Innovation Star', icon: 'Lightbulb', type: 'category', category: 'Creativity', threshold: 3, criteria: 'Receive 3 Creativity recognitions' },
  { id: 'bd7', name: 'Tech Leader', icon: 'Crown', type: 'category', category: 'Leadership', threshold: 3, criteria: 'Receive 3 Leadership recognitions' },
  { id: 'bd8', name: 'Digital Citizen', icon: 'Wrench', type: 'category', category: 'Digital Citizenship', threshold: 4, criteria: 'Receive 4 Digital Citizenship recognitions' },
  { id: 'bd9', name: 'Coding Explorer', icon: 'Trophy', type: 'academic', threshold: 100, criteria: 'Earn 100 academic points' },
];

const DEFAULT_REWARDS = [
  { id: 'r1', icon: 'Armchair', name: 'Choose Your Seat', cost: 250, description: 'Pick your seat for one lesson.' },
  { id: 'r2', icon: 'Code2', name: '10 Min Free Coding Time', cost: 150, description: 'Extra free coding time at the end of class.' },
  { id: 'r3', icon: 'Bot', name: 'Robotics Team Leader', cost: 300, description: 'Lead the robotics team for one lesson.' },
  { id: 'r4', icon: 'Target', name: 'Choose the Next Mini Challenge', cost: 200, description: 'Pick what the class works on next.' },
  { id: 'r5', icon: 'Award', name: 'Special Digital Certificate', cost: 400, description: 'A certificate recognizing your progress.' },
  { id: 'r6', icon: 'Star', name: 'Tech Assistant of the Day', cost: 350, description: 'Help the teacher run the lesson.' },
];

const ICONS = { Shield, Users, Bot, Brain, Flame, Lightbulb, Crown, Wrench, Trophy, Armchair, Code2, Target, Award, Star };

const QUALITIES = [
  { label: 'Respect', category: 'Respect' },
  { label: 'Teamwork', category: 'Teamwork' },
  { label: 'Responsibility', category: 'Responsibility' },
  { label: 'Leadership', category: 'Leadership' },
  { label: 'Participation', category: 'Participation' },
  { label: 'Digital Citizenship', category: 'Digital Citizenship' },
  { label: 'Perseverance', category: 'Problem Solving & Mindset' },
  { label: 'Creativity', category: 'Creativity' },
];

function defaultState() {
  return {
    students: DEFAULT_STUDENTS,
    behaviors: DEFAULT_BEHAVIORS,
    rewards: DEFAULT_REWARDS,
    academicPoints: {},
    spentXP: {},
    behaviorLog: [],
    studentBadges: {},
    redemptions: [],
    goals: [],
    reflections: [],
    notes: [],
    mission: {
      id: 'm1', text: 'Help your team solve today\u2019s robotics challenge.',
      xpReward: 30, behaviorPoints: 10, badgeHint: 'Team Player', completedBy: [],
    },
  };
}

function uid(p) { return p + '_' + Math.random().toString(36).slice(2, 9); }

/* --------------------------------- storage (Supabase) ------------------------ */
// The whole app's data lives in one row (id = 1) of `classroom_state`, in a
// single jsonb column. This mirrors a simple key-value store but on a real,
// shared Postgres database anyone with the URL can reach.

const ROW_ID = 1;

async function loadState() {
  const { data, error } = await supabase.from('classroom_state').select('data').eq('id', ROW_ID).single();
  if (error || !data || !data.data || Object.keys(data.data).length === 0) {
    const seeded = defaultState();
    await saveState(seeded);
    return seeded;
  }
  return { ...defaultState(), ...data.data };
}

async function saveState(state) {
  const { error } = await supabase
    .from('classroom_state')
    .update({ data: state, updated_at: new Date().toISOString() })
    .eq('id', ROW_ID);
  if (error) console.error('save failed', error);
}

/* --------------------------------- helpers ----------------------------------- */

const dayKey = (iso) => iso.slice(0, 10);

function categoryPoints(state, studentId, category) {
  return state.behaviorLog.filter(l => l.studentId === studentId && l.category === category).reduce((s, l) => s + l.points, 0);
}
function categoryCount(state, studentId, category) {
  return state.behaviorLog.filter(l => l.studentId === studentId && l.category === category).length;
}
function behaviorPillarPoints(state, studentId) {
  return state.behaviorLog.filter(l => l.studentId === studentId && PILLAR_MAP[l.category] === 'behavior').reduce((s, l) => s + l.points, 0);
}
function totalXP(state, studentId) {
  const academic = state.academicPoints[studentId] || 0;
  const behaviorTotal = state.behaviorLog.filter(l => l.studentId === studentId).reduce((s, l) => s + l.points, 0);
  return academic + behaviorTotal;
}
function spendableXP(state, studentId) {
  return totalXP(state, studentId) - (state.spentXP[studentId] || 0);
}
function levelInfo(xp) {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) current = l;
  const idx = LEVELS.findIndex(l => l.level === current.level);
  const next = LEVELS[idx + 1];
  const progress = next ? Math.min(100, Math.round(((xp - current.min) / (next.min - current.min)) * 100)) : 100;
  const toNext = next ? next.min - xp : 0;
  return { ...current, next, progress, toNext };
}
function computeStreak(state, studentId) {
  const days = Array.from(new Set(state.behaviorLog.filter(l => l.studentId === studentId).map(l => dayKey(l.date)))).sort().reverse();
  if (!days.length) return 0;
  let streak = 1;
  let cur = new Date(days[0]);
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i]);
    const diff = Math.round((cur - prev) / 86400000);
    if (diff === 1) { streak++; cur = prev; } else break;
  }
  return streak;
}
function computeMostImproved(state) {
  let best = null;
  state.students.forEach(st => {
    const logs = state.behaviorLog.filter(l => l.studentId === st.id).sort((a, b) => a.date.localeCompare(b.date));
    if (logs.length < 4) return;
    const mid = Math.floor(logs.length / 2);
    const delta = logs.slice(mid).reduce((s, l) => s + l.points, 0) - logs.slice(0, mid).reduce((s, l) => s + l.points, 0);
    if (delta > 0 && (!best || delta > best.delta)) best = { student: st, delta };
  });
  return best;
}
function computeNeedsEncouragement(state) {
  const withLogs = state.students.filter(st => state.behaviorLog.some(l => l.studentId === st.id));
  if (withLogs.length < 2) return [];
  return withLogs.map(st => ({ student: st, pts: behaviorPillarPoints(state, st.id) }))
    .sort((a, b) => a.pts - b.pts).slice(0, 2).filter(x => x.pts <= 15);
}
function categoryLeader(state, category) {
  let best = null;
  state.students.forEach(st => {
    const pts = categoryPoints(state, st.id, category);
    if (pts > 0 && (!best || pts > best.pts)) best = { student: st, pts };
  });
  return best;
}
function academicLeader(state) {
  let best = null;
  state.students.forEach(st => {
    const pts = state.academicPoints[st.id] || 0;
    if (pts > 0 && (!best || pts > best.pts)) best = { student: st, pts };
  });
  return best;
}
function autoAwardBadges(state) {
  const next = { ...state.studentBadges };
  state.students.forEach(st => {
    const earned = new Set(next[st.id] || []);
    BADGE_DEFS.forEach(bd => {
      const qualifies = bd.type === 'academic'
        ? (state.academicPoints[st.id] || 0) >= bd.threshold
        : categoryCount(state, st.id, bd.category) >= bd.threshold;
      if (qualifies) earned.add(bd.id);
    });
    next[st.id] = Array.from(earned);
  });
  return next;
}
function ageTheme(ageGroup) {
  if (ageGroup === 'primary') return {
    greet: n => `Welcome back, ${n}! \u{1F44B}`,
    xpToast: n => `\u{1F680} Amazing! You earned ${n} XP!`,
  };
  if (ageGroup === 'middle') return {
    greet: n => `Welcome back, ${n} \u{1F44B}`,
    xpToast: n => `\u{1F525} +${n} XP earned!`,
  };
  return {
    greet: n => `Welcome back, ${n}`,
    xpToast: n => `+${n} XP`,
  };
}

/* ---------------------------------- bits -------------------------------------- */

function Card({ children, style, className = '' }) {
  return (
    <div className={`rounded-2xl border p-4 ${className}`} style={{ background: COLORS.panel, borderColor: COLORS.border, ...style }}>
      {children}
    </div>
  );
}

function Bar({ value, color, height = 8 }) {
  return (
    <div className="rounded-full overflow-hidden" style={{ height, background: COLORS.panelSoft }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </div>
  );
}

function SectionLabel({ icon: Icon, color, children, right }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-center gap-1.5 text-xs font-bold tracking-wide" style={{ color: color || COLORS.textMuted }}>
        {Icon && <Icon size={14} />} <span style={{ color: COLORS.text }}>{children}</span>
      </div>
      {right}
    </div>
  );
}

function StatChip({ icon: Icon, label, value, color }) {
  return (
    <div className="flex-1 rounded-xl border px-3 py-2.5" style={{ minWidth: 84, background: COLORS.panelAlt, borderColor: COLORS.border }}>
      <div className="flex items-center gap-1.5 mb-1" style={{ color }}>
        <Icon size={13} />
        <span className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: COLORS.textFaint }}>{label}</span>
      </div>
      <div className="text-lg font-black font-mono" style={{ color: COLORS.text }}>{value}</div>
    </div>
  );
}

function JourneyPath({ level }) {
  return (
    <div className="flex items-center overflow-x-auto py-1 -mx-1 px-1">
      {LEVELS.map((l, i) => {
        const st = l.level < level ? 'done' : l.level === level ? 'current' : 'future';
        return (
          <React.Fragment key={l.level}>
            <div className="flex flex-col items-center gap-1 shrink-0" style={{ width: 58 }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                style={{
                  background: st === 'future' ? COLORS.panelAlt : `linear-gradient(135deg, ${COLORS.xp}, #FFDA8A)`,
                  color: st === 'future' ? COLORS.textFaint : '#0B0F16',
                  boxShadow: st === 'current' ? `0 0 0 3px ${COLORS.xp}40` : 'none',
                }}>
                {l.level}
              </div>
              <div className="text-[8.5px] text-center leading-tight font-semibold" style={{ color: st === 'future' ? COLORS.textFaint : COLORS.textMuted }}>
                {l.title}
              </div>
            </div>
            {i < LEVELS.length - 1 && (
              <div className="h-0.5 flex-1 shrink-0" style={{ minWidth: 10, background: l.level < level ? COLORS.xp : COLORS.border }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function BadgeTile({ def, earned, progressText }) {
  const Icon = ICONS[def.icon] || Award;
  return (
    <div className="rounded-2xl border p-3 flex flex-col items-center gap-1.5 text-center relative"
      style={{ background: earned ? `${COLORS.xp}14` : COLORS.panelAlt, borderColor: earned ? `${COLORS.xp}55` : COLORS.border }}>
      {!earned && <Lock size={11} className="absolute top-2 right-2" style={{ color: COLORS.textFaint }} />}
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: earned ? COLORS.xp : COLORS.panelSoft }}>
        <Icon size={18} style={{ color: earned ? '#0B0F16' : COLORS.textFaint }} strokeWidth={2.2} />
      </div>
      <div className="text-[10.5px] font-bold leading-tight" style={{ color: earned ? COLORS.text : COLORS.textMuted }}>{def.name}</div>
      <div className="text-[9px] leading-tight" style={{ color: COLORS.textFaint }}>{earned ? 'Unlocked' : progressText}</div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const colorMap = { xp: COLORS.xp, badge: COLORS.xp, reward: COLORS.reward, reflect: COLORS.behavior };
  const color = colorMap[toast.kind] || COLORS.xp;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]">
      <div className="rounded-xl px-5 py-3 shadow-2xl flex items-center gap-3 max-w-sm border" style={{ background: COLORS.panel, borderColor: `${color}55` }}>
        <Sparkles size={18} style={{ color }} className="shrink-0" />
        <div>
          <div className="text-sm font-bold" style={{ color: COLORS.text }}>{toast.title}</div>
          {toast.body && <div className="text-xs" style={{ color: COLORS.textMuted }}>{toast.body}</div>}
        </div>
      </div>
    </div>
  );
}

function NavTabs({ tabs, active, onChange, accent }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border p-1" style={{ background: COLORS.panelSoft, borderColor: COLORS.border }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition"
          style={active === t.id ? { background: accent, color: '#0B0F16' } : { color: COLORS.textMuted }}>
          <t.icon size={13} /> {t.label}
        </button>
      ))}
    </div>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(4,7,11,0.7)', backdropFilter: 'blur(3px)' }}>
      <div className="rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm max-h-[85vh] overflow-auto p-5 border" style={{ background: COLORS.panel, borderColor: COLORS.border }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold" style={{ color: COLORS.text }}>{title}</h3>
          {onClose && <button onClick={onClose} style={{ color: COLORS.textMuted }}><X size={18} /></button>}
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div>
      <div className="text-[10.5px] font-bold uppercase tracking-wide mb-1.5" style={{ color: COLORS.textFaint }}>{label}</div>
      {children}
    </div>
  );
}
const inputStyle = { width: '100%', background: COLORS.panelSoft, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, color: COLORS.text, outline: 'none' };

/* ------------------------------- Teacher login modal --------------------------- */

function TeacherLoginModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onSuccess();
  }

  return (
    <ModalShell title="Teacher Sign In" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Email"><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} /></Field>
        <Field label="Password"><input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} /></Field>
        {error && <div className="text-xs font-semibold" style={{ color: '#FF6B6B' }}>{error}</div>}
        <button onClick={handleLogin} disabled={loading} className="w-full font-bold text-sm rounded-lg py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: COLORS.robotics, color: '#0B0F16' }}>
          <LogIn size={15} /> {loading ? 'Signing in\u2026' : 'Sign In'}
        </button>
        <p className="text-[10.5px] text-center" style={{ color: COLORS.textFaint }}>
          Teacher accounts are created in the Supabase dashboard under Authentication.
        </p>
      </div>
    </ModalShell>
  );
}

/* ------------------------------------ App -------------------------------------- */

export default function App() {
  const [state, setState] = useState(null);
  const [role, setRole] = useState('student');
  const [activeStudentId, setActiveStudentId] = useState(DEFAULT_STUDENTS[0].id);
  const [toast, setToast] = useState(null);
  const [showRecognize, setShowRecognize] = useState(false);
  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => { loadState().then(setState); }, []);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3400); return () => clearTimeout(t); }, [toast]);

  const persist = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const withBadges = { ...next, studentBadges: autoAwardBadges(next) };
      saveState(withBadges);
      return withBadges;
    });
  }, []);

  if (!state) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
      <Loader2 className="animate-spin" style={{ color: COLORS.robotics }} size={28} />
    </div>;
  }

  function awardBehavior({ studentId, behaviorId, points, comment }) {
    const behavior = state.behaviors.find(b => b.id === behaviorId);
    const entry = { id: uid('log'), studentId, behaviorId, category: behavior.category, name: behavior.name, points: Number(points), comment, date: new Date().toISOString() };
    persist(prev => ({ ...prev, behaviorLog: [...prev.behaviorLog, entry] }));
    const student = state.students.find(s => s.id === studentId);
    const theme = ageTheme(student.ageGroup);
    setToast({ kind: 'xp', title: theme.xpToast(points), body: `${student.name} \u2014 ${behavior.name}` });
    setShowRecognize(false);
  }

  function handleRoleClick(target) {
    if (target === 'teacher' && !session) { setShowLogin(true); return; }
    setRole(target);
  }
  async function handleSignOut() {
    await supabase.auth.signOut();
    setRole('student');
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bg, color: COLORS.text, fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
      <Toast toast={toast} />
      <header className="sticky top-0 z-40 border-b" style={{ background: `${COLORS.bg}F2`, borderColor: COLORS.border, backdropFilter: 'blur(6px)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${COLORS.robotics}, ${COLORS.coding})` }}>
              <Zap size={16} style={{ color: '#0B0F16' }} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[14.5px] font-black tracking-tight leading-none">CS &amp; Robotics Lab</div>
              <div className="text-[9.5px] font-semibold tracking-wide leading-none mt-1" style={{ color: COLORS.textFaint }}>TECH JOURNEY PLATFORM</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg p-1 border" style={{ background: COLORS.panelAlt, borderColor: COLORS.border }}>
              <button onClick={() => handleRoleClick('student')} className="px-3 py-1.5 rounded-md text-xs font-bold transition"
                style={role === 'student' ? { background: COLORS.xp, color: '#0B0F16' } : { color: COLORS.textMuted }}>Student</button>
              <button onClick={() => handleRoleClick('teacher')} className="px-3 py-1.5 rounded-md text-xs font-bold transition"
                style={role === 'teacher' ? { background: COLORS.robotics, color: '#0B0F16' } : { color: COLORS.textMuted }}>Teacher</button>
            </div>
            {role === 'teacher' && session && (
              <button onClick={handleSignOut} title={session.user.email} className="p-2 rounded-lg border" style={{ borderColor: COLORS.border, color: COLORS.textMuted }}>
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5">
        {role === 'student' ? (
          <StudentApp state={state} activeStudentId={activeStudentId} setActiveStudentId={setActiveStudentId} persist={persist} setToast={setToast} />
        ) : (
          <TeacherApp state={state} persist={persist} />
        )}
      </main>

      {showRecognize && <RecognizeModal state={state} onClose={() => setShowRecognize(false)} onSubmit={awardBehavior} />}
      {showLogin && (
        <TeacherLoginModal onClose={() => setShowLogin(false)} onSuccess={() => { setShowLogin(false); setRole('teacher'); }} />
      )}

      {role === 'teacher' && session && (
        <button onClick={() => setShowRecognize(true)}
          className="fixed bottom-5 right-5 z-30 rounded-full shadow-2xl flex items-center gap-2 px-4 py-3 font-bold text-xs"
          style={{ background: COLORS.xp, color: '#0B0F16' }}>
          <Plus size={16} /> Quick Recognition
        </button>
      )}
    </div>
  );
}

/* --------------------------------- Student App ---------------------------------- */

function StudentApp({ state, activeStudentId, setActiveStudentId, persist, setToast }) {
  const [tab, setTab] = useState('dashboard');
  const student = state.students.find(s => s.id === activeStudentId) || state.students[0];
  const theme = ageTheme(student.ageGroup);
  const xp = totalXP(state, student.id);
  const lvl = levelInfo(xp);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'store', label: 'Store', icon: Gift },
    { id: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
  ];

  function addReflection(feeling, improvement) {
    persist(prev => ({ ...prev, reflections: [{ id: uid('refl'), studentId: student.id, feeling, improvement, date: new Date().toISOString() }, ...prev.reflections] }));
    setToast({ kind: 'reflect', title: 'Reflection saved', body: 'Thanks for thinking about your lesson today.' });
  }
  function redeem(reward) {
    if (spendableXP(state, student.id) < reward.cost) return;
    persist(prev => ({
      ...prev,
      spentXP: { ...prev.spentXP, [student.id]: (prev.spentXP[student.id] || 0) + reward.cost },
      redemptions: [{ id: uid('rdm'), studentId: student.id, rewardId: reward.id, date: new Date().toISOString() }, ...prev.redemptions],
    }));
    setToast({ kind: 'reward', title: '\u{1F381} Reward redeemed!', body: reward.name });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <UserCircle2 size={17} style={{ color: COLORS.textMuted }} />
        <select value={student.id} onChange={e => setActiveStudentId(e.target.value)}
          className="rounded-lg px-2.5 py-1.5 text-sm font-semibold outline-none border"
          style={{ background: COLORS.panelAlt, borderColor: COLORS.border, color: COLORS.text }}>
          {state.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full" style={{ background: COLORS.panelAlt, color: COLORS.textFaint }}>
          {student.ageGroup} view
        </span>
      </div>

      <NavTabs tabs={tabs} active={tab} onChange={setTab} accent={COLORS.xp} />

      {tab === 'dashboard' && <DashboardTab state={state} student={student} theme={theme} lvl={lvl} xp={xp} onReflect={addReflection} />}
      {tab === 'achievements' && <AchievementsTab state={state} student={student} />}
      {tab === 'store' && <StoreTab state={state} student={student} onRedeem={redeem} />}
      {tab === 'leaderboard' && <LeaderboardTab state={state} />}
    </div>
  );
}

function DashboardTab({ state, student, theme, lvl, xp, onReflect }) {
  const streak = computeStreak(state, student.id);
  const badgeCount = (state.studentBadges[student.id] || []).length;
  const behaviorPts = behaviorPillarPoints(state, student.id);
  const mission = state.mission;
  const missionDone = mission.completedBy.includes(student.id);
  const [feeling, setFeeling] = useState(null);
  const [improvement, setImprovement] = useState('');
  const goals = state.goals.filter(g => g.studentId === student.id);
  const log = state.behaviorLog.filter(l => l.studentId === student.id).slice(-4).reverse();
  const reflections = state.reflections.filter(r => r.studentId === student.id).slice(0, 3);

  const feelings = [
    { id: 'great', icon: Smile, label: 'I worked very well' },
    { id: 'good', icon: Smile, label: 'I did well' },
    { id: 'meh', icon: Meh, label: 'I need to improve' },
    { id: 'help', icon: HelpCircle, label: 'I need help' },
  ];

  return (
    <div className="space-y-5">
      <Card style={{ background: `linear-gradient(135deg, ${COLORS.panel}, ${COLORS.panelAlt})` }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-base font-black">{theme.greet(student.name)}</div>
            <div className="text-sm font-bold mt-0.5" style={{ color: COLORS.xp }}>Level {lvl.level} {'\u2014'} {lvl.title}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl font-black font-mono" style={{ color: COLORS.xp }}>{xp}</div>
            <div className="text-[9.5px] font-bold uppercase" style={{ color: COLORS.textFaint }}>Total XP</div>
          </div>
        </div>
        <Bar value={lvl.progress} color={COLORS.xp} height={10} />
        <div className="text-[11px] font-medium mt-1.5" style={{ color: COLORS.textMuted }}>
          {lvl.next ? `${lvl.toNext} XP to Level ${lvl.next.level}` : 'Max level reached \u2014 Tech Champion!'}
        </div>
        <JourneyPath level={lvl.level} />
      </Card>

      <div className="flex gap-2 flex-wrap">
        <StatChip icon={Zap} label="Total XP" value={xp} color={COLORS.xp} />
        <StatChip icon={Flame} label="Streak" value={streak} color={COLORS.reward} />
        <StatChip icon={Trophy} label="Badges" value={badgeCount} color={COLORS.challenge} />
        <StatChip icon={Rocket} label="Level" value={lvl.level} color={COLORS.robotics} />
        <StatChip icon={Heart} label="Behavior" value={behaviorPts} color={COLORS.behavior} />
      </div>

      <Card style={{ borderColor: `${COLORS.challenge}55` }}>
        <SectionLabel icon={Target} color={COLORS.challenge}>Today's Mission</SectionLabel>
        <div className="text-sm font-semibold mb-2">{mission.text}</div>
        <div className="flex gap-2 flex-wrap text-[11px] font-bold mb-1">
          <span className="px-2 py-1 rounded-full" style={{ background: `${COLORS.xp}22`, color: COLORS.xp }}>+{mission.xpReward} XP</span>
          <span className="px-2 py-1 rounded-full" style={{ background: `${COLORS.behavior}22`, color: COLORS.behavior }}>+{mission.behaviorPoints} Behavior Points</span>
          {mission.badgeHint && <span className="px-2 py-1 rounded-full" style={{ background: `${COLORS.challenge}22`, color: COLORS.challenge }}>{'\u{1F3C5}'} {mission.badgeHint} progress</span>}
        </div>
        {missionDone && <div className="text-[11px] font-bold mt-1" style={{ color: COLORS.success }}>{'\u2713 Completed \u2014 nice work!'}</div>}
      </Card>

      <div>
        <SectionLabel icon={Heart} color={COLORS.behavior}>Character &amp; Behavior</SectionLabel>
        <Card>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            {QUALITIES.map(q => {
              const pct = Math.min(100, categoryCount(state, student.id, q.category) * 20);
              return (
                <div key={q.label}>
                  <div className="flex justify-between text-[11.5px] font-semibold mb-1">
                    <span>{q.label}</span><span style={{ color: COLORS.behavior }} className="font-mono">{pct}%</span>
                  </div>
                  <Bar value={pct} color={COLORS.behavior} />
                </div>
              );
            })}
          </div>
          <div className="text-[11px] font-medium mt-3 pt-3 border-t" style={{ color: COLORS.textMuted, borderColor: COLORS.border }}>
            You're becoming a stronger team player! Keep it up.
          </div>
        </Card>
      </div>

      {goals.length > 0 && (
        <div>
          <SectionLabel icon={Target} color={COLORS.coding}>My Goals</SectionLabel>
          <div className="space-y-2">
            {goals.map(g => (
              <Card key={g.id} className="!p-3">
                <div className="flex justify-between text-xs font-semibold mb-1.5"><span>{g.text}</span><span className="font-mono" style={{ color: COLORS.coding }}>{g.progress}/{g.target}</span></div>
                <Bar value={(g.progress / g.target) * 100} color={COLORS.coding} />
              </Card>
            ))}
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div>
          <SectionLabel icon={ClipboardList}>Recent Recognitions</SectionLabel>
          <div className="space-y-1.5">
            {log.map(l => (
              <div key={l.id} className="flex justify-between text-xs rounded-lg px-3 py-2 border-l-2" style={{ background: COLORS.panelAlt, borderColor: CATEGORY_COLOR[l.category] }}>
                <span style={{ color: COLORS.text }}>{l.name}</span>
                <span className="font-mono font-bold" style={{ color: COLORS.xp }}>+{l.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card>
        <SectionLabel>How did I behave today?</SectionLabel>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {feelings.map(f => {
            const Icon = f.icon;
            const active = feeling === f.id;
            return (
              <button key={f.id} onClick={() => setFeeling(f.id)} className="flex flex-col items-center gap-1 rounded-lg py-2.5 border transition"
                style={{ borderColor: active ? COLORS.xp : COLORS.border, background: active ? `${COLORS.xp}18` : 'transparent' }}>
                <Icon size={17} style={{ color: active ? COLORS.xp : COLORS.textMuted }} />
                <span className="text-[8.5px] text-center leading-tight" style={{ color: COLORS.textMuted }}>{f.label}</span>
              </button>
            );
          })}
        </div>
        <textarea value={improvement} onChange={e => setImprovement(e.target.value)} placeholder="One thing I can improve next lesson\u2026" rows={2}
          className="w-full rounded-lg px-2.5 py-2 text-xs outline-none resize-none mb-2 border"
          style={{ background: COLORS.panelSoft, borderColor: COLORS.border, color: COLORS.text }} />
        <button disabled={!feeling} onClick={() => { onReflect(feeling, improvement); setFeeling(null); setImprovement(''); }}
          className="w-full font-bold text-xs rounded-lg py-2.5 transition disabled:opacity-30"
          style={{ background: COLORS.behavior, color: '#0B0F16' }}>Save Reflection</button>
        {reflections.length > 0 && (
          <div className="mt-3 pt-3 border-t space-y-1" style={{ borderColor: COLORS.border }}>
            {reflections.map(r => <div key={r.id} className="text-[10.5px]" style={{ color: COLORS.textMuted }}>{new Date(r.date).toLocaleDateString()} {'\u2014'} {r.improvement || '(no note)'}</div>)}
          </div>
        )}
      </Card>
    </div>
  );
}

function AchievementsTab({ state, student }) {
  const earned = state.studentBadges[student.id] || [];
  return (
    <div>
      <SectionLabel icon={Trophy} color={COLORS.xp}>Achievement Wall</SectionLabel>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {BADGE_DEFS.map(bd => {
          const isEarned = earned.includes(bd.id);
          let progressText = bd.criteria;
          if (!isEarned) {
            const have = bd.type === 'academic' ? (state.academicPoints[student.id] || 0) : categoryCount(state, student.id, bd.category);
            const remaining = Math.max(0, bd.threshold - have);
            progressText = bd.type === 'academic' ? `${remaining} more academic pts to unlock` : `${remaining} more to unlock`;
          }
          return <BadgeTile key={bd.id} def={bd} earned={isEarned} progressText={progressText} />;
        })}
      </div>
    </div>
  );
}

function StoreTab({ state, student, onRedeem }) {
  const balance = spendableXP(state, student.id);
  const history = state.redemptions.filter(r => r.studentId === student.id).slice(0, 5);
  return (
    <div className="space-y-4">
      <Card style={{ background: `linear-gradient(135deg, ${COLORS.panel}, ${COLORS.panelAlt})` }}>
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase" style={{ color: COLORS.textFaint }}>Available to spend</div>
          <div className="text-xl font-black font-mono" style={{ color: COLORS.reward }}>{balance} XP</div>
        </div>
      </Card>
      <SectionLabel icon={Gift} color={COLORS.reward}>Reward Store</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-3">
        {state.rewards.map(r => {
          const Icon = ICONS[r.icon] || Gift;
          const affordable = balance >= r.cost;
          return (
            <Card key={r.id} className="flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${COLORS.reward}22` }}>
                <Icon size={18} style={{ color: COLORS.reward }} />
              </div>
              <div className="text-sm font-bold">{r.name}</div>
              <div className="text-[11px]" style={{ color: COLORS.textMuted }}>{r.description}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono font-bold text-sm" style={{ color: COLORS.xp }}>{r.cost} XP</span>
                <button disabled={!affordable} onClick={() => onRedeem(r)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-30 transition"
                  style={{ background: affordable ? COLORS.reward : COLORS.panelSoft, color: affordable ? '#0B0F16' : COLORS.textFaint }}>
                  {affordable ? 'Redeem' : 'Locked'}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
      {history.length > 0 && (
        <div>
          <SectionLabel>Redemption History</SectionLabel>
          <div className="space-y-1.5">
            {history.map(h => {
              const r = state.rewards.find(x => x.id === h.rewardId);
              return <div key={h.id} className="text-xs rounded-lg px-3 py-2" style={{ background: COLORS.panelAlt, color: COLORS.textMuted }}>
                {new Date(h.date).toLocaleDateString()} {'\u2014'} {r ? r.name : 'Reward'}
              </div>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LeaderboardTab({ state }) {
  const ranked = [...state.students].sort((a, b) => totalXP(state, b.id) - totalXP(state, a.id));
  const top3 = ranked.slice(0, 3);
  const mostImproved = computeMostImproved(state);
  const categories = [
    { label: 'Best Team Player', icon: Users, color: COLORS.behavior, leader: categoryLeader(state, 'Teamwork') },
    { label: 'Top Problem Solver', icon: Brain, color: COLORS.robotics, leader: categoryLeader(state, 'Problem Solving & Mindset') },
    { label: 'Robotics Champion', icon: Bot, color: COLORS.robotics, leader: categoryLeader(state, 'Robotics Behavior') },
    { label: 'Coding Champion', icon: Code2, color: COLORS.coding, leader: academicLeader(state) },
  ];
  const medalColor = ['#F5C948', '#C7D0DA', '#D89A5E'];

  return (
    <div className="space-y-5">
      <div>
        <SectionLabel icon={Trophy} color={COLORS.xp}>Top of the Class</SectionLabel>
        <div className="grid grid-cols-3 gap-2 items-end">
          {[top3[1], top3[0], top3[2]].map((st, i) => {
            if (!st) return <div key={i} />;
            const place = i === 1 ? 1 : i === 0 ? 2 : 3;
            const h = place === 1 ? 108 : place === 2 ? 84 : 68;
            return (
              <div key={st.id} className="flex flex-col items-center gap-1.5">
                <div className="text-xl">{place === 1 ? '\u{1F947}' : place === 2 ? '\u{1F948}' : '\u{1F949}'}</div>
                <div className="text-xs font-bold text-center">{st.name}</div>
                <div className="text-[10px] font-mono" style={{ color: COLORS.xp }}>{totalXP(state, st.id)} XP</div>
                <div className="w-full rounded-t-lg" style={{ height: h, background: `linear-gradient(180deg, ${medalColor[place - 1]}55, ${medalColor[place - 1]}18)`, border: `1px solid ${medalColor[place - 1]}66` }} />
              </div>
            );
          })}
        </div>
      </div>

      {mostImproved && (
        <Card style={{ borderColor: `${COLORS.coding}55` }}>
          <div className="flex items-center gap-2 text-xs font-bold mb-1" style={{ color: COLORS.coding }}><TrendingUp size={14} /> Most Improved</div>
          <div className="text-sm font-semibold">{mostImproved.student.name} {'\u2014 great comeback lately!'}</div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map(c => (
          <Card key={c.label}>
            <div className="flex items-center gap-1.5 text-[11px] font-bold mb-1.5" style={{ color: c.color }}><c.icon size={13} /> {c.label}</div>
            <div className="text-sm font-semibold">{c.leader ? c.leader.student.name : '\u2014'}</div>
            {c.leader && <div className="text-[10.5px] font-mono mt-0.5" style={{ color: COLORS.textMuted }}>{c.leader.pts} pts</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- Teacher App ----------------------------------- */

function TeacherApp({ state, persist }) {
  const [tab, setTab] = useState('overview');
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'badges', label: 'Badges', icon: Trophy },
    { id: 'store', label: 'Store', icon: Gift },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-black">Teacher Console</h1>
        <p className="text-xs" style={{ color: COLORS.textFaint }}>{'Reward \u2192 recognize \u2192 encourage \u2192 improve.'}</p>
      </div>
      <NavTabs tabs={tabs} active={tab} onChange={setTab} accent={COLORS.robotics} />
      {tab === 'overview' && <OverviewTab state={state} persist={persist} />}
      {tab === 'missions' && <MissionsTab state={state} persist={persist} />}
      {tab === 'badges' && <BadgesTab state={state} />}
      {tab === 'store' && <StoreManageTab state={state} persist={persist} />}
      {tab === 'analytics' && <AnalyticsTab state={state} />}
    </div>
  );
}

function OverviewTab({ state, persist }) {
  const [expanded, setExpanded] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const roster = [...state.students].sort((a, b) => totalXP(state, b.id) - totalXP(state, a.id));
  const mostImproved = computeMostImproved(state);
  const needsEncouragement = computeNeedsEncouragement(state);
  const avgXP = Math.round(state.students.reduce((s, st) => s + totalXP(state, st.id), 0) / state.students.length) || 0;
  const totalBadges = Object.values(state.studentBadges).reduce((s, arr) => s + arr.length, 0);
  const activeStreaks = state.students.filter(st => computeStreak(state, st.id) >= 2).length;

  function addAcademic(id, delta) { persist(prev => ({ ...prev, academicPoints: { ...prev.academicPoints, [id]: (prev.academicPoints[id] || 0) + delta } })); }
  function addNote(id, text) { persist(prev => ({ ...prev, notes: [{ id: uid('note'), studentId: id, text, date: new Date().toISOString() }, ...prev.notes] })); }

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        <StatChip icon={Zap} label="Avg XP" value={avgXP} color={COLORS.xp} />
        <StatChip icon={Trophy} label="Badges Awarded" value={totalBadges} color={COLORS.challenge} />
        <StatChip icon={Flame} label="Active Streaks" value={activeStreaks} color={COLORS.reward} />
        <StatChip icon={Users} label="Class Size" value={state.students.length} color={COLORS.robotics} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {mostImproved && (
          <Card style={{ borderColor: `${COLORS.coding}55` }}>
            <div className="flex items-center gap-2 text-xs font-bold mb-1" style={{ color: COLORS.coding }}><TrendingUp size={14} /> Most Improved</div>
            <div className="text-sm font-semibold">{mostImproved.student.name} {'\u2014 great comeback lately.'}</div>
          </Card>
        )}
        {needsEncouragement.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 text-xs font-bold mb-1" style={{ color: COLORS.textMuted }}><Heart size={14} /> May benefit from encouragement</div>
            <div className="text-sm font-semibold">{needsEncouragement.map(x => x.student.name).join(', ')}</div>
          </Card>
        )}
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: COLORS.border }}>
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: COLORS.panelAlt, color: COLORS.textFaint }}>
          <div>Student</div><div className="w-14 text-right">Level</div><div className="w-16 text-right">XP</div><div className="w-14 text-right">Badges</div>
        </div>
        {roster.map(st => {
          const lvl = levelInfo(totalXP(state, st.id));
          const isOpen = expanded === st.id;
          return (
            <div key={st.id} className="border-t" style={{ borderColor: COLORS.border }}>
              <button onClick={() => setExpanded(isOpen ? null : st.id)} className="w-full grid grid-cols-[1fr_auto_auto_auto] gap-2 px-4 py-3 items-center text-left transition">
                <div className="flex items-center gap-2">
                  <ChevronRight size={14} style={{ color: COLORS.textFaint, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                  <span className="text-sm font-semibold">{st.name}</span>
                </div>
                <div className="w-14 text-right text-xs font-mono" style={{ color: COLORS.challenge }}>{lvl.level}</div>
                <div className="w-16 text-right text-xs font-mono" style={{ color: COLORS.xp }}>{totalXP(state, st.id)}</div>
                <div className="w-14 text-right text-xs font-mono">{(state.studentBadges[st.id] || []).length}</div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 grid md:grid-cols-2 gap-4" style={{ background: COLORS.panelSoft }}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10.5px] font-bold uppercase" style={{ color: COLORS.textFaint }}>Academic points</div>
                      <div className="flex gap-1">
                        <button onClick={() => addAcademic(st.id, 10)} className="text-[10px] px-2 py-1 rounded border font-semibold" style={{ borderColor: COLORS.border, color: COLORS.coding }}>+10</button>
                        <button onClick={() => addAcademic(st.id, 25)} className="text-[10px] px-2 py-1 rounded border font-semibold" style={{ borderColor: COLORS.border, color: COLORS.coding }}>+25</button>
                      </div>
                    </div>
                    <div className="text-xl font-mono font-black" style={{ color: COLORS.coding }}>{state.academicPoints[st.id] || 0}</div>
                  </div>
                  <div>
                    <div className="text-[10.5px] font-bold uppercase mb-2 flex items-center gap-1.5" style={{ color: COLORS.textFaint }}><MessageSquare size={11} /> Private notes</div>
                    <div className="flex gap-2 mb-2">
                      <input value={noteDraft} onChange={e => setNoteDraft(e.target.value)} placeholder="Add a note\u2026" style={inputStyle} />
                      <button onClick={() => { if (noteDraft.trim()) { addNote(st.id, noteDraft.trim()); setNoteDraft(''); } }} className="text-xs px-2.5 rounded-lg font-semibold shrink-0" style={{ background: COLORS.panelAlt, color: COLORS.text }}>Add</button>
                    </div>
                    <ul className="space-y-1 max-h-24 overflow-auto">
                      {state.notes.filter(n => n.studentId === st.id).map(n => (
                        <li key={n.id} className="text-[11px]" style={{ color: COLORS.textMuted }}><span style={{ color: COLORS.textFaint }}>{new Date(n.date).toLocaleDateString()}:</span> {n.text}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MissionsTab({ state, persist }) {
  const mission = state.mission;
  const [text, setText] = useState(mission.text);
  const [xpReward, setXpReward] = useState(mission.xpReward);
  const [behaviorPoints, setBehaviorPoints] = useState(mission.behaviorPoints);
  const [badgeHint, setBadgeHint] = useState(mission.badgeHint);

  function saveMission() {
    persist(prev => ({ ...prev, mission: { ...prev.mission, text, xpReward: Number(xpReward), behaviorPoints: Number(behaviorPoints), badgeHint } }));
  }
  function markComplete(studentId) {
    persist(prev => {
      if (prev.mission.completedBy.includes(studentId)) return prev;
      const entry = { id: uid('log'), studentId, behaviorId: 'mission', category: 'Participation', name: `Mission: ${prev.mission.text}`, points: Number(prev.mission.behaviorPoints), comment: '', date: new Date().toISOString() };
      return {
        ...prev,
        behaviorLog: [...prev.behaviorLog, entry],
        academicPoints: { ...prev.academicPoints, [studentId]: (prev.academicPoints[studentId] || 0) + Number(prev.mission.xpReward) },
        mission: { ...prev.mission, completedBy: [...prev.mission.completedBy, studentId] },
      };
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <SectionLabel icon={Target} color={COLORS.challenge}>Today's Mission</SectionLabel>
        <div className="space-y-3">
          <Field label="Mission"><textarea value={text} onChange={e => setText(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'none' }} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="XP reward"><input type="number" value={xpReward} onChange={e => setXpReward(e.target.value)} style={inputStyle} /></Field>
            <Field label="Behavior points"><input type="number" value={behaviorPoints} onChange={e => setBehaviorPoints(e.target.value)} style={inputStyle} /></Field>
          </div>
          <Field label="Badge progress hint"><input value={badgeHint} onChange={e => setBadgeHint(e.target.value)} style={inputStyle} /></Field>
          <button onClick={saveMission} className="w-full font-bold text-xs rounded-lg py-2.5" style={{ background: COLORS.challenge, color: '#0B0F16' }}>Save Mission</button>
        </div>
      </Card>

      <div>
        <SectionLabel>Mark Complete</SectionLabel>
        <div className="space-y-1.5">
          {state.students.map(st => {
            const done = mission.completedBy.includes(st.id);
            return (
              <div key={st.id} className="flex items-center justify-between rounded-xl border px-3.5 py-2.5" style={{ borderColor: COLORS.border, background: COLORS.panel }}>
                <span className="text-sm font-medium">{st.name}</span>
                <button onClick={() => markComplete(st.id)} disabled={done} className="text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-40 flex items-center gap-1"
                  style={{ background: done ? COLORS.panelSoft : COLORS.success, color: done ? COLORS.success : '#0B0F16' }}>
                  <CheckCircle2 size={13} /> {done ? 'Completed' : 'Mark done'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BadgesTab({ state }) {
  return (
    <div>
      <SectionLabel icon={Trophy} color={COLORS.xp}>Badge Definitions</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {BADGE_DEFS.map(bd => {
          const Icon = ICONS[bd.icon] || Award;
          const earnedCount = state.students.filter(st => (state.studentBadges[st.id] || []).includes(bd.id)).length;
          return (
            <Card key={bd.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: `${COLORS.xp}22` }}>
                <Icon size={18} style={{ color: COLORS.xp }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">{bd.name}</div>
                <div className="text-[11px]" style={{ color: COLORS.textMuted }}>{bd.criteria}</div>
              </div>
              <div className="text-xs font-mono font-bold shrink-0" style={{ color: COLORS.textFaint }}>{earnedCount}/{state.students.length}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function StoreManageTab({ state, persist }) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState(200);
  const [description, setDescription] = useState('');

  function addReward() {
    if (!name.trim()) return;
    persist(prev => ({ ...prev, rewards: [...prev.rewards, { id: uid('r'), icon: 'Star', name: name.trim(), cost: Number(cost), description }] }));
    setName(''); setDescription(''); setCost(200);
  }
  function removeReward(id) { persist(prev => ({ ...prev, rewards: prev.rewards.filter(r => r.id !== id) })); }
  function updateCost(id, val) { persist(prev => ({ ...prev, rewards: prev.rewards.map(r => r.id === id ? { ...r, cost: Number(val) } : r) })); }

  return (
    <div className="space-y-5">
      <Card>
        <SectionLabel icon={Plus} color={COLORS.reward}>Add a reward</SectionLabel>
        <div className="space-y-3">
          <Field label="Name"><input value={name} onChange={e => setName(e.target.value)} style={inputStyle} /></Field>
          <div className="grid grid-cols-[1fr_100px] gap-3">
            <Field label="Description"><input value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} /></Field>
            <Field label="XP cost"><input type="number" value={cost} onChange={e => setCost(e.target.value)} style={inputStyle} /></Field>
          </div>
          <button onClick={addReward} className="w-full font-bold text-xs rounded-lg py-2.5" style={{ background: COLORS.reward, color: '#0B0F16' }}>Add to store</button>
        </div>
      </Card>
      <div>
        <SectionLabel icon={Gift} color={COLORS.reward}>Store items</SectionLabel>
        <div className="space-y-2">
          {state.rewards.map(r => (
            <div key={r.id} className="flex items-center gap-3 rounded-xl border px-3.5 py-2.5" style={{ borderColor: COLORS.border, background: COLORS.panel }}>
              <div className="flex-1">
                <div className="text-sm font-semibold">{r.name}</div>
                <div className="text-[11px]" style={{ color: COLORS.textMuted }}>{r.description}</div>
              </div>
              <input type="number" defaultValue={r.cost} onBlur={e => updateCost(r.id, e.target.value)} className="w-16 text-xs text-right font-mono rounded-md px-2 py-1 border" style={{ background: COLORS.panelSoft, borderColor: COLORS.border, color: COLORS.xp }} />
              <button onClick={() => removeReward(r.id)} style={{ color: COLORS.textFaint }}><X size={15} /></button>
            </div>
          ))}
        </div>
      </div>
      {state.redemptions.length > 0 && (
        <div>
          <SectionLabel>Redemption Log</SectionLabel>
          <div className="space-y-1.5">
            {state.redemptions.slice(0, 8).map(h => {
              const st = state.students.find(s => s.id === h.studentId);
              const r = state.rewards.find(x => x.id === h.rewardId);
              return <div key={h.id} className="text-xs rounded-lg px-3 py-2" style={{ background: COLORS.panelAlt, color: COLORS.textMuted }}>
                {new Date(h.date).toLocaleDateString()} {'\u2014'} <b style={{ color: COLORS.text }}>{st?.name}</b> redeemed {r?.name || 'a reward'}
              </div>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsTab({ state }) {
  const maxXP = Math.max(1, ...state.students.map(st => totalXP(state, st.id)));
  const catTotals = CATEGORY_ORDER.map(cat => ({ cat, pts: state.behaviorLog.filter(l => l.category === cat).reduce((s, l) => s + l.points, 0) }));
  const maxCat = Math.max(1, ...catTotals.map(c => c.pts));

  return (
    <div className="space-y-5">
      <div>
        <SectionLabel icon={BarChart3} color={COLORS.robotics}>XP by Student</SectionLabel>
        <Card className="space-y-2.5">
          {[...state.students].sort((a, b) => totalXP(state, b.id) - totalXP(state, a.id)).map(st => (
            <div key={st.id}>
              <div className="flex justify-between text-xs font-semibold mb-1"><span>{st.name}</span><span className="font-mono" style={{ color: COLORS.xp }}>{totalXP(state, st.id)}</span></div>
              <Bar value={(totalXP(state, st.id) / maxXP) * 100} color={COLORS.xp} />
            </div>
          ))}
        </Card>
      </div>
      <div>
        <SectionLabel icon={Medal} color={COLORS.behavior}>Recognitions by Category</SectionLabel>
        <Card className="space-y-2.5">
          {catTotals.filter(c => c.pts > 0).map(c => (
            <div key={c.cat}>
              <div className="flex justify-between text-xs font-semibold mb-1"><span>{c.cat}</span><span className="font-mono" style={{ color: CATEGORY_COLOR[c.cat] }}>{c.pts}</span></div>
              <Bar value={(c.pts / maxCat) * 100} color={CATEGORY_COLOR[c.cat]} />
            </div>
          ))}
          {catTotals.every(c => c.pts === 0) && <div className="text-xs" style={{ color: COLORS.textFaint }}>No recognitions logged yet.</div>}
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------- Recognize modal ---------------------------------- */

function RecognizeModal({ state, onClose, onSubmit }) {
  const [studentId, setStudentId] = useState(state.students[0].id);
  const [behaviorId, setBehaviorId] = useState(state.behaviors[0].id);
  const [points, setPoints] = useState(state.behaviors[0].points);
  const [comment, setComment] = useState('');
  const grouped = CATEGORY_ORDER.map(cat => ({ category: cat, items: state.behaviors.filter(b => b.category === cat) })).filter(g => g.items.length);

  function handleBehaviorChange(id) {
    setBehaviorId(id);
    const b = state.behaviors.find(x => x.id === id);
    if (b) setPoints(b.points);
  }

  return (
    <ModalShell onClose={onClose} title="Recognize Positive Behavior">
      <div className="space-y-4">
        <Field label="Student">
          <select value={studentId} onChange={e => setStudentId(e.target.value)} style={inputStyle}>
            {state.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Behavior">
          <select value={behaviorId} onChange={e => handleBehaviorChange(e.target.value)} style={inputStyle}>
            {grouped.map(g => <optgroup key={g.category} label={g.category}>{g.items.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</optgroup>)}
          </select>
        </Field>
        <Field label="Points"><input type="number" value={points} onChange={e => setPoints(e.target.value)} style={inputStyle} /></Field>
        <Field label="Comment (optional)"><textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="You supported your team and helped them solve the problem." style={{ ...inputStyle, resize: 'none' }} /></Field>
        <button onClick={() => onSubmit({ studentId, behaviorId, points, comment })} className="w-full font-bold text-sm rounded-lg py-2.5" style={{ background: COLORS.xp, color: '#0B0F16' }}>
          Award Recognition
        </button>
      </div>
    </ModalShell>
  );
}
