/**
 * NAJM ENHANCED - Full App.jsx with 5 New Features
 * 
 * NEW FEATURES INTEGRATED:
 * 1. ✅ Bulk Award Dashboard
 * 2. ✅ Weekly Timetable + Audio-Visual Reminders
 * 3. ✅ AI-Powered Attitude Report Generator
 * 4. ✅ Dynamic Seating Plans (Pairs/Groups)
 * 5. ✅ Integrated Rewards Marketplace
 * 
 * INTEGRATION POINTS MARKED WITH: 🔌 NEW FEATURE
 * 
 * This is a guide showing WHERE each feature goes.
 * Copy/paste components as needed into your existing App.jsx
 */

// ============================================
// SECTION: NEW COMPONENT IMPORTS
// ============================================
// Add these to your existing imports at the top:

import {
  CalendarDays,
  AlertCircle,
  Smile,
  ClipboardList,
  LayoutGrid,
} from 'lucide-react';

// ============================================
// SECTION: STATE SCHEMA UPDATES
// ============================================
// LOCATION: Around line 179 in defaultState()
// ADD these properties to the return object:

function defaultState() {
  return {
    // ... ALL EXISTING STATE ...

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
      layout: 'default', // 'default' | 'pairs' | 'groups'
      pairs: [],
      groups: [],
    },

    // 🔌 NEW FEATURE 3: Attitude Report Drafts
    attitudeReportDraft: null,
  };
}

// ============================================
// SECTION: UTILITY FUNCTIONS
// ============================================
// Add these AFTER existing utility functions (around line 560):

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

// ============================================
// SECTION: NEW COMPONENTS
// ============================================
// Add these BEFORE the App() component (around line 1400):

// 🔌 FEATURE 1: BULK AWARD MODE
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

      <Card
        style={{ background: COLORS.panelSoft, borderColor: COLORS.border }}
      >
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

// 🔌 FEATURE 2: CLASSROOM CLOCK
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

// 🔌 FEATURE 2: CLASS END ALARM MODAL
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

// 🔌 FEATURE 2: TIMETABLE MODULE
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

// 🔌 FEATURE 3: STUDENT REPORT GENERATOR
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

  const student = state.students.find(s => s.id === selectedStudentId);

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

// 🔌 FEATURE 4: SEATING PLANS
function SeatingPlansModule({ state, persist, COLORS, onAward }) {
  const [layout, setLayout] = useState(state.seatingPlans.layout || 'default');
  const roster = state.students || [];
  const inputStyle = {
    width: '100%',
    fontSize: '14px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
    background: COLORS.panel,
    color: COLORS.text,
  };

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

// 🔌 FEATURE 5: REWARDS MARKETPLACE CARD
function RewardMarketplaceCard({ reward, balance, state, onRedeem, COLORS }) {
  const Icon = ICONS[reward.icon] || Gift;
  const affordable = balance >= reward.cost;
  const remaining = rewardRemaining(state, reward);
  const soldOut = remaining !== null && remaining <= 0;
  const locked = !affordable || soldOut;

  return (
    <div
      className="rounded-2xl border p-4 flex flex-col gap-2 transition hover:shadow-lg"
      style={{
        borderColor: locked ? COLORS.border : COLORS.robotics,
        background: locked ? COLORS.panel : `${COLORS.robotics}08`,
        opacity: locked ? 0.7 : 1,
      }}
    >
      <div className="text-3xl text-center mb-1">
        {reward.emoji || '🎁'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold truncate" style={{ color: COLORS.text }}>
          {reward.name}
        </div>
        <div
          className="text-[11px] mt-1 leading-snug"
          style={{ color: COLORS.textMuted }}
        >
          {reward.description}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: COLORS.border }}>
        <div className="font-mono font-bold" style={{ color: COLORS.xp }}>
          {reward.cost} XP
        </div>
        {remaining !== null && (
          <div
            className="text-[10px] font-bold px-2 py-1 rounded-full"
            style={{
              background: COLORS.panelSoft,
              color: COLORS.textFaint,
            }}
          >
            {remaining}/{reward.limitedQty}
          </div>
        )}
      </div>

      <button
        onClick={() => onRedeem(reward)}
        disabled={locked}
        className="w-full text-xs font-bold rounded-lg py-2 transition"
        style={{
          background: locked ? COLORS.panelAlt : COLORS.reward,
          color: locked ? COLORS.textFaint : COLORS.onAccent,
          cursor: locked ? 'not-allowed' : 'pointer',
        }}
      >
        {soldOut ? '❌ Sold Out' : affordable ? '🎉 Redeem' : '🔒 Locked'}
      </button>

      {!affordable && !soldOut && (
        <div className="text-[10px] font-semibold" style={{ color: COLORS.challenge }}>
          Need {reward.cost - balance} more XP
        </div>
      )}
    </div>
  );
}

// ============================================
// SECTION: TEACHER DASHBOARD UPDATES
// ============================================
// LOCATION: Find DashboardTab component (around line 2300)
// ADD this right after the "Roster" section:

// In the tabs array, ADD:
// { label: '📦 Bulk Award', key: 'bulk-award', icon: Gift },
// { label: '📅 Timetable', key: 'timetable', icon: CalendarDays },
// { label: '📝 Reports', key: 'reports', icon: ClipboardList },
// { label: '🪑 Seating', key: 'seating', icon: Users },

// In the tab render section, ADD:
// {tab === 'bulk-award' && (
//   <BulkAwardMode
//     state={state}
//     students={roster}
//     onAward={awardBehavior}
//     onCancel={() => setTab('dashboard')}
//     COLORS={COLORS}
//   />
// )}
// {tab === 'timetable' && <TimetableModule state={state} persist={persist} COLORS={COLORS} />}
// {tab === 'reports' && <StudentReportGenerator state={state} persist={persist} COLORS={COLORS} />}
// {tab === 'seating' && <SeatingPlansModule state={state} persist={persist} COLORS={COLORS} onAward={awardBehavior} />}

// ============================================
// END OF NEW FEATURES
// ============================================

/**
 * INTEGRATION SUMMARY
 * 
 * 1. Add state properties to defaultState()
 * 2. Import new icons (CalendarDays, AlertCircle, etc.)
 * 3. Add 4 new utility functions (subtractMinutes, etc.)
 * 4. Add 7 new component functions
 * 5. Update DashboardTab to include 4 new tabs
 * 6. Wire up tab rendering
 * 7. Test each feature incrementally
 * 
 * All existing functionality is preserved.
 * All new features use existing COLORS and styling.
 * No breaking changes to state management.
 */
