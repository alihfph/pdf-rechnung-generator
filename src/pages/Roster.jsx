import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateRosterPdf } from '../utils/generateRosterPdf';
import { getRosterData, setRosterData } from '../utils/rosterStorage';
import { loadRoster, saveRoster } from '../utils/rosterDb';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './Roster.css';

function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getWeekDates(startOfWeek) {
  const dates = [];
  const d = new Date(startOfWeek);
  for (let i = 0; i < 7; i++) {
    dates.push(toDateKey(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function getMonthDates(startOfMonth) {
  const dates = [];
  const d = new Date(startOfMonth);
  const year = d.getFullYear();
  const month = d.getMonth();
  d.setDate(1);
  while (d.getMonth() === month && d.getFullYear() === year) {
    dates.push(toDateKey(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const weekDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  return `${weekDays[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.`;
}

const DEFAULT_PRESET_SHIFTS = [
  { id: 'preset-1', start: '11:30', end: '14:30' },
  { id: 'preset-2', start: '17:30', end: '23:00' },
  { id: 'preset-3', start: '18:00', end: '21:00' },
];
const PRESET_SHIFTS_STORAGE_KEY = 'roster-preset-shifts';
const DRAG_TYPE_SHIFT = 'application/x-roster-shift';

function loadPresetShifts() {
  try {
    const raw = localStorage.getItem(PRESET_SHIFTS_STORAGE_KEY);
    if (!raw) return DEFAULT_PRESET_SHIFTS;
    const data = JSON.parse(raw);
    return Array.isArray(data) && data.length ? data : DEFAULT_PRESET_SHIFTS;
  } catch {
    return DEFAULT_PRESET_SHIFTS;
  }
}

export default function Roster() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState(() => getRosterData().employees);
  const [shifts, setShifts] = useState(() => getRosterData().shifts);
  const [viewMode, setViewMode] = useState('week');

  useEffect(() => {
    setRosterData({ employees, shifts });
    saveRoster(employees, shifts, token);
  }, [employees, shifts, token]);

  useEffect(() => {
    loadRoster(token).then(({ employees: e, shifts: s }) => {
      setEmployees(e);
      setShifts(s);
    });
  }, [token]);
  const [periodStart, setPeriodStart] = useState(() => getStartOfWeek(new Date()));
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [addShiftCell, setAddShiftCell] = useState(null);
  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('17:00');

  const [presetShifts, setPresetShifts] = useState(loadPresetShifts);
  const [newPresetStart, setNewPresetStart] = useState('11:30');
  const [newPresetEnd, setNewPresetEnd] = useState('14:30');

  useEffect(() => {
    localStorage.setItem(PRESET_SHIFTS_STORAGE_KEY, JSON.stringify(presetShifts));
  }, [presetShifts]);

  const dates = useMemo(() => {
    if (viewMode === 'week') return getWeekDates(periodStart);
    return getMonthDates(periodStart);
  }, [viewMode, periodStart]);

  const goPrev = () => {
    const d = new Date(periodStart);
    if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setPeriodStart(d);
  };

  const goNext = () => {
    const d = new Date(periodStart);
    if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setPeriodStart(d);
  };

  const addEmployee = () => {
    const name = newEmployeeName.trim();
    if (!name) return;
    setEmployees((prev) => [...prev, { id: crypto.randomUUID(), name }]);
    setNewEmployeeName('');
  };

  const removeEmployee = (id) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setShifts((prev) => prev.filter((s) => s.employeeId !== id));
  };

  const getShiftsFor = (employeeId, date) =>
    shifts.filter((s) => s.employeeId === employeeId && s.date === date);

  const openAddShift = (employeeId, date) => setAddShiftCell({ employeeId, date });

  const saveShift = () => {
    if (!addShiftCell) return;
    setShifts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        employeeId: addShiftCell.employeeId,
        date: addShiftCell.date,
        start: shiftStart,
        end: shiftEnd,
      },
    ]);
    setAddShiftCell(null);
  };

  const removeShift = (shiftId) => {
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
  };

  const addShiftByDrop = (employeeId, date, start, end) => {
    setShifts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), employeeId, date, start, end },
    ]);
  };

  const addPresetShift = () => {
    const start = newPresetStart.trim();
    const end = newPresetEnd.trim();
    if (!start || !end) return;
    setPresetShifts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), start, end },
    ]);
  };

  const removePresetShift = (id) => {
    setPresetShifts((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePresetDragStart = (e, preset) => {
    if (e.target.closest('button')) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData(DRAG_TYPE_SHIFT, JSON.stringify({ start: preset.start, end: preset.end }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCellDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    e.currentTarget.classList.add('roster-cell-drag-over');
  };

  const handleCellDragLeave = (e) => {
    e.currentTarget.classList.remove('roster-cell-drag-over');
  };

  const handleCellDrop = (e, employeeId, date) => {
    e.preventDefault();
    e.currentTarget.classList.remove('roster-cell-drag-over');
    const raw = e.dataTransfer.getData(DRAG_TYPE_SHIFT);
    if (!raw) return;
    try {
      const { start, end } = JSON.parse(raw);
      if (start && end) addShiftByDrop(employeeId, date, start, end);
    } catch (_) {}
  };

  const handleDownloadPdf = () => {
    const start = dates[0];
    const end = dates[dates.length - 1];
    const title =
      viewMode === 'week'
        ? `Roster ${formatDateLabel(start)} - ${formatDateLabel(end)}`
        : `Roster ${periodStart.getDate()}.${periodStart.getMonth() + 1}.${periodStart.getFullYear()}`;
    generateRosterPdf({
      employees,
      shifts,
      dates,
      title,
      periodLabel: viewMode === 'week' ? 'Wochenansicht' : 'Monatsansicht',
    });
  };

  const periodTitle =
    viewMode === 'week'
      ? `${formatDateLabel(dates[0])} - ${formatDateLabel(dates[6])}`
      : `${periodStart.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`;

  return (
    <div className="roster-page">
      <header className="roster-header">
        <nav className="roster-nav">
          <Link to="/">← Zurück</Link>
          <span className="roster-nav-sep"> · </span>
          <Link to="/roster/hours">Stunden pro Person</Link>
          <span className="roster-nav-sep"> · </span>
          <Link to="/roster/employee-work">Arbeitsübersicht</Link>
        </nav>
        <h1>Dienstplan / Roster</h1>
        <p>Mitarbeiter und Schichten verwalten. Wochen- oder Monatsansicht. Als PDF herunterladen.</p>
      </header>

      <section className="roster-controls card">
        <div className="roster-controls-row">
          <div className="roster-period">
            <button type="button" className="roster-nav-btn" onClick={goPrev} aria-label="Vorherige">‹</button>
            <span className="roster-period-title">{periodTitle}</span>
            <button type="button" className="roster-nav-btn" onClick={goNext} aria-label="Nächste">›</button>
          </div>
          <div className="roster-view-toggle">
            <button
              type="button"
              className={viewMode === 'week' ? 'active' : ''}
              onClick={() => {
                setPeriodStart(getStartOfWeek(periodStart));
                setViewMode('week');
              }}
            >
              Woche
            </button>
            <button
              type="button"
              className={viewMode === 'month' ? 'active' : ''}
              onClick={() => {
                setPeriodStart(getStartOfMonth(periodStart));
                setViewMode('month');
              }}
            >
              Monat
            </button>
          </div>
        </div>

        <div className="roster-add-employee">
          <input
            type="text"
            placeholder="Mitarbeiter Name"
            value={newEmployeeName}
            onChange={(e) => setNewEmployeeName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addEmployee()}
          />
          <button type="button" className="btn-primary" onClick={addEmployee}>
            Mitarbeiter hinzufügen
          </button>
        </div>

        <div className="roster-shift-palette">
          <span className="roster-shift-palette-label">Schichten auf Zelle ziehen:</span>
          {presetShifts.map((preset) => (
            <span
              key={preset.id}
              className="roster-shift-preset"
              draggable
              onDragStart={(e) => handlePresetDragStart(e, preset)}
            >
              {preset.start} – {preset.end}
              <button
                type="button"
                className="roster-shift-preset-remove"
                onClick={(e) => { e.stopPropagation(); removePresetShift(preset.id); }}
                title="Schicht aus Palette entfernen"
              >
                ×
              </button>
            </span>
          ))}
          <div className="roster-shift-palette-add">
            <input
              type="time"
              value={newPresetStart}
              onChange={(e) => setNewPresetStart(e.target.value)}
              title="Von"
            />
            <span className="roster-shift-palette-sep">–</span>
            <input
              type="time"
              value={newPresetEnd}
              onChange={(e) => setNewPresetEnd(e.target.value)}
              title="Bis"
            />
            <button type="button" className="roster-shift-preset-add-btn" onClick={addPresetShift}>
              Schicht hinzufügen
            </button>
          </div>
        </div>

        <div className="roster-actions">
          <button type="button" className="btn-primary" onClick={handleDownloadPdf} disabled={!employees.length}>
            Roster als PDF herunterladen
          </button>
        </div>
      </section>

      <section className="roster-table-wrap card">
        {employees.length === 0 ? (
          <p className="roster-empty">Fügen Sie zuerst Mitarbeiter hinzu.</p>
        ) : (
          <div className="roster-table-scroll">
            <table className="roster-table">
              <thead>
                <tr>
                  <th className="roster-col-name">Mitarbeiter</th>
                  {dates.map((d) => (
                    <th key={d}>{formatDateLabel(d)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td className="roster-col-name">
                      <span>{emp.name}</span>
                      <button
                        type="button"
                        className="roster-remove-emp"
                        onClick={() => removeEmployee(emp.id)}
                        title="Mitarbeiter entfernen"
                      >
                        ×
                      </button>
                    </td>
                    {dates.map((date) => {
                      const dayShifts = getShiftsFor(emp.id, date);
                      return (
                        <td
                          key={date}
                          className="roster-cell"
                          onDragOver={handleCellDragOver}
                          onDragLeave={handleCellDragLeave}
                          onDrop={(e) => handleCellDrop(e, emp.id, date)}
                        >
                          <div className="roster-shifts">
                            {dayShifts.map((s) => (
                              <span key={s.id} className="roster-shift-tag">
                                {s.start} – {s.end}
                                <button
                                  type="button"
                                  className="roster-shift-remove"
                                  onClick={() => removeShift(s.id)}
                                  title="Schicht entfernen"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <button
                            type="button"
                            className="roster-add-shift"
                            onClick={() => openAddShift(emp.id, date)}
                            title="Schicht hinzufügen"
                          >
                            +
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {addShiftCell && (
        <div className="roster-modal-overlay" onClick={() => setAddShiftCell(null)}>
          <div className="roster-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Schicht hinzufügen</h3>
            <p className="roster-modal-date">
              {formatDateLabel(addShiftCell.date)}
            </p>
            <div className="roster-modal-fields">
              <label>
                Von
                <input
                  type="time"
                  value={shiftStart}
                  onChange={(e) => setShiftStart(e.target.value)}
                />
              </label>
              <label>
                Bis
                <input
                  type="time"
                  value={shiftEnd}
                  onChange={(e) => setShiftEnd(e.target.value)}
                />
              </label>
            </div>
            <div className="roster-modal-btns">
              <button type="button" className="btn-secondary" onClick={() => setAddShiftCell(null)}>
                Abbrechen
              </button>
              <button type="button" className="btn-primary" onClick={saveShift}>
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
