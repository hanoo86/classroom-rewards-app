import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Brain, Wrench, Heart, Rocket, Award, Shield, Sparkles, CheckCircle2,
  Target, MessageSquare, Plus, X, ChevronRight, TrendingUp,
  UserCircle2, Smile, Meh, HelpCircle, Loader2, Flame, Trophy, Crown,
  Lightbulb, Bot, Armchair, Code2, Star, Lock, Zap, BarChart3, Gift,
  LayoutGrid, Medal, ClipboardList, LogOut, LogIn,
  Settings, Bell, GraduationCap, ShieldCheck, Download, Printer,
  CalendarDays, UserPlus, Building2, Percent, ListChecks, Trash2
} from 'lucide-react';
import { supabase } from './supabaseClient';

/* ---------------------------------- palette --------------------------------- */

const COLORS = {
  bg: '#F4F5FB', panel: '#FFFFFF', panelAlt: '#F1EEFE', panelSoft: '#F7F8FC',
  border: '#E7E8F3', borderStrong: '#D6D8EC',
  text: '#20223B', textMuted: '#686D8C', textFaint: '#9498B3',
  xp: '#7C5CFC', behavior: '#22C55E', robotics: '#3B82F6',
  coding: '#6366F1', challenge: '#F97316', reward: '#F59E0B', success: '#22C55E',
  onAccent: '#FFFFFF',
  sidebarBg: '#1E1B3A', sidebarText: '#B7B4D6', sidebarActive: '#7C5CFC',
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

/* ---------------------------- classes & competition ---------------------------- */

const DEFAULT_CLASSES = [
  { id: 'c1', name: '6A' }, { id: 'c2', name: '6B' }, { id: 'c3', name: '6C' },
  { id: 'c4', name: '7A' }, { id: 'c5', name: '7B' }, { id: 'c6', name: '7C' },
];

const BEHAVIOR_ASSESS_CATEGORIES = CATEGORY_ORDER.filter(c => PILLAR_MAP[c] === 'behavior');
// Respect, Cooperation(=Teamwork), Participation, Responsibility, Discipline, Digital Citizenship
const ACADEMIC_CATEGORIES = ['Assignments', 'Tests', 'Projects', 'Participation', 'Problem Solving', 'Creativity'];

const DEFAULT_COMPETITION_WEIGHTS = { points: 40, behavior: 30, academic: 30 };

function monthKeyOf(iso) { return (iso || '').slice(0, 7); }
function currentMonthKey() { return new Date().toISOString().slice(0, 7); }
function monthLabel(key) {
  if (!key) return '';
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function defaultState() {
  return {
    students: DEFAULT_STUDENTS.map(s => ({ ...s, classId: 'c1' })),
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
    // --- school-wide extension ---
    classes: DEFAULT_CLASSES,
    teacherAssignments: {}, // { [email]: { isAdmin, classId } }
    behaviorAssessments: [], // { id, studentId, classId, teacherEmail, date, ratings:{cat:1-5}, comment }
    academicAssessments: [], // { id, studentId, classId, teacherEmail, date, scores:{cat:0-100}, comment }
    challenges: [], // { id, name, description, startDate, endDate, points, scope:'student'|'class', eligibleClasses:[], status, completedBy:[] }
    notifications: [], // { id, scope:'student'|'class'|'broadcast', targetId, message, date, read }
    competitions: [], // finalized monthly snapshots: { monthKey, weights, results:[...], winnerClassId, closedAt }
    competitionConfig: { weights: DEFAULT_COMPETITION_WEIGHTS },
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
/* ------------------------- classes, assessments, competition ------------------------- */

function studentsInClass(state, classId) { return state.students.filter(s => s.classId === classId); }
function className(state, classId) { return (state.classes.find(c => c.id === classId) || {}).name || 'Unassigned'; }
function classPointsTotal(state, classId) { return studentsInClass(state, classId).reduce((s, st) => s + totalXP(state, st.id), 0); }

function studentBehaviorAssessments(state, studentId) { return state.behaviorAssessments.filter(a => a.studentId === studentId).sort((a, b) => b.date.localeCompare(a.date)); }
function studentAcademicAssessments(state, studentId) { return state.academicAssessments.filter(a => a.studentId === studentId).sort((a, b) => b.date.localeCompare(a.date)); }

function avgOf(obj) { const v = Object.values(obj); return v.length ? v.reduce((a, b) => a + Number(b), 0) / v.length : null; }

function studentBehaviorScorePct(state, studentId) {
  const latest = studentBehaviorAssessments(state, studentId)[0];
  if (!latest) return null;
  const avg = avgOf(latest.ratings); // 1-5 scale
  return avg == null ? null : Math.round(avg * 20);
}
function studentAcademicScorePct(state, studentId) {
  const latest = studentAcademicAssessments(state, studentId)[0];
  if (!latest) return null;
  const avg = avgOf(latest.scores); // already 0-100
  return avg == null ? null : Math.round(avg);
}

function classMonthlyPointsAvg(state, classId, monthKey) {
  const studs = studentsInClass(state, classId);
  if (!studs.length) return 0;
  const total = studs.reduce((sum, s) => sum + state.behaviorLog.filter(l => l.studentId === s.id && monthKeyOf(l.date) === monthKey).reduce((a, l) => a + l.points, 0), 0);
  return total / studs.length;
}
function classBehaviorScore(state, classId, monthKey) {
  const rows = state.behaviorAssessments.filter(a => a.classId === classId && monthKeyOf(a.date) === monthKey);
  if (!rows.length) return 0;
  const vals = rows.map(r => avgOf(r.ratings)).filter(v => v != null);
  return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 20) : 0;
}
function classAcademicScore(state, classId, monthKey) {
  const rows = state.academicAssessments.filter(a => a.classId === classId && monthKeyOf(a.date) === monthKey);
  if (!rows.length) return 0;
  const vals = rows.map(r => avgOf(r.scores)).filter(v => v != null);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}

function computeCompetition(state, monthKey) {
  const w = state.competitionConfig.weights;
  const wSum = (Number(w.points) + Number(w.behavior) + Number(w.academic)) || 1;
  const rows = state.classes.map(c => {
    const pointsAvg = classMonthlyPointsAvg(state, c.id, monthKey);
    const behaviorScore = classBehaviorScore(state, c.id, monthKey);
    const academicScore = classAcademicScore(state, c.id, monthKey);
    return { classId: c.id, className: c.name, studentCount: studentsInClass(state, c.id).length, pointsAvg, behaviorScore, academicScore };
  });
  const maxAvg = Math.max(1, ...rows.map(r => r.pointsAvg));
  return {
    monthKey, weights: w,
    results: rows.map(r => {
      const pointsScore = Math.round((r.pointsAvg / maxAvg) * 100);
      const finalScore = Math.round(((pointsScore * w.points + r.behaviorScore * w.behavior + r.academicScore * w.academic) / wSum) * 10) / 10;
      return { ...r, pointsScore, finalScore };
    }).sort((a, b) => b.finalScore - a.finalScore).map((r, i) => ({ ...r, rank: i + 1 })),
  };
}

function pushNotification(state, notif) {
  return [{ id: uid('ntf'), date: new Date().toISOString(), read: false, ...notif }, ...state.notifications].slice(0, 200);
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

/* ------------------------------ demo data generator ------------------------------ */
// Additive only: never touches existing classes/students. Safe to run once from
// the Admin > Classes tab to populate the other demo classes for evaluation.

const DEMO_ROSTER = {
  c2: ['Hassan', 'Nour', 'Khalid', 'Reem', 'Fahad', 'Dana'],
  c3: ['Zayd', 'Lina', 'Tariq', 'Huda', 'Rashid', 'Mona'],
  c4: ['Salem', 'Aisha', 'Waleed', 'Farah', 'Nasser'],
  c5: ['Bader', 'Yara', 'Faisal', 'Amina', 'Talal'],
  c6: ['Majed', 'Salma', 'Adel', 'Noor', 'Karim'],
};
// tuned so 6C (c3) leads August, matching the target-score example in the spec
const DEMO_TUNING = {
  c1: { behavior: 91, academic: 88, pointsPerStudent: 78 },
  c2: { behavior: 94, academic: 86, pointsPerStudent: 82 },
  c3: { behavior: 92, academic: 93, pointsPerStudent: 95 },
  c4: { behavior: 87, academic: 84, pointsPerStudent: 70 },
  c5: { behavior: 85, academic: 81, pointsPerStudent: 65 },
  c6: { behavior: 88, academic: 85, pointsPerStudent: 72 },
};

function buildDemoExpansion(state, teacherEmail) {
  const existingIds = new Set(state.students.map(s => s.id));
  const newStudents = [];
  const newBehaviorLog = [];
  const newBehaviorAssessments = [];
  const newAcademicAssessments = [];
  const thisMonth = currentMonthKey();
  const ageGroups = ['primary', 'middle', 'middle', 'high', 'high'];

  Object.entries(DEMO_ROSTER).forEach(([classId, names]) => {
    names.forEach((name, i) => {
      const id = `demo_${classId}_${i}`;
      if (existingIds.has(id)) return;
      newStudents.push({ id, name, ageGroup: ageGroups[i % ageGroups.length], classId });
    });
  });

  const allDemoStudents = [...state.students.filter(s => s.classId), ...newStudents];
  Object.keys(DEMO_TUNING).forEach(classId => {
    const tune = DEMO_TUNING[classId];
    const studs = allDemoStudents.filter(s => s.classId === classId);
    studs.forEach((s, idx) => {
      const jitter = (idx % 3) - 1; // -1,0,1 small spread per student
      // behavior recognitions this month (drives class points score)
      const recognitions = Math.max(1, Math.round(tune.pointsPerStudent / 10) + jitter);
      for (let r = 0; r < recognitions; r++) {
        const b = DEFAULT_BEHAVIORS[(idx + r) % DEFAULT_BEHAVIORS.length];
        newBehaviorLog.push({
          id: uid('log'), studentId: s.id, behaviorId: b.id, category: b.category, name: b.name,
          points: b.points, comment: '', date: `${thisMonth}-${String(2 + (r % 26)).padStart(2, '0')}T09:00:00.000Z`,
        });
      }
      // one behavior assessment + one academic assessment this month
      const bRatings = {};
      BEHAVIOR_ASSESS_CATEGORIES.forEach((cat, ci) => { bRatings[cat] = Math.max(1, Math.min(5, Math.round(tune.behavior / 20) + ((idx + ci) % 2 === 0 ? 0 : jitter))); });
      newBehaviorAssessments.push({ id: uid('ba'), studentId: s.id, classId, teacherEmail: teacherEmail || 'demo@school.local', date: `${thisMonth}-10T09:00:00.000Z`, ratings: bRatings, comment: 'Demo assessment.' });

      const aScores = {};
      ACADEMIC_CATEGORIES.forEach((cat, ci) => { aScores[cat] = Math.max(50, Math.min(100, tune.academic + (((idx + ci) % 5) - 2))); });
      newAcademicAssessments.push({ id: uid('aa'), studentId: s.id, classId, teacherEmail: teacherEmail || 'demo@school.local', date: `${thisMonth}-10T09:00:00.000Z`, scores: aScores, comment: 'Demo assessment.' });
    });
  });

  const demoCompetitions = [
    { monthKey: '2026-06', weights: DEFAULT_COMPETITION_WEIGHTS, closedAt: '2026-06-30T18:00:00.000Z', winnerClassId: 'c4',
      results: [
        { classId: 'c4', className: '7A', studentCount: 5, pointsAvg: 74, behaviorScore: 90, academicScore: 89, pointsScore: 100, finalScore: 93.7, rank: 1 },
        { classId: 'c3', className: '6C', studentCount: 6, pointsAvg: 70, behaviorScore: 88, academicScore: 90, pointsScore: 95, finalScore: 91.4, rank: 2 },
        { classId: 'c2', className: '6B', studentCount: 6, pointsAvg: 68, behaviorScore: 91, academicScore: 84, pointsScore: 92, finalScore: 89.9, rank: 3 },
        { classId: 'c1', className: '6A', studentCount: 6, pointsAvg: 60, behaviorScore: 89, academicScore: 85, pointsScore: 81, finalScore: 86.0, rank: 4 },
        { classId: 'c5', className: '7B', studentCount: 5, pointsAvg: 55, behaviorScore: 84, academicScore: 80, pointsScore: 74, finalScore: 79.6, rank: 5 },
        { classId: 'c6', className: '7C', studentCount: 5, pointsAvg: 52, behaviorScore: 86, academicScore: 82, pointsScore: 70, finalScore: 79.4, rank: 6 },
      ] },
    { monthKey: '2026-07', weights: DEFAULT_COMPETITION_WEIGHTS, closedAt: '2026-07-31T18:00:00.000Z', winnerClassId: 'c2',
      results: [
        { classId: 'c2', className: '6B', studentCount: 6, pointsAvg: 80, behaviorScore: 93, academicScore: 88, pointsScore: 100, finalScore: 94.3, rank: 1 },
        { classId: 'c3', className: '6C', studentCount: 6, pointsAvg: 76, behaviorScore: 90, academicScore: 91, pointsScore: 95, finalScore: 93.3, rank: 2 },
        { classId: 'c1', className: '6A', studentCount: 6, pointsAvg: 65, behaviorScore: 90, academicScore: 86, pointsScore: 81, finalScore: 85.6, rank: 3 },
        { classId: 'c4', className: '7A', studentCount: 5, pointsAvg: 60, behaviorScore: 86, academicScore: 83, pointsScore: 75, finalScore: 81.6, rank: 4 },
        { classId: 'c6', className: '7C', studentCount: 5, pointsAvg: 58, behaviorScore: 87, academicScore: 84, pointsScore: 73, finalScore: 81.5, rank: 5 },
        { classId: 'c5', className: '7B', studentCount: 5, pointsAvg: 54, behaviorScore: 83, academicScore: 79, pointsScore: 68, finalScore: 76.9, rank: 6 },
      ] },
  ];

  return { newStudents, newBehaviorLog, newBehaviorAssessments, newAcademicAssessments, demoCompetitions };
}

/* ---------------------------------- bits -------------------------------------- */

function Card({ children, style, className = '' }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${className}`} style={{ background: COLORS.panel, borderColor: COLORS.border, boxShadow: '0 1px 3px rgba(32,34,59,0.05)', ...style }}>
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

function StatChip({ icon: Icon, label, value, color, caption }) {
  return (
    <div className="flex-1 rounded-2xl border px-3.5 py-3 flex items-center gap-3 shadow-sm" style={{ minWidth: 140, background: COLORS.panel, borderColor: COLORS.border }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}1A` }}>
        <Icon size={18} style={{ color }} strokeWidth={2.3} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wide truncate" style={{ color: COLORS.textFaint }}>{label}</div>
        <div className="text-lg font-black leading-tight" style={{ color: COLORS.text }}>{value}</div>
        {caption && <div className="text-[9.5px] font-semibold" style={{ color }}>{caption}</div>}
      </div>
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
                  color: st === 'future' ? COLORS.textFaint : COLORS.onAccent,
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
        <Icon size={18} style={{ color: earned ? COLORS.onAccent : COLORS.textFaint }} strokeWidth={2.2} />
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
          style={active === t.id ? { background: accent, color: COLORS.onAccent } : { color: COLORS.textMuted }}>
          <t.icon size={13} /> {t.label}
        </button>
      ))}
    </div>
  );
}

function Sidebar({ tabs, active, onChange, dark, header, footer }) {
  const bg = dark ? COLORS.sidebarBg : COLORS.panel;
  const textCol = dark ? COLORS.sidebarText : COLORS.textMuted;
  const activeBg = dark ? COLORS.sidebarActive : `${COLORS.xp}18`;
  const activeText = dark ? COLORS.onAccent : COLORS.xp;
  return (
    <aside className="hidden md:flex md:flex-col md:w-60 shrink-0 rounded-2xl border shadow-sm overflow-hidden self-start" style={{ background: bg, borderColor: dark ? bg : COLORS.border }}>
      {header && <div className="px-4 pt-4 pb-3">{header}</div>}
      <nav className="px-2.5 pb-3 space-y-0.5 flex-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => onChange(t.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition text-left"
            style={active === t.id ? { background: activeBg, color: activeText } : { color: textCol }}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </nav>
      {footer && <div className="px-3 pb-3">{footer}</div>}
    </aside>
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

function RatingInput({ label, value, onChange, color }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11.5px] font-semibold" style={{ color: COLORS.text }}>{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5">
            <Star size={17} fill={n <= value ? color : 'none'} style={{ color: n <= value ? color : COLORS.border }} strokeWidth={1.8} />
          </button>
        ))}
      </div>
    </div>
  );
}

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
          style={{ background: COLORS.robotics, color: COLORS.onAccent }}>
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

  const email = session?.user?.email;
  const myAssignment = state && email ? state.teacherAssignments[email] : null;

  // Bootstrap: the very first person to sign in with no admin yet on record becomes admin.
  useEffect(() => {
    if (!state || !email) return;
    if (state.teacherAssignments[email]) return;
    const hasAdmin = Object.values(state.teacherAssignments).some(a => a.isAdmin);
    if (!hasAdmin) {
      persist(prev => ({ ...prev, teacherAssignments: { ...prev.teacherAssignments, [email]: { isAdmin: true, classId: null } } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state && Object.keys(state.teacherAssignments || {}).length, email]);

  if (!state) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
      <Loader2 className="animate-spin" style={{ color: COLORS.robotics }} size={28} />
    </div>;
  }

  const myClassId = myAssignment?.classId || null;
  const isAdmin = !!myAssignment?.isAdmin;
  const teacherStudents = myClassId ? state.students.filter(s => s.classId === myClassId) : state.students;

  function awardBehavior({ studentId, behaviorId, points, comment }) {
    const behavior = state.behaviors.find(b => b.id === behaviorId);
    const entry = { id: uid('log'), studentId, behaviorId, category: behavior.category, name: behavior.name, points: Number(points), comment, date: new Date().toISOString() };
    const student = state.students.find(s => s.id === studentId);
    persist(prev => ({
      ...prev,
      behaviorLog: [...prev.behaviorLog, entry],
      notifications: pushNotification(prev, { scope: 'student', targetId: studentId, message: `\u{1F389} Congratulations! You earned ${points} points for ${behavior.name}.` }),
    }));
    const theme = ageTheme(student.ageGroup);
    setToast({ kind: 'xp', title: theme.xpToast(points), body: `${student.name} \u2014 ${behavior.name}` });
    setShowRecognize(false);
  }

  function handleRoleClick(target) {
    if (target !== 'student' && !session) { setShowLogin(true); return; }
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
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${COLORS.robotics}, ${COLORS.coding})` }}>
              <Zap size={16} style={{ color: COLORS.onAccent }} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[14.5px] font-black tracking-tight leading-none">CS &amp; Robotics Lab</div>
              <div className="text-[9.5px] font-semibold tracking-wide leading-none mt-1" style={{ color: COLORS.textFaint }}>TECH JOURNEY PLATFORM</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg p-1 border" style={{ background: COLORS.panelAlt, borderColor: COLORS.border }}>
              <button onClick={() => handleRoleClick('student')} className="px-3 py-1.5 rounded-md text-xs font-bold transition"
                style={role === 'student' ? { background: COLORS.xp, color: COLORS.onAccent } : { color: COLORS.textMuted }}>Student</button>
              <button onClick={() => handleRoleClick('teacher')} className="px-3 py-1.5 rounded-md text-xs font-bold transition"
                style={role === 'teacher' ? { background: COLORS.robotics, color: COLORS.onAccent } : { color: COLORS.textMuted }}>Teacher</button>
              {session && isAdmin && (
                <button onClick={() => handleRoleClick('admin')} className="px-3 py-1.5 rounded-md text-xs font-bold transition"
                  style={role === 'admin' ? { background: COLORS.challenge, color: COLORS.onAccent } : { color: COLORS.textMuted }}>Admin</button>
              )}
            </div>
            {(role === 'teacher' || role === 'admin') && session && (
              <button onClick={handleSignOut} title={email} className="p-2 rounded-lg border" style={{ borderColor: COLORS.border, color: COLORS.textMuted }}>
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-5">
        {role === 'student' && (
          <StudentApp state={state} activeStudentId={activeStudentId} setActiveStudentId={setActiveStudentId} persist={persist} setToast={setToast} />
        )}
        {role === 'teacher' && session && (
          myClassId || isAdmin ? (
            <TeacherApp state={state} persist={persist} classId={myClassId} email={email} setToast={setToast} />
          ) : (
            <Card>
              <div className="text-sm font-bold mb-1">Waiting for class assignment</div>
              <div className="text-xs" style={{ color: COLORS.textMuted }}>
                You're signed in as <b>{email}</b> but not yet assigned to a class. Ask your admin to assign you under Admin {'\u2192'} Team.
              </div>
            </Card>
          )
        )}
        {role === 'admin' && session && isAdmin && (
          <AdminApp state={state} persist={persist} email={email} />
        )}
      </main>

      {showRecognize && <RecognizeModal state={{ ...state, students: teacherStudents.length ? teacherStudents : state.students }} onClose={() => setShowRecognize(false)} onSubmit={awardBehavior} />}
      {showLogin && (
        <TeacherLoginModal onClose={() => setShowLogin(false)} onSuccess={() => { setShowLogin(false); setRole('teacher'); }} />
      )}

      {(role === 'teacher' || role === 'admin') && session && (
        <button onClick={() => setShowRecognize(true)}
          className="fixed bottom-5 right-5 z-30 rounded-full shadow-2xl flex items-center gap-2 px-4 py-3 font-bold text-xs"
          style={{ background: COLORS.xp, color: COLORS.onAccent }}>
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

  const myNotifs = state.notifications.filter(n => n.scope === 'broadcast' || (n.scope === 'student' && n.targetId === student.id) || (n.scope === 'class' && n.targetId === student.classId));
  const unread = myNotifs.filter(n => !n.read).length;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'store', label: 'Reward Store', icon: Gift },
    { id: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
    { id: 'competition', label: 'Class Competition', icon: Medal },
    { id: 'notifications', label: unread ? `Alerts (${unread})` : 'Alerts', icon: Bell },
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

  const sidebarHeader = (
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0" style={{ background: `linear-gradient(135deg, ${COLORS.xp}, ${COLORS.robotics})`, color: COLORS.onAccent }}>
        {student.name.charAt(0)}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold truncate" style={{ color: COLORS.text }}>{student.name}</div>
        <div className="text-[10.5px] font-semibold flex items-center gap-1" style={{ color: COLORS.textFaint }}>
          {student.classId ? className(state, student.classId) : student.ageGroup}
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.success }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="md:flex md:gap-5 items-start">
      <Sidebar tabs={tabs} active={tab} onChange={setTab} header={sidebarHeader} />
      <div className="flex-1 min-w-0 space-y-5">
        <div className="flex items-center gap-2 flex-wrap">
          <UserCircle2 size={17} style={{ color: COLORS.textMuted }} />
          <select value={student.id} onChange={e => setActiveStudentId(e.target.value)}
            className="rounded-lg px-2.5 py-1.5 text-sm font-semibold outline-none border"
            style={{ background: COLORS.panelAlt, borderColor: COLORS.border, color: COLORS.text }}>
            {state.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full" style={{ background: COLORS.panelAlt, color: COLORS.textFaint }}>
            {student.ageGroup} view
          </span>
          {student.classId && (
            <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full flex items-center gap-1" style={{ background: `${COLORS.robotics}18`, color: COLORS.robotics }}>
              <Building2 size={10} /> {className(state, student.classId)}
            </span>
          )}
          <div className="md:hidden ml-auto"><NavTabs tabs={tabs} active={tab} onChange={setTab} accent={COLORS.xp} /></div>
        </div>

        {tab === 'dashboard' && <DashboardTab state={state} student={student} theme={theme} lvl={lvl} xp={xp} onReflect={addReflection} />}
        {tab === 'achievements' && <AchievementsTab state={state} student={student} />}
        {tab === 'store' && <StoreTab state={state} student={student} onRedeem={redeem} />}
        {tab === 'leaderboard' && <LeaderboardTab state={state} />}
        {tab === 'competition' && (
          student.classId
            ? <CompetitionBoard title={`\u{1F3C6} Monthly Class Challenge \u2014 ${monthLabel(currentMonthKey())}`} data={computeCompetition(state, currentMonthKey())} />
            : <div className="text-xs" style={{ color: COLORS.textFaint }}>Not assigned to a class yet.</div>
        )}
        {tab === 'notifications' && (
          <div className="space-y-2">
            <SectionLabel icon={Bell} color={COLORS.xp}>Notifications</SectionLabel>
            {myNotifs.length === 0 && <div className="text-xs" style={{ color: COLORS.textFaint }}>No notifications yet.</div>}
            {myNotifs.slice(0, 30).map(n => (
              <div key={n.id} className="text-xs rounded-lg px-3 py-2.5" style={{ background: COLORS.panelAlt, color: COLORS.text }}>
                <div>{n.message}</div>
                <div className="text-[10px] mt-0.5" style={{ color: COLORS.textFaint }}>{new Date(n.date).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardTab({ state, student, theme, lvl, xp, onReflect }) {
  const streak = computeStreak(state, student.id);
  const badgeCount = (state.studentBadges[student.id] || []).length;
  const behaviorPts = behaviorPillarPoints(state, student.id);
  const behaviorPct = studentBehaviorScorePct(state, student.id);
  const academicPct = studentAcademicScorePct(state, student.id);
  const comp = student.classId ? computeCompetition(state, currentMonthKey()) : null;
  const myClassRow = comp ? comp.results.find(r => r.classId === student.classId) : null;
  const activeChallenges = state.challenges.filter(c => c.status === 'active' && (!c.eligibleClasses?.length || c.eligibleClasses.includes(student.classId)));
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
        <StatChip icon={Heart} label="Behavior" value={behaviorPct != null ? `${behaviorPct}%` : behaviorPts} color={COLORS.behavior} />
        {academicPct != null && <StatChip icon={GraduationCap} label="Academic" value={`${academicPct}%`} color={COLORS.coding} />}
        {myClassRow && <StatChip icon={Trophy} label="Class Rank" value={`#${myClassRow.rank}`} color={COLORS.xp} />}
      </div>

      {activeChallenges.length > 0 && (
        <Card style={{ borderColor: `${COLORS.reward}55` }}>
          <SectionLabel icon={ListChecks} color={COLORS.reward}>Active Challenges</SectionLabel>
          <div className="space-y-2">
            {activeChallenges.map(c => (
              <div key={c.id} className="flex items-center justify-between text-xs rounded-lg px-3 py-2" style={{ background: COLORS.panelAlt }}>
                <div>
                  <div className="font-bold" style={{ color: COLORS.text }}>{c.name}</div>
                  <div style={{ color: COLORS.textFaint }}>{c.description}</div>
                </div>
                <span className="font-mono font-bold shrink-0 ml-2" style={{ color: COLORS.reward }}>+{c.points}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

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
          style={{ background: COLORS.behavior, color: COLORS.onAccent }}>Save Reflection</button>
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
                  style={{ background: affordable ? COLORS.reward : COLORS.panelSoft, color: affordable ? COLORS.onAccent : COLORS.textFaint }}>
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

function TeacherApp({ state, persist, classId, email, setToast }) {
  const [tab, setTab] = useState('overview');
  const scoped = { ...state, students: classId ? state.students.filter(s => s.classId === classId) : state.students };
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'assessments', label: 'Assessments', icon: ClipboardList },
    { id: 'challenges', label: 'Challenges', icon: ListChecks },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'badges', label: 'Badges', icon: Trophy },
    { id: 'store', label: 'Store', icon: Gift },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const sidebarHeader = (
    <div>
      <div className="text-[11px] font-black uppercase tracking-wide flex items-center gap-1.5" style={{ color: COLORS.sidebarActive }}>
        <ShieldCheck size={13} /> Teacher Console
      </div>
      <div className="text-sm font-bold mt-1" style={{ color: COLORS.onAccent }}>{classId ? className(state, classId) : 'All Classes'}</div>
      <div className="text-[10.5px] mt-0.5" style={{ color: COLORS.sidebarText }}>{scoped.students.length} Students</div>
    </div>
  );

  return (
    <div className="md:flex md:gap-5 items-start">
      <Sidebar tabs={tabs} active={tab} onChange={setTab} dark header={sidebarHeader} />
      <div className="flex-1 min-w-0 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-black">Teacher Console {classId ? `\u2014 ${className(state, classId)}` : ''}</h1>
            <p className="text-xs" style={{ color: COLORS.textFaint }}>{'Reward \u2192 recognize \u2192 encourage \u2192 improve.'}</p>
          </div>
          {classId && <ClassCompetitionChip state={state} classId={classId} />}
        </div>
        <div className="md:hidden"><NavTabs tabs={tabs} active={tab} onChange={setTab} accent={COLORS.robotics} /></div>
        {tab === 'overview' && <OverviewTab state={scoped} persist={persist} />}
        {tab === 'assessments' && <AssessmentsTab state={scoped} persist={persist} classId={classId} email={email} setToast={setToast} />}
        {tab === 'challenges' && <ChallengesTab state={state} persist={persist} classId={classId} scopedStudents={scoped.students} isAdmin={!classId} />}
        {tab === 'missions' && <MissionsTab state={scoped} persist={persist} />}
        {tab === 'badges' && <BadgesTab state={scoped} />}
        {tab === 'store' && <StoreManageTab state={scoped} persist={persist} />}
        {tab === 'analytics' && <AnalyticsTab state={scoped} />}
      </div>
    </div>
  );
}

function ClassCompetitionChip({ state, classId }) {
  const comp = computeCompetition(state, currentMonthKey());
  const row = comp.results.find(r => r.classId === classId);
  if (!row) return null;
  return (
    <div className="text-xs font-bold rounded-lg px-3 py-2 border flex items-center gap-2" style={{ borderColor: COLORS.border, background: COLORS.panelAlt }}>
      <Trophy size={13} style={{ color: COLORS.xp }} />
      <span>Class Rank #{row.rank}/{comp.results.length}</span>
      <span className="font-mono" style={{ color: COLORS.xp }}>{row.finalScore}</span>
    </div>
  );
}

function OverviewTab({ state, persist }) {
  const [expanded, setExpanded] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const roster = [...state.students].sort((a, b) => totalXP(state, b.id) - totalXP(state, a.id));
  const mostImproved = computeMostImproved(state);
  const needsEncouragement = computeNeedsEncouragement(state);
  const avgXP = state.students.length ? Math.round(state.students.reduce((s, st) => s + totalXP(state, st.id), 0) / state.students.length) : 0;
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
          <button onClick={saveMission} className="w-full font-bold text-xs rounded-lg py-2.5" style={{ background: COLORS.challenge, color: COLORS.onAccent }}>Save Mission</button>
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
                  style={{ background: done ? COLORS.panelSoft : COLORS.success, color: done ? COLORS.success : COLORS.onAccent }}>
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
          <button onClick={addReward} className="w-full font-bold text-xs rounded-lg py-2.5" style={{ background: COLORS.reward, color: COLORS.onAccent }}>Add to store</button>
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

/* ------------------------------- Assessments (behavior + academic) ---------------------------------- */

function AssessmentsTab({ state, persist, classId, email, setToast }) {
  const [mode, setMode] = useState(null); // 'behavior' | 'academic'
  const [studentId, setStudentId] = useState(state.students[0]?.id);

  function saveBehavior(ratings, comment) {
    const entry = { id: uid('ba'), studentId, classId: classId || state.students.find(s => s.id === studentId)?.classId, teacherEmail: email, date: new Date().toISOString(), ratings, comment };
    persist(prev => ({ ...prev, behaviorAssessments: [entry, ...prev.behaviorAssessments] }));
    setToast && setToast({ kind: 'reflect', title: 'Behavior assessment saved', body: state.students.find(s => s.id === studentId)?.name });
    setMode(null);
  }
  function saveAcademic(scores, comment) {
    const entry = { id: uid('aa'), studentId, classId: classId || state.students.find(s => s.id === studentId)?.classId, teacherEmail: email, date: new Date().toISOString(), scores, comment };
    persist(prev => ({ ...prev, academicAssessments: [entry, ...prev.academicAssessments] }));
    setToast && setToast({ kind: 'reflect', title: 'Academic assessment saved', body: state.students.find(s => s.id === studentId)?.name });
    setMode(null);
  }

  if (!state.students.length) return <div className="text-xs" style={{ color: COLORS.textFaint }}>No students in this class yet.</div>;

  return (
    <div className="space-y-5">
      <Card>
        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2 items-end">
          <Field label="Student">
            <select value={studentId} onChange={e => setStudentId(e.target.value)} style={inputStyle}>
              {state.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <button onClick={() => setMode('behavior')} className="text-xs font-bold rounded-lg px-3 py-2" style={{ background: COLORS.behavior, color: COLORS.onAccent }}>+ Behavior</button>
          <button onClick={() => setMode('academic')} className="text-xs font-bold rounded-lg px-3 py-2" style={{ background: COLORS.coding, color: COLORS.onAccent }}>+ Academic</button>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <SectionLabel icon={Heart} color={COLORS.behavior}>Behavior History</SectionLabel>
          <div className="space-y-1.5">
            {studentBehaviorAssessments(state, studentId).slice(0, 6).map(a => (
              <Card key={a.id} className="!p-3">
                <div className="flex justify-between text-xs font-bold mb-1"><span>{new Date(a.date).toLocaleDateString()}</span><span style={{ color: COLORS.behavior }}>{Math.round(avgOf(a.ratings) * 20)}%</span></div>
                {a.comment && <div className="text-[11px]" style={{ color: COLORS.textMuted }}>{a.comment}</div>}
              </Card>
            ))}
            {studentBehaviorAssessments(state, studentId).length === 0 && <div className="text-xs" style={{ color: COLORS.textFaint }}>No assessments yet.</div>}
          </div>
        </div>
        <div>
          <SectionLabel icon={GraduationCap} color={COLORS.coding}>Academic History</SectionLabel>
          <div className="space-y-1.5">
            {studentAcademicAssessments(state, studentId).slice(0, 6).map(a => (
              <Card key={a.id} className="!p-3">
                <div className="flex justify-between text-xs font-bold mb-1"><span>{new Date(a.date).toLocaleDateString()}</span><span style={{ color: COLORS.coding }}>{Math.round(avgOf(a.scores))}%</span></div>
                {a.comment && <div className="text-[11px]" style={{ color: COLORS.textMuted }}>{a.comment}</div>}
              </Card>
            ))}
            {studentAcademicAssessments(state, studentId).length === 0 && <div className="text-xs" style={{ color: COLORS.textFaint }}>No assessments yet.</div>}
          </div>
        </div>
      </div>

      {mode === 'behavior' && <BehaviorAssessmentModal categories={BEHAVIOR_ASSESS_CATEGORIES} onClose={() => setMode(null)} onSubmit={saveBehavior} />}
      {mode === 'academic' && <AcademicAssessmentModal categories={ACADEMIC_CATEGORIES} onClose={() => setMode(null)} onSubmit={saveAcademic} />}
    </div>
  );
}

function BehaviorAssessmentModal({ categories, onClose, onSubmit }) {
  const [ratings, setRatings] = useState(Object.fromEntries(categories.map(c => [c, 3])));
  const [comment, setComment] = useState('');
  const overall = Math.round(avgOf(ratings) * 20);
  return (
    <ModalShell title="Behavior Assessment" onClose={onClose}>
      <div className="space-y-3">
        {categories.map(c => <RatingInput key={c} label={c} value={ratings[c]} onChange={v => setRatings(r => ({ ...r, [c]: v }))} color={COLORS.behavior} />)}
        <div className="text-xs font-bold text-right" style={{ color: COLORS.behavior }}>Overall: {overall}%</div>
        <Field label="Comment (optional)"><textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'none' }} /></Field>
        <button onClick={() => onSubmit(ratings, comment)} className="w-full font-bold text-sm rounded-lg py-2.5" style={{ background: COLORS.behavior, color: COLORS.onAccent }}>Save Assessment</button>
      </div>
    </ModalShell>
  );
}

function AcademicAssessmentModal({ categories, onClose, onSubmit }) {
  const [scores, setScores] = useState(Object.fromEntries(categories.map(c => [c, 85])));
  const [comment, setComment] = useState('');
  const overall = Math.round(avgOf(scores));
  return (
    <ModalShell title="Academic Assessment" onClose={onClose}>
      <div className="space-y-3">
        {categories.map(c => (
          <Field key={c} label={`${c} (%)`}>
            <input type="number" min={0} max={100} value={scores[c]} onChange={e => setScores(s => ({ ...s, [c]: Number(e.target.value) }))} style={inputStyle} />
          </Field>
        ))}
        <div className="text-xs font-bold text-right" style={{ color: COLORS.coding }}>Overall: {overall}%</div>
        <Field label="Comment (optional)"><textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'none' }} /></Field>
        <button onClick={() => onSubmit(scores, comment)} className="w-full font-bold text-sm rounded-lg py-2.5" style={{ background: COLORS.coding, color: COLORS.onAccent }}>Save Assessment</button>
      </div>
    </ModalShell>
  );
}

/* ------------------------------------ Challenges ------------------------------------- */

function ChallengesTab({ state, persist, classId, scopedStudents, isAdmin }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(20);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');

  function addChallenge() {
    if (!name.trim()) return;
    const entry = { id: uid('ch'), name: name.trim(), description, points: Number(points), startDate, endDate, status: 'active', eligibleClasses: classId ? [classId] : [], completedBy: [] };
    persist(prev => ({ ...prev, challenges: [entry, ...prev.challenges] }));
    setName(''); setDescription(''); setPoints(20); setEndDate('');
  }
  function toggleStatus(id) { persist(prev => ({ ...prev, challenges: prev.challenges.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c) })); }
  function removeChallenge(id) { persist(prev => ({ ...prev, challenges: prev.challenges.filter(c => c.id !== id) })); }
  function completeFor(challenge, studentId) {
    if (challenge.completedBy.includes(studentId)) return;
    const behavior = { category: 'Participation', name: `Challenge: ${challenge.name}` };
    const entry = { id: uid('log'), studentId, behaviorId: 'challenge', category: behavior.category, name: behavior.name, points: challenge.points, comment: '', date: new Date().toISOString() };
    persist(prev => ({
      ...prev,
      behaviorLog: [...prev.behaviorLog, entry],
      challenges: prev.challenges.map(c => c.id === challenge.id ? { ...c, completedBy: [...c.completedBy, studentId] } : c),
      notifications: pushNotification(prev, { scope: 'student', targetId: studentId, message: `\u2B50 You completed the "${challenge.name}" challenge and earned ${challenge.points} points!` }),
    }));
  }

  const visible = classId ? state.challenges.filter(c => !c.eligibleClasses?.length || c.eligibleClasses.includes(classId)) : state.challenges;

  return (
    <div className="space-y-5">
      <Card>
        <SectionLabel icon={ListChecks} color={COLORS.challenge}>New Challenge</SectionLabel>
        <div className="space-y-3">
          <Field label="Name"><input value={name} onChange={e => setName(e.target.value)} placeholder="Best Behavior Week" style={inputStyle} /></Field>
          <Field label="Description"><input value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Points"><input type="number" value={points} onChange={e => setPoints(e.target.value)} style={inputStyle} /></Field>
            <Field label="Start"><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} /></Field>
            <Field label="End"><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} /></Field>
          </div>
          <button onClick={addChallenge} className="w-full font-bold text-xs rounded-lg py-2.5" style={{ background: COLORS.challenge, color: COLORS.onAccent }}>Create Challenge</button>
        </div>
      </Card>

      <div className="space-y-3">
        {visible.map(c => (
          <Card key={c.id}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div>
                <div className="text-sm font-bold flex items-center gap-2">{c.name}
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full" style={{ background: c.status === 'active' ? `${COLORS.success}22` : `${COLORS.textFaint}22`, color: c.status === 'active' ? COLORS.success : COLORS.textFaint }}>{c.status}</span>
                </div>
                <div className="text-[11px]" style={{ color: COLORS.textMuted }}>{c.description}</div>
                <div className="text-[10px] mt-0.5" style={{ color: COLORS.textFaint }}>{c.startDate} {c.endDate ? `\u2192 ${c.endDate}` : ''} {'\u2022'} +{c.points} pts</div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => toggleStatus(c.id)} className="text-[10px] font-bold px-2 py-1 rounded-lg border" style={{ borderColor: COLORS.border, color: COLORS.textMuted }}>{c.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => removeChallenge(c.id)} style={{ color: COLORS.textFaint }}><Trash2 size={14} /></button>
              </div>
            </div>
            {!isAdmin && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t" style={{ borderColor: COLORS.border }}>
                {scopedStudents.map(s => {
                  const done = c.completedBy.includes(s.id);
                  return (
                    <button key={s.id} disabled={done} onClick={() => completeFor(c, s.id)}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg disabled:opacity-40 flex items-center gap-1"
                      style={{ background: done ? COLORS.panelSoft : COLORS.panelAlt, color: done ? COLORS.success : COLORS.text }}>
                      {done && <CheckCircle2 size={10} />} {s.name}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        ))}
        {visible.length === 0 && <div className="text-xs" style={{ color: COLORS.textFaint }}>No challenges yet.</div>}
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
        <button onClick={() => onSubmit({ studentId, behaviorId, points, comment })} className="w-full font-bold text-sm rounded-lg py-2.5" style={{ background: COLORS.xp, color: COLORS.onAccent }}>
          Award Recognition
        </button>
      </div>
    </ModalShell>
  );
}

/* ============================================================================ */
/* ------------------------------------ Admin App ------------------------------ */
/* ============================================================================ */

function AdminApp({ state, persist, email }) {
  const [tab, setTab] = useState('overview');
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'classes', label: 'Classes', icon: Building2 },
    { id: 'team', label: 'Team', icon: UserPlus },
    { id: 'competition', label: 'Competition', icon: Trophy },
    { id: 'challenges', label: 'Challenges', icon: ListChecks },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  const sidebarHeader = (
    <div>
      <div className="text-[11px] font-black uppercase tracking-wide flex items-center gap-1.5" style={{ color: COLORS.sidebarActive }}>
        <ShieldCheck size={13} /> Admin
      </div>
      <div className="text-sm font-bold mt-1" style={{ color: COLORS.onAccent }}>{email}</div>
      <div className="text-[10.5px] mt-0.5" style={{ color: COLORS.sidebarText }}>{state.classes.length} classes</div>
    </div>
  );
  return (
    <div className="md:flex md:gap-5 items-start">
      <Sidebar tabs={tabs} active={tab} onChange={setTab} dark header={sidebarHeader} />
      <div className="flex-1 min-w-0 space-y-5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} style={{ color: COLORS.challenge }} />
          <div>
            <h1 className="text-lg font-black">Admin Dashboard</h1>
            <p className="text-xs" style={{ color: COLORS.textFaint }}>School-wide behavior, academics &amp; competition.</p>
          </div>
        </div>
        <div className="md:hidden"><NavTabs tabs={tabs} active={tab} onChange={setTab} accent={COLORS.challenge} /></div>
        {tab === 'overview' && <AdminOverviewTab state={state} />}
        {tab === 'classes' && <AdminClassesTab state={state} persist={persist} email={email} />}
        {tab === 'team' && <AdminTeamTab state={state} persist={persist} />}
        {tab === 'competition' && <AdminCompetitionTab state={state} persist={persist} />}
        {tab === 'challenges' && <ChallengesTab state={state} persist={persist} classId={null} scopedStudents={state.students} isAdmin={true} />}
        {tab === 'settings' && <AdminSettingsTab state={state} persist={persist} />}
      </div>
    </div>
  );
}

function AdminOverviewTab({ state }) {
  const comp = computeCompetition(state, currentMonthKey());
  const champion = comp.results[0];
  const avgBehavior = Math.round(comp.results.reduce((s, r) => s + r.behaviorScore, 0) / (comp.results.length || 1));
  const avgAcademic = Math.round(comp.results.reduce((s, r) => s + r.academicScore, 0) / (comp.results.length || 1));
  const totalPoints = state.students.reduce((s, st) => s + totalXP(state, st.id), 0);
  const topStudents = [...state.students].sort((a, b) => totalXP(state, b.id) - totalXP(state, a.id)).slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        <StatChip icon={Users} label="Students" value={state.students.length} color={COLORS.robotics} />
        <StatChip icon={Building2} label="Classes" value={state.classes.length} color={COLORS.coding} />
        <StatChip icon={UserPlus} label="Teachers" value={Object.values(state.teacherAssignments).filter(a => a.classId).length} color={COLORS.behavior} />
        <StatChip icon={Zap} label="Total Points" value={totalPoints} color={COLORS.xp} />
        <StatChip icon={Heart} label="Avg Behavior" value={`${avgBehavior}%`} color={COLORS.behavior} />
        <StatChip icon={GraduationCap} label="Avg Academic" value={`${avgAcademic}%`} color={COLORS.coding} />
      </div>

      {champion && (
        <Card style={{ background: `linear-gradient(135deg, ${COLORS.panel}, ${COLORS.panelAlt})`, borderColor: `${COLORS.xp}55` }}>
          <div className="flex items-center gap-2 text-xs font-bold mb-1" style={{ color: COLORS.xp }}><Trophy size={14} /> Current Monthly Champion ({monthLabel(comp.monthKey)})</div>
          <div className="text-xl font-black">{champion.className}</div>
          <div className="text-xs font-mono mt-0.5" style={{ color: COLORS.textMuted }}>Final Score: <b style={{ color: COLORS.xp }}>{champion.finalScore}</b></div>
        </Card>
      )}

      <div>
        <SectionLabel icon={Trophy} color={COLORS.xp}>Top Students (all classes)</SectionLabel>
        <Card className="space-y-1.5">
          {topStudents.map((st, i) => (
            <div key={st.id} className="flex justify-between text-xs font-semibold">
              <span>{i + 1}. {st.name} <span style={{ color: COLORS.textFaint }}>({className(state, st.classId)})</span></span>
              <span className="font-mono" style={{ color: COLORS.xp }}>{totalXP(state, st.id)} XP</span>
            </div>
          ))}
        </Card>
      </div>

      <div>
        <SectionLabel icon={BarChart3} color={COLORS.robotics}>Top Classes This Month</SectionLabel>
        <Card className="space-y-2">
          {comp.results.slice(0, 3).map(r => (
            <div key={r.classId} className="flex justify-between text-xs font-semibold">
              <span>#{r.rank} {r.className}</span>
              <span className="font-mono" style={{ color: COLORS.xp }}>{r.finalScore}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function AdminClassesTab({ state, persist, email }) {
  const [newClassName, setNewClassName] = useState('');
  const alreadyExpanded = state.students.some(s => s.id.startsWith('demo_'));

  function addClass() {
    if (!newClassName.trim()) return;
    persist(prev => ({ ...prev, classes: [...prev.classes, { id: uid('cls'), name: newClassName.trim() }] }));
    setNewClassName('');
  }
  function removeClass(id) {
    persist(prev => ({ ...prev, classes: prev.classes.filter(c => c.id !== id) }));
  }
  function assignStudent(studentId, classId) {
    persist(prev => ({ ...prev, students: prev.students.map(s => s.id === studentId ? { ...s, classId: classId || null } : s) }));
  }
  function loadDemoData() {
    const demo = buildDemoExpansion(state, email);
    persist(prev => ({
      ...prev,
      students: [...prev.students, ...demo.newStudents],
      behaviorLog: [...prev.behaviorLog, ...demo.newBehaviorLog],
      behaviorAssessments: [...prev.behaviorAssessments, ...demo.newBehaviorAssessments],
      academicAssessments: [...prev.academicAssessments, ...demo.newAcademicAssessments],
      competitions: [...demo.demoCompetitions, ...prev.competitions.filter(c => !demo.demoCompetitions.some(d => d.monthKey === c.monthKey))],
    }));
  }

  return (
    <div className="space-y-5">
      {!alreadyExpanded && (
        <Card style={{ borderColor: `${COLORS.xp}55` }}>
          <div className="text-sm font-bold mb-1">Populate demo classes</div>
          <div className="text-xs mb-2" style={{ color: COLORS.textMuted }}>
            Adds students, assessments and points to classes 6B, 6C, 7A, 7B, 7C (your existing class and students are untouched) plus two closed competition months, so you can see the full competition system working.
          </div>
          <button onClick={loadDemoData} className="text-xs font-bold rounded-lg px-3 py-2" style={{ background: COLORS.xp, color: COLORS.onAccent }}>Load Demo Data</button>
        </Card>
      )}

      <Card>
        <SectionLabel icon={Plus} color={COLORS.coding}>Add a class</SectionLabel>
        <div className="flex gap-2">
          <input value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="e.g. 8A" style={inputStyle} />
          <button onClick={addClass} className="text-xs font-bold rounded-lg px-3 shrink-0" style={{ background: COLORS.coding, color: COLORS.onAccent }}>Add</button>
        </div>
      </Card>

      <div>
        <SectionLabel icon={Building2} color={COLORS.robotics}>Classes</SectionLabel>
        <div className="space-y-2">
          {state.classes.map(c => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border px-3.5 py-2.5" style={{ borderColor: COLORS.border, background: COLORS.panel }}>
              <div className="text-sm font-semibold">{c.name} <span className="text-[11px] font-normal" style={{ color: COLORS.textFaint }}>({studentsInClass(state, c.id).length} students, {classPointsTotal(state, c.id)} pts)</span></div>
              <button onClick={() => removeClass(c.id)} style={{ color: COLORS.textFaint }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel icon={Users} color={COLORS.behavior}>Assign students to classes</SectionLabel>
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: COLORS.border }}>
          {state.students.map(s => (
            <div key={s.id} className="flex items-center justify-between gap-2 px-4 py-2.5 border-t first:border-t-0" style={{ borderColor: COLORS.border }}>
              <span className="text-sm font-medium">{s.name}</span>
              <select value={s.classId || ''} onChange={e => assignStudent(s.id, e.target.value)} className="rounded-lg px-2 py-1.5 text-xs font-semibold outline-none border" style={{ background: COLORS.panelAlt, borderColor: COLORS.border, color: COLORS.text }}>
                <option value="">Unassigned</option>
                {state.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminTeamTab({ state, persist }) {
  const [newEmail, setNewEmail] = useState('');
  const [newClassId, setNewClassId] = useState(state.classes[0]?.id || '');
  const entries = Object.entries(state.teacherAssignments);

  function addAssignment() {
    if (!newEmail.trim()) return;
    persist(prev => ({ ...prev, teacherAssignments: { ...prev.teacherAssignments, [newEmail.trim().toLowerCase()]: { isAdmin: false, classId: newClassId || null } } }));
    setNewEmail('');
  }
  function updateAssignment(em, patch) {
    persist(prev => ({ ...prev, teacherAssignments: { ...prev.teacherAssignments, [em]: { ...prev.teacherAssignments[em], ...patch } } }));
  }
  function removeAssignment(em) {
    persist(prev => { const next = { ...prev.teacherAssignments }; delete next[em]; return { ...prev, teacherAssignments: next }; });
  }

  return (
    <div className="space-y-5">
      <Card>
        <SectionLabel icon={UserPlus} color={COLORS.robotics}>Assign a teacher</SectionLabel>
        <div className="text-[11px] mb-2" style={{ color: COLORS.textFaint }}>
          Enter the exact email of a Supabase Auth user (create the login in Supabase first). They'll get this class automatically the next time they sign in.
        </div>
        <div className="grid sm:grid-cols-[1fr_140px_auto] gap-2">
          <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="teacher@school.com" style={inputStyle} />
          <select value={newClassId} onChange={e => setNewClassId(e.target.value)} style={inputStyle}>
            {state.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={addAssignment} className="text-xs font-bold rounded-lg px-3" style={{ background: COLORS.robotics, color: COLORS.onAccent }}>Assign</button>
        </div>
      </Card>

      <div>
        <SectionLabel icon={ShieldCheck} color={COLORS.challenge}>Team</SectionLabel>
        <div className="space-y-2">
          {entries.map(([em, a]) => (
            <div key={em} className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 flex-wrap" style={{ borderColor: COLORS.border, background: COLORS.panel }}>
              <div className="flex-1 min-w-[140px] text-sm font-semibold">{em}</div>
              <select value={a.classId || ''} onChange={e => updateAssignment(em, { classId: e.target.value || null })} className="rounded-lg px-2 py-1.5 text-xs font-semibold outline-none border" style={{ background: COLORS.panelAlt, borderColor: COLORS.border, color: COLORS.text }}>
                <option value="">No class</option>
                {state.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <label className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: a.isAdmin ? COLORS.challenge : COLORS.textFaint }}>
                <input type="checkbox" checked={!!a.isAdmin} onChange={e => updateAssignment(em, { isAdmin: e.target.checked })} /> Admin
              </label>
              <button onClick={() => removeAssignment(em)} style={{ color: COLORS.textFaint }}><Trash2 size={14} /></button>
            </div>
          ))}
          {entries.length === 0 && <div className="text-xs" style={{ color: COLORS.textFaint }}>No team members yet.</div>}
        </div>
      </div>
    </div>
  );
}

function AdminCompetitionTab({ state, persist }) {
  const monthKey = currentMonthKey();
  const live = computeCompetition(state, monthKey);
  const history = [...state.competitions].sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  const [openMonth, setOpenMonth] = useState(null);

  function finalizeMonth() {
    const snapshot = { ...live, closedAt: new Date().toISOString(), winnerClassId: live.results[0]?.classId };
    persist(prev => ({
      ...prev,
      competitions: [snapshot, ...prev.competitions.filter(c => c.monthKey !== monthKey)],
      notifications: pushNotification(prev, { scope: 'broadcast', message: `\u{1F3C6} ${snapshot.results[0]?.className} won the ${monthLabel(monthKey)} class challenge!` }),
    }));
  }

  return (
    <div className="space-y-6">
      <CompetitionBoard title={`\u{1F3C6} Monthly Class Challenge \u2014 ${monthLabel(monthKey)} (live)`} data={live} />
      <button onClick={finalizeMonth} className="text-xs font-bold rounded-lg px-3 py-2" style={{ background: COLORS.xp, color: COLORS.onAccent }}>Finalize &amp; Close {monthLabel(monthKey)}</button>

      <div>
        <SectionLabel icon={CalendarDays} color={COLORS.robotics}>Competition History</SectionLabel>
        <div className="space-y-2">
          {history.map(h => (
            <div key={h.monthKey}>
              <button onClick={() => setOpenMonth(openMonth === h.monthKey ? null : h.monthKey)}
                className="w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5" style={{ borderColor: COLORS.border, background: COLORS.panel }}>
                <span className="text-sm font-semibold">{monthLabel(h.monthKey)} {'\u2192'} {h.results.find(r => r.classId === h.winnerClassId)?.className} {'\u{1F3C6}'}</span>
                <ChevronRight size={14} style={{ transform: openMonth === h.monthKey ? 'rotate(90deg)' : 'none', color: COLORS.textFaint }} />
              </button>
              {openMonth === h.monthKey && <div className="mt-2"><CompetitionBoard title="" data={h} compact /></div>}
            </div>
          ))}
          {history.length === 0 && <div className="text-xs" style={{ color: COLORS.textFaint }}>No finalized months yet.</div>}
        </div>
      </div>
    </div>
  );
}

function CompetitionBoard({ title, data, compact }) {
  const podiumColors = [COLORS.xp, COLORS.textFaint, COLORS.reward];
  const podiumBg = ['#7C5CFC', '#9CA3AF', '#F59E0B'];
  const top3 = data.results.slice(0, 3);
  const champion = data.results[0];
  return (
    <div className="space-y-4">
      {title && <SectionLabel icon={Trophy} color={COLORS.xp}>{title}</SectionLabel>}

      {!compact && top3.length > 0 && (
        <div className="grid grid-cols-3 gap-3 items-end">
          {[top3[1], top3[0], top3[2]].map((r, i) => {
            if (!r) return <div key={i} />;
            const isFirst = r.rank === 1;
            return (
              <div key={r.classId} className="rounded-2xl border p-4 text-center shadow-sm" style={{
                background: isFirst ? `${COLORS.xp}0F` : COLORS.panel,
                borderColor: isFirst ? COLORS.xp : COLORS.border,
                borderWidth: isFirst ? 2 : 1,
                paddingTop: isFirst ? 24 : 16,
              }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs mx-auto mb-2" style={{ background: podiumBg[r.rank - 1], color: COLORS.onAccent }}>
                  {r.rank}
                </div>
                <div className="text-lg font-black" style={{ color: COLORS.text }}>{r.className}</div>
                <div className="flex items-center justify-center gap-1 text-sm font-bold mt-1" style={{ color: podiumColors[r.rank - 1] }}>
                  <Trophy size={13} /> {r.finalScore}
                </div>
                {isFirst && <Bar value={100} color={COLORS.xp} height={4} />}
              </div>
            );
          })}
        </div>
      )}

      {champion && !compact && (
        <Card style={{ background: `linear-gradient(135deg, ${COLORS.panel}, ${COLORS.panelAlt})`, borderColor: `${COLORS.xp}55` }}>
          <div className="text-[11px] font-bold uppercase mb-1" style={{ color: COLORS.xp }}>{'\u{1F3C6}'} Class Champion</div>
          <div className="text-2xl font-black">{champion.className}</div>
          <div className="text-xs font-mono mt-1" style={{ color: COLORS.textMuted }}>Final Score: <b style={{ color: COLORS.xp }}>{champion.finalScore}</b> {'\u2022'} {champion.studentCount} students</div>
          <button onClick={() => window.print()} className="mt-3 text-[11px] font-bold rounded-lg px-3 py-1.5 flex items-center gap-1.5 w-fit" style={{ background: COLORS.xp, color: COLORS.onAccent }}>
            <Printer size={12} /> Print / Download Certificate
          </button>
        </Card>
      )}
      <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: COLORS.border }}>
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 px-3 py-2 text-[9.5px] font-bold uppercase" style={{ background: COLORS.panelAlt, color: COLORS.textFaint }}>
          <div>#</div><div>Class</div><div className="text-right">Points</div><div className="text-right">Behavior</div><div className="text-right">Academic</div><div className="text-right">Final</div>
        </div>
        {data.results.map(r => (
          <div key={r.classId} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 px-3 py-2.5 text-xs border-t items-center" style={{ borderColor: COLORS.border, background: r.rank === 1 ? `${COLORS.xp}0A` : 'transparent' }}>
            <div className="font-bold" style={{ color: r.rank <= 3 ? podiumColors[r.rank - 1] : COLORS.textFaint }}>#{r.rank}</div>
            <div className="font-semibold" style={{ color: COLORS.text }}>{r.className}</div>
            <div className="text-right font-mono" style={{ color: COLORS.textMuted }}>{r.pointsScore}</div>
            <div className="text-right font-mono" style={{ color: COLORS.textMuted }}>{r.behaviorScore}%</div>
            <div className="text-right font-mono" style={{ color: COLORS.textMuted }}>{r.academicScore}%</div>
            <div className="text-right font-mono font-bold" style={{ color: COLORS.xp }}>{r.finalScore}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSettingsTab({ state, persist }) {
  const w = state.competitionConfig.weights;
  function update(field, val) {
    persist(prev => ({ ...prev, competitionConfig: { ...prev.competitionConfig, weights: { ...prev.competitionConfig.weights, [field]: Number(val) } } }));
  }
  const sum = Number(w.points) + Number(w.behavior) + Number(w.academic);
  return (
    <div className="space-y-5">
      <Card>
        <SectionLabel icon={Percent} color={COLORS.challenge}>Competition Formula Weights</SectionLabel>
        <div className="space-y-3">
          <Field label={`Student Points \u2014 ${w.points}%`}><input type="range" min={0} max={100} value={w.points} onChange={e => update('points', e.target.value)} className="w-full" /></Field>
          <Field label={`Behavior Performance \u2014 ${w.behavior}%`}><input type="range" min={0} max={100} value={w.behavior} onChange={e => update('behavior', e.target.value)} className="w-full" /></Field>
          <Field label={`Academic Performance \u2014 ${w.academic}%`}><input type="range" min={0} max={100} value={w.academic} onChange={e => update('academic', e.target.value)} className="w-full" /></Field>
          <div className="text-[11px] font-semibold" style={{ color: sum === 100 ? COLORS.success : COLORS.reward }}>
            {sum === 100 ? 'Weights total 100%.' : `Weights total ${sum}% \u2014 scores are auto-normalized, but 100% is recommended for clarity.`}
          </div>
        </div>
      </Card>
    </div>
  );
}
