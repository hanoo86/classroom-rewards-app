import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Users, Brain, Wrench, Heart, Rocket, Award, Shield, Sparkles, CheckCircle2,
  Target, MessageSquare, Plus, X, ChevronRight, TrendingUp,
  UserCircle2, Smile, Meh, HelpCircle, Loader2, Flame, Trophy, Crown,
  Lightbulb, Bot, Armchair, Code2, Star, Lock, Zap, BarChart3, Gift,
  LayoutGrid, Medal, ClipboardList, LogOut, LogIn,
  Settings, Bell, GraduationCap, ShieldCheck, Download, Printer,
  CalendarDays, UserPlus, Building2, Percent, ListChecks, Trash2, Shuffle, KeyRound, ChevronDown, Volume2,
  AlertCircle, Activity
} from 'lucide-react';
import { supabase } from './supabaseClient';

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
    // 🔌 NEW FEATURE 2: Timetable & Reminders
    timetable: {
      periods: [
        { id: 'p1', startTime: '08:30', endTime: '09:15', subject: 'Math', classId: null },
        { id: 'p2', startTime: '09:15', endTime: '10:00', subject: 'Science', classId: null },
        { id: 'p3', startTime: '10:00', endTime: '10:45', subject: 'Robotics', classId: null },
        { id: 'p4', startTime: '11:00', endTime: '11:45', subject: 'Coding', classId: null },
        { id: 'p5', startTime: '12:00', endTime: '12:45', subject: 'English', classId: null },
      ],
      alarmMinutesBeforeEnd: 5,
      alarmAcknowledged: {},
    },
    // 🔌 NEW FEATURE 4: Seating Plans
    seatingPlans: {
      layout: 'default',
      pairs: [],
      groups: [],
    },
    // 🔌 NEW FEATURE 3: Attitude Report Drafts
    attitudeReportDraft: null,
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

// 🔌 Utility functions for new features
function subtractMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMins = h * 60 + m - mins;
  const newH = Math.floor(totalMins / 60);
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

function isTimeInPeriod(time, startTime, endTime) {
  const [th, tm] = time.split(':').map(Number);
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const totalTime = th * 60 + tm;
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  return totalTime >= startMins && totalTime < endMins;
}

function generatePairs(students) {
  const pairs = [];
  for (let i = 0; i < students.length; i += 2) {
    pairs.push({
      id: `pair_${i}`,
      studentIds: [students[i].id, ...(students[i + 1] ? [students[i + 1].id] : [])],
    });
  }
  return pairs;
}

function generateGroups(students, groupSize = 4) {
  const groups = [];
  for (let i = 0; i < students.length; i += groupSize) {
    groups.push({
      id: `group_${i}`,
      studentIds: students.slice(i, i + groupSize).map(s => s.id),
      tableNumber: Math.floor(i / groupSize) + 1,
    });
  }
  return groups;
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

// 🔌 ==================== FEATURE 1: BULK AWARD MODE ====================
function BulkAwardMode({ state, students, onAward, onCancel, COLORS }) {
  const [selected, setSelected] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [selectedBehavior, setSelectedBehavior] = useState(null);
  const [customPoints, setCustomPoints] = useState('');
  const inputStyle = {
    width: '100%',
    fontSize: '14px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
    background: COLORS.panel,
    color: COLORS.text,
  };

  const toggleStudent = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    setSelectAll(false);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelected(new Set());
      setSelectAll(false);
    } else {
      setSelected(new Set(students.map(s => s.id)));
      setSelectAll(true);
    }
  };

  const awardToGroup = () => {
    if (!selectedBehavior || selected.size === 0) return;
    const behavior = state.behaviors.find(b => b.id === selectedBehavior);
    if (!behavior) return;
    const points = customPoints !== '' ? Number(customPoints) : behavior.points;
    onAward({
      studentIds: Array.from(selected),
      behaviorIds: [selectedBehavior],
      pointsOverride: points,
      comment: 'Bulk group award',
    });
    setSelected(new Set());
    setSelectAll(false);
    setSelectedBehavior(null);
    setCustomPoints('');
  };

  const positives = state.behaviors.filter(b => b.type === 'positive');
  const selectedCount = selected.size;

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div className="text-base font-black" style={{ color: COLORS.text }}>
          📦 Bulk Award Mode
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-bold px-3 py-1.5 rounded-lg"
          style={{ background: COLORS.panelAlt, color: COLORS.textMuted }}
        >
          ✕ Exit
        </button>
      </div>

      <Card style={{ background: COLORS.panelSoft, borderColor: COLORS.border }}>
        <div className="font-semibold" style={{ color: COLORS.text }}>
          {selectedCount} of {students.length} selected
        </div>
        <div style={{ color: COLORS.textMuted }} className="text-xs mt-1">
          {selectedCount > 0
            ? `${selectedCount} student${selectedCount !== 1 ? 's' : ''} will receive the award`
            : 'Select students below'}
        </div>
      </Card>

      <div>
        <label className="text-xs font-bold uppercase" style={{ color: COLORS.textFaint }}>
          Recognize for:
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {positives.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBehavior(b.id)}
              className="text-left text-xs rounded-lg border p-2.5 transition"
              style={{
                background:
                  selectedBehavior === b.id ? `${COLORS.robotics}22` : COLORS.panel,
                borderColor:
                  selectedBehavior === b.id ? COLORS.robotics : COLORS.border,
                color: COLORS.text,
              }}
            >
              <div className="font-semibold truncate">{b.name}</div>
              <div style={{ color: COLORS.textMuted }} className="text-[10px]">
                +{b.points} XP
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedBehavior && (
        <div>
          <label className="text-xs font-bold uppercase" style={{ color: COLORS.textFaint }}>
            Points (leave blank for default):
          </label>
          <input
            type="number"
            value={customPoints}
            onChange={e => setCustomPoints(e.target.value)}
            placeholder={state.behaviors.find(b => b.id === selectedBehavior)?.points}
            style={{ ...inputStyle, marginTop: '0.5rem' }}
          />
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={toggleSelectAll}
            id="select-all-bulk"
          />
          <label
            htmlFor="select-all-bulk"
            className="text-sm font-semibold cursor-pointer"
            style={{ color: COLORS.text }}
          >
            Select All ({students.length})
          </label>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
          {students.map(student => (
            <label
              key={student.id}
              className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition"
              style={{
                background: selected.has(student.id)
                  ? `${COLORS.robotics}22`
                  : COLORS.panel,
                borderColor: selected.has(student.id)
                  ? COLORS.robotics
                  : COLORS.border,
              }}
            >
              <input
                type="checkbox"
                checked={selected.has(student.id)}
                onChange={() => toggleStudent(student.id)}
                className="cursor-pointer"
              />
              <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
                {student.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {selectedCount > 0 && (
        <div
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 rounded-2xl border p-4 shadow-2xl z-40"
          style={{ background: COLORS.panel, borderColor: COLORS.border }}
        >
          <div className="text-xs font-bold mb-3" style={{ color: COLORS.textFaint }}>
            Award {selectedCount} student{selectedCount !== 1 ? 's' : ''}?
          </div>
          <button
            onClick={awardToGroup}
            disabled={!selectedBehavior || selectedCount === 0}
            className="w-full text-sm font-bold rounded-lg py-3 disabled:opacity-50"
            style={{ background: COLORS.robotics, color: COLORS.onAccent }}
          >
            🎁 Award Group Points
          </button>
        </div>
      )}
    </div>
  );
}

// 🔌 ==================== FEATURE 2: CLASSROOM CLOCK ====================
function ClassroomClock({ COLORS }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const mins = String(time.getMinutes()).padStart(2, '0');

  return (
    <div className="text-center p-4 rounded-xl" style={{ background: COLORS.panelAlt }}>
      <div className="font-mono text-5xl font-black" style={{ color: COLORS.robotics }}>
        {hours}:{mins}
      </div>
      <div className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
        {time.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })}
      </div>
    </div>
  );
}

// 🔌 ==================== FEATURE 2: CLASS END ALARM MODAL ====================
function ClassEndAlarmModal({ periodName, onAcknowledge, COLORS }) {
  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const playTone = (freq, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      };
      playTone(800, 0.3);
      setTimeout(() => playTone(800, 0.3), 400);
      setTimeout(() => playTone(800, 0.3), 800);
    } catch (e) {
      console.log('Audio not available');
    }
  }, []);

  return (
    <ModalShell title="⏰ Class Ending Soon" onClose={onAcknowledge}>
      <div className="text-center space-y-4">
        <div className="text-6xl">⏰</div>
        <div className="text-2xl font-black" style={{ color: COLORS.challenge }}>
          {periodName} ends in 5 minutes
        </div>
        <div
          className="rounded-lg border p-4"
          style={{ background: COLORS.panelSoft, borderColor: COLORS.border }}
        >
          <div className="text-sm" style={{ color: COLORS.textMuted }}>
            Wrap up and prepare for transition.
          </div>
        </div>
        <button
          onClick={onAcknowledge}
          className="w-full text-base font-bold rounded-lg py-3"
          style={{ background: COLORS.robotics, color: COLORS.onAccent }}
        >
          ✓ Acknowledged
        </button>
      </div>
    </ModalShell>
  );
}

// 🔌 ==================== FEATURE 2: TIMETABLE MODULE ====================
function TimetableModule({ state, persist, COLORS }) {
  const [now, setNow] = useState(new Date());
  const [showAlarm, setShowAlarm] = useState(null);
  const alarmTriggeredRef = useRef(new Set());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    state.timetable.periods.forEach(period => {
      const fiveMinBefore = subtractMinutes(period.endTime, 5);
      const alarmKey = `${period.id}_${now.toDateString()}`;
      if (
        nowTime === fiveMinBefore &&
        !alarmTriggeredRef.current.has(alarmKey)
      ) {
        alarmTriggeredRef.current.add(alarmKey);
        setShowAlarm(period);
      }
    });
  }, [now, state.timetable.periods]);

  const handleAlarmAcknowledge = () => {
    setShowAlarm(null);
  };

  const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  let currentPeriod = null;
  let nextPeriod = null;

  for (let i = 0; i < state.timetable.periods.length; i++) {
    const p = state.timetable.periods[i];
    if (nowStr >= p.startTime && nowStr < p.endTime) {
      currentPeriod = p;
      nextPeriod = state.timetable.periods[i + 1] || null;
      break;
    }
    if (nowStr < p.startTime) {
      nextPeriod = p;
      break;
    }
  }

  return (
    <div className="space-y-4">
      <SectionLabel icon={CalendarDays} color={COLORS.robotics}>
        Weekly Timetable
      </SectionLabel>

      <ClassroomClock COLORS={COLORS} />

      {currentPeriod && (
        <Card
          style={{
            borderColor: COLORS.robotics,
            background: `${COLORS.robotics}08`,
          }}
        >
          <div
            className="text-xs font-bold uppercase mb-1"
            style={{ color: COLORS.robotics }}
          >
            Currently Active
          </div>
          <div className="text-xl font-black" style={{ color: COLORS.text }}>
            {currentPeriod.subject}
          </div>
          <div className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
            {currentPeriod.startTime} - {currentPeriod.endTime}
          </div>
        </Card>
      )}

      {nextPeriod && (
        <Card style={{ borderColor: COLORS.border }}>
          <div
            className="text-xs font-bold uppercase mb-1"
            style={{ color: COLORS.textFaint }}
          >
            Next Period
          </div>
          <div className="text-lg font-bold" style={{ color: COLORS.text }}>
            {nextPeriod.subject}
          </div>
          <div className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
            {nextPeriod.startTime} - {nextPeriod.endTime}
          </div>
        </Card>
      )}

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: COLORS.border }}
      >
        <div
          className="grid grid-cols-3 gap-2 px-3 py-2.5 text-[9.5px] font-bold uppercase"
          style={{ background: COLORS.panelAlt, color: COLORS.textFaint }}
        >
          <div>Time</div>
          <div>Subject</div>
          <div>Duration</div>
        </div>
        {state.timetable.periods.map(period => {
          const isActive = nowStr >= period.startTime && nowStr < period.endTime;
          return (
            <div
              key={period.id}
              className="grid grid-cols-3 gap-2 px-3 py-2.5 text-xs border-t items-center"
              style={{
                borderColor: COLORS.border,
                background: isActive ? `${COLORS.robotics}0A` : 'transparent',
              }}
            >
              <div className="font-mono font-bold">{period.startTime}</div>
              <div className="font-semibold">{period.subject}</div>
              <div style={{ color: COLORS.textMuted }}>45 min</div>
            </div>
          );
        })}
      </div>

      {showAlarm && (
        <ClassEndAlarmModal
          periodName={showAlarm.subject}
          onAcknowledge={handleAlarmAcknowledge}
          COLORS={COLORS}
        />
      )}
    </div>
  );
}

// 🔌 ==================== FEATURE 3: STUDENT REPORT GENERATOR ====================
function StudentReportGenerator({ state, persist, COLORS }) {
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [checkedAttitudes, setCheckedAttitudes] = useState(new Set());
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputStyle = {
    width: '100%',
    fontSize: '14px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
    background: COLORS.panel,
    color: COLORS.text,
  };

  const POSITIVE_ATTITUDES = [
    'Active Participation',
    'Team Player',
    'Problem Solver',
    'Focused Effort',
    'Creative Thinker',
    'Respectful Listener',
    'Takes Initiative',
    'Helpful to Peers',
  ];

  const AREAS_FOR_IMPROVEMENT = [
    'Distracted',
    'Disrupting Peers',
    'Unprepared',
    'Late to Task',
    'Needs Reminders',
    'Off-Task',
    'Rushed Work',
    'Needs Support',
  ];

  const toggleAttitude = (attitude) => {
    const next = new Set(checkedAttitudes);
    if (next.has(attitude)) {
      next.delete(attitude);
    } else {
      next.add(attitude);
    }
    setCheckedAttitudes(next);
  };

  const generateReport = async () => {
    if (!selectedStudentId || checkedAttitudes.size === 0) {
      alert('Select a student and at least one attitude');
      return;
    }

    const student = state.students.find(s => s.id === selectedStudentId);
    if (!student) return;

    setLoading(true);

    const positiveChecked = Array.from(checkedAttitudes).filter(a =>
      POSITIVE_ATTITUDES.includes(a)
    );
    const improvementChecked = Array.from(checkedAttitudes).filter(a =>
      AREAS_FOR_IMPROVEMENT.includes(a)
    );

    const prompt = `You are a teacher writing a brief, natural-sounding progress note about a student's behavior and attitude during class today.

Student: ${student.name}
Age Group: ${student.ageGroup}

Positive behaviors observed: ${positiveChecked.join(', ') || 'None'}
Areas for improvement: ${improvementChecked.join(', ') || 'None'}

Write a single professional paragraph (2-3 sentences) summarizing this student's performance. Be encouraging but honest. Example: "John showed excellent focus as a Team Player today, though he was occasionally distracted during independent tasks."

Respond ONLY with the paragraph, no extra text.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 200,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const reportText =
        data.content?.[0]?.type === 'text' ? data.content[0].text : '';
      setGeneratedText(reportText);
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-5">
      <SectionLabel icon={ClipboardList} color={COLORS.coding}>
        Student Report Generator
      </SectionLabel>

      <Card>
        <label className="text-xs font-bold uppercase mb-2" style={{ color: COLORS.textFaint }}>
          Select Student
        </label>
        <select
          value={selectedStudentId || ''}
          onChange={e => {
            setSelectedStudentId(e.target.value || null);
            setGeneratedText('');
            setCheckedAttitudes(new Set());
          }}
          style={{ ...inputStyle }}
        >
          <option value="">— Choose a student —</option>
          {state.students.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Card>

      {selectedStudentId && (
        <>
          <Card>
            <SectionLabel
              icon={Smile}
              color={COLORS.success}
              className="mb-3"
            >
              ✨ Positive Attitudes
            </SectionLabel>
            <div className="space-y-2">
              {POSITIVE_ATTITUDES.map(attitude => (
                <label
                  key={attitude}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer"
                  style={{ background: COLORS.panelAlt }}
                >
                  <input
                    type="checkbox"
                    checked={checkedAttitudes.has(attitude)}
                    onChange={() => toggleAttitude(attitude)}
                    className="cursor-pointer"
                  />
                  <span className="text-sm font-medium">{attitude}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <SectionLabel
              icon={AlertCircle}
              color={COLORS.challenge}
              className="mb-3"
            >
              📍 Areas for Improvement
            </SectionLabel>
            <div className="space-y-2">
              {AREAS_FOR_IMPROVEMENT.map(area => (
                <label
                  key={area}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer"
                  style={{ background: COLORS.panelAlt }}
                >
                  <input
                    type="checkbox"
                    checked={checkedAttitudes.has(area)}
                    onChange={() => toggleAttitude(area)}
                    className="cursor-pointer"
                  />
                  <span className="text-sm font-medium">{area}</span>
                </label>
              ))}
            </div>
          </Card>

          <button
            onClick={generateReport}
            disabled={loading || checkedAttitudes.size === 0}
            className="w-full text-sm font-bold rounded-lg py-3 disabled:opacity-50"
            style={{ background: COLORS.coding, color: COLORS.onAccent }}
          >
            {loading ? '⏳ Generating...' : '✨ Generate AI Report'}
          </button>

          {generatedText && (
            <Card style={{ borderColor: `${COLORS.coding}55` }}>
              <div
                className="text-xs font-bold uppercase mb-2"
                style={{ color: COLORS.coding }}
              >
                📄 Generated Report
              </div>
              <div
                className="text-sm leading-relaxed mb-3 p-3 rounded-lg"
                style={{ background: COLORS.panelAlt, color: COLORS.text }}
              >
                {generatedText}
              </div>
              <button
                onClick={copyToClipboard}
                className="text-xs font-bold rounded-lg px-3 py-2 w-full"
                style={{
                  background: copied ? COLORS.success : COLORS.panelSoft,
                  color: copied ? COLORS.onAccent : COLORS.textMuted,
                }}
              >
                {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
              </button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// 🔌 ==================== FEATURE 4: SEATING PLANS ====================
function SeatingPlansModule({ state, persist, COLORS, onAward }) {
  const [layout, setLayout] = useState(state.seatingPlans.layout || 'default');
  const roster = state.students || [];

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    let pairs = [];
    let groups = [];
    if (newLayout === 'pairs') {
      pairs = generatePairs(roster);
    } else if (newLayout === 'groups') {
      groups = generateGroups(roster);
    }
    persist(prev => ({
      ...prev,
      seatingPlans: { layout: newLayout, pairs, groups },
    }));
  };

  const awardGroupPoints = (studentIds) => {
    if (!onAward || !studentIds.length) return;
    const behavior = state.behaviors.find(b => b.name === 'Team Player');
    if (!behavior) return;
    onAward({
      studentIds,
      behaviorIds: [behavior.id],
      pointsOverride: 5,
      comment: 'Group work bonus',
    });
  };

  return (
    <div className="space-y-5">
      <SectionLabel icon={Users} color={COLORS.behavior}>
        Seating & Group Work
      </SectionLabel>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'default', label: '📊 Default', emoji: '📊' },
          { id: 'pairs', label: '👥 Pairs', emoji: '👥' },
          { id: 'groups', label: '🪑 Groups', emoji: '🪑' },
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => handleLayoutChange(opt.id)}
            className="text-xs font-bold px-3 py-2 rounded-lg transition border"
            style={{
              background:
                layout === opt.id ? COLORS.robotics : COLORS.panel,
              borderColor: layout === opt.id ? COLORS.robotics : COLORS.border,
              color:
                layout === opt.id ? COLORS.onAccent : COLORS.text,
            }}
          >
            {opt.emoji} {opt.label}
          </button>
        ))}
      </div>

      {layout === 'pairs' && (
        <div className="space-y-3">
          <div className="text-xs font-bold" style={{ color: COLORS.textFaint }}>
            👥 PAIRS LAYOUT
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(state.seatingPlans.pairs || generatePairs(roster)).map(pair => (
              <div
                key={pair.id}
                className="rounded-xl border p-3"
                style={{
                  borderColor: COLORS.border,
                  background: COLORS.panelAlt,
                }}
              >
                <div className="flex flex-col gap-2 mb-2">
                  {pair.studentIds.map(sId => {
                    const s = state.students.find(st => st.id === sId);
                    return s ? (
                      <div
                        key={sId}
                        className="text-sm font-semibold flex items-center gap-2"
                      >
                        <Avatar name={s.name} id={s.id} size={24} />
                        {s.name}
                      </div>
                    ) : null;
                  })}
                </div>
                <button
                  onClick={() => awardGroupPoints(pair.studentIds)}
                  className="w-full text-xs font-bold rounded-lg px-2 py-1.5"
                  style={{ background: COLORS.reward, color: COLORS.onAccent }}
                >
                  +5 XP Pair Bonus
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {layout === 'groups' && (
        <div className="space-y-3">
          <div className="text-xs font-bold" style={{ color: COLORS.textFaint }}>
            🪑 GROUP LAYOUT
          </div>
          {(state.seatingPlans.groups || generateGroups(roster)).map(group => (
            <Card key={group.id} style={{ borderColor: COLORS.border }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold" style={{ color: COLORS.text }}>
                  Table {group.tableNumber}
                </div>
                <span
                  className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{
                    background: `${COLORS.robotics}22`,
                    color: COLORS.robotics,
                  }}
                >
                  {group.studentIds.length} students
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {group.studentIds.map(sId => {
                  const s = state.students.find(st => st.id === sId);
                  return s ? (
                    <div
                      key={sId}
                      className="flex items-center gap-2 p-2 rounded-lg"
                      style={{ background: COLORS.panelSoft }}
                    >
                      <Avatar name={s.name} id={s.id} size={20} />
                      <div className="text-xs font-semibold">{s.name}</div>
                    </div>
                  ) : null;
                })}
              </div>

              <button
                onClick={() => awardGroupPoints(group.studentIds)}
                className="w-full text-xs font-bold rounded-lg px-2 py-2"
                style={{ background: COLORS.robotics, color: COLORS.onAccent }}
              >
                🎁 Table +10 XP
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(null);
  const [role, setRole] = useState(null);
  const [quickClassId, setQuickClassId] = useState(null);
  const [activeStudentId, setActiveStudentId] = useState(DEFAULT_STUDENTS[0].id);
  const [toast, setToast] = useState(null);
  const [showRecognize, setShowRecognize] = useState(false);
  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [provisioning, setProvisioning] = useState(false);

  // Student PIN-login flow (no Supabase Auth session — see supabase RPCs
  // find_class_by_code / student_login / student_redeem / student_add_reflection).
  const [studentStep, setStudentStep] = useState('code'); // 'code' | 'roster' | 'pin' | 'in'
  const [studentClassInfo, setStudentClassInfo] = useState(null);
  const [studentPicked, setStudentPicked] = useState(null);
  const [studentSession, setStudentSession] = useState(null); // { state, studentId, pin }

  useEffect(() => { document.title = 'Najm \u2014 Every Student Is a Star'; }, []);
  useEffect(() => { loadState().then(setState); }, []);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3400); return () => clearTimeout(t); }, [toast]);

  // `persist` still works exactly as before, but now only writes the small
  // low-stakes JSON document (school_data) — never students/points/classes/etc.
  const persist = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const withBadges = { ...next, studentBadges: autoAwardBadges(next) };
      saveSchoolData(withBadges);
      return withBadges;
    });
  }, []);

  const refresh = useCallback(async () => {
    const fresh = await loadState();
    const withBadges = { ...fresh, studentBadges: autoAwardBadges(fresh) };
    setState(withBadges);
    return withBadges;
  }, []);

  // Runs a relational write (one of the dbXxx functions above), then reloads
  // from the database so the UI reflects exactly what's really there — no
  // hand-maintained local copies of sensitive data to get out of sync.
  const runDb = useCallback(async (fn, notifBuilder) => {
    try {
      await fn();
    } catch (e) {
      console.error(e);
      setToast({ kind: 'reflect', title: 'Could not save', body: e.message || 'Something went wrong — please try again.' });
      return false;
    }
    await refresh();
    if (notifBuilder) persist(prev => ({ ...prev, notifications: pushNotification(prev, notifBuilder()) }));
    return true;
  }, [refresh, persist]);

  const email = session?.user?.email?.toLowerCase();
  const myAssignment = state && email ? state.teacherAssignments[email] : null;
  const isAdmin = !!myAssignment?.isAdmin;
  const hasProfile = !!myAssignment;

  // Any signed-in user with no profile row yet self-provisions as a regular
  // teacher (never admin — see the one-time SQL step to promote yourself).
  // Row Level Security means `state.classes` already only contains classes
  // this person owns (or every class, if they're admin) — nothing further
  // to filter client-side.
  useEffect(() => {
    if (!state || !email || !session || hasProfile || provisioning) return;
    setProvisioning(true);
    dbSelfProvisionTeacher().then(refresh).catch(e => console.error(e)).finally(() => setProvisioning(false));
  }, [state, email, session, hasProfile, provisioning, refresh]);

  // A teacher with exactly one class skips the picker screen — nothing to choose.
  useEffect(() => {
    if (role !== 'teacher' || !session || quickClassId) return;
    if (state && state.classes.length === 1) setQuickClassId(state.classes[0].id);
  }, [role, session, state, quickClassId]);

  if (!state) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
      <Loader2 className="animate-spin" style={{ color: COLORS.robotics }} size={28} />
    </div>;
  }

  const manageableClasses = state.classes; // already RLS-scoped: mine, or everyone's if admin
  const effectiveClassId = quickClassId || null;
  const teacherStudents = effectiveClassId ? state.students.filter(s => s.classId === effectiveClassId) : (isAdmin ? state.students : []);

  async function createFirstClass(name) {
    const created = await dbAddClass(name);
    await refresh();
    if (created?.id) setQuickClassId(created.id);
  }

  function studentRedeem(reward) {
    if (!studentSession) return;
    const { studentId, pin } = studentSession;
    const balanceBefore = spendableXP(studentSession.state, studentId);
    dbStudentRedeem({ studentId, pin, rewardId: reward.id, rewardName: reward.name, cost: reward.cost })
      .then(() => dbStudentLogin(studentId, pin)).then(payload => {
        if (payload?.ok) setStudentSession({ state: studentPayloadToState(payload), studentId, pin });
      }).catch(e => setToast({ kind: 'reflect', title: 'Could not redeem', body: e.message }));
    setToast({ kind: 'reward', title: `\u{1F389} Reward redeemed!`, body: `${reward.emoji ? reward.emoji + ' ' : ''}${reward.name} \u2014 ${reward.cost} XP spent, ${balanceBefore - reward.cost} XP remaining` });
  }
  function studentAddReflection(feeling, improvement) {
    if (!studentSession) return;
    const { studentId, pin } = studentSession;
    dbStudentAddReflection({ studentId, pin, feeling, improvement })
      .then(() => dbStudentLogin(studentId, pin)).then(payload => {
        if (payload?.ok) setStudentSession({ state: studentPayloadToState(payload), studentId, pin });
      }).catch(e => setToast({ kind: 'reflect', title: 'Could not save', body: e.message }));
    setToast({ kind: 'reflect', title: 'Reflection saved', body: 'Thanks for thinking about your lesson today.' });
  }
  function exitStudentFlow() {
    setStudentStep('code'); setStudentClassInfo(null); setStudentPicked(null); setStudentSession(null);
    setRole(null);
  }

  function awardBehavior({ studentIds, behaviorIds, pointsOverride, comment }) {
    const behaviors = behaviorIds.map(id => state.behaviors.find(b => b.id === id)).filter(Boolean);
    const ids = Array.isArray(studentIds) ? studentIds : [studentIds];
    const targetStudents = ids.map(id => state.students.find(s => s.id === id)).filter(Boolean);
    if (!targetStudents.length || !behaviors.length) return;
    const singleBehavior = behaviors.length === 1;
    const behaviorNames = behaviors.map(b => b.name).join(', ');
    const totalPoints = behaviors.reduce((sum, b) => sum + Number((singleBehavior && pointsOverride !== '' && pointsOverride != null) ? pointsOverride : b.points), 0);

    const jobs = [];
    targetStudents.forEach(student => {
      behaviors.forEach(behavior => {
        const pts = singleBehavior && pointsOverride !== '' && pointsOverride != null ? Number(pointsOverride) : behavior.points;
        jobs.push(dbAwardPoints({ studentId: student.id, classId: student.classId, category: behavior.category, name: behavior.name, points: pts, comment, awardedBy: session?.user?.id }));
      });
    });

    const isConcern = totalPoints < 0;

    runDb(
      () => Promise.all(jobs),
      () => isConcern
        ? (targetStudents.length === 1
          ? { scope: 'student', targetId: targetStudents[0].id, message: `A note was logged for ${behaviorNames}. Let's talk about it and turn it around.` }
          : { scope: 'broadcast', message: `A note was logged for ${targetStudents.length} students \u2014 ${behaviorNames}.` })
        : (targetStudents.length === 1
          ? { scope: 'student', targetId: targetStudents[0].id, message: `\u{1F389} Congratulations! You earned ${totalPoints} points for ${behaviorNames}.` }
          : { scope: 'broadcast', message: `\u{1F389} ${targetStudents.length} students earned ${totalPoints} points each for ${behaviorNames}.` })
    );
    if (isConcern) {
      setToast({ kind: 'concern', title: targetStudents.length === 1 ? ageTheme(targetStudents[0].ageGroup).concernToast() : 'A note was logged', body: `${targetStudents.map(s => s.name).join(', ')} \u2014 ${behaviorNames}` });
    } else if (targetStudents.length === 1) {
      const theme = ageTheme(targetStudents[0].ageGroup);
      setToast({ kind: 'xp', title: theme.xpToast(totalPoints), body: `${targetStudents[0].name} \u2014 ${behaviorNames}` });
    } else {
      setToast({ kind: 'xp', title: `\u{1F389} +${totalPoints} XP each awarded!`, body: `${targetStudents.length} students \u2014 ${behaviorNames}` });
    }
    setShowRecognize(false);
  }

  function handleRoleClick(target) {
    if (target !== 'student' && !session) { setShowLogin(true); return; }
    setRole(target);
  }
  async function handleSignOut() {
    await supabase.auth.signOut();
    setQuickClassId(null);
    setRole(null);
  }
  function changeClass() {
    setQuickClassId(null);
  }

  if (role === null) {
    return (
      <>
        <Toast toast={toast} />
        <LandingPage state={state} onPickStudent={() => setRole('student')} onPickTeacher={() => handleRoleClick('teacher')} />
        {showLogin && (
          <TeacherAuthModal onClose={() => setShowLogin(false)} onSuccess={() => { setShowLogin(false); setRole('teacher'); }} />
        )}
      </>
    );
  }

  // ------------------------------ Student PIN-login flow -----------------------
  if (role === 'student' && studentStep !== 'in') {
    return (
      <>
        <Toast toast={toast} />
        {studentStep === 'code' && (
          <StudentClassCodeEntry
            onBack={() => setRole(null)}
            onFound={info => { setStudentClassInfo(info); setStudentStep('roster'); }}
          />
        )}
        {studentStep === 'roster' && studentClassInfo && (
          <StudentRosterPick
            classInfo={studentClassInfo}
            onBack={() => { setStudentClassInfo(null); setStudentStep('code'); }}
            onPick={s => { setStudentPicked(s); setStudentStep('pin'); }}
          />
        )}
        {studentStep === 'pin' && studentPicked && (
          <StudentPinPad
            student={studentPicked}
            onBack={() => { setStudentPicked(null); setStudentStep('roster'); }}
            onVerified={(payload, pin) => {
              setStudentSession({ state: studentPayloadToState(payload), studentId: studentPicked.id, pin });
              setActiveStudentId(studentPicked.id);
              setStudentStep('in');
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.bg, color: COLORS.text, fontFamily: 'var(--font-body)' }}>
      <Toast toast={toast} />
      <header className="sticky top-0 z-40 border-b" style={{ background: `${COLORS.bg}F2`, borderColor: COLORS.border, backdropFilter: 'blur(6px)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <button onClick={() => (role === 'student' ? exitStudentFlow() : setRole(null))} className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${COLORS.robotics}, ${COLORS.coding})` }}>
              <Star size={16} style={{ color: COLORS.onAccent }} strokeWidth={2.5} fill={COLORS.onAccent} />
            </div>
            <div>
              <div className="text-[14.5px] font-display font-black tracking-tight leading-none">Najm</div>
              <div className="text-[9.5px] font-semibold tracking-wide leading-none mt-1" style={{ color: COLORS.textFaint }}>EVERY STUDENT IS A STAR</div>
            </div>
          </button>
          <div className="flex items-center gap-2">
            {role === 'teacher' && session && effectiveClassId && manageableClasses.length > 1 && (
              <button onClick={changeClass} className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border" style={{ borderColor: COLORS.border, color: COLORS.textMuted }}>
                <Building2 size={12} /> {className(state, effectiveClassId)} <ChevronRight size={10} />
              </button>
            )}
            {role !== 'student' && (
              <div className="flex items-center gap-1 rounded-lg p-1 border" style={{ background: COLORS.panelAlt, borderColor: COLORS.border }}>
                <button onClick={() => handleRoleClick('teacher')} className="px-3 py-1.5 rounded-md text-xs font-bold transition"
                  style={role === 'teacher' ? { background: COLORS.robotics, color: COLORS.onAccent } : { color: COLORS.textMuted }}>Teacher</button>
                {session && isAdmin && (
                  <button onClick={() => handleRoleClick('admin')} className="px-3 py-1.5 rounded-md text-xs font-bold transition"
                    style={role === 'admin' ? { background: COLORS.challenge, color: COLORS.onAccent } : { color: COLORS.textMuted }}>Admin</button>
                )}
              </div>
            )}
            {(role === 'teacher' || role === 'admin') && session && (
              <button onClick={handleSignOut} title={email} aria-label={`Sign out (${email})`} className="p-2 rounded-lg border" style={{ borderColor: COLORS.border, color: COLORS.textMuted }}>
                <LogOut size={14} />
              </button>
            )}
            {role === 'student' && (
              <button onClick={exitStudentFlow} className="p-2 rounded-lg border" style={{ borderColor: COLORS.border, color: COLORS.textMuted }} aria-label="Log out">
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-5">
        {role === 'student' && studentSession && (
          <StudentApp state={studentSession.state} activeStudentId={studentSession.studentId} setActiveStudentId={() => {}} lockedStudent
            persist={() => {}} setToast={setToast} db={async fn => { await fn(); return true; }}
            onRedeem={studentRedeem} onReflect={studentAddReflection} />
        )}
        {role === 'teacher' && session && (
          provisioning ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin" style={{ color: COLORS.robotics }} size={24} /></div>
          ) : !effectiveClassId ? (
            manageableClasses.length > 0 ? (
              <ClassPickerScreen state={state} classes={manageableClasses} onPick={setQuickClassId} />
            ) : (
              <CreateFirstClassScreen onCreate={createFirstClass} />
            )
          ) : (
            <TeacherApp state={state} persist={persist} classId={effectiveClassId} email={email} setToast={setToast} db={runDb}
              session={session} manageableClasses={manageableClasses} onSwitchClass={setQuickClassId} />
          )
        )}
        {role === 'admin' && session && isAdmin && (
          <AdminApp state={state} persist={persist} email={email} db={runDb} session={session} />
        )}
      </main>

      {showRecognize && <RecognizeModal state={{ ...state, students: teacherStudents.length ? teacherStudents : state.students }} onClose={() => setShowRecognize(false)} onSubmit={awardBehavior} />}
      {showLogin && (
        <TeacherAuthModal onClose={() => setShowLogin(false)} onSuccess={() => { setShowLogin(false); setRole('teacher'); }} />
      )}

      {((role === 'teacher' && effectiveClassId) || (role === 'admin' && isAdmin)) && session && (
        <button onClick={() => setShowRecognize(true)}
          className="fixed bottom-5 right-5 z-30 rounded-full shadow-2xl flex items-center gap-2 px-4 py-3 font-bold text-xs"
          style={{ background: COLORS.xp, color: COLORS.onAccent }}>
          <Plus size={16} /> Log Behavior
        </button>
      )}
      {role === 'teacher' && effectiveClassId && session && teacherStudents.length > 0 && (
        <FocusMeter students={teacherStudents} onAward={awardBehavior} />
      )}
    </div>
  );
}

/* --------------------------------- Student App ---------------------------------- */

function StudentApp({ state, activeStudentId, setActiveStudentId, persist, setToast, db, lockedStudent, onRedeem, onReflect }) {
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
    { id: 'leaderboard', label: 'Spotlight', icon: Sparkles },
    { id: 'competition', label: 'Class Competition', icon: Medal },
    { id: 'notifications', label: unread ? `Alerts (${unread})` : 'Alerts', icon: Bell },
  ];

  function addReflection(feeling, improvement) {
    if (onReflect) { onReflect(feeling, improvement); return; }
    db(() => dbAddReflection({ studentId: student.id, feeling, improvement }));
    setToast({ kind: 'reflect', title: 'Reflection saved', body: 'Thanks for thinking about your lesson today.' });
  }
  function redeem(reward) {
    const balanceBefore = spendableXP(state, student.id);
    if (balanceBefore < reward.cost) return;
    if (onRedeem) { onRedeem(reward); return; }
    db(() => dbRedeem({ studentId: student.id, classId: student.classId, rewardId: reward.id, rewardName: reward.name, cost: reward.cost }));
    setToast({ kind: 'reward', title: `\u{1F389} Reward redeemed!`, body: `${reward.emoji ? reward.emoji + ' ' : ''}${reward.name} \u2014 ${reward.cost} XP spent, ${balanceBefore - reward.cost} XP remaining` });
  }

  const sidebarHeader = (
    <div className="flex items-center gap-2.5">
      <Avatar name={student.name} id={student.id} size={40} />
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
          {lockedStudent ? (
            <span className="rounded-lg px-2.5 py-1.5 text-sm font-semibold border" style={{ background: COLORS.panelAlt, borderColor: COLORS.border, color: COLORS.text }}>
              {student.name}
            </span>
          ) : (
            <select value={student.id} onChange={e => setActiveStudentId(e.target.value)}
              className="rounded-lg px-2.5 py-1.5 text-sm font-semibold outline-none border"
              style={{ background: COLORS.panelAlt, borderColor: COLORS.border, color: COLORS.text }}>
              {state.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
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
        {tab === 'leaderboard' && <LeaderboardTab state={state} student={student} />}
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
            <div className="text-xl font-display font-black" style={{ color: COLORS.xp }}>{xp}</div>
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
          <SectionLabel icon={ClipboardList}>Recent Activity</SectionLabel>
          <div className="space-y-1.5">
            {log.map(l => (
              <div key={l.id} className="flex justify-between text-xs rounded-lg px-3 py-2 border-l-2" style={{ background: COLORS.panelAlt, borderColor: l.points < 0 ? COLORS.challenge : CATEGORY_COLOR[l.category] }}>
                <span style={{ color: COLORS.text }}>{l.name}</span>
                <span className="font-mono font-bold" style={{ color: l.points < 0 ? COLORS.challenge : COLORS.xp }}>{l.points > 0 ? `+${l.points}` : l.points}</span>
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
  const history = state.redemptions.filter(r => r.studentId === student.id).slice(0, 6);
  const nextReward = nextLockedReward(state, student.id);
  const [confirming, setConfirming] = useState(null);

  const visible = state.rewards.filter(r => r.enabled !== false);
  const groups = REWARD_CATEGORIES.map(cat => ({ ...cat, items: visible.filter(r => (r.category || 'general') === cat.id) })).filter(g => g.items.length);

  return (
    <div className="space-y-5">
      <Card style={{ background: `linear-gradient(135deg, ${COLORS.panel}, ${COLORS.panelAlt})` }}>
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-bold uppercase" style={{ color: COLORS.textFaint }}>\u2B50 Your XP</div>
          <div className="text-xl font-black font-mono" style={{ color: COLORS.reward }}>{balance} XP</div>
        </div>
        {nextReward && (
          <div className="mt-2">
            <div className="text-[11px] font-semibold mb-1" style={{ color: COLORS.textMuted }}>Progress to {nextReward.name}</div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: COLORS.panelSoft }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.round((balance / nextReward.cost) * 100))}%`, background: COLORS.reward }} />
            </div>
            <div className="text-[10.5px] mt-1 font-semibold" style={{ color: COLORS.reward }}>{'\u{1F525}'} {nextReward.cost - balance} XP until {nextReward.name}</div>
          </div>
        )}
      </Card>

      {groups.map(g => (
        <div key={g.id}>
          <SectionLabel icon={Gift} color={COLORS.reward}>{g.emoji} {g.label}</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-3">
            {g.items.map(r => (
              <RewardCard key={r.id} reward={r} balance={balance} state={state} onRedeem={() => setConfirming(r)} />
            ))}
          </div>
        </div>
      ))}

      {history.length > 0 && (
        <div>
          <SectionLabel>My Rewards</SectionLabel>
          <div className="space-y-1.5">
            {history.map(h => {
              const r = state.rewards.find(x => x.id === h.rewardId);
              return (
                <div key={h.id} className="flex items-center justify-between text-xs rounded-lg px-3 py-2" style={{ background: COLORS.panelAlt, color: COLORS.textMuted }}>
                  <span>{r?.emoji ? `${r.emoji} ` : ''}{r ? r.name : 'Reward'} <span style={{ color: COLORS.textFaint }}>{'\u2014'} {new Date(h.date).toLocaleDateString()}</span></span>
                  <span className="font-mono font-bold" style={{ color: COLORS.reward }}>{h.cost ?? r?.cost ?? ''} XP</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {confirming && (
        <RedeemConfirmModal reward={confirming} balance={balance}
          onCancel={() => setConfirming(null)}
          onConfirm={() => { onRedeem(confirming); setConfirming(null); }} />
      )}
    </div>
  );
}

function RewardCard({ reward: r, balance, state, onRedeem }) {
  const Icon = ICONS[r.icon] || Gift;
  const affordable = balance >= r.cost;
  const remaining = rewardRemaining(state, r);
  const soldOut = remaining !== null && remaining <= 0;
  const isVip = r.category === 'vip';
  const isLimited = r.category === 'limited';
  const locked = !affordable || soldOut;

  return (
    <Card className="flex flex-col gap-2" style={isVip ? { background: `linear-gradient(135deg, ${COLORS.reward}18, ${COLORS.xp}10)`, borderColor: `${COLORS.reward}66` } : undefined}>
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${COLORS.reward}22` }}>
          <Icon size={18} style={{ color: COLORS.reward }} />
        </div>
        {isVip && <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: `${COLORS.reward}22`, color: COLORS.reward }}>{'\u{1F48E}'} VIP</span>}
        {isLimited && !soldOut && <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: `${COLORS.challenge}1A`, color: COLORS.challenge }}>{'\u{1F525}'} THIS WEEK</span>}
      </div>
      <div className="text-sm font-bold">{r.emoji ? `${r.emoji} ` : ''}{r.name}</div>
      <div className="text-[11px]" style={{ color: COLORS.textMuted }}>{r.description}</div>
      {isVip && !affordable && (
        <div>
          <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: COLORS.panelSoft }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.round((balance / r.cost) * 100))}%`, background: COLORS.reward }} />
          </div>
          <div className="text-[10.5px] font-semibold" style={{ color: COLORS.textFaint }}>{balance} / {r.cost} XP</div>
        </div>
      )}
      {isLimited && !soldOut && <div className="text-[10.5px] font-bold" style={{ color: COLORS.challenge }}>{remaining} / {r.limitedQty} remaining</div>}
      <div className="flex items-center justify-between mt-1">
        <span className="font-mono font-bold text-sm" style={{ color: COLORS.xp }}>{r.cost} XP</span>
        <button disabled={locked} onClick={onRedeem}
          className="text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-30 transition"
          style={{ background: locked ? COLORS.panelSoft : COLORS.reward, color: locked ? COLORS.textFaint : COLORS.onAccent }}>
          {soldOut ? 'Sold Out' : affordable ? 'Redeem' : 'Locked'}
        </button>
      </div>
      {!affordable && !soldOut && <div className="text-[10.5px] font-semibold" style={{ color: COLORS.textFaint }}>{'\u{1F512}'} Need {r.cost - balance} more XP</div>}
    </Card>
  );
}

function RedeemConfirmModal({ reward, balance, onCancel, onConfirm }) {
  return (
    <ModalShell onClose={onCancel} title="Redeem Reward?">
      <div className="text-center space-y-1 mb-4">
        <div className="text-2xl">{reward.emoji || '\u{1F381}'}</div>
        <div className="text-base font-black">{reward.name}</div>
      </div>
      <div className="rounded-xl border p-3 mb-4 space-y-1.5 text-sm" style={{ borderColor: COLORS.border, background: COLORS.panelAlt }}>
        <div className="flex justify-between"><span style={{ color: COLORS.textMuted }}>Cost</span><span className="font-mono font-bold" style={{ color: COLORS.reward }}>{reward.cost} XP</span></div>
        <div className="flex justify-between"><span style={{ color: COLORS.textMuted }}>Your XP</span><span className="font-mono font-bold">{balance} XP</span></div>
        <div className="flex justify-between border-t pt-1.5" style={{ borderColor: COLORS.border }}><span style={{ color: COLORS.textMuted }}>After redemption</span><span className="font-mono font-bold" style={{ color: COLORS.xp }}>{balance - reward.cost} XP</span></div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 text-sm font-bold rounded-lg py-2.5" style={{ background: COLORS.panelSoft, color: COLORS.textMuted }}>Cancel</button>
        <button onClick={onConfirm} className="flex-1 text-sm font-bold rounded-lg py-2.5" style={{ background: COLORS.reward, color: COLORS.onAccent }}>Redeem</button>
      </div>
    </ModalShell>
  );
}

function LeaderboardTab({ state, student }) {
  const trend = weeklyXPTrend(state, student.id);
  const mostImproved = computeMostImproved(state);
  const categories = [
    { label: 'Best Team Player', icon: Users, color: COLORS.behavior, leader: categoryLeader(state, 'Teamwork') },
    { label: 'Top Problem Solver', icon: Brain, color: COLORS.robotics, leader: categoryLeader(state, 'Problem Solving & Mindset') },
    { label: 'Robotics Champion', icon: Bot, color: COLORS.robotics, leader: categoryLeader(state, 'Robotics Behavior') },
    { label: 'Coding Champion', icon: Code2, color: COLORS.coding, leader: academicLeader(state) },
  ];

  return (
    <div className="space-y-5">
      {/* Personal growth — about this student's own progress, never ranked
          against classmates. */}
      <div>
        <SectionLabel icon={TrendingUp} color={COLORS.xp}>Your Growth</SectionLabel>
        <Card style={{ background: `linear-gradient(135deg, ${COLORS.panel}, ${COLORS.panelAlt})` }}>
          <div className="flex items-center gap-3">
            <Avatar name={student.name} id={student.id} size={44} ring />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{student.name}</div>
              <div className="text-[11px]" style={{ color: COLORS.textMuted }}>
                {trend.thisWeek} XP this week
                {trend.delta > 0 && <span style={{ color: COLORS.success }}> {'\u2191'} {trend.delta} more than last week {'\u{1F389}'}</span>}
                {trend.delta < 0 && <span style={{ color: COLORS.textFaint }}> {'\u2014'} keep going, every point counts</span>}
                {trend.delta === 0 && trend.thisWeek > 0 && <span style={{ color: COLORS.textFaint }}> {'\u2014'} steady as last week</span>}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {mostImproved && (
        <Card style={{ borderColor: `${COLORS.coding}55` }}>
          <div className="flex items-center gap-2 text-xs font-bold mb-1.5" style={{ color: COLORS.coding }}><TrendingUp size={14} /> Most Improved This Term</div>
          <div className="flex items-center gap-2">
            <Avatar name={mostImproved.student.name} id={mostImproved.student.id} size={26} />
            <div className="text-sm font-semibold">{mostImproved.student.name} {'\u2014 great comeback lately!'}</div>
          </div>
        </Card>
      )}

      <div>
        <SectionLabel icon={Sparkles} color={COLORS.xp}>Class Spotlight</SectionLabel>
        <div className="grid sm:grid-cols-2 gap-3">
          {categories.map(c => (
            <Card key={c.label}>
              <div className="flex items-center gap-1.5 text-[11px] font-bold mb-2" style={{ color: c.color }}><c.icon size={13} /> {c.label}</div>
              {c.leader ? (
                <div className="flex items-center gap-2">
                  <Avatar name={c.leader.student.name} id={c.leader.student.id} size={26} />
                  <div className="text-sm font-semibold">{c.leader.student.name}</div>
                </div>
              ) : <div className="text-sm font-semibold" style={{ color: COLORS.textFaint }}>{'\u2014'}</div>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Teacher App ----------------------------------- */

function TeacherApp({ state, persist, classId, email, setToast, db, session, manageableClasses, onSwitchClass }) {
  const [tab, setTab] = useState('overview');
  const scoped = { ...state, students: classId ? state.students.filter(s => s.classId === classId) : state.students };
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'classes', label: 'My Classes', icon: Building2 },
    { id: 'bulk-award', label: '📦 Bulk Award', icon: Gift },
    { id: 'timetable', label: '📅 Timetable', icon: CalendarDays },
    { id: 'reports', label: '📝 Reports', icon: ClipboardList },
    { id: 'seating', label: '🪑 Seating', icon: Users },
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
        {tab === 'overview' && <OverviewTab state={scoped} persist={persist} classId={classId} db={db} session={session} />}
        {tab === 'classes' && <TeacherClassesTab state={state} classes={manageableClasses || []} activeClassId={classId} db={db} onSwitch={onSwitchClass} />}
        {tab === 'bulk-award' && (
          <BulkAwardMode
            state={scoped}
            students={scoped.students}
            onAward={(data) => {
              // Award to multiple students
              const newBehaviorLog = [...scoped.behaviorLog];
              data.studentIds.forEach(studentId => {
                data.behaviorIds.forEach(behaviorId => {
                  newBehaviorLog.push({
                    id: String(Date.now()) + Math.random(),
                    studentId,
                    behaviorId,
                    points: data.pointsOverride,
                    timestamp: new Date().toISOString(),
                    comment: data.comment,
                  });
                });
              });
              persist(prev => ({ ...prev, behaviorLog: newBehaviorLog }));
              setToast({ message: `✅ Awarded ${data.studentIds.length} students!`, color: COLORS.success });
            }}
            onCancel={() => setTab('overview')}
            COLORS={COLORS}
          />
        )}
        {tab === 'timetable' && <TimetableModule state={scoped} persist={persist} COLORS={COLORS} />}
        {tab === 'reports' && <StudentReportGenerator state={scoped} persist={persist} COLORS={COLORS} />}
        {tab === 'seating' && (
          <SeatingPlansModule
            state={scoped}
            persist={persist}
            COLORS={COLORS}
            onAward={(data) => {
              const newBehaviorLog = [...scoped.behaviorLog];
              data.studentIds.forEach(studentId => {
                data.behaviorIds.forEach(behaviorId => {
                  newBehaviorLog.push({
                    id: String(Date.now()) + Math.random(),
                    studentId,
                    behaviorId,
                    points: data.pointsOverride,
                    timestamp: new Date().toISOString(),
                    comment: data.comment,
                  });
                });
              });
              persist(prev => ({ ...prev, behaviorLog: newBehaviorLog }));
              setToast({ message: `✅ Group bonus awarded!`, color: COLORS.success });
            }}
          />
        )}
        {tab === 'assessments' && <AssessmentsTab state={scoped} persist={persist} classId={classId} email={email} setToast={setToast} db={db} session={session} />}
        {tab === 'challenges' && <ChallengesTab state={state} persist={persist} classId={classId} scopedStudents={scoped.students} isAdmin={!classId} db={db} session={session} />}
        {tab === 'missions' && <MissionsTab state={scoped} persist={persist} classId={classId} db={db} session={session} />}
        {tab === 'badges' && <BadgesTab state={scoped} />}
        {tab === 'store' && <StoreManageTab state={scoped} persist={persist} />}
        {tab === 'analytics' && <AnalyticsTab state={scoped} />}
      </div>
    </div>
  );
}

// A regular teacher's own class list — separate from AdminClassesTab, which
// manages every class across the whole school. `classes` here is already
// RLS-scoped server-side to just this teacher's own rows, so nothing further
// to filter client-side; this tab is what lets a teacher create a *second*
// class themselves instead of only ever having the one from onboarding.
function TeacherClassesTab({ state, classes, activeClassId, db, onSwitch }) {
  const [newClassName, setNewClassName] = useState('');
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('middle');
  const [addingStudent, setAddingStudent] = useState(false);

  async function addClass() {
    if (!newClassName.trim() || busy) return;
    setBusy(true);
    const ok = await db(() => dbAddClass(newClassName.trim()));
    setBusy(false);
    if (ok) setNewClassName('');
  }
  function removeClass(id) { db(() => dbRemoveClass(id)); }
  async function addStudent(classId) {
    if (!studentName.trim() || addingStudent) return;
    setAddingStudent(true);
    const ok = await db(() => dbAddStudent({ name: studentName.trim(), ageGroup: studentAge, classId }));
    setAddingStudent(false);
    if (ok) setStudentName('');
  }

  return (
    <div className="space-y-5">
      <Card>
        <SectionLabel icon={Plus} color={COLORS.robotics}>Create another class</SectionLabel>
        <div className="text-xs mb-2" style={{ color: COLORS.textMuted }}>Each class gets its own class code to share with that group of students.</div>
        <div className="flex gap-2">
          <input value={newClassName} onChange={e => setNewClassName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addClass()}
            placeholder="e.g. Grade 8 Robotics" style={inputStyle} />
          <button onClick={addClass} disabled={!newClassName.trim() || busy} className="text-xs font-bold rounded-lg px-3 shrink-0 disabled:opacity-50" style={{ background: COLORS.robotics, color: COLORS.onAccent }}>
            {busy ? 'Creating\u2026' : 'Create'}
          </button>
        </div>
      </Card>

      <div>
        <SectionLabel icon={Building2} color={COLORS.robotics}>My Classes</SectionLabel>
        <div className="space-y-2">
          {classes.map(c => {
            const isActive = c.id === activeClassId;
            const isOpen = expanded === c.id;
            const trend = isOpen ? classWeeklyTrend(state, c.id, 8) : null;
            return (
              <div key={c.id} className="rounded-xl border overflow-hidden" style={isActive ? { borderColor: `${COLORS.robotics}66` } : { borderColor: COLORS.border }}>
                <button onClick={() => setExpanded(isOpen ? null : c.id)}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left" style={{ background: isActive ? `${COLORS.robotics}0F` : COLORS.panel }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <ChevronRight size={14} style={{ color: COLORS.textFaint, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold min-w-0 truncate flex items-center gap-1.5">
                        {c.name}
                        {isActive && <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded-full" style={{ background: `${COLORS.robotics}22`, color: COLORS.robotics }}>Viewing</span>}
                        <span className="text-[11px] font-normal" style={{ color: COLORS.textFaint }}>({studentsInClass(state, c.id).length} students, {classPointsTotal(state, c.id)} pts)</span>
                      </div>
                      {c.classCode && <ClassCodeBadge code={c.classCode} />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!isActive && (
                      <span onClick={e => { e.stopPropagation(); onSwitch && onSwitch(c.id); }} className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer" style={{ background: COLORS.panelSoft, color: COLORS.text }}>
                        Switch to
                      </span>
                    )}
                    <span onClick={e => { e.stopPropagation(); removeClass(c.id); }} aria-label={`Delete class: ${c.name}`} className="cursor-pointer" style={{ color: COLORS.textFaint }}><Trash2 size={14} /></span>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-4 pt-1 space-y-4" style={{ background: COLORS.panelSoft }}>
                    <div>
                      <div className="text-[10.5px] font-bold uppercase tracking-wide mb-2" style={{ color: COLORS.textFaint }}>Add a student to {c.name}</div>
                      <div className="flex gap-2">
                        <input value={studentName} onChange={e => setStudentName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addStudent(c.id)}
                          placeholder="Student name" style={inputStyle} />
                        <select value={studentAge} onChange={e => setStudentAge(e.target.value)} style={{ ...inputStyle, width: 110, flexShrink: 0 }}>
                          <option value="primary">Primary</option>
                          <option value="middle">Middle</option>
                          <option value="high">High</option>
                        </select>
                        <button onClick={() => addStudent(c.id)} disabled={!studentName.trim() || addingStudent} className="text-xs font-bold rounded-lg px-3 shrink-0 disabled:opacity-50" style={{ background: COLORS.behavior, color: COLORS.onAccent }}>
                          {addingStudent ? '\u2026' : 'Add'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10.5px] font-bold uppercase tracking-wide mb-2" style={{ color: COLORS.textFaint }}>Performance trend {'\u2014'} avg XP/student per week</div>
                      {trend && trend.some(p => p.avg !== 0) ? (
                        <div className="rounded-lg border p-2" style={{ borderColor: COLORS.border, background: COLORS.panel }}>
                          <TrendChart points={trend} color={COLORS.robotics} />
                          <div className="flex justify-between text-[9.5px] mt-1" style={{ color: COLORS.textFaint }}>
                            <span>8 weeks ago</span><span>This week</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs rounded-lg border px-3 py-3 text-center" style={{ borderColor: COLORS.border, color: COLORS.textFaint }}>
                          Not enough activity yet to show a trend.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {classes.length === 0 && <div className="text-xs" style={{ color: COLORS.textFaint }}>No classes yet.</div>}
        </div>
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

function OverviewTab({ state, persist, classId, db, session }) {
  const [expanded, setExpanded] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [pickedStudent, setPickedStudent] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [recentlyPicked, setRecentlyPicked] = useState([]);
  const spinTimer = useRef(null);
  useEffect(() => () => clearInterval(spinTimer.current), []);
  const roster = [...state.students].sort((a, b) => totalXP(state, b.id) - totalXP(state, a.id));
  const mostImproved = computeMostImproved(state);
  const needsEncouragement = computeNeedsEncouragement(state);
  const avgXP = state.students.length ? Math.round(state.students.reduce((s, st) => s + totalXP(state, st.id), 0) / state.students.length) : 0;
  const totalBadges = Object.values(state.studentBadges).reduce((s, arr) => s + arr.length, 0);
  const activeStreaks = state.students.filter(st => computeStreak(state, st.id) >= 2).length;

  function addAcademic(id, delta) {
    const student = state.students.find(s => s.id === id);
    db(() => dbAwardPoints({ studentId: id, classId: student?.classId, category: 'Academic Achievement', name: delta > 0 ? 'Academic bonus' : 'Academic adjustment', points: delta, awardedBy: session?.user?.id }));
  }
  function addNote(id, text) { persist(prev => ({ ...prev, notes: [{ id: uid('note'), studentId: id, text, date: new Date().toISOString() }, ...prev.notes] })); }
  function addStudent() {
    if (!newStudentName.trim()) return;
    db(() => dbAddStudent({ name: newStudentName.trim(), ageGroup: 'middle', classId }));
    setNewStudentName('');
  }
  function pickRandomStudent() {
    if (spinning || !state.students.length) return;
    const pool = state.students;
    let candidates = pool.filter(s => !recentlyPicked.includes(s.id));
    if (!candidates.length) candidates = pool;
    const winner = candidates[Math.floor(Math.random() * candidates.length)];
    setSpinning(true);
    let ticks = 0;
    const maxTicks = 14;
    spinTimer.current = setInterval(() => {
      ticks++;
      setPickedStudent(pool[Math.floor(Math.random() * pool.length)]);
      if (ticks >= maxTicks) {
        clearInterval(spinTimer.current);
        setPickedStudent(winner);
        setSpinning(false);
        setRecentlyPicked(prev => {
          const cap = Math.max(1, Math.ceil(pool.length / 2));
          const next = [...prev, winner.id];
          return next.length > cap ? next.slice(next.length - cap) : next;
        });
      }
    }, 80);
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        <StatChip icon={Zap} label="Avg XP" value={avgXP} color={COLORS.xp} />
        <StatChip icon={Trophy} label="Badges Awarded" value={totalBadges} color={COLORS.challenge} />
        <StatChip icon={Flame} label="Active Streaks" value={activeStreaks} color={COLORS.reward} />
        <StatChip icon={Users} label="Class Size" value={state.students.length} color={COLORS.robotics} />
      </div>

      {classId && (
        <Card>
          <SectionLabel icon={UserPlus} color={COLORS.behavior}>Add a student to this class</SectionLabel>
          <div className="flex gap-2">
            <input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="Student name" style={inputStyle} />
            <button onClick={addStudent} className="text-xs font-bold rounded-lg px-3 shrink-0" style={{ background: COLORS.behavior, color: COLORS.onAccent }}>Add</button>
          </div>
        </Card>
      )}

      {state.students.length > 0 && (
        <Card style={{ borderColor: `${COLORS.robotics}55` }}>
          <SectionLabel icon={Shuffle} color={COLORS.robotics}>Pick a Random Student</SectionLabel>
          <div className="flex items-center gap-3">
            {pickedStudent ? (
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Avatar name={pickedStudent.name} id={pickedStudent.id} size={38} ring={!spinning} />
                <div className="text-base font-black truncate" style={{ color: spinning ? COLORS.textFaint : COLORS.text }}>{pickedStudent.name}</div>
              </div>
            ) : (
              <div className="text-xs flex-1" style={{ color: COLORS.textFaint }}>Fair, random cold-calling — tap to pick.</div>
            )}
            <button onClick={pickRandomStudent} disabled={spinning} className="text-xs font-bold rounded-lg px-3.5 py-2.5 shrink-0 disabled:opacity-60" style={{ background: COLORS.robotics, color: COLORS.onAccent }}>
              {spinning ? 'Picking\u2026' : pickedStudent ? 'Pick Again' : 'Pick a Student'}
            </button>
          </div>
        </Card>
      )}

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
                  <Avatar name={st.name} id={st.id} size={26} />
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

function MissionsTab({ state, persist, classId, db }) {
  const mission = state.mission;
  const [text, setText] = useState(mission.text);
  const [xpReward, setXpReward] = useState(mission.xpReward);
  const [behaviorPoints, setBehaviorPoints] = useState(mission.behaviorPoints);
  const [badgeHint, setBadgeHint] = useState(mission.badgeHint);

  function saveMission() {
    persist(prev => ({ ...prev, mission: { ...prev.mission, text, xpReward: Number(xpReward), behaviorPoints: Number(behaviorPoints), badgeHint } }));
  }
  async function markComplete(studentId) {
    if (mission.completedBy.includes(studentId)) return;
    const student = state.students.find(s => s.id === studentId);
    const sClassId = classId || student?.classId;
    const ok1 = await db(() => dbAwardPoints({ studentId, classId: sClassId, category: 'Participation', name: `Mission: ${mission.text}`, points: mission.behaviorPoints, awardedBy: session?.user?.id }));
    if (mission.xpReward) await db(() => dbAwardPoints({ studentId, classId: sClassId, category: 'Academic Achievement', name: `Mission bonus: ${mission.text}`, points: mission.xpReward, awardedBy: session?.user?.id }));
    if (ok1) persist(prev => ({ ...prev, mission: { ...prev.mission, completedBy: [...prev.mission.completedBy, studentId] } }));
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
  const [category, setCategory] = useState('general');
  const [emoji, setEmoji] = useState('');
  const [limited, setLimited] = useState(false);
  const [qty, setQty] = useState(5);

  function addReward() {
    if (!name.trim()) return;
    persist(prev => ({
      ...prev, rewards: [...prev.rewards, {
        id: uid('r'), icon: 'Star', name: name.trim(), cost: Number(cost), description, category,
        emoji: emoji.trim() || undefined, enabled: true, limitedQty: limited ? Number(qty) : null, resetAt: null,
      }]
    }));
    setName(''); setDescription(''); setCost(200); setCategory('general'); setEmoji(''); setLimited(false); setQty(5);
  }
  function removeReward(id) { persist(prev => ({ ...prev, rewards: prev.rewards.filter(r => r.id !== id) })); }
  function updateReward(id, patch) { persist(prev => ({ ...prev, rewards: prev.rewards.map(r => r.id === id ? { ...r, ...patch } : r) })); }
  function resetQuantity(id) { updateReward(id, { resetAt: new Date().toISOString() }); }

  return (
    <div className="space-y-5">
      <Card>
        <SectionLabel icon={Plus} color={COLORS.reward}>Add a reward</SectionLabel>
        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_60px] gap-3">
            <Field label="Name"><input value={name} onChange={e => setName(e.target.value)} style={inputStyle} /></Field>
            <Field label="Emoji"><input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="\u{1F381}" style={inputStyle} /></Field>
          </div>
          <div className="grid grid-cols-[1fr_100px] gap-3">
            <Field label="Description"><input value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} /></Field>
            <Field label="XP cost"><input type="number" value={cost} onChange={e => setCost(e.target.value)} style={inputStyle} /></Field>
          </div>
          <Field label="Category">
            <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
              {REWARD_CATEGORIES.filter(c => c.id !== 'limited').map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
            </select>
          </Field>
          <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: COLORS.textMuted }}>
            <input type="checkbox" checked={limited} onChange={e => setLimited(e.target.checked)} />
            Limited quantity this week
          </label>
          {limited && (
            <Field label="Available quantity"><input type="number" min={1} value={qty} onChange={e => setQty(e.target.value)} style={inputStyle} /></Field>
          )}
          <button onClick={addReward} className="w-full font-bold text-xs rounded-lg py-2.5" style={{ background: COLORS.reward, color: COLORS.onAccent }}>Add to store</button>
        </div>
      </Card>
      <div>
        <SectionLabel icon={Gift} color={COLORS.reward}>Store items</SectionLabel>
        <div className="space-y-2">
          {state.rewards.map(r => {
            const cat = REWARD_CATEGORIES.find(c => c.id === (r.category || 'general')) || REWARD_CATEGORIES[REWARD_CATEGORIES.length - 1];
            const remaining = rewardRemaining(state, r);
            const enabled = r.enabled !== false;
            return (
              <div key={r.id} className="rounded-xl border px-3.5 py-2.5 space-y-2" style={{ borderColor: COLORS.border, background: COLORS.panel, opacity: enabled ? 1 : 0.55 }}>
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                      {r.emoji && <span>{r.emoji}</span>} {r.name}
                      <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded-full shrink-0" style={{ background: `${COLORS.reward}18`, color: COLORS.reward }}>{cat.label}</span>
                    </div>
                    <input defaultValue={r.description} onBlur={e => updateReward(r.id, { description: e.target.value })}
                      className="text-[11px] w-full bg-transparent outline-none border-b border-transparent focus:border-current" style={{ color: COLORS.textMuted }} />
                  </div>
                  <input type="number" defaultValue={r.cost} onBlur={e => updateReward(r.id, { cost: Number(e.target.value) })} className="w-16 text-xs text-right font-mono rounded-md px-2 py-1 border shrink-0" style={{ background: COLORS.panelSoft, borderColor: COLORS.border, color: COLORS.xp }} />
                  <button onClick={() => updateReward(r.id, { enabled: !enabled })} aria-label={enabled ? `Disable ${r.name}` : `Enable ${r.name}`} className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-md" style={{ background: enabled ? `${COLORS.behavior}18` : COLORS.panelSoft, color: enabled ? COLORS.behavior : COLORS.textFaint }}>
                    {enabled ? 'On' : 'Off'}
                  </button>
                  <button onClick={() => removeReward(r.id)} aria-label={`Delete reward: ${r.name}`} className="shrink-0" style={{ color: COLORS.textFaint }}><X size={15} /></button>
                </div>
                {r.limitedQty != null && (
                  <div className="flex items-center justify-between text-[10.5px] font-semibold pl-0.5" style={{ color: COLORS.challenge }}>
                    <span>{'\u{1F525}'} {remaining} / {r.limitedQty} remaining this week</span>
                    <button onClick={() => resetQuantity(r.id)} className="font-bold underline">Reset quantity</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {state.redemptions.length > 0 && (
        <div>
          <SectionLabel>Redemption Log</SectionLabel>
          <div className="space-y-1.5">
            {state.redemptions.slice(0, 8).map(h => {
              const st = state.students.find(s => s.id === h.studentId);
              const r = state.rewards.find(x => x.id === h.rewardId);
              return (
                <div key={h.id} className="flex items-center justify-between text-xs rounded-lg px-3 py-2" style={{ background: COLORS.panelAlt, color: COLORS.textMuted }}>
                  <span>{new Date(h.date).toLocaleDateString()} {'\u2014'} <b style={{ color: COLORS.text }}>{st?.name}</b> redeemed {r?.name || 'a reward'}</span>
                  <span className="font-mono font-bold shrink-0" style={{ color: COLORS.reward }}>{h.cost ?? r?.cost ?? ''} XP</span>
                </div>
              );
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

function AssessmentsTab({ state, persist, classId, email, setToast, db, session }) {
  const [mode, setMode] = useState(null); // 'behavior' | 'academic'
  const [studentId, setStudentId] = useState(state.students[0]?.id);

  function saveBehavior(ratings, comment) {
    const sClassId = classId || state.students.find(s => s.id === studentId)?.classId;
    db(() => dbAddBehaviorAssessment({ studentId, classId: sClassId, teacherId: session?.user?.id, ratings, comment }));
    setToast && setToast({ kind: 'reflect', title: 'Behavior assessment saved', body: state.students.find(s => s.id === studentId)?.name });
    setMode(null);
  }
  function saveAcademic(scores, comment) {
    const sClassId = classId || state.students.find(s => s.id === studentId)?.classId;
    db(() => dbAddAcademicAssessment({ studentId, classId: sClassId, teacherId: session?.user?.id, scores, comment }));
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

function ChallengesTab({ state, persist, classId, scopedStudents, isAdmin, db, session }) {
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
  async function completeFor(challenge, studentId) {
    if (challenge.completedBy.includes(studentId)) return;
    const student = state.students.find(s => s.id === studentId);
    const ok = await db(
      () => dbAwardPoints({ studentId, classId: student?.classId, category: 'Participation', name: `Challenge: ${challenge.name}`, points: challenge.points, awardedBy: session?.user?.id }),
      () => ({ scope: 'student', targetId: studentId, message: `\u2B50 You completed the "${challenge.name}" challenge and earned ${challenge.points} points!` })
    );
    if (ok) persist(prev => ({ ...prev, challenges: prev.challenges.map(c => c.id === challenge.id ? { ...c, completedBy: [...c.completedBy, studentId] } : c) }));
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
              <div className="min-w-0">
                <div className="text-sm font-bold flex items-center gap-2">
                  <span className="truncate">{c.name}</span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full" style={{ background: c.status === 'active' ? `${COLORS.success}22` : `${COLORS.textFaint}22`, color: c.status === 'active' ? COLORS.success : COLORS.textFaint }}>{c.status}</span>
                </div>
                <div className="text-[11px]" style={{ color: COLORS.textMuted }}>{c.description}</div>
                <div className="text-[10px] mt-0.5" style={{ color: COLORS.textFaint }}>{c.startDate} {c.endDate ? `\u2192 ${c.endDate}` : ''} {'\u2022'} +{c.points} pts</div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => toggleStatus(c.id)} className="text-[10px] font-bold px-2 py-1 rounded-lg border" style={{ borderColor: COLORS.border, color: COLORS.textMuted }}>{c.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => removeChallenge(c.id)} aria-label={`Delete challenge: ${c.name}`} style={{ color: COLORS.textFaint }}><Trash2 size={14} /></button>
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
  const positiveBehaviors = state.behaviors.filter(b => (b.type || 'positive') === 'positive');
  const negativeBehaviors = state.behaviors.filter(b => b.type === 'negative');
  const [mode, setMode] = useState('positive'); // 'positive' | 'negative'
  const accent = mode === 'positive' ? COLORS.xp : COLORS.challenge;
  const list = mode === 'positive' ? positiveBehaviors : negativeBehaviors;

  const [studentIds, setStudentIds] = useState([state.students[0].id]);
  const [behaviorIds, setBehaviorIds] = useState(list.length ? [list[0].id] : []);
  const [pointsOverride, setPointsOverride] = useState(list.length ? list[0].points : 0);
  const [comment, setComment] = useState('');
  const grouped = CATEGORY_ORDER.map(cat => ({ category: cat, items: list.filter(b => b.category === cat) })).filter(g => g.items.length);
  const allStudentsSelected = studentIds.length === state.students.length;
  const selectedBehaviors = behaviorIds.map(id => list.find(b => b.id === id)).filter(Boolean);
  const singleBehavior = selectedBehaviors.length === 1;
  const totalPointsPerStudent = selectedBehaviors.reduce((sum, b) => sum + Number(singleBehavior && pointsOverride !== '' ? pointsOverride : b.points), 0);

  function switchMode(next) {
    if (next === mode) return;
    const nextList = next === 'positive' ? positiveBehaviors : negativeBehaviors;
    setMode(next);
    setBehaviorIds(nextList.length ? [nextList[0].id] : []);
    setPointsOverride(nextList.length ? nextList[0].points : 0);
  }
  function toggleStudent(id) {
    setStudentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function toggleAllStudents() {
    setStudentIds(allStudentsSelected ? [] : state.students.map(s => s.id));
  }
  function toggleBehavior(id) {
    setBehaviorIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      if (next.length === 1) {
        const b = list.find(x => x.id === next[0]);
        if (b) setPointsOverride(b.points);
      }
      return next;
    });
  }

  return (
    <ModalShell onClose={onClose} title={mode === 'positive' ? 'Recognize Positive Behavior' : 'Log a Concern'}>
      <div className="space-y-4">
        <div className="flex rounded-lg border p-1" style={{ borderColor: COLORS.border, background: COLORS.panelSoft }}>
          <button type="button" onClick={() => switchMode('positive')}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-bold transition"
            style={mode === 'positive' ? { background: COLORS.xp, color: COLORS.onAccent } : { color: COLORS.textMuted }}>
            <Sparkles size={13} /> Recognize
          </button>
          <button type="button" onClick={() => switchMode('negative')}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-bold transition"
            style={mode === 'negative' ? { background: COLORS.challenge, color: COLORS.onAccent } : { color: COLORS.textMuted }}>
            <MessageSquare size={13} /> Log a Concern
          </button>
        </div>

        <Field label={`Students ${studentIds.length ? `(${studentIds.length} selected)` : ''}`}>
          <div className="rounded-lg border max-h-36 overflow-auto" style={{ borderColor: COLORS.border }}>
            <button type="button" onClick={toggleAllStudents} className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-bold border-b" style={{ borderColor: COLORS.border, color: accent }}>
              <input type="checkbox" readOnly checked={allStudentsSelected} /> Select all
            </button>
            {state.students.map(s => (
              <label key={s.id} className="flex items-center gap-2 px-2.5 py-1.5 text-sm cursor-pointer border-b last:border-b-0" style={{ borderColor: COLORS.border }}>
                <input type="checkbox" checked={studentIds.includes(s.id)} onChange={() => toggleStudent(s.id)} />
                <Avatar name={s.name} id={s.id} size={22} />
                <span className="min-w-0 truncate">{s.name}</span>
              </label>
            ))}
          </div>
        </Field>
        <Field label={`${mode === 'positive' ? 'Recognitions' : 'Concerns'} ${behaviorIds.length ? `(${behaviorIds.length} selected)` : ''}`}>
          {list.length === 0 ? (
            <div className="text-xs rounded-lg border px-2.5 py-3 text-center" style={{ borderColor: COLORS.border, color: COLORS.textFaint }}>
              No {mode === 'positive' ? 'recognitions' : 'concerns'} set up yet.
            </div>
          ) : (
            <div className="rounded-lg border max-h-44 overflow-auto" style={{ borderColor: COLORS.border }}>
              {grouped.map(g => (
                <div key={g.category}>
                  <div className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: COLORS.textFaint, background: COLORS.panelSoft }}>{g.category}</div>
                  {g.items.map(b => (
                    <label key={b.id} className="flex items-center gap-2 px-2.5 py-1.5 text-sm cursor-pointer border-b last:border-b-0" style={{ borderColor: COLORS.border }}>
                      <input type="checkbox" checked={behaviorIds.includes(b.id)} onChange={() => toggleBehavior(b.id)} />
                      <span className="min-w-0 truncate flex-1">{b.name}</span>
                      <span className="text-[10.5px] font-bold shrink-0" style={{ color: accent }}>{b.points > 0 ? `+${b.points}` : b.points}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Field>
        {singleBehavior ? (
          <Field label="Points"><input type="number" value={pointsOverride} onChange={e => setPointsOverride(e.target.value)} style={inputStyle} /></Field>
        ) : selectedBehaviors.length > 1 && (
          <div className="text-xs font-bold rounded-lg px-3 py-2" style={{ background: `${accent}14`, color: accent }}>
            Total: {totalPointsPerStudent} points {studentIds.length > 1 ? 'per student' : ''}
          </div>
        )}
        <Field label="Comment (optional)">
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2}
            placeholder={mode === 'positive' ? 'You supported your team and helped them solve the problem.' : 'What happened, and what should change next time?'}
            style={{ ...inputStyle, resize: 'none' }} />
        </Field>
        <button disabled={!studentIds.length || !behaviorIds.length}
          onClick={() => onSubmit({ studentIds, behaviorIds, pointsOverride, comment })}
          className="w-full font-bold text-sm rounded-lg py-2.5 disabled:opacity-40" style={{ background: accent, color: COLORS.onAccent }}>
          {mode === 'positive'
            ? `Award ${behaviorIds.length > 1 ? `${behaviorIds.length} Recognitions` : 'Recognition'}${studentIds.length > 1 ? ` to ${studentIds.length} Students` : ''}`
            : `Log ${behaviorIds.length > 1 ? `${behaviorIds.length} Concerns` : 'Concern'}${studentIds.length > 1 ? ` for ${studentIds.length} Students` : ''}`}
        </button>
      </div>
    </ModalShell>
  );
}

/* -------------------------- Focus Meter (noise-aware class XP) ---------------------------- */
// Runs entirely in the teacher's own browser tab: a live, RELATIVE loudness
// reading from that device's mic — not a calibrated decibel meter. Audio is
// never recorded or sent anywhere; only a live number is read, every frame,
// and thrown away. The mic only turns on when the teacher taps "Turn on"
// below, never automatically. Sustained loud/quiet periods only ever
// *suggest* a class-wide point change — nothing is applied without the
// teacher tapping Confirm.
function FocusMeter({ students, onAward }) {
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(false);
  const [error, setError] = useState(null);
  const [level, setLevel] = useState(0);
  const [baseline, setBaseline] = useState(null);
  const [calibrating, setCalibrating] = useState(false);
  const [loudSeconds, setLoudSeconds] = useState(10);
  const [quietMinutes, setQuietMinutes] = useState(5);
  const [suggestion, setSuggestion] = useState(null); // 'loud' | 'quiet' | null

  const streamRef = useRef(null);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataRef = useRef(null);
  const rafRef = useRef(null);
  const levelRef = useRef(0);
  const loudSinceRef = useRef(null);
  const quietSinceRef = useRef(null);
  const cooldownUntilRef = useRef(0);
  const suggestionRef = useRef(null);
  const calibratingRef = useRef(false);
  const calibSamplesRef = useRef([]);
  const settingsRef = useRef({ loudSeconds, quietMinutes, baseline });

  useEffect(() => { settingsRef.current = { loudSeconds, quietMinutes, baseline }; }, [loudSeconds, quietMinutes, baseline]);
  useEffect(() => { suggestionRef.current = suggestion; }, [suggestion]);
  useEffect(() => { calibratingRef.current = calibrating; }, [calibrating]);
  useEffect(() => () => stopMic(), []); // stop the mic if this widget ever unmounts (e.g. switching classes)

  function stopMic() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (ctxRef.current && ctxRef.current.state !== 'closed') ctxRef.current.close().catch(() => {});
    streamRef.current = null; ctxRef.current = null; analyserRef.current = null;
    loudSinceRef.current = null; quietSinceRef.current = null; levelRef.current = 0;
    setActive(false); setLevel(0);
  }

  async function startMic() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      streamRef.current = stream; ctxRef.current = ctx; analyserRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.fftSize);
      setActive(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      setError('Microphone access was blocked. Allow it in your browser\u2019s site settings to use the Focus Meter.');
    }
  }

  function tick() {
    const analyser = analyserRef.current;
    if (!analyser) return;
    analyser.getByteTimeDomainData(dataRef.current);
    let sum = 0;
    for (let i = 0; i < dataRef.current.length; i++) { const v = (dataRef.current[i] - 128) / 128; sum += v * v; }
    const rms = Math.sqrt(sum / dataRef.current.length);
    const smoothed = Math.round(levelRef.current * 0.8 + Math.min(100, rms * 400) * 0.2);
    levelRef.current = smoothed;
    setLevel(smoothed);
    if (calibratingRef.current) calibSamplesRef.current.push(smoothed);

    const { loudSeconds: ls, quietMinutes: qm, baseline: bl } = settingsRef.current;
    const base = bl ?? 15;
    const loudThreshold = base + 30;
    const quietThreshold = base + 8;
    const now = Date.now();

    if (!suggestionRef.current && now > cooldownUntilRef.current) {
      if (smoothed >= loudThreshold) {
        quietSinceRef.current = null;
        if (!loudSinceRef.current) loudSinceRef.current = now;
        else if (now - loudSinceRef.current >= ls * 1000) { setSuggestion('loud'); loudSinceRef.current = null; }
      } else if (smoothed <= quietThreshold) {
        loudSinceRef.current = null;
        if (!quietSinceRef.current) quietSinceRef.current = now;
        else if (now - quietSinceRef.current >= qm * 60 * 1000) { setSuggestion('quiet'); quietSinceRef.current = null; }
      } else {
        loudSinceRef.current = null; quietSinceRef.current = null;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function runCalibration() {
    calibSamplesRef.current = [];
    setCalibrating(true);
    setTimeout(() => {
      const samples = calibSamplesRef.current;
      if (samples.length) setBaseline(Math.round(samples.reduce((a, b) => a + b, 0) / samples.length));
      setCalibrating(false);
    }, 2500);
  }

  function actOnSuggestion(confirm) {
    if (confirm && suggestion === 'loud') {
      onAward({ studentIds: students.map(s => s.id), behaviorIds: ['n9'], pointsOverride: null, comment: 'Logged automatically by the Focus Meter after sustained noise.' });
    } else if (confirm && suggestion === 'quiet') {
      onAward({ studentIds: students.map(s => s.id), behaviorIds: ['b14'], pointsOverride: null, comment: 'Logged automatically by the Focus Meter after sustained focus.' });
    }
    setSuggestion(null);
    cooldownUntilRef.current = Date.now() + (confirm ? 90 : 45) * 1000;
  }

  const base = baseline ?? 15;
  const pct = Math.min(100, level);
  const meterColor = level >= base + 30 ? COLORS.challenge : level <= base + 8 ? COLORS.behavior : COLORS.xp;

  return (
    <>
      {suggestion && (
        <div className="fixed bottom-24 right-5 z-40 w-72 rounded-2xl border p-4 shadow-2xl animate-fade-up"
          style={{ background: COLORS.panel, borderColor: suggestion === 'loud' ? COLORS.challenge : COLORS.behavior }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Volume2 size={16} style={{ color: suggestion === 'loud' ? COLORS.challenge : COLORS.behavior }} />
            <div className="text-xs font-black">{suggestion === 'loud' ? 'The room has been loud for a while' : 'The class has been focused and quiet'}</div>
          </div>
          <p className="text-[11.5px] mb-3" style={{ color: COLORS.textMuted }}>
            {suggestion === 'loud'
              ? `Log a class-wide note (\u22123 points each) for all ${students.length} students?`
              : `Award a quiet-work bonus (+3 points each) to all ${students.length} students?`}
          </p>
          <div className="flex gap-2">
            <button onClick={() => actOnSuggestion(false)} className="flex-1 text-xs font-bold rounded-lg py-2" style={{ background: COLORS.panelSoft, color: COLORS.textMuted }}>Dismiss</button>
            <button onClick={() => actOnSuggestion(true)} className="flex-1 text-xs font-bold rounded-lg py-2" style={{ background: suggestion === 'loud' ? COLORS.challenge : COLORS.behavior, color: COLORS.onAccent }}>Confirm</button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="fixed bottom-24 right-5 z-30 w-64 rounded-2xl border p-4 shadow-2xl" style={{ background: COLORS.panel, borderColor: COLORS.border }}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-black flex items-center gap-1.5"><Volume2 size={14} /> Focus Meter</div>
            <button onClick={() => setExpanded(false)}><X size={14} style={{ color: COLORS.textFaint }} /></button>
          </div>
          {error && <div className="text-[11px] mb-2" style={{ color: COLORS.challenge }}>{error}</div>}
          {!active ? (
            <>
              <p className="text-[11px] mb-2.5 leading-relaxed" style={{ color: COLORS.textMuted }}>
                Uses this device\u2019s mic to sense room noise. Nothing is recorded \u2014 only a live level, discarded instantly. Best on the device at the front of the room.
              </p>
              <button onClick={startMic} className="w-full text-xs font-bold rounded-lg py-2" style={{ background: COLORS.robotics, color: COLORS.onAccent }}>Turn on Focus Meter</button>
            </>
          ) : (
            <>
              <div className="h-3 rounded-full overflow-hidden mb-1" style={{ background: COLORS.panelSoft }}>
                <div className="h-full transition-all" style={{ width: `${pct}%`, background: meterColor }} />
              </div>
              <div className="text-[10px] mb-3" style={{ color: COLORS.textFaint }}>
                {baseline == null ? 'Not calibrated \u2014 tap Calibrate for best results.' : 'Calibrated to this room.'}
              </div>
              <button onClick={runCalibration} disabled={calibrating}
                className="w-full text-xs font-bold rounded-lg py-2 mb-3 disabled:opacity-50" style={{ background: COLORS.panelSoft, color: COLORS.text }}>
                {calibrating ? 'Listening to the room\u2026' : 'Calibrate to this room'}
              </button>
              <div className="text-[10px] mb-1" style={{ color: COLORS.textFaint }}>Loud for {loudSeconds}s suggests a note</div>
              <input type="range" min={5} max={30} value={loudSeconds} onChange={e => setLoudSeconds(Number(e.target.value))} className="w-full mb-2.5" />
              <div className="text-[10px] mb-1" style={{ color: COLORS.textFaint }}>Quiet for {quietMinutes} min suggests a bonus</div>
              <input type="range" min={2} max={15} value={quietMinutes} onChange={e => setQuietMinutes(Number(e.target.value))} className="w-full mb-3" />
              <button onClick={stopMic} className="w-full text-xs font-bold rounded-lg py-2" style={{ background: `${COLORS.challenge}14`, color: COLORS.challenge }}>Turn off</button>
            </>
          )}
        </div>
      )}

      <button onClick={() => setExpanded(e => !e)}
        className="fixed bottom-[76px] right-5 z-30 rounded-full shadow-2xl flex items-center gap-2 px-4 py-3 font-bold text-xs"
        style={active ? { background: COLORS.robotics, color: COLORS.onAccent } : { background: COLORS.panel, color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
        <Volume2 size={16} /> Focus Meter{active ? ` \u00b7 ${level}` : ''}
      </button>
    </>
  );
}

/* ============================================================================ */
/* ------------------------------------ Admin App ------------------------------ */
/* ============================================================================ */

function AdminApp({ state, persist, email, db, session }) {
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
        {tab === 'classes' && <AdminClassesTab state={state} persist={persist} email={email} db={db} session={session} />}
        {tab === 'team' && <AdminTeamTab state={state} persist={persist} db={db} />}
        {tab === 'competition' && <AdminCompetitionTab state={state} persist={persist} db={db} />}
        {tab === 'challenges' && <ChallengesTab state={state} persist={persist} classId={null} scopedStudents={state.students} isAdmin={true} db={db} session={session} />}
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
        <StatChip icon={UserPlus} label="Teachers" value={Object.values(state.teacherAssignments).length} color={COLORS.behavior} />
        <StatChip icon={Zap} label="Total Points" value={totalPoints} color={COLORS.xp} />
        <StatChip icon={Heart} label="Avg Behavior" value={`${avgBehavior}%`} color={COLORS.behavior} />
        <StatChip icon={GraduationCap} label="Avg Academic" value={`${avgAcademic}%`} color={COLORS.coding} />
      </div>

      {champion && (
        <Card style={{ background: `linear-gradient(135deg, ${COLORS.panel}, ${COLORS.panelAlt})`, borderColor: `${COLORS.xp}55` }}>
          <div className="flex items-center gap-2 text-xs font-bold mb-1" style={{ color: COLORS.xp }}><Trophy size={14} /> Current Monthly Champion ({monthLabel(comp.monthKey)})</div>
          <div className="text-xl font-display font-black">{champion.className}</div>
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

function AdminClassesTab({ state, persist, email, db, session }) {
  const [newClassName, setNewClassName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClassId, setNewStudentClassId] = useState(state.classes[0]?.id || '');
  const [newStudentAge, setNewStudentAge] = useState('middle');
  const [bulkNames, setBulkNames] = useState('');
  const [bulkClassId, setBulkClassId] = useState(state.classes[0]?.id || '');
  const [bulkAge, setBulkAge] = useState('middle');
  const [bulkBusy, setBulkBusy] = useState(false);
  const alreadyExpanded = state.classes.length > 1 && state.classes.some(c => ['6B', '6C', '7A', '7B', '7C'].includes(c.name));

  function addClass() {
    if (!newClassName.trim()) return;
    db(() => dbAddClass(newClassName.trim()));
    setNewClassName('');
  }
  function removeClass(id) { db(() => dbRemoveClass(id)); }
  function addStudent() {
    if (!newStudentName.trim()) return;
    db(() => dbAddStudent({ name: newStudentName.trim(), ageGroup: newStudentAge, classId: newStudentClassId }));
    setNewStudentName('');
  }
  function removeStudent(id) { db(() => dbRemoveStudent(id)); }
  function assignStudent(studentId, classId) { db(() => dbAssignStudentClass(studentId, classId)); }
  function loadDemoData() { db(() => dbLoadDemoData(state, session?.user?.id)); }

  const bulkList = bulkNames.split('\n').map(n => n.trim()).filter(Boolean);
  const bulkDupes = bulkList.filter(n => state.students.some(s => s.name.toLowerCase() === n.toLowerCase()));
  async function addStudentsBulk() {
    if (!bulkList.length || bulkBusy) return;
    setBulkBusy(true);
    const ok = await db(() => dbAddStudentsBulk({ names: bulkList, ageGroup: bulkAge, classId: bulkClassId }));
    setBulkBusy(false);
    if (ok) setBulkNames('');
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

      <Card>
        <SectionLabel icon={UserPlus} color={COLORS.behavior}>Add a student</SectionLabel>
        <div className="grid sm:grid-cols-[1fr_120px_120px_auto] gap-2">
          <input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="Student name" style={inputStyle} />
          <select value={newStudentAge} onChange={e => setNewStudentAge(e.target.value)} style={inputStyle}>
            <option value="primary">Primary</option>
            <option value="middle">Middle</option>
            <option value="high">High</option>
          </select>
          <select value={newStudentClassId} onChange={e => setNewStudentClassId(e.target.value)} style={inputStyle}>
            <option value="">Unassigned</option>
            {state.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={addStudent} className="text-xs font-bold rounded-lg px-3 shrink-0" style={{ background: COLORS.behavior, color: COLORS.onAccent }}>Add</button>
        </div>
      </Card>

      <Card>
        <SectionLabel icon={Users} color={COLORS.robotics}>Bulk add students</SectionLabel>
        <div className="text-xs mb-2" style={{ color: COLORS.textMuted }}>
          Paste one name per line — straight from a spreadsheet or class list works fine.
        </div>
        <textarea
          value={bulkNames}
          onChange={e => setBulkNames(e.target.value)}
          placeholder={'Ahmed Al Khalifa\nLayla Hassan\nOmar Youssef'}
          rows={5}
          className="w-full text-sm rounded-lg px-3 py-2 border"
          style={{ background: COLORS.panelSoft, borderColor: COLORS.border, color: COLORS.text, resize: 'vertical' }}
        />
        <div className="grid sm:grid-cols-[120px_1fr_auto] gap-2 mt-2">
          <select value={bulkAge} onChange={e => setBulkAge(e.target.value)} style={inputStyle}>
            <option value="primary">Primary</option>
            <option value="middle">Middle</option>
            <option value="high">High</option>
          </select>
          <select value={bulkClassId} onChange={e => setBulkClassId(e.target.value)} style={inputStyle}>
            <option value="">Unassigned</option>
            {state.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={addStudentsBulk} disabled={!bulkList.length || bulkBusy} className="text-xs font-bold rounded-lg px-3 disabled:opacity-40" style={{ background: COLORS.robotics, color: COLORS.onAccent }}>
            {bulkBusy ? 'Adding…' : `Add ${bulkList.length || ''} student${bulkList.length === 1 ? '' : 's'}`.trim()}
          </button>
        </div>
        {bulkDupes.length > 0 && (
          <div className="text-[11px] font-semibold mt-2" style={{ color: COLORS.reward }}>
            Heads up — {bulkDupes.length} name{bulkDupes.length === 1 ? '' : 's'} already exist{bulkDupes.length === 1 ? 's' : ''} in your roster ({bulkDupes.slice(0, 3).join(', ')}{bulkDupes.length > 3 ? ', …' : ''}). They'll be added again as separate students unless you remove them from the list first.
          </div>
        )}
      </Card>

      <div>
        <SectionLabel icon={Building2} color={COLORS.robotics}>Classes</SectionLabel>
        <div className="space-y-2">
          {state.classes.map(c => (
            <div key={c.id} className="flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5" style={{ borderColor: COLORS.border, background: COLORS.panel }}>
              <div className="min-w-0">
                <div className="text-sm font-semibold min-w-0 truncate">{c.name} <span className="text-[11px] font-normal" style={{ color: COLORS.textFaint }}>({studentsInClass(state, c.id).length} students, {classPointsTotal(state, c.id)} pts)</span></div>
                {c.classCode && <ClassCodeBadge code={c.classCode} />}
              </div>
              <button onClick={() => removeClass(c.id)} aria-label={`Delete class: ${c.name}`} className="shrink-0" style={{ color: COLORS.textFaint }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel icon={Users} color={COLORS.behavior}>All students</SectionLabel>
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: COLORS.border }}>
          {state.students.map(s => (
            <div key={s.id} className="flex items-center justify-between gap-2 px-4 py-2.5 border-t first:border-t-0" style={{ borderColor: COLORS.border }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar name={s.name} id={s.id} size={28} />
                <span className="text-sm font-medium min-w-0 truncate">{s.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StudentPinBadge student={s} db={db} />
                <select value={s.classId || ''} onChange={e => assignStudent(s.id, e.target.value)} aria-label={`Assign class for ${s.name}`} className="rounded-lg px-2 py-1.5 text-xs font-semibold outline-none border" style={{ background: COLORS.panelAlt, borderColor: COLORS.border, color: COLORS.text }}>
                  <option value="">Unassigned</option>
                  {state.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button onClick={() => removeStudent(s.id)} aria-label={`Delete student: ${s.name}`} style={{ color: COLORS.textFaint }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClassCodeBadge({ code }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }
  return (
    <button onClick={copy} className="mt-1 flex items-center gap-1.5 text-[11px] font-bold rounded-md px-2 py-0.5 border w-fit"
      style={{ borderColor: COLORS.border, color: COLORS.xp, background: `${COLORS.xp}0F` }}>
      <KeyRound size={11} /> {code} {copied ? '\u2713 copied' : ''}
    </button>
  );
}

function StudentPinBadge({ student, db }) {
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  async function reset() {
    setBusy(true);
    await db(() => dbResetStudentPin(student.id));
    setBusy(false);
    setRevealed(true);
  }
  return (
    <button onClick={() => revealed ? reset() : setRevealed(true)} disabled={busy}
      className="text-[10.5px] font-bold rounded-md px-2 py-1 border disabled:opacity-50"
      title={revealed ? 'Click to generate a new PIN' : 'Click to reveal PIN'}
      style={{ borderColor: COLORS.border, color: COLORS.textMuted, background: COLORS.panelAlt }}>
      {revealed ? `PIN ${student.pin} \u21BB` : 'Show PIN'}
    </button>
  );
}

function AdminTeamTab({ state, persist, db }) {
  const entries = Object.entries(state.teacherAssignments);

  function setAdmin(em, isAdmin) {
    db(() => dbAssignTeacher({ email: em, isAdmin, classId: null }));
  }
  function removeAssignment(em) {
    db(() => dbRemoveTeacher(em));
  }

  return (
    <div className="space-y-5">
      <Card style={{ borderColor: `${COLORS.robotics}55` }}>
        <div className="text-xs" style={{ color: COLORS.textMuted }}>
          Teachers now sign themselves up from the home screen and create their own classes — nothing to set up here. This list is every teacher who has signed in at least once, across the whole platform. Toggle <b>Admin</b> to give someone super-admin access (they'll see every class from every teacher).
        </div>
      </Card>

      <div>
        <SectionLabel icon={ShieldCheck} color={COLORS.challenge}>Team ({entries.length})</SectionLabel>
        <div className="space-y-2">
          {entries.map(([em, a]) => (
            <div key={em} className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 flex-wrap" style={{ borderColor: COLORS.border, background: COLORS.panel }}>
              <div className="flex-1 min-w-[140px] text-sm font-semibold truncate">{em}</div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: a.isAdmin ? COLORS.challenge : COLORS.textFaint }}>
                <input type="checkbox" checked={!!a.isAdmin} onChange={e => setAdmin(em, e.target.checked)} /> Admin
              </label>
              <button onClick={() => removeAssignment(em)} aria-label={`Remove team member: ${em}`} style={{ color: COLORS.textFaint }}><Trash2 size={14} /></button>
            </div>
          ))}
          {entries.length === 0 && <div className="text-xs" style={{ color: COLORS.textFaint }}>No teachers have signed up yet.</div>}
        </div>
      </div>
    </div>
  );
}

function AdminCompetitionTab({ state, persist, db }) {
  const monthKey = currentMonthKey();
  const live = computeCompetition(state, monthKey);
  const history = [...state.competitions].sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  const [openMonth, setOpenMonth] = useState(null);

  function finalizeMonth() {
    const snapshot = { ...live, closedAt: new Date().toISOString(), winnerClassId: live.results[0]?.classId };
    db(
      () => dbFinalizeCompetition(snapshot),
      () => ({ scope: 'broadcast', message: `\u{1F3C6} ${snapshot.results[0]?.className} won the ${monthLabel(monthKey)} class challenge!` })
    );
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
  const podiumBg = ['#96660B', '#767085', '#8A5A22'];
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
                <div className="text-lg font-black truncate" style={{ color: COLORS.text }}>{r.className}</div>
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
          <div className="text-2xl font-display font-black">{champion.className}</div>
          <div className="text-xs font-mono mt-1" style={{ color: COLORS.textMuted }}>Final Score: <b style={{ color: COLORS.xp }}>{champion.finalScore}</b> {'\u2022'} {champion.studentCount} students</div>
          <button onClick={() => window.print()} className="mt-3 text-[11px] font-bold rounded-lg px-3 py-1.5 flex items-center gap-1.5 w-fit" style={{ background: COLORS.xp, color: COLORS.onAccent }}>
            <Printer size={12} /> Print / Download Certificate
          </button>
        </Card>
      )}
      <div className="rounded-2xl border overflow-hidden shadow-sm table-scroll" style={{ borderColor: COLORS.border }}>
        <div style={{ minWidth: 480 }}>
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 px-3 py-2 text-[9.5px] font-bold uppercase" style={{ background: COLORS.panelAlt, color: COLORS.textFaint }}>
            <div>#</div><div>Class</div><div className="text-right">Points</div><div className="text-right">Behavior</div><div className="text-right">Academic</div><div className="text-right">Final</div>
          </div>
          {data.results.map(r => (
            <div key={r.classId} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 px-3 py-2.5 text-xs border-t items-center" style={{ borderColor: COLORS.border, background: r.rank === 1 ? `${COLORS.xp}0A` : 'transparent' }}>
              <div className="font-bold" style={{ color: r.rank <= 3 ? podiumColors[r.rank - 1] : COLORS.textFaint }}>#{r.rank}</div>
              <div className="font-semibold truncate" style={{ color: COLORS.text }}>{r.className}</div>
              <div className="text-right font-mono" style={{ color: COLORS.textMuted }}>{r.pointsScore}</div>
              <div className="text-right font-mono" style={{ color: COLORS.textMuted }}>{r.behaviorScore}%</div>
              <div className="text-right font-mono" style={{ color: COLORS.textMuted }}>{r.academicScore}%</div>
              <div className="text-right font-mono font-bold" style={{ color: COLORS.xp }}>{r.finalScore}</div>
            </div>
          ))}
        </div>
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
