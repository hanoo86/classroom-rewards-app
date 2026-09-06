import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Users, Brain, Wrench, Heart, Rocket, Award, Shield, Sparkles, CheckCircle2,
  Target, MessageSquare, Plus, X, ChevronRight, TrendingUp,
  UserCircle2, Smile, Meh, HelpCircle, Loader2, Flame, Trophy, Crown,
  Lightbulb, Bot, Armchair, Code2, Star, Lock, Zap, BarChart3, Gift,
  LayoutGrid, Medal, ClipboardList, LogOut, LogIn,
  Settings, Bell, GraduationCap, ShieldCheck, Download, Printer,
  CalendarDays, UserPlus, Building2, Percent, ListChecks, Trash2, Shuffle, KeyRound, ChevronDown, Volume2
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { LineChart, Line, BarChart, Bar as RechartsBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/* ---------------------------------- palette --------------------------------- */

const COLORS = {
  bg: '#F5F8FE', panel: '#FFFFFF', panelAlt: '#EAF0FE', panelSoft: '#F1F5FD',
  border: '#DCE4F7', borderStrong: '#C3D0F2',
  text: '#161B3A', textMuted: '#585F86', textFaint: '#8790B8',
  xp: '#9C6209', behavior: '#166B54', robotics: '#2A4FD6',
  coding: '#6D4FE0', challenge: '#C33327', reward: '#B3600A', success: '#166B54',
  onAccent: '#FFFFFF',
  sidebarBg: '#121A3D', sidebarText: '#AAB4E0', sidebarActive: '#F0AC2E',
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
  { id: 'b1', category: 'Respect', name: 'Respectful behavior', points: 5, type: 'positive' },
  { id: 'b2', category: 'Respect', name: 'Respecting different opinions', points: 5, type: 'positive' },
  { id: 'b3', category: 'Teamwork', name: 'Excellent teamwork', points: 10, type: 'positive' },
  { id: 'b4', category: 'Teamwork', name: 'Helping a classmate', points: 5, type: 'positive' },
  { id: 'b5', category: 'Responsibility', name: 'Excellent responsibility', points: 10, type: 'positive' },
  { id: 'b6', category: 'Responsibility', name: 'Taking care of equipment', points: 5, type: 'positive' },
  { id: 'b7', category: 'Participation', name: 'Outstanding participation', points: 5, type: 'positive' },
  { id: 'b8', category: 'Leadership', name: 'Demonstrating leadership', points: 10, type: 'positive' },
  { id: 'b9', category: 'Problem Solving & Mindset', name: 'Excellent problem-solving attitude', points: 10, type: 'positive' },
  { id: 'b10', category: 'Problem Solving & Mindset', name: 'Showing perseverance', points: 10, type: 'positive' },
  { id: 'b11', category: 'Digital Citizenship', name: 'Excellent digital citizenship', points: 10, type: 'positive' },
  { id: 'b12', category: 'Robotics Behavior', name: 'Careful, safe robot handling', points: 5, type: 'positive' },
  { id: 'b13', category: 'Creativity', name: 'Creative idea or solution', points: 10, type: 'positive' },
  // --- concerns (negative points) — same categories as their positive counterparts,
  // so a concern nudges a student's standing in that pillar without inflating
  // badge progress (badge counts only ever look at positive-point entries).
  { id: 'n1', category: 'Respect', name: 'Not respecting the teacher', points: -5, type: 'negative' },
  { id: 'n2', category: 'Respect', name: 'Disrespectful to a classmate', points: -5, type: 'negative' },
  { id: 'n3', category: 'Responsibility', name: 'Not following instructions', points: -5, type: 'negative' },
  { id: 'n4', category: 'Responsibility', name: 'Did not complete assigned work', points: -5, type: 'negative' },
  { id: 'n5', category: 'Participation', name: 'Disruptive during class', points: -5, type: 'negative' },
  { id: 'n6', category: 'Participation', name: 'Off-task / not focused', points: -3, type: 'negative' },
  { id: 'n7', category: 'Teamwork', name: 'Unkind to a classmate', points: -5, type: 'negative' },
  { id: 'n8', category: 'Robotics Behavior', name: 'Careless equipment handling', points: -5, type: 'negative' },
  // --- Focus Meter (classroom noise monitor) — only ever applied when the
  // teacher taps Confirm on a suggestion; never written automatically.
  { id: 'n9', category: 'Participation', name: 'Classroom noise level', points: -3, type: 'negative' },
  { id: 'b14', category: 'Participation', name: 'Focused, quiet work', points: 3, type: 'positive' },
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

const REWARD_CATEGORIES = [
  { id: 'privileges', label: 'Classroom Privileges', emoji: '\u{1F451}' },
  { id: 'fun', label: 'Fun & Digital', emoji: '\u{1F3AE}' },
  { id: 'vip', label: 'VIP / High XP', emoji: '\u{1F48E}' },
  { id: 'limited', label: 'This Week Only', emoji: '\u{1F525}' },
  { id: 'general', label: 'More Rewards', emoji: '\u{1F381}' },
];

const DEFAULT_REWARDS = [
  // --- existing rewards, unchanged name/cost/description — just tagged with a category so they slot into the new store layout
  { id: 'r1', icon: 'Armchair', name: 'Choose Your Seat', cost: 250, description: 'Pick your seat for one lesson.', category: 'privileges', enabled: true, limitedQty: null },
  { id: 'r2', icon: 'Code2', name: '10 Min Free Coding Time', cost: 150, description: 'Extra free coding time at the end of class.', category: 'fun', enabled: true, limitedQty: null },
  { id: 'r3', icon: 'Bot', name: 'Robotics Team Leader', cost: 300, description: 'Lead the robotics team for one lesson.', category: 'privileges', enabled: true, limitedQty: null },
  { id: 'r4', icon: 'Target', name: 'Choose the Next Mini Challenge', cost: 200, description: 'Pick what the class works on next.', category: 'privileges', enabled: true, limitedQty: null },
  { id: 'r5', icon: 'Award', name: 'Special Digital Certificate', cost: 400, description: 'A certificate recognizing your progress.', category: 'general', enabled: true, limitedQty: null },
  { id: 'r6', icon: 'Star', name: 'Tech Assistant of the Day', cost: 350, description: 'Help the teacher run the lesson.', category: 'privileges', enabled: true, limitedQty: null },
  // --- new: Classroom Privileges
  { id: 'r7', icon: 'Users', name: 'Choose Your Partner', cost: 200, description: 'Choose your partner for one activity.', emoji: '\u{1F451}', category: 'privileges', enabled: true, limitedQty: null },
  { id: 'r8', icon: 'Flame', name: 'Choose the Warm-Up Activity', cost: 250, description: 'Choose the warm-up activity for the class.', emoji: '\u{1F451}', category: 'privileges', enabled: true, limitedQty: null },
  { id: 'r9', icon: 'Crown', name: 'Be Teacher Assistant', cost: 300, description: 'Help the teacher during one lesson.', emoji: '\u{1F451}', category: 'privileges', enabled: true, limitedQty: null },
  // --- new: Fun & Digital
  { id: 'r10', icon: 'Code2', name: 'Choose a Class Game', cost: 300, description: 'Choose the game the class will play.', emoji: '\u{1F3AE}', category: 'fun', enabled: true, limitedQty: null },
  // --- new: VIP / High XP (visually prestigious tier)
  { id: 'v1', icon: 'Trophy', name: 'Lab VIP', cost: 500, description: 'Recognized as a Lab VIP for outstanding effort.', emoji: '\u{1F3C6}', category: 'vip', enabled: true, limitedQty: null },
  { id: 'v2', icon: 'Crown', name: 'Tech Leader', cost: 750, description: 'A standing leadership title in class.', emoji: '\u{1F451}', category: 'vip', enabled: true, limitedQty: null },
  { id: 'v3', icon: 'Award', name: 'Innovation Champion', cost: 1000, description: 'Recognized for standout creative problem-solving.', emoji: '\u{1F680}', category: 'vip', enabled: true, limitedQty: null },
  { id: 'v4', icon: 'Bot', name: 'Robotics Master', cost: 1250, description: 'The top robotics recognition in class.', emoji: '\u{1F916}', category: 'vip', enabled: true, limitedQty: null },
  { id: 'v5', icon: 'Star', name: 'Ultimate CS Legend', cost: 1500, description: 'The highest honor in the class.', emoji: '\u{1F48E}', category: 'vip', enabled: true, limitedQty: null },
  // --- new: This Week Only (limited quantity — remaining slots are computed
  // from redemption count vs. limitedQty, so "reset" just re-opens slots
  // without ever deleting redemption history)
  { id: 'l1', icon: 'Code2', name: 'Gaming Break', cost: 150, description: '10 minutes of approved game time.', emoji: '\u{1F3AE}', category: 'limited', enabled: true, limitedQty: 5, resetAt: null },
  { id: 'l2', icon: 'Crown', name: 'Teacher Assistant', cost: 300, description: 'Help run one lesson this week.', emoji: '\u{1F451}', category: 'limited', enabled: true, limitedQty: 3, resetAt: null },
  { id: 'l3', icon: 'Bot', name: 'Choose the Robotics Challenge', cost: 500, description: 'Pick this week\u2019s robotics challenge.', emoji: '\u{1F916}', category: 'limited', enabled: true, limitedQty: 1, resetAt: null },
  { id: 'l4', icon: 'Award', name: 'Mystery Box', cost: 750, description: 'A surprise reward, revealed after redeeming.', emoji: '\u{1F381}', category: 'limited', enabled: true, limitedQty: 2, resetAt: null },
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
    // --- redesign additions ---
    studentAvatars: {},      // { [studentId]: avatarProps }
    classGenderConfig: {},   // { [classId]: 'boys'|'girls'|'mixed' }
    rewardImages: {},        // { [rewardId]: { imageUrl, displayMode } }
  };
}

function uid(p) { return p + '_' + Math.random().toString(36).slice(2, 9); }

/* --------------------------------- storage (Supabase, v2 relational) --------- */
// Sensitive data (students, classes, points, assessments, competitions, staff
// roles) now lives in real tables with Postgres RLS enforcing who can read/
// write what — see supabase/schema_v2_secure.sql. Lower-stakes data (reward/
// badge catalogs, goals, notes, mission, challenges, notifications) stays as
// one JSON document per school in `school_data`. The functions below fetch
// from all of these and assemble them into the SAME shape the rest of this
// file already expects, so the UI code barely has to change.

const SCHOOL_ID = import.meta.env.VITE_SCHOOL_ID;

function rowToBehaviorLog(p) { return { id: p.id, studentId: p.student_id, behaviorId: null, category: p.category, name: p.name, points: p.points, comment: p.comment || '', date: p.created_at }; }
function rowToStudent(s) { return { id: s.id, name: s.name, ageGroup: s.age_group, classId: s.class_id, pin: s.pin }; }
function rowToClass(c) { return { id: c.id, name: c.name, classCode: c.class_code, ownerId: c.owner_id }; }
function rowToBehaviorAssessment(a) { return { id: a.id, studentId: a.student_id, classId: a.class_id, date: a.created_at, ratings: a.ratings, comment: a.comment || '' }; }
function rowToAcademicAssessment(a) { return { id: a.id, studentId: a.student_id, classId: a.class_id, date: a.created_at, scores: a.scores, comment: a.comment || '' }; }
function rowToCompetition(c) { return { monthKey: c.month_key, weights: c.weights, results: c.results, winnerClassId: c.winner_class_id, closedAt: c.closed_at }; }
function rowToRedemption(r) { return { id: r.id, studentId: r.student_id, rewardId: r.reward_id, cost: r.cost, date: r.created_at }; }
function rowToReflection(r) { return { id: r.id, studentId: r.student_id, feeling: r.feeling, improvement: r.improvement, date: r.created_at }; }

async function loadState() {
  if (!SCHOOL_ID) {
    // eslint-disable-next-line no-console
    console.error('Missing VITE_SCHOOL_ID. Set it to the school row created by the migration script.');
  }
  // school_data is now one row PER TEACHER (owner_id), not one shared row per
  // school — so it has to be looked up by the signed-in user's own id, never
  // by school_id alone (that would match every teacher's row at once).
  const { data: { user } = {} } = await supabase.auth.getUser();

  const [classesR, studentsR, pointsR, bAssessR, aAssessR, compsR, profilesR, redemptionsR, reflectionsR, schoolDataR] = await Promise.all([
    supabase.from('classes').select('*').eq('school_id', SCHOOL_ID),
    supabase.from('students').select('*').eq('school_id', SCHOOL_ID),
    supabase.from('point_transactions').select('*').eq('school_id', SCHOOL_ID).order('created_at'),
    supabase.from('behavior_assessments').select('*').eq('school_id', SCHOOL_ID).order('created_at', { ascending: false }),
    supabase.from('academic_assessments').select('*').eq('school_id', SCHOOL_ID).order('created_at', { ascending: false }),
    supabase.from('competitions').select('*').eq('school_id', SCHOOL_ID),
    supabase.from('profiles').select('*').eq('school_id', SCHOOL_ID),
    supabase.from('redemptions').select('*').eq('school_id', SCHOOL_ID).order('created_at', { ascending: false }),
    supabase.from('reflections').select('*').eq('school_id', SCHOOL_ID).order('created_at', { ascending: false }),
    user ? supabase.from('school_data').select('*').eq('owner_id', user.id).maybeSingle() : Promise.resolve({ data: null, error: null }),
  ]);
  [classesR, studentsR, pointsR, bAssessR, aAssessR, compsR, profilesR, redemptionsR, reflectionsR, schoolDataR].forEach(r => {
    if (r.error) console.error('load error:', r.error.message);
  });

  const spentXP = {};
  (redemptionsR.data || []).forEach(r => { spentXP[r.student_id] = (spentXP[r.student_id] || 0) + r.cost; });

  const teacherAssignments = {};
  (profilesR.data || []).forEach(p => { if (p.email) teacherAssignments[p.email.toLowerCase()] = { isAdmin: p.is_admin, classId: p.class_id }; });

  const extra = schoolDataR.data?.data || {};
  // A teacher's saved school_data.behaviors fully replaces the defaults once
  // they have one, which means any behavior we add later (concerns, the
  // Focus Meter's two entries, etc.) would silently never reach an existing
  // account. Union in whichever defaults are missing by id, every load.
  const savedBehaviors = extra.behaviors || [];
  const savedBehaviorIds = new Set(savedBehaviors.map(b => b.id));
  const mergedBehaviors = [...savedBehaviors, ...DEFAULT_BEHAVIORS.filter(b => !savedBehaviorIds.has(b.id))];
  const savedRewards = extra.rewards || [];
  const savedRewardIds = new Set(savedRewards.map(r => r.id));
  const mergedRewards = [...savedRewards, ...DEFAULT_REWARDS.filter(r => !savedRewardIds.has(r.id))];

  return {
    ...defaultState(),
    ...extra,
    behaviors: mergedBehaviors,
    rewards: mergedRewards,
    classes: (classesR.data || []).map(rowToClass),
    students: (studentsR.data || []).map(rowToStudent),
    behaviorLog: (pointsR.data || []).map(rowToBehaviorLog),
    behaviorAssessments: (bAssessR.data || []).map(rowToBehaviorAssessment),
    academicAssessments: (aAssessR.data || []).map(rowToAcademicAssessment),
    competitions: (compsR.data || []).map(rowToCompetition),
    teacherAssignments,
    redemptions: (redemptionsR.data || []).map(rowToRedemption),
    reflections: (reflectionsR.data || []).map(rowToReflection),
    spentXP,
    academicPoints: {}, // folded into point_transactions; kept as empty object for shape compatibility
  };
}

// For the small amount of remaining low-stakes data (catalogs, goals, notes,
// mission, challenges, notifications, competition weight config), still
// writable only by authenticated staff of this school.
async function saveSchoolData(state) {
  const payload = {
    behaviors: state.behaviors, rewards: state.rewards, studentBadges: state.studentBadges,
    goals: state.goals, notes: state.notes, mission: state.mission, challenges: state.challenges,
    notifications: state.notifications, competitionConfig: state.competitionConfig,
  };
  const { error } = await supabase.from('school_data').upsert({ school_id: SCHOOL_ID, data: payload, updated_at: new Date().toISOString() }, { onConflict: 'owner_id' });
  if (error) console.error('save failed:', error.message);
}

/* --------------------------- relational write actions ------------------------ */
// Every function here does exactly one thing to exactly one table, guarded by
// the RLS policies in schema_v2_secure.sql. Components never call `supabase`
// directly for sensitive data — they go through these.

async function dbAddStudent({ name, ageGroup, classId }) {
  const { error } = await supabase.from('students').insert({ school_id: SCHOOL_ID, name, age_group: ageGroup, class_id: classId || null });
  if (error) throw error;
}
async function dbAddStudentsBulk({ names, ageGroup, classId }) {
  const rows = names.map(name => ({ school_id: SCHOOL_ID, name, age_group: ageGroup, class_id: classId || null }));
  const { error } = await supabase.from('students').insert(rows);
  if (error) throw error;
}
async function dbRemoveStudent(id) {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
}
async function dbAssignStudentClass(id, classId) {
  const { error } = await supabase.from('students').update({ class_id: classId || null }).eq('id', id);
  if (error) throw error;
}
async function dbAddClass(name) {
  const { data, error } = await supabase.rpc('create_class', { p_name: name });
  if (error) throw error;
  return data;
}
async function dbRemoveClass(id) {
  const { error } = await supabase.from('classes').delete().eq('id', id);
  if (error) throw error;
}
async function dbAwardPoints({ studentId, classId, category, name, points, comment, awardedBy }) {
  const { error } = await supabase.from('point_transactions').insert({
    school_id: SCHOOL_ID, student_id: studentId, class_id: classId || null,
    category, name, points: Number(points), comment: comment || null, awarded_by: awardedBy || null,
  });
  if (error) throw error;
}
async function dbAddBehaviorAssessment({ studentId, classId, teacherId, ratings, comment }) {
  const { error } = await supabase.from('behavior_assessments').insert({ school_id: SCHOOL_ID, student_id: studentId, class_id: classId || null, teacher_id: teacherId || null, ratings, comment: comment || null });
  if (error) throw error;
}
async function dbAddAcademicAssessment({ studentId, classId, teacherId, scores, comment }) {
  const { error } = await supabase.from('academic_assessments').insert({ school_id: SCHOOL_ID, student_id: studentId, class_id: classId || null, teacher_id: teacherId || null, scores, comment: comment || null });
  if (error) throw error;
}
async function dbFinalizeCompetition(snapshot) {
  const { error } = await supabase.from('competitions').upsert({
    school_id: SCHOOL_ID, month_key: snapshot.monthKey, weights: snapshot.weights, results: snapshot.results,
    winner_class_id: snapshot.winnerClassId, closed_at: snapshot.closedAt,
  }, { onConflict: 'owner_id,month_key' });
  if (error) throw error;
}
async function dbAssignTeacher({ email, isAdmin, classId }) {
  const { error } = await supabase.rpc('admin_assign_teacher', { p_email: email, p_is_admin: !!isAdmin, p_class_id: classId || null });
  if (error) throw error;
}
async function dbRemoveTeacher(email) {
  const { error } = await supabase.rpc('admin_remove_teacher', { p_email: email });
  if (error) throw error;
}
async function dbAddReflection({ studentId, feeling, improvement }) {
  const { error } = await supabase.from('reflections').insert({ school_id: SCHOOL_ID, student_id: studentId, feeling, improvement });
  if (error) throw error;
}
async function dbRedeem({ studentId, classId, rewardId, rewardName, cost }) {
  const { error } = await supabase.from('redemptions').insert({ school_id: SCHOOL_ID, student_id: studentId, class_id: classId || null, reward_id: rewardId, reward_name: rewardName, cost });
  if (error) throw error;
}
async function dbSelfProvisionTeacher() {
  const { error } = await supabase.rpc('self_provision_teacher');
  if (error) throw error;
}
async function dbResetStudentPin(studentId) {
  const { data, error } = await supabase.rpc('reset_student_pin', { p_student_id: studentId });
  if (error) throw error;
  return data;
}

/* ------------------------- student PIN-login (no Supabase Auth session) ------ */

async function dbFindClassByCode(code) {
  const { data, error } = await supabase.rpc('find_class_by_code', { p_code: code });
  if (error) throw error;
  return data; // null if not found
}
async function dbStudentLogin(studentId, pin) {
  const { data, error } = await supabase.rpc('student_login', { p_student_id: studentId, p_pin: pin });
  if (error) throw error;
  return data;
}
async function dbStudentRedeem({ studentId, pin, rewardId, rewardName, cost }) {
  const { error } = await supabase.rpc('student_redeem', { p_student_id: studentId, p_pin: pin, p_reward_id: rewardId, p_reward_name: rewardName, p_cost: cost });
  if (error) throw error;
}
async function dbStudentAddReflection({ studentId, pin, feeling, improvement }) {
  const { error } = await supabase.rpc('student_add_reflection', { p_student_id: studentId, p_pin: pin, p_feeling: feeling, p_improvement: improvement });
  if (error) throw error;
}

// Builds a state object shaped exactly like loadState()'s output, but from
// the scoped JSON payload returned by student_login() — reuses the same
// rowTo* mappers so every existing StudentApp component works unmodified.
function studentPayloadToState(payload) {
  const spentXP = {};
  (payload.redemptions || []).forEach(r => { spentXP[r.student_id] = (spentXP[r.student_id] || 0) + r.cost; });
  const extra = payload.schoolData || {};
  const savedBehaviors = extra.behaviors || [];
  const savedBehaviorIds = new Set(savedBehaviors.map(b => b.id));
  const mergedBehaviors = [...savedBehaviors, ...DEFAULT_BEHAVIORS.filter(b => !savedBehaviorIds.has(b.id))];
  const savedRewards = extra.rewards || [];
  const savedRewardIds = new Set(savedRewards.map(r => r.id));
  const mergedRewards = [...savedRewards, ...DEFAULT_REWARDS.filter(r => !savedRewardIds.has(r.id))];
  return {
    ...defaultState(),
    ...extra,
    behaviors: mergedBehaviors,
    rewards: mergedRewards,
    classes: (payload.classes || []).map(rowToClass),
    students: (payload.students || []).map(rowToStudent),
    behaviorLog: (payload.points || []).map(rowToBehaviorLog),
    behaviorAssessments: (payload.behaviorAssessments || []).map(rowToBehaviorAssessment),
    academicAssessments: (payload.academicAssessments || []).map(rowToAcademicAssessment),
    competitions: (payload.competitions || []).map(rowToCompetition),
    redemptions: (payload.redemptions || []).map(rowToRedemption),
    reflections: (payload.reflections || []).map(rowToReflection),
    spentXP,
    academicPoints: {},
  };
}

/* --------------------------------- helpers ----------------------------------- */

const dayKey = (iso) => iso.slice(0, 10);

function categoryPoints(state, studentId, category) {
  return state.behaviorLog.filter(l => l.studentId === studentId && l.category === category).reduce((s, l) => s + l.points, 0);
}
function categoryCount(state, studentId, category) {
  // Only positive-point entries count toward badge progress — a concern
  // logged in the same category (e.g. "Not respecting the teacher" under
  // Respect) should never nudge a student closer to a Respect badge.
  return state.behaviorLog.filter(l => l.studentId === studentId && l.category === category && l.points > 0).length;
}
function behaviorPillarPoints(state, studentId) {
  return state.behaviorLog.filter(l => l.studentId === studentId && PILLAR_MAP[l.category] === 'behavior').reduce((s, l) => s + l.points, 0);
}
function totalXP(state, studentId) {
  const academic = state.academicPoints[studentId] || 0;
  const behaviorTotal = state.behaviorLog.filter(l => l.studentId === studentId).reduce((s, l) => s + l.points, 0);
  return academic + behaviorTotal;
}
// Personal week-over-week trend for a single student — used to celebrate
// individual growth without ranking one student against another.
function weeklyXPTrend(state, studentId) {
  const now = Date.now();
  const day = 86400000;
  const logs = state.behaviorLog.filter(l => l.studentId === studentId);
  const thisWeek = logs.filter(l => now - new Date(l.date).getTime() <= 7 * day).reduce((s, l) => s + l.points, 0);
  const lastWeek = logs.filter(l => {
    const age = now - new Date(l.date).getTime();
    return age > 7 * day && age <= 14 * day;
  }).reduce((s, l) => s + l.points, 0);
  return { thisWeek, lastWeek, delta: thisWeek - lastWeek };
}
// Average XP earned per student, per week, for the last `weeks` weeks — used
// to show a class trend that's fair to compare regardless of class size.
function classWeeklyTrend(state, classId, weeks = 8) {
  const day = 86400000;
  const now = Date.now();
  const studs = studentsInClass(state, classId);
  const studentIds = new Set(studs.map(s => s.id));
  const logs = state.behaviorLog.filter(l => studentIds.has(l.studentId));
  const buckets = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const end = now - i * 7 * day;
    const start = end - 7 * day;
    const sum = logs.filter(l => { const t = new Date(l.date).getTime(); return t > start && t <= end; }).reduce((s, l) => s + l.points, 0);
    buckets.push({ weekStart: new Date(start).toISOString(), avg: studs.length ? Math.round((sum / studs.length) * 10) / 10 : 0 });
  }
  return buckets;
}
function spendableXP(state, studentId) {
  return totalXP(state, studentId) - (state.spentXP[studentId] || 0);
}
// Remaining slots on a limited reward. Redemptions are never deleted — a
// "reset" just moves resetAt forward, so only redemptions since the last
// reset count against the cap. No new schema needed.
function rewardRemaining(state, reward) {
  if (reward.limitedQty == null) return null;
  const since = reward.resetAt ? new Date(reward.resetAt).getTime() : 0;
  const redeemed = state.redemptions.filter(r => r.rewardId === reward.id && new Date(r.date).getTime() >= since).length;
  return Math.max(0, reward.limitedQty - redeemed);
}
function rewardAvailable(state, reward) {
  if (reward.enabled === false) return false;
  const remaining = rewardRemaining(state, reward);
  return remaining === null || remaining > 0;
}
// The cheapest reward a student can't yet afford — used to drive the "X XP
// until your next reward" progress bar.
function nextLockedReward(state, studentId) {
  const balance = spendableXP(state, studentId);
  const locked = state.rewards.filter(r => rewardAvailable(state, r) && r.cost > balance);
  if (!locked.length) return null;
  return locked.sort((a, b) => a.cost - b.cost)[0];
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
    concernToast: () => `Let's work on this together`,
  };
  if (ageGroup === 'middle') return {
    greet: n => `Welcome back, ${n} \u{1F44B}`,
    xpToast: n => `\u{1F525} +${n} XP earned!`,
    concernToast: () => `A note was logged for you`,
  };
  return {
    greet: n => `Welcome back, ${n}`,
    xpToast: n => `+${n} XP`,
    concernToast: () => `A note was logged`,
  };
}

/* ------------------------------ demo data generator ------------------------------ */
// Additive only: never touches existing classes/students. Safe to run once from
// the Admin > Classes tab to populate the other demo classes for evaluation.

const DEMO_ROSTER = {
  '6B': ['Hassan', 'Nour', 'Khalid', 'Reem', 'Fahad', 'Dana'],
  '6C': ['Zayd', 'Lina', 'Tariq', 'Huda', 'Rashid', 'Mona'],
  '7A': ['Salem', 'Aisha', 'Waleed', 'Farah', 'Nasser'],
  '7B': ['Bader', 'Yara', 'Faisal', 'Amina', 'Talal'],
  '7C': ['Majed', 'Salma', 'Adel', 'Noor', 'Karim'],
};
// tuned so 6C leads August, matching the target-score example in the original spec
const DEMO_TUNING = {
  '6A': { behavior: 91, academic: 88, pointsPerStudent: 78 },
  '6B': { behavior: 94, academic: 86, pointsPerStudent: 82 },
  '6C': { behavior: 92, academic: 93, pointsPerStudent: 95 },
  '7A': { behavior: 87, academic: 84, pointsPerStudent: 70 },
  '7B': { behavior: 85, academic: 81, pointsPerStudent: 65 },
  '7C': { behavior: 88, academic: 85, pointsPerStudent: 72 },
};

// Populates the other demo classes for evaluation. Additive and safe to run
// once: it only creates classes/students that don't already exist by name,
// and never touches your real class or students.
async function dbLoadDemoData(state, userId) {
  const ageGroups = ['primary', 'middle', 'middle', 'high', 'high'];
  const thisMonth = currentMonthKey();

  const classByName = {};
  state.classes.forEach(c => { classByName[c.name] = c.id; });
  for (const name of ['6A', '6B', '6C', '7A', '7B', '7C']) {
    if (!classByName[name]) {
      const { data, error } = await supabase.from('classes').insert({ school_id: SCHOOL_ID, name }).select().single();
      if (error) throw error;
      classByName[name] = data.id;
    }
  }

  const existingNames = new Set(state.students.filter(s => s.classId).map(s => `${s.classId}::${s.name}`));
  const studentRows = [];
  Object.entries(DEMO_ROSTER).forEach(([clsName, names]) => {
    const classId = classByName[clsName];
    names.forEach((name, i) => {
      if (existingNames.has(`${classId}::${name}`)) return;
      studentRows.push({ school_id: SCHOOL_ID, class_id: classId, name, age_group: ageGroups[i % ageGroups.length] });
    });
  });
  let insertedStudents = [];
  if (studentRows.length) {
    const { data, error } = await supabase.from('students').insert(studentRows).select();
    if (error) throw error;
    insertedStudents = data;
  }

  const allDemoStudents = [...state.students.filter(s => s.classId), ...insertedStudents.map(rowToStudent)];
  const pointRows = [], behaviorAssessRows = [], academicAssessRows = [];

  Object.entries(DEMO_TUNING).forEach(([clsName, tune]) => {
    const classId = classByName[clsName];
    const studs = allDemoStudents.filter(s => s.classId === classId);
    studs.forEach((s, idx) => {
      const jitter = (idx % 3) - 1;
      const recognitions = Math.max(1, Math.round(tune.pointsPerStudent / 10) + jitter);
      for (let r = 0; r < recognitions; r++) {
        const b = DEFAULT_BEHAVIORS[(idx + r) % DEFAULT_BEHAVIORS.length];
        pointRows.push({
          school_id: SCHOOL_ID, student_id: s.id, class_id: classId, category: b.category, name: b.name,
          points: b.points, awarded_by: userId, created_at: `${thisMonth}-${String(2 + (r % 26)).padStart(2, '0')}T09:00:00.000Z`,
        });
      }
      const bRatings = {};
      BEHAVIOR_ASSESS_CATEGORIES.forEach((cat, ci) => { bRatings[cat] = Math.max(1, Math.min(5, Math.round(tune.behavior / 20) + ((idx + ci) % 2 === 0 ? 0 : jitter))); });
      behaviorAssessRows.push({ school_id: SCHOOL_ID, student_id: s.id, class_id: classId, teacher_id: userId, ratings: bRatings, comment: 'Demo assessment.', created_at: `${thisMonth}-10T09:00:00.000Z` });

      const aScores = {};
      ACADEMIC_CATEGORIES.forEach((cat, ci) => { aScores[cat] = Math.max(50, Math.min(100, tune.academic + (((idx + ci) % 5) - 2))); });
      academicAssessRows.push({ school_id: SCHOOL_ID, student_id: s.id, class_id: classId, teacher_id: userId, scores: aScores, comment: 'Demo assessment.', created_at: `${thisMonth}-10T09:00:00.000Z` });
    });
  });

  if (pointRows.length) { const { error } = await supabase.from('point_transactions').insert(pointRows); if (error) throw error; }
  if (behaviorAssessRows.length) { const { error } = await supabase.from('behavior_assessments').insert(behaviorAssessRows); if (error) throw error; }
  if (academicAssessRows.length) { const { error } = await supabase.from('academic_assessments').insert(academicAssessRows); if (error) throw error; }

  const demoCompetitions = [
    { month_key: '2026-06', weights: DEFAULT_COMPETITION_WEIGHTS, closed_at: '2026-06-30T18:00:00.000Z', winner_class_id: classByName['7A'], results: [
      { classId: classByName['7A'], className: '7A', studentCount: 5, pointsAvg: 74, behaviorScore: 90, academicScore: 89, pointsScore: 100, finalScore: 93.7, rank: 1 },
      { classId: classByName['6C'], className: '6C', studentCount: 6, pointsAvg: 70, behaviorScore: 88, academicScore: 90, pointsScore: 95, finalScore: 91.4, rank: 2 },
      { classId: classByName['6B'], className: '6B', studentCount: 6, pointsAvg: 68, behaviorScore: 91, academicScore: 84, pointsScore: 92, finalScore: 89.9, rank: 3 },
      { classId: classByName['6A'], className: '6A', studentCount: 6, pointsAvg: 60, behaviorScore: 89, academicScore: 85, pointsScore: 81, finalScore: 86.0, rank: 4 },
      { classId: classByName['7B'], className: '7B', studentCount: 5, pointsAvg: 55, behaviorScore: 84, academicScore: 80, pointsScore: 74, finalScore: 79.6, rank: 5 },
      { classId: classByName['7C'], className: '7C', studentCount: 5, pointsAvg: 52, behaviorScore: 86, academicScore: 82, pointsScore: 70, finalScore: 79.4, rank: 6 },
    ] },
    { month_key: '2026-07', weights: DEFAULT_COMPETITION_WEIGHTS, closed_at: '2026-07-31T18:00:00.000Z', winner_class_id: classByName['6B'], results: [
      { classId: classByName['6B'], className: '6B', studentCount: 6, pointsAvg: 80, behaviorScore: 93, academicScore: 88, pointsScore: 100, finalScore: 94.3, rank: 1 },
      { classId: classByName['6C'], className: '6C', studentCount: 6, pointsAvg: 76, behaviorScore: 90, academicScore: 91, pointsScore: 95, finalScore: 93.3, rank: 2 },
      { classId: classByName['6A'], className: '6A', studentCount: 6, pointsAvg: 65, behaviorScore: 90, academicScore: 86, pointsScore: 81, finalScore: 85.6, rank: 3 },
      { classId: classByName['7A'], className: '7A', studentCount: 5, pointsAvg: 60, behaviorScore: 86, academicScore: 83, pointsScore: 75, finalScore: 81.6, rank: 4 },
      { classId: classByName['7C'], className: '7C', studentCount: 5, pointsAvg: 58, behaviorScore: 87, academicScore: 84, pointsScore: 73, finalScore: 81.5, rank: 5 },
      { classId: classByName['7B'], className: '7B', studentCount: 5, pointsAvg: 54, behaviorScore: 83, academicScore: 79, pointsScore: 68, finalScore: 76.9, rank: 6 },
    ] },
  ];
  for (const comp of demoCompetitions) {
    const { error } = await supabase.from('competitions').upsert({ school_id: SCHOOL_ID, ...comp }, { onConflict: 'owner_id,month_key' });
    if (error) throw error;
  }
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

// Small inline SVG line chart — no charting library needed for a single trend line.
function TrendChart({ points, color, height = 64, formatLabel }) {
  const w = 280;
  const h = height;
  const pad = 6;
  const max = Math.max(1, ...points.map(p => p.avg));
  const min = Math.min(0, ...points.map(p => p.avg));
  const range = max - min || 1;
  const step = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({
    x: pad + i * step,
    y: pad + (1 - (p.avg - min) / range) * (h - pad * 2),
    ...p,
  }));
  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
  const areaPath = `${path} L ${coords[coords.length - 1]?.x.toFixed(1)} ${h - pad} L ${coords[0]?.x.toFixed(1)} ${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <path d={areaPath} fill={`${color}18`} stroke="none" />
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {coords.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 3 : 2} fill={color} />)}
    </svg>
  );
}

// Deterministic per-student color + initials avatar. Gives every student an
// instantly-recognizable visual identity in rosters and pickers, the way
// ClassDojo's monster avatars do — without needing any uploaded image or
// copying its actual mascot art.
const AVATAR_PALETTE = ['#7C5CFC', '#2F9E8F', '#E0703D', '#D64E7A', '#4C8DE8', '#C9963D', '#5FA867', '#9B6BD6'];
function avatarColorFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}
function initialsOf(name) {
  const parts = (name || '').trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}
function Avatar({ name, id, size = 32, ring }) {
  const color = avatarColorFor(id || name || 'x');
  return (
    <div
      className="rounded-full flex items-center justify-center font-black shrink-0"
      style={{
        width: size, height: size, fontSize: Math.round(size * 0.38),
        background: `linear-gradient(135deg, ${color}, ${color}99)`, color: COLORS.onAccent,
        boxShadow: ring ? `0 0 0 2px ${COLORS.panel}, 0 0 0 4px ${color}` : 'none',
      }}
    >
      {initialsOf(name)}
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
  const colorMap = { xp: COLORS.xp, badge: COLORS.xp, reward: COLORS.reward, reflect: COLORS.behavior, concern: COLORS.challenge };
  const color = colorMap[toast.kind] || COLORS.xp;
  const Icon = toast.kind === 'concern' ? MessageSquare : Sparkles;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]">
      <div className="rounded-xl px-5 py-3 shadow-2xl flex items-center gap-3 max-w-sm border" style={{ background: COLORS.panel, borderColor: `${color}55` }}>
        <Icon size={18} style={{ color }} className="shrink-0" />
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
          {onClose && <button onClick={onClose} aria-label="Close" style={{ color: COLORS.textMuted }}><X size={18} /></button>}
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

/* ------------------------------- Teacher auth modal ----------------------------- */

function TeacherAuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('signup'); // 'signup' | 'signin'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  async function handleSignIn() {
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onSuccess();
  }
  async function handleSignUp() {
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    const { data, error: err } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: name || undefined } },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    if (data.session) { onSuccess(); return; } // email confirmation disabled — signed in immediately
    setConfirmSent(true);
  }

  if (confirmSent) {
    return (
      <ModalShell title="Check your email" onClose={onClose}>
        <div className="text-center py-2 space-y-3">
          <div className="text-4xl">{'\u{1F4E7}'}</div>
          <p className="text-sm" style={{ color: COLORS.text }}>
            We sent a confirmation link to <b>{email}</b>. Click it, then come back and sign in.
          </p>
          <button onClick={() => { setConfirmSent(false); setMode('signin'); }} className="text-xs font-bold rounded-lg px-4 py-2" style={{ background: COLORS.robotics, color: COLORS.onAccent }}>
            Back to Sign In
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell title={mode === 'signup' ? 'Create your teacher account' : 'Teacher Sign In'} onClose={onClose}>
      <div className="flex gap-1 rounded-lg p-1 mb-4 border" style={{ background: COLORS.panelAlt, borderColor: COLORS.border }}>
        <button onClick={() => { setMode('signup'); setError(''); }} className="flex-1 py-1.5 rounded-md text-xs font-bold"
          style={mode === 'signup' ? { background: COLORS.robotics, color: COLORS.onAccent } : { color: COLORS.textMuted }}>Sign Up</button>
        <button onClick={() => { setMode('signin'); setError(''); }} className="flex-1 py-1.5 rounded-md text-xs font-bold"
          style={mode === 'signin' ? { background: COLORS.robotics, color: COLORS.onAccent } : { color: COLORS.textMuted }}>Sign In</button>
      </div>
      <div className="space-y-4">
        {mode === 'signup' && (
          <Field label="Your name"><input value={name} onChange={e => setName(e.target.value)} placeholder="Ms. Hana" style={inputStyle} /></Field>
        )}
        <Field label="Email"><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} /></Field>
        <Field label="Password"><input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} /></Field>
        {error && <div className="text-xs font-semibold" style={{ color: '#FF6B6B' }}>{error}</div>}
        <button onClick={mode === 'signup' ? handleSignUp : handleSignIn} disabled={loading || !email || !password}
          className="w-full font-bold text-sm rounded-lg py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: COLORS.robotics, color: COLORS.onAccent }}>
          <LogIn size={15} /> {loading ? 'Please wait\u2026' : mode === 'signup' ? 'Create Account' : 'Sign In'}
        </button>
        <p className="text-[10.5px] text-center" style={{ color: COLORS.textFaint }}>
          {mode === 'signup' ? "You'll be able to create your own classes right after this." : 'New here? Switch to Sign Up above.'}
        </p>
      </div>
    </ModalShell>
  );
}

/* ------------------------------------ App -------------------------------------- */

// The three-step path is a genuine sequence (how a class actually moves
// through the app), so it's the one place on the page that earns numbered
// nodes. Everything else on the page is not a sequence and stays unnumbered.
const LANDING_JOURNEY = [
  { icon: Sparkles, color: 'xp', title: 'Recognize', body: 'Tap a name, pick a reason, and points land instantly \u2014 for one student or a whole group at once.' },
  { icon: Gift, color: 'reward', title: 'Redeem', body: 'Students spend what they\u2019ve earned in a reward store you build. No sticker charts, no paper tickets.' },
  { icon: Trophy, color: 'robotics', title: 'Compete', body: 'Your own sections face off in monthly challenges, scored automatically \u2014 a champion class every month.' },
];

// NOTE for Hana: these are placeholder quotes so the section isn't empty —
// swap in real reviews from actual teachers once you have a few. Don't
// publish this section with made-up names/quotes attached to real people.
const LANDING_TESTIMONIALS = [
  { name: 'Your teacher\u2019s name here', role: 'Placeholder \u2014 swap for a real quote', quote: 'Once you have a few teachers using Najm, replace this with something they actually said about it.' },
  { name: 'Another teacher', role: 'Placeholder', quote: 'This section is built and ready \u2014 it just needs real testimonials before it goes live.' },
  { name: 'A third teacher', role: 'Placeholder', quote: 'Three quotes usually feels full without being repetitive. Keep them short.' },
];

const LANDING_FAQ = [
  { q: 'What is Najm?', a: 'Najm ("star" in Arabic) is a free classroom rewards and behavior-tracking app. Teachers recognize good behavior and great work with points; students track their own growth, earn badges, and spend points in a reward store.' },
  { q: 'How do students log in?', a: 'No email needed. Students enter their teacher\u2019s class code, tap their name from the roster, and enter their private 4-digit PIN.' },
  { q: 'Is my class visible to other teachers?', a: 'No. Every class belongs to the teacher who created it \u2014 other teachers who sign up can\u2019t see your classes, students, or points.' },
  { q: 'Can a student see another student\u2019s points?', a: 'No. Once signed in, a student only ever sees their own dashboard.' },
  { q: 'How is Najm different from other classroom reward apps?', a: 'Najm is built to be self-serve from day one \u2014 any teacher can sign up and be running in a couple of minutes, with class-vs-class competitions and a growth-focused "Spotlight" view instead of a public ranked leaderboard.' },
  { q: 'What does it cost?', a: 'Signing up and creating classes doesn\u2019t require a payment method.' },
];

function RoleTile({ icon: Icon, color, label, sub, onClick }) {
  return (
    <button onClick={onClick} className="animate-fade-up flex flex-col items-center gap-2 group">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center border transition group-hover:-translate-y-1"
        style={{ background: COLORS.panel, borderColor: 'rgba(255,255,255,0.08)', boxShadow: '0 10px 28px rgba(4,7,20,0.4)' }}>
        <Icon size={26} style={{ color }} />
      </div>
      <div className="text-xs font-black" style={{ color: COLORS.onAccent }}>{label}</div>
      {sub && <div className="text-[10px] max-w-[110px] text-center leading-tight" style={{ color: COLORS.sidebarText }}>{sub}</div>}
    </button>
  );
}

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="border-b" style={{ borderColor: COLORS.border }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-3 py-4 text-left">
        <span className="text-[13.5px] font-bold">{q}</span>
        <ChevronDown size={16} style={{ color: COLORS.textFaint, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && <p className="pb-4 text-[12.5px] leading-relaxed" style={{ color: COLORS.textMuted }}>{a}</p>}
    </div>
  );
}

function LandingPage({ state, onPickStudent, onPickTeacher }) {
  const showcase = state.students.slice(0, 6);
  const [openFaq, setOpenFaq] = useState(0);
  // Fixed, deterministic star field so the hero doesn't reshuffle on re-render.
  const heroStars = [
    { top: '12%', left: '8%', delay: '0s' }, { top: '22%', left: '88%', delay: '0.4s' },
    { top: '68%', left: '5%', delay: '0.9s' }, { top: '78%', left: '92%', delay: '1.3s' },
    { top: '8%', left: '46%', delay: '1.7s' }, { top: '85%', left: '52%', delay: '0.2s' },
    { top: '40%', left: '94%', delay: '1.1s' }, { top: '48%', left: '3%', delay: '0.6s' },
  ];

  return (
    <div style={{ background: COLORS.bg }}>
      {/* ---------- Hero: night sky, matching the Najm (\u201cstar\u201d) mark ---------- */}
      <div className="relative overflow-hidden px-4 pt-16 pb-20" style={{ background: `linear-gradient(185deg, #0A0E22, ${COLORS.sidebarBg} 55%, ${COLORS.sidebarBg})` }}>
        {heroStars.map((s, i) => (
          <div key={i} className="star-twinkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }} />
        ))}
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-5 flex items-center justify-center animate-pop-in">
            <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${COLORS.sidebarActive}30, transparent 70%)`, filter: 'blur(10px)' }} />
            <img src="/najm-logo.png" alt="Najm logo: a glowing gold star character"
              className="relative w-full h-full object-contain animate-float" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-5 text-[10.5px] font-black tracking-wide animate-fade-up" style={{ background: `${COLORS.sidebarActive}22`, color: COLORS.sidebarActive }}>
            <Star size={11} fill={COLORS.sidebarActive} /> EVERY STUDENT IS A STAR
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight leading-[1.1] mb-4 animate-fade-up" style={{ animationDelay: '60ms', color: COLORS.onAccent }}>
            A classroom reward system<br className="hidden sm:block" /> students actually <span style={{ color: COLORS.sidebarActive }}>care about</span>
          </h1>
          <p className="text-base sm:text-lg font-medium max-w-xl mx-auto mb-9 animate-fade-up" style={{ animationDelay: '120ms', color: COLORS.sidebarText }}>
            Add your students in seconds, share a simple class code, and motivate behavior by rewarding points in real time.
          </p>

          <div className="text-[11px] font-black uppercase tracking-wide mb-4 animate-fade-up" style={{ animationDelay: '160ms', color: COLORS.sidebarText }}>Get started as a{'\u2026'}</div>
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-7">
            <RoleTile icon={GraduationCap} color={COLORS.sidebarActive} label="Teacher" sub="Create classes & give points" onClick={onPickTeacher} />
            <RoleTile icon={UserCircle2} color={COLORS.sidebarActive} label="Student" sub="See my progress" onClick={onPickStudent} />
          </div>
          <button onClick={onPickTeacher} className="animate-fade-up font-black text-sm rounded-full px-8 py-3 shadow-lg" style={{ animationDelay: '200ms', background: COLORS.sidebarActive, color: COLORS.sidebarBg, boxShadow: `0 8px 24px rgba(0,0,0,0.35)` }}>
            Get Started
          </button>

          {showcase.length > 0 && (
            <div className="flex items-center justify-center -space-x-2 mt-9 animate-fade-up" style={{ animationDelay: '260ms' }}>
              {showcase.map((s, i) => (
                <div key={s.id} className="animate-pop-in" style={{ animationDelay: `${300 + i * 70}ms` }}>
                  <Avatar name={s.name} id={s.id} size={34} ring />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Journey: the three real steps of using Najm ---------- */}
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-10">
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
          <div className="hidden sm:block absolute top-9 left-[16.5%] right-[16.5%] h-px" style={{ background: COLORS.border }} />
          {LANDING_JOURNEY.map((f, i) => (
            <div key={f.title} className="relative animate-fade-up text-center" style={{ animationDelay: `${i * 90}ms` }}>
              <div className="relative w-[72px] h-[72px] mx-auto mb-4 rounded-full flex items-center justify-center border-2" style={{ background: COLORS.panel, borderColor: COLORS[f.color] }}>
                <f.icon size={28} style={{ color: COLORS[f.color] }} strokeWidth={1.8} />
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: COLORS[f.color], color: COLORS.onAccent }}>{i + 1}</div>
              </div>
              <div className="text-base font-display font-black mb-1.5">{f.title}</div>
              <div className="text-sm leading-relaxed max-w-[220px] mx-auto" style={{ color: COLORS.textMuted }}>{f.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Privacy assurance (a standing fact, not a journey step) ---------- */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="animate-fade-up flex flex-col sm:flex-row items-center gap-4 rounded-2xl border p-5 sm:p-6" style={{ background: COLORS.panelAlt, borderColor: COLORS.border }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${COLORS.behavior}16` }}>
            <ShieldCheck size={26} style={{ color: COLORS.behavior }} strokeWidth={1.8} />
          </div>
          <div className="text-center sm:text-left">
            <div className="text-sm font-display font-black mb-1">Private by design</div>
            <div className="text-[13px] leading-relaxed" style={{ color: COLORS.textMuted }}>Every class is only visible to the teacher who made it, and students never see a classmate\u2019s points \u2014 only their own dashboard.</div>
          </div>
        </div>
      </div>

      {/* ---------- Testimonials ---------- */}
      <div className="py-16 px-4" style={{ background: COLORS.panelAlt }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-9">
            <div className="text-xl sm:text-2xl font-display font-black">Kind Words from Our Teachers</div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {LANDING_TESTIMONIALS.map((t, i) => (
              <div key={i} className="animate-fade-up rounded-2xl p-5 border" style={{ animationDelay: `${i * 60}ms`, background: COLORS.panel, borderColor: COLORS.border }}>
                <div className="flex gap-0.5 mb-2.5">
                  {Array.from({ length: 5 }).map((_, si) => <Star key={si} size={13} fill={COLORS.sidebarActive} style={{ color: COLORS.sidebarActive }} />)}
                </div>
                <p className="text-[12.5px] leading-relaxed mb-3" style={{ color: COLORS.text }}>{t.quote}</p>
                <div className="text-xs font-black">{t.name}</div>
                <div className="text-[10.5px]" style={{ color: COLORS.textFaint }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- FAQ ---------- */}
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-6">
          <div className="text-xl sm:text-2xl font-display font-black">Answers to Your Questions</div>
        </div>
        <div>
          {LANDING_FAQ.map((item, i) => (
            <FaqItem key={item.q} q={item.q} a={item.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
          ))}
        </div>
      </div>

      {/* ---------- Bottom CTA: bookends the hero with the same night sky ---------- */}
      <div className="relative overflow-hidden px-4 py-16 text-center" style={{ background: `linear-gradient(160deg, ${COLORS.sidebarBg}, #0A0E22)` }}>
        <div className="star-twinkle" style={{ top: '20%', left: '12%', animationDelay: '0.3s' }} />
        <div className="star-twinkle" style={{ top: '70%', left: '85%', animationDelay: '1.1s' }} />
        <div className="star-twinkle" style={{ top: '30%', left: '90%', animationDelay: '0.7s' }} />
        <div className="relative">
          <div className="text-2xl sm:text-3xl font-display font-black mb-2" style={{ color: COLORS.onAccent }}>Get started with Najm today</div>
          <p className="text-sm mb-7" style={{ color: COLORS.sidebarText }}>Create your free teacher account and set up your first class in minutes.</p>
          <button onClick={onPickTeacher} className="font-black text-sm rounded-full px-8 py-3" style={{ background: COLORS.sidebarActive, color: COLORS.sidebarBg }}>
            Get Started
          </button>
        </div>
      </div>

      {/* ---------- Footer ---------- */}
      <div className="border-t px-4 py-6" style={{ borderColor: COLORS.border }}>
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 text-[11px]" style={{ color: COLORS.textFaint }}>
          <Star size={12} fill={COLORS.textFaint} style={{ color: COLORS.textFaint }} />
          Najm {'\u2014'} Every Student Is a Star
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Student class-code entry ---------------------- */

function StudentClassCodeEntry({ onFound, onBack }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!code.trim() || loading) return;
    setLoading(true); setError('');
    try {
      const found = await dbFindClassByCode(code.trim());
      setLoading(false);
      if (!found) { setError("We couldn't find a class with that code. Double-check with your teacher."); return; }
      onFound(found);
    } catch (e) {
      setLoading(false);
      setError(e.message || 'Something went wrong.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: `linear-gradient(160deg, ${COLORS.bg}, ${COLORS.panelAlt})` }}>
      <div className="w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pop-in" style={{ background: `${COLORS.xp}18` }}>
          <KeyRound size={24} style={{ color: COLORS.xp }} />
        </div>
        <div className="text-lg font-display font-black mb-1 animate-fade-up">Enter your class code</div>
        <div className="text-xs mb-6 animate-fade-up" style={{ color: COLORS.textMuted }}>Ask your teacher for the 6-character code.</div>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && submit()}
          maxLength={6}
          placeholder="K7QX2M"
          className="w-full text-center text-2xl font-display font-black tracking-[0.3em] rounded-xl px-3 py-3.5 border outline-none"
          style={{ background: COLORS.panel, borderColor: COLORS.border, color: COLORS.text }}
        />
        {error && <div className="text-xs font-semibold mt-3" style={{ color: '#FF6B6B' }}>{error}</div>}
        <button onClick={submit} disabled={!code.trim() || loading}
          className="w-full mt-4 font-bold text-sm rounded-lg py-2.5 disabled:opacity-50"
          style={{ background: COLORS.xp, color: COLORS.onAccent }}>
          {loading ? 'Looking\u2026' : 'Continue'}
        </button>
        <button onClick={onBack} className="text-xs font-semibold mt-4" style={{ color: COLORS.textFaint }}>{'\u2190'} Back</button>
      </div>
    </div>
  );
}

function StudentRosterPick({ classInfo, onPick, onBack }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: `linear-gradient(160deg, ${COLORS.bg}, ${COLORS.panelAlt})` }}>
      <div className="w-full max-w-lg text-center py-6">
        <div className="text-lg font-display font-black mb-1 animate-fade-up">{classInfo.name}</div>
        <div className="text-xs mb-6 animate-fade-up" style={{ color: COLORS.textMuted }}>Tap your name</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {classInfo.students.map((s, i) => (
            <button key={s.id} onClick={() => onPick(s)}
              className="animate-fade-up flex flex-col items-center gap-2 rounded-2xl border p-3.5 transition hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 40}ms`, background: COLORS.panel, borderColor: COLORS.border }}>
              <Avatar name={s.name} id={s.id} size={44} />
              <div className="text-xs font-bold truncate w-full">{s.name}</div>
            </button>
          ))}
        </div>
        <button onClick={onBack} className="text-xs font-semibold mt-6" style={{ color: COLORS.textFaint }}>{'\u2190'} Not my class</button>
      </div>
    </div>
  );
}

function StudentPinPad({ student, onVerified, onBack }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(finalPin) {
    if (finalPin.length !== 4 || loading) return;
    setLoading(true); setError('');
    try {
      const payload = await dbStudentLogin(student.id, finalPin);
      setLoading(false);
      if (!payload?.ok) { setError('Wrong PIN — ask your teacher if you forgot it.'); setPin(''); return; }
      onVerified(payload, finalPin);
    } catch (e) {
      setLoading(false);
      setError(e.message || 'Something went wrong.');
    }
  }
  function tap(d) {
    if (loading) return;
    const next = (pin + d).slice(0, 4);
    setPin(next);
    setError('');
    if (next.length === 4) submit(next);
  }
  function backspace() { setPin(p => p.slice(0, -1)); setError(''); }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: `linear-gradient(160deg, ${COLORS.bg}, ${COLORS.panelAlt})` }}>
      <div className="w-full max-w-xs text-center">
        <Avatar name={student.name} id={student.id} size={56} />
        <div className="text-base font-display font-black mt-3 mb-1">{student.name}</div>
        <div className="text-xs mb-5" style={{ color: COLORS.textMuted }}>Enter your 4-digit PIN</div>
        <div className="flex items-center justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: COLORS.xp, background: i < pin.length ? COLORS.xp : 'transparent' }} />
          ))}
        </div>
        {error && <div className="text-xs font-semibold mb-4" style={{ color: '#FF6B6B' }}>{error}</div>}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '\u232B'].map((d, i) => d === '' ? <div key={i} /> : (
            <button key={i} disabled={loading} onClick={() => d === '\u232B' ? backspace() : tap(d)}
              className="rounded-xl py-3.5 text-lg font-bold border disabled:opacity-50"
              style={{ background: COLORS.panel, borderColor: COLORS.border, color: COLORS.text }}>
              {d}
            </button>
          ))}
        </div>
        <button onClick={onBack} className="text-xs font-semibold mt-6" style={{ color: COLORS.textFaint }}>{'\u2190'} Not me</button>
      </div>
    </div>
  );
}

/* ------------------------------- Create first class ----------------------------- */

function CreateFirstClassScreen({ onCreate }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!name.trim() || loading) return;
    setLoading(true); setError('');
    try {
      await onCreate(name.trim());
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-sm mx-auto text-center py-10">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pop-in" style={{ background: `${COLORS.robotics}18` }}>
        <Building2 size={24} style={{ color: COLORS.robotics }} />
      </div>
      <div className="text-lg font-display font-black mb-1 animate-fade-up">Create your first class</div>
      <div className="text-xs mb-6 animate-fade-up" style={{ color: COLORS.textMuted }}>You'll get a class code to share with students.</div>
      <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="e.g. Grade 7 Robotics" style={inputStyle} className="text-center" />
      {error && <div className="text-xs font-semibold mt-3" style={{ color: '#FF6B6B' }}>{error}</div>}
      <button onClick={submit} disabled={!name.trim() || loading}
        className="w-full mt-4 font-bold text-sm rounded-lg py-2.5 disabled:opacity-50"
        style={{ background: COLORS.robotics, color: COLORS.onAccent }}>
        {loading ? 'Creating\u2026' : 'Create Class'}
      </button>
    </div>
  );
}

function ClassPickerScreen({ state, classes, onPick }) {
  return (
    <div className="max-w-lg mx-auto text-center py-6">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pop-in" style={{ background: `${COLORS.robotics}18` }}>
        <Building2 size={22} style={{ color: COLORS.robotics }} />
      </div>
      <div className="text-lg font-display font-black mb-1 animate-fade-up">Which class today?</div>
      <div className="text-xs mb-6 animate-fade-up" style={{ animationDelay: '60ms', color: COLORS.textMuted }}>Pick a class to start giving points.</div>
      <div className="grid gap-2.5">
        {classes.map((c, i) => {
          const roster = studentsInClass(state, c.id);
          return (
            <button key={c.id} onClick={() => onPick(c.id)}
              className="animate-fade-up flex items-center gap-3 rounded-2xl border p-3.5 text-left transition hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 70}ms`, background: COLORS.panel, borderColor: COLORS.border }}>
              <div className="flex -space-x-2 shrink-0">
                {roster.slice(0, 3).map(s => <Avatar key={s.id} name={s.name} id={s.id} size={30} />)}
                {roster.length === 0 && <Avatar name={c.name} id={c.id} size={30} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black truncate">{c.name}</div>
                <div className="text-[11px]" style={{ color: COLORS.textFaint }}>{roster.length} student{roster.length === 1 ? '' : 's'}</div>
              </div>
              <ChevronRight size={16} style={{ color: COLORS.textFaint }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   REDESIGN — Avatars, Analytics Dashboard, Public Homepage
   ============================================================ */

/* ---------- Avatar trait tables ---------- */
const AVATAR_TOP_MALE = ['ShortHairTheCaesar','ShortHairShortFlat','ShortHairShortRound','ShortHairShortWaved','ShortHairSides','NoHair'];
const AVATAR_TOP_FEMALE = ['LongHairBigHair','LongHairBob','LongHairBun','LongHairCurly','LongHairStraight','LongHairStraight2','Hijab'];
const AVATAR_CLOTHE = ['BlazerAndShirt','BlazerAndSweater','CollarAndSweater','GraphicShirt','Hoodie','Overall','ShirtCrewNeck','ShirtVNeck'];
const AVATAR_CLOTHE_COLOR = ['Black','Blue01','Blue02','Blue03','Gray01','Gray02','PastelBlue','PastelGreen','PastelOrange','Pink','Red','White'];
const AVATAR_EYE = ['Close','Default','Happy','Squint','Surprised','Wink','Hearts'];
const AVATAR_MOUTH = ['Default','Smile','Smirk','Serious','Twinkle','Tongue'];
const AVATAR_SKIN = ['Tanned','Yellow','Pale','Light','Brown','DarkBrown','Black'];
const AVATAR_HAIR_COLOR = ['Auburn','Black','Blonde','BlondeGolden','Brown','BrownDark','PastelPink','Red'];

function seededRand(seed, max) {
  const x = Math.sin(seed + 1) * 10000;
  return Math.floor((x - Math.floor(x)) * max);
}

function generateAvatar(studentId, gender = 'male') {
  const s = studentId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const pick = (arr, offset) => arr[seededRand(s + offset, arr.length)];
  const topList = gender === 'female' ? AVATAR_TOP_FEMALE : AVATAR_TOP_MALE;
  return {
    gender,
    topType: pick(topList, 1),
    clotheType: pick(AVATAR_CLOTHE, 2),
    clotheColor: pick(AVATAR_CLOTHE_COLOR, 3),
    eyeType: pick(AVATAR_EYE, 4),
    mouthType: pick(AVATAR_MOUTH, 5),
    skinColor: pick(AVATAR_SKIN, 6),
    hairColor: pick(AVATAR_HAIR_COLOR, 7),
  };
}

/* ---------- SVG Avatar renderer ---------- */
const SKIN_HEX = { Tanned:'#FD9841',Yellow:'#F8D25C',Pale:'#FDDBB4',Light:'#EDB98A',Brown:'#D08B5B',DarkBrown:'#AE5D29',Black:'#614335' };
const HAIR_HEX = { Auburn:'#A55728',Black:'#2C1B18',Blonde:'#B58143',BlondeGolden:'#D6B370',Brown:'#724133',BrownDark:'#4A312C',PastelPink:'#F59797',Red:'#C93305' };
const CLOTHE_HEX = { Black:'#262E33',Blue01:'#65C9FF',Blue02:'#5199E4',Blue03:'#25557C',Gray01:'#E6E6E6',Gray02:'#929598',PastelBlue:'#B1E2FF',PastelGreen:'#A7FFC4',PastelOrange:'#FFDEB5',Pink:'#FF488E',Red:'#FF5C5C',White:'#FFFFFF' };

function AvatarSVG({ av, size = 72 }) {
  const skin = SKIN_HEX[av.skinColor] || '#EDB98A';
  const hair = HAIR_HEX[av.hairColor] || '#2C1B18';
  const cloth = CLOTHE_HEX[av.clotheColor] || '#5199E4';
  const clothDark = cloth + 'CC';
  const isFemale = av.gender === 'female';
  const hasHijab = av.topType === 'Hijab';
  const skinShadow = skin + 'AA';
  const eyeStyle = av.eyeType || 'Default';
  const mouthStyle = av.mouthType || 'Smile';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`sg${av.skinColor}`} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor={skin} stopOpacity="1"/>
          <stop offset="100%" stopColor={skinShadow} stopOpacity="1"/>
        </radialGradient>
        <radialGradient id={`bg${av.clotheColor}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={cloth} stopOpacity="1"/>
          <stop offset="100%" stopColor={clothDark} stopOpacity="1"/>
        </radialGradient>
      </defs>

      {/* Body / shirt with gradient */}
      <ellipse cx="50" cy="95" rx="30" ry="18" fill={`url(#bg${av.clotheColor})`} />
      {/* Collar detail */}
      <path d="M42 72 Q50 78 58 72 L56 68 Q50 74 44 68 Z" fill={clothDark} opacity="0.6"/>

      {/* Neck */}
      <rect x="44" y="62" width="12" height="12" rx="4" fill={skin}/>
      {/* Neck shadow */}
      <rect x="44" y="68" width="12" height="6" rx="2" fill={skinShadow} opacity="0.3"/>

      {/* Head base with gradient */}
      <ellipse cx="50" cy="45" rx="22" ry="24" fill={`url(#sg${av.skinColor})`}/>
      {/* Cheek blush */}
      <ellipse cx="30" cy="50" rx="6" ry="4" fill="#FF9999" opacity="0.25"/>
      <ellipse cx="70" cy="50" rx="6" ry="4" fill="#FF9999" opacity="0.25"/>

      {/* Ears */}
      <ellipse cx="28" cy="46" rx="5" ry="6" fill={skin}/>
      <ellipse cx="72" cy="46" rx="5" ry="6" fill={skin}/>
      <ellipse cx="28" cy="46" rx="3" ry="4" fill={skinShadow} opacity="0.3"/>
      <ellipse cx="72" cy="46" rx="3" ry="4" fill={skinShadow} opacity="0.3"/>

      {/* Hair */}
      {hasHijab ? (
        <>
          <ellipse cx="50" cy="30" rx="24" ry="20" fill={hair}/>
          <ellipse cx="50" cy="44" rx="26" ry="10" fill={hair}/>
          <rect x="24" y="38" width="6" height="20" rx="3" fill={hair}/>
          <rect x="70" y="38" width="6" height="20" rx="3" fill={hair}/>
        </>
      ) : isFemale ? (
        <>
          {/* Long hair back */}
          <ellipse cx="50" cy="25" rx="23" ry="16" fill={hair}/>
          <rect x="24" y="30" width="7" height="30" rx="4" fill={hair}/>
          <rect x="69" y="30" width="7" height="30" rx="4" fill={hair}/>
          {/* Hair shine */}
          <ellipse cx="42" cy="22" rx="6" ry="3" fill="white" opacity="0.15" transform="rotate(-20,42,22)"/>
        </>
      ) : (
        <>
          {/* Short hair */}
          <ellipse cx="50" cy="26" rx="22" ry="14" fill={hair}/>
          <rect x="28" y="26" width="6" height="10" rx="3" fill={hair}/>
          <rect x="66" y="26" width="6" height="10" rx="3" fill={hair}/>
          {/* Hair shine */}
          <ellipse cx="43" cy="23" rx="7" ry="3" fill="white" opacity="0.15" transform="rotate(-15,43,23)"/>
        </>
      )}

      {/* Eyes — big Pixar-style */}
      {eyeStyle === 'Happy' || eyeStyle === 'Wink' ? (
        <>
          <path d="M36 44 Q40 40 44 44" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          {eyeStyle === 'Wink'
            ? <ellipse cx="62" cy="43" rx="5" ry="6" fill="#1a1a1a"/>
            : <path d="M56 44 Q60 40 64 44" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
        </>
      ) : eyeStyle === 'Surprised' ? (
        <>
          <circle cx="40" cy="43" r="7" fill="white" stroke="#1a1a1a" strokeWidth="1"/>
          <circle cx="40" cy="43" r="4" fill="#1a1a1a"/>
          <circle cx="42" cy="41" r="1.5" fill="white"/>
          <circle cx="60" cy="43" r="7" fill="white" stroke="#1a1a1a" strokeWidth="1"/>
          <circle cx="60" cy="43" r="4" fill="#1a1a1a"/>
          <circle cx="62" cy="41" r="1.5" fill="white"/>
        </>
      ) : (
        <>
          {/* Normal big eyes */}
          <ellipse cx="40" cy="43" rx="7" ry="8" fill="white" stroke="#1a1a1a" strokeWidth="1"/>
          <ellipse cx="40" cy="44" rx="5" ry="6" fill="#3D2B1A"/>
          <ellipse cx="40" cy="44" rx="3" ry="4" fill="#1a1a1a"/>
          <circle cx="42" cy="42" r="2" fill="white"/>
          <circle cx="38" cy="45" r="1" fill="white" opacity="0.5"/>

          <ellipse cx="60" cy="43" rx="7" ry="8" fill="white" stroke="#1a1a1a" strokeWidth="1"/>
          <ellipse cx="60" cy="44" rx="5" ry="6" fill="#3D2B1A"/>
          <ellipse cx="60" cy="44" rx="3" ry="4" fill="#1a1a1a"/>
          <circle cx="62" cy="42" r="2" fill="white"/>
          <circle cx="58" cy="45" r="1" fill="white" opacity="0.5"/>
        </>
      )}

      {/* Eyebrows */}
      <path d="M33 36 Q40 33 47 36" stroke={hair} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M53 36 Q60 33 67 36" stroke={hair} strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* Nose */}
      <path d="M48 50 Q50 54 52 50" stroke={skinShadow} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>

      {/* Mouth */}
      {mouthStyle === 'Smile' || mouthStyle === 'Twinkle' ? (
        <>
          <path d="M40 58 Q50 65 60 58" stroke="#C0392B" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M42 58 Q50 64 58 58 Q50 62 42 58 Z" fill="#E74C3C" opacity="0.5"/>
          {mouthStyle === 'Twinkle' && <ellipse cx="50" cy="59" rx="5" ry="2" fill="white" opacity="0.6"/>}
        </>
      ) : mouthStyle === 'Smirk' ? (
        <path d="M42 58 Q52 63 60 57" stroke="#C0392B" strokeWidth="2" fill="none" strokeLinecap="round"/>
      ) : mouthStyle === 'Serious' ? (
        <path d="M42 59 Q50 60 58 59" stroke="#C0392B" strokeWidth="2" fill="none" strokeLinecap="round"/>
      ) : mouthStyle === 'Tongue' ? (
        <>
          <path d="M40 58 Q50 65 60 58" stroke="#C0392B" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <ellipse cx="50" cy="62" rx="5" ry="4" fill="#E74C3C"/>
        </>
      ) : (
        <path d="M42 59 Q50 64 58 59" stroke="#C0392B" strokeWidth="2" fill="none" strokeLinecap="round"/>
      )}
    </svg>
  );
}

/* ---------- Clickable Student Avatar ---------- */
function StudentAvatar({ student, size='md', clickable=true, onAward, showName=true, showRank=false, showXP=false, state, COLORS }) {
  const av = state?.studentAvatars?.[student.id];
  const [bouncing, setBouncing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const px = { sm:48, md:72, lg:96, xl:120 }[size] || 72;
  const xp = state ? totalXP(state, student.id) : 0;
  const rank = state
    ? (state.students||[]).slice().sort((a,b)=>totalXP(state,b.id)-totalXP(state,a.id)).findIndex(s=>s.id===student.id)+1
    : null;

  const handleClick = () => { if (clickable && onAward) setShowMenu(true); };

  const handleAward = (b) => {
    onAward(student.id, b.id, b.points);
    setBouncing(true);
    setShowMenu(false);
    setTimeout(() => setBouncing(false), 500);
    for (let i = 0; i < 5; i++) {
      const el = document.createElement('div');
      el.textContent = '⭐';
      el.style.cssText = `position:fixed;font-size:18px;pointer-events:none;z-index:9999;top:${window.innerHeight/2}px;left:${window.innerWidth/2}px;animation:av-particle 0.8s ease-out forwards;--tx:${(Math.random()-0.5)*60}px`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 800);
    }
  };

  if (typeof document !== 'undefined' && !document.getElementById('av-kf')) {
    const s = document.createElement('style');
    s.id = 'av-kf';
    s.textContent = `@keyframes av-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@keyframes av-particle{0%{opacity:1;transform:translateY(0) translateX(0)}100%{opacity:0;transform:translateY(-40px) translateX(var(--tx))}}.av-bounce{animation:av-bounce 0.5s ease-in-out}`;
    document.head.appendChild(s);
  }

  const fallback = student.name?.[0]?.toUpperCase() || '?';

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,position:'relative'}}>
      <div
        className={bouncing ? 'av-bounce' : ''}
        onClick={handleClick}
        style={{width:px,height:px,cursor:clickable&&onAward?'pointer':'default',borderRadius:'50%',overflow:'hidden',background:COLORS?.panelAlt||'#EAF0FE',border:`3px solid ${COLORS?.border||'#DCE4F7'}`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:clickable&&onAward?'0 4px 12px rgba(42,79,214,0.2)':'none'}}
        title={clickable&&onAward?`Click to award ${student.name}`:student.name}
      >
        {av ? <AvatarSVG av={av} size={px-6} /> : <span style={{fontSize:px*0.4,fontWeight:'bold',color:COLORS?.textMuted}}>{fallback}</span>}
      </div>

      {showRank && rank && (
        <div style={{position:'absolute',top:-6,right:-6,width:22,height:22,borderRadius:'50%',background:rank===1?COLORS.xp:rank===2?'#C0C0C0':'#CD7F32',color:'white',fontSize:10,fontWeight:'bold',display:'flex',alignItems:'center',justifyContent:'center'}}>#{rank}</div>
      )}

      {showName && <div style={{fontSize:11,fontWeight:'bold',textAlign:'center',color:COLORS?.text}}>{student.name}</div>}
      {showXP && <div style={{fontSize:10,color:COLORS?.xp,fontWeight:'bold'}}>{xp} XP</div>}

      {showMenu && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowMenu(false)}>
          <div style={{background:'white',borderRadius:16,padding:24,maxWidth:380,width:'90%',boxShadow:'0 20px 40px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
              <div style={{width:56,height:56,borderRadius:'50%',overflow:'hidden',border:`2px solid ${COLORS?.border}`,background:COLORS?.panelAlt}}>
                {av ? <AvatarSVG av={av} size={52} /> : <span style={{fontSize:24,lineHeight:'52px'}}>{fallback}</span>}
              </div>
              <div>
                <div style={{fontWeight:'bold',fontSize:16}}>{student.name}</div>
                <div style={{fontSize:12,color:COLORS?.textMuted}}>Choose a behavior to award</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,maxHeight:280,overflowY:'auto',marginBottom:16}}>
              {(state?.behaviors||[]).filter(b=>b.type==='positive').slice(0,10).map(b=>(
                <button key={b.id} onClick={()=>handleAward(b)} style={{padding:10,border:`1px solid ${COLORS?.border}`,borderRadius:8,background:COLORS?.panelAlt,cursor:'pointer',fontSize:12,textAlign:'left'}}>
                  <div style={{fontWeight:'bold',marginBottom:2}}>{b.name}</div>
                  <div style={{fontSize:11,color:COLORS?.xp}}>+{b.points} XP</div>
                </button>
              ))}
            </div>
            <button onClick={()=>setShowMenu(false)} style={{width:'100%',padding:10,borderRadius:8,border:'none',background:COLORS?.robotics,color:'white',fontWeight:'bold',cursor:'pointer'}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Avatar Classroom Tab ---------- */
function AvatarClassroomTab({ state, persist, classId, COLORS, onAward }) {
  const students = classId ? state.students.filter(s=>s.classId===classId) : state.students;

  // Generate avatars immediately — store in state AND localStorage as backup
  const [localAvatars, setLocalAvatars] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('najm_avatars')||'{}'); } catch { return {}; }
  });

  React.useEffect(() => {
    const allAvatars = { ...localAvatars, ...state.studentAvatars };
    const missing = students.filter(s=>!allAvatars[s.id]);
    if (!missing.length) return;
    const newAvatars = { ...allAvatars };
    missing.forEach(s => {
      const cfg = state.classGenderConfig?.[s.classId];
      const gender = cfg==='girls'?'female':cfg==='boys'?'male':Math.random()>0.5?'male':'female';
      newAvatars[s.id] = generateAvatar(s.id, gender);
    });
    // Save to localStorage immediately (fast, no network)
    try { localStorage.setItem('najm_avatars', JSON.stringify(newAvatars)); } catch {}
    setLocalAvatars(newAvatars);
    // Also persist to state
    persist(prev => ({ ...prev, studentAvatars: newAvatars }));
  }, [students.length]);

  // Merge state avatars + local backup
  const mergedAvatars = { ...localAvatars, ...state.studentAvatars };

  const handleAward = (studentId, behaviorId, points) => {
    onAward({ studentI
